# Gestion des probes

## Vue d'ensemble

Les probes sont des verifications automatisees qui s'executent a intervalles reguliers pour surveiller la sante de votre infrastructure de tracking. Chaque probe est configuree par site et produit des resultats avec un statut (`ok`, `warning`, `critical` ou `error`).

## Types de probes

Probr supporte les types de probes suivants :

| Type de probe | Statut | Description |
|---|---|---|
| `http_health` | Actif | Verifie la disponibilite HTTP de l'endpoint sGTM |
| `sgtm_infra` | Prevu | Surveille l'infrastructure sGTM (Stape, Addingwell) |
| `gtm_version` | Prevu | Suit les changements de version du conteneur GTM |
| `data_volume` | Prevu | Surveille les tendances de volume d'evenements et les anomalies |
| `bq_events` | Prevu | Verifie la sante du pipeline d'evenements BigQuery |
| `tag_check` | Prevu | Valide les schemas d'execution de tags specifiques |
| `cmp_check` | Prevu | Surveille le statut du CMP (Consent Management Platform) |

### Probe `http_health`

La probe HTTP health envoie une requete HTTP a l'URL `sgtm_url` du site et verifie :
- Que le serveur repond avec un code de statut reussi
- Le temps de reponse

**Statuts :**
- `ok` : Le serveur a repondu en 2xx, temps de reponse dans les seuils
- `warning` : Le serveur a repondu mais le temps de reponse est eleve
- `critical` : Le serveur n'a pas repondu ou a retourne un code d'erreur
- `error` : L'execution de la probe elle-meme a echoue (erreur reseau, probleme de configuration)

## Configuration des probes

### Modele de donnees

| Champ | Type | Defaut | Description |
|---|---|---|---|
| `id` | UUID | auto | Identifiant unique |
| `site_id` | UUID | requis | Le site que cette probe surveille |
| `probe_type` | string | requis | Un des types de probe ci-dessus |
| `config` | object | `{}` | Configuration specifique a la probe (JSON) |
| `interval_seconds` | int | `300` | Frequence d'execution de la probe (en secondes) |
| `is_active` | bool | `true` | Si la probe est planifiee |

### Planification

Les probes actives sont enregistrees dans le gestionnaire de taches en arriere-plan APScheduler. Quand vous creez ou mettez a jour une probe :
- Si `is_active` est `true`, la probe est ajoutee au planificateur
- Si `is_active` est `false`, la probe est retiree du planificateur
- Modifier `interval_seconds` met a jour la planification immediatement

## Endpoints API

### `GET /api/probes`

Lister toutes les configurations de probes.

| Parametre | Type | Defaut | Description |
|---|---|---|---|
| `site_id` | UUID | optionnel | Filtrer par site |
| `active_only` | bool | `false` | Ne retourner que les probes actives |

### `POST /api/probes`

Creer une nouvelle configuration de probe. Si `is_active` est `true`, elle est immediatement planifiee.

```json
{
  "site_id": "uuid",
  "probe_type": "http_health",
  "config": {},
  "interval_seconds": 300,
  "is_active": true
}
```

**Reponse :** `201 Created` avec l'objet configuration de probe complet.

### `PATCH /api/probes/{probe_id}`

Mettre a jour une configuration de probe.

```json
{
  "interval_seconds": 60,
  "is_active": true
}
```

### `DELETE /api/probes/{probe_id}`

Supprimer une configuration de probe. La retire egalement du planificateur. Retourne `204 No Content`.

### `POST /api/probes/{probe_id}/run`

Declencher manuellement l'execution d'une probe. Retourne le resultat immediatement.

**Reponse :**

```json
{
  "id": "uuid",
  "probe_config_id": "uuid",
  "status": "ok",
  "response_time_ms": 142.5,
  "message": "HTTP 200 in 142ms",
  "details": null,
  "executed_at": "2025-02-24T10:30:00Z"
}
```

### `GET /api/probes/{probe_id}/results`

Obtenir l'historique des resultats d'une probe.

| Parametre | Type | Defaut | Description |
|---|---|---|---|
| `limit` | int | `50` | Nombre maximum de resultats a retourner |

Les resultats sont tries par `executed_at` decroissant (plus recent en premier).

## Resultats des probes

Chaque execution de probe produit un resultat avec :

| Champ | Type | Description |
|---|---|---|
| `status` | string | `ok`, `warning`, `critical` ou `error` |
| `response_time_ms` | float | Temps d'execution en millisecondes |
| `message` | string | Message de statut lisible |
| `details` | object | Donnees supplementaires specifiques a la probe (optionnel) |
| `executed_at` | datetime | Quand la probe a ete executee |

## Integration avec les alertes

Quand une probe retourne `critical` ou `warning` :
- Une alerte est **automatiquement creee** (ou l'alerte ouverte existante est mise a jour)
- Des notifications sont envoyees via Slack et/ou email

Quand une probe revient a `ok` :
- Toute alerte ouverte pour cette probe est **automatiquement resolue**

Voir [Gestion des alertes](../monitoring/alerts.md) pour les details.
