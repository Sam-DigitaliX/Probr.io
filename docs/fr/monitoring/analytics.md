# Monitoring Analytics

## Vue d'ensemble

Les endpoints d'analytics de monitoring fournissent des insights detailles sur les donnees collectees par le tag GTM Listener de Probr. Ils agregent les volumes d'evenements, les metriques de sante des tags et les scores de qualite des donnees utilisateur sur des fenetres de temps configurables.

## Endpoints

### `GET /api/monitoring/sites/{site_id}/overview`

Retourne un aperçu agrege de toutes les donnees de monitoring pour un site sur les N dernieres heures.

**Parametres :**

| Parametre | Type | Defaut | Description |
|---|---|---|---|
| `site_id` | UUID | requis | Le site a interroger |
| `hours` | int | 24 | Fenetre de temps en heures |

**Reponse :**

```json
{
  "site_id": "uuid",
  "site_name": "acme.com - Production",
  "container_id": "GTM-XXXXX",
  "period_hours": 24,
  "total_events": 47832,
  "events": [
    { "event_name": "page_view", "total_count": 38210 },
    { "event_name": "purchase", "total_count": 412 },
    { "event_name": "add_to_cart", "total_count": 1893 }
  ],
  "tags": [
    {
      "tag_name": "GA4",
      "total_executions": 47832,
      "success_count": 47810,
      "failure_count": 22,
      "success_rate": 99.95,
      "avg_execution_time_ms": 45.2
    },
    {
      "tag_name": "Facebook CAPI",
      "total_executions": 47832,
      "success_count": 47100,
      "failure_count": 732,
      "success_rate": 98.47,
      "avg_execution_time_ms": 120.8
    }
  ],
  "user_data": {
    "email_rate": 34.5,
    "phone_rate": 12.1,
    "address_rate": 8.3,
    "total_events": 47832
  },
  "last_seen": "2025-02-24T10:29:00Z"
}
```

### `GET /api/monitoring/sites/{site_id}/batches`

Retourne les batches de monitoring bruts pour construire des graphiques en series temporelles. Chaque batch represente une fenetre d'agregation d'1 minute.

**Parametres :**

| Parametre | Type | Defaut | Description |
|---|---|---|---|
| `site_id` | UUID | requis | Le site a interroger |
| `hours` | int | 24 | Fenetre de temps en heures |
| `limit` | int | 1440 | Nombre maximum de batches a retourner |

**Reponse :** Un tableau d'objets `MonitoringBatch`, chacun contenant :

| Champ | Type | Description |
|---|---|---|
| `window_start` | datetime | Debut de la fenetre d'1 minute |
| `window_seconds` | int | Duree de la fenetre (toujours 60) |
| `total_events` | int | Nombre d'evenements dans cette fenetre |
| `event_counts` | object | `{"page_view": 847, "purchase": 12, ...}` |
| `tag_metrics` | object | Compteurs succes/echec/timeout/exception par tag |
| `user_data_quality` | object | `{"email": 340, "phone": 120, "address": 80, "total": 1000}` |
| `ecommerce_quality` | object | `{"value": 12, "currency": 12, "transaction_id": 12, "items": 12, "total": 12}` |

### `GET /api/monitoring/sites/{site_id}/tags/{tag_name}`

Retourne les metriques de sante detaillees pour un tag specifique.

**Parametres :**

| Parametre | Type | Defaut | Description |
|---|---|---|---|
| `site_id` | UUID | requis | Le site a interroger |
| `tag_name` | string | requis | Nom du tag (encode URL si necessaire) |
| `hours` | int | 24 | Fenetre de temps en heures |

**Reponse :**

```json
{
  "tag_name": "GA4",
  "total_executions": 47832,
  "success_count": 47810,
  "failure_count": 22,
  "success_rate": 99.95,
  "avg_execution_time_ms": 45.2
}
```

Retourne `404` si aucune donnee n'est trouvee pour le tag donne.

## Metriques cles

### Volume d'evenements
Nombre total d'evenements reçus du tag GTM Listener, ventile par nom d'evenement (`page_view`, `purchase`, `add_to_cart`, etc.).

### Sante des tags
Pour chaque tag de votre conteneur sGTM, Probr suit :
- **Nombre de succes** : tags executes sans erreur
- **Nombre d'echecs** : inclut les echecs, timeouts et exceptions
- **Taux de succes** : pourcentage d'executions reussies
- **Temps d'execution moyen** : temps d'execution moyen sur toutes les executions

### Qualite des donnees utilisateur
Mesure le taux de presence des champs de donnees utilisateur cles dans tous les evenements :
- **Taux email** : % d'evenements avec un email hashe present
- **Taux telephone** : % d'evenements avec un numero de telephone present
- **Taux adresse** : % d'evenements avec des donnees nom/adresse presentes

### Qualite e-commerce
Pour les evenements e-commerce, suit la completude de :
- `value`, `currency`, `transaction_id`, `items`

## Flux de donnees

```
Tag GTM Listener → POST /api/ingest → Agregation en memoire (fenetres d'1 min)
                                            ↓ (flush toutes les 30s)
                                       PostgreSQL (table monitoring_batches)
                                            ↓
                                   Endpoints /api/monitoring/*
```

Les donnees passent par une couche d'agregation en memoire avant d'etre ecrites en base de donnees, ce qui minimise la charge d'ecriture tout en maintenant une visibilite quasi temps reel.
