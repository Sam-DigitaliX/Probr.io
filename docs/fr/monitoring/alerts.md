# Gestion des alertes

## Vue d'ensemble

Probr cree automatiquement des alertes lorsque les probes detectent des problemes et les resout lorsque le probleme disparait. Les alertes peuvent etre delivrees via des webhooks Slack et par email (SMTP).

## Cycle de vie d'une alerte

```
La probe detecte un statut CRITICAL ou WARNING
        ↓
   Nouvelle alerte creee (ou alerte existante mise a jour)
        ↓
   Notifications envoyees (Slack + Email)
        ↓
   La probe revient au statut OK
        ↓
   Alerte auto-resolue
```

### Creation automatique des alertes

Quand l'execution d'une probe retourne un statut `critical` ou `warning` :
- S'il **n'existe pas d'alerte ouverte** pour cette probe → une **nouvelle alerte** est creee
- Si une **alerte ouverte existe deja** → sa severite et son message sont **mis a jour**

### Resolution automatique

Quand une probe revient au statut `ok` et qu'une alerte ouverte existe pour cette probe :
- L'alerte est marquee comme **resolue**
- Le timestamp `resolved_at` est renseigne

### Resolution manuelle

Vous pouvez egalement resoudre les alertes manuellement via l'API.

## Severite des alertes

| Severite | Declenchee quand |
|---|---|
| `critical` | Le statut de la probe est `critical` |
| `warning` | Le statut de la probe est `warning` |

## Canaux de notification

### Webhooks Slack

Les alertes sont envoyees sur Slack avec un formatage colore :
- **Critical** : piece jointe rouge avec emoji :red_circle:
- **Warning** : piece jointe orange avec emoji :warning:

Deux niveaux de webhooks Slack :
1. **Webhook global** (configure dans `.env` → `SLACK_WEBHOOK_URL`) : reçoit toutes les alertes
2. **Webhook client** (configure par client → champ `slack_webhook`) : reçoit les alertes de ce client uniquement

### Email (SMTP)

Les notifications par email sont envoyees a l'adresse email du client (le champ `email` de l'objet Client).

Configuration SMTP (dans `.env`) :

| Variable | Description |
|---|---|
| `SMTP_HOST` | Nom d'hote du serveur SMTP |
| `SMTP_PORT` | Port du serveur SMTP |
| `SMTP_USER` | Nom d'utilisateur SMTP |
| `SMTP_PASSWORD` | Mot de passe SMTP |
| `SMTP_FROM` | Adresse email de l'expediteur |

## Endpoints API

### `GET /api/alerts`

Lister les alertes avec filtrage optionnel.

**Parametres :**

| Parametre | Type | Defaut | Description |
|---|---|---|---|
| `site_id` | UUID | optionnel | Filtrer par site |
| `resolved` | bool | optionnel | Filtrer par statut de resolution (`true` / `false`) |
| `limit` | int | 100 | Nombre maximum d'alertes a retourner |

**Reponse :**

```json
[
  {
    "id": "uuid",
    "site_id": "uuid",
    "probe_config_id": "uuid",
    "severity": "critical",
    "probe_type": "http_health",
    "title": "[CRITICAL] http_health — acme.com",
    "message": "Connection timeout after 10000ms",
    "is_resolved": false,
    "resolved_at": null,
    "notified_at": "2025-02-24T10:31:00Z",
    "created_at": "2025-02-24T10:30:00Z"
  }
]
```

### `PATCH /api/alerts/{alert_id}/resolve`

Resoudre manuellement une alerte.

**Reponse :** L'objet alerte mis a jour avec `is_resolved: true` et `resolved_at` renseigne.

## Exemples

### Obtenir toutes les alertes non resolues

```bash
curl -s https://votre-instance-probr/api/alerts?resolved=false
```

### Obtenir les alertes d'un site specifique

```bash
curl -s https://votre-instance-probr/api/alerts?site_id=<uuid>
```

### Resoudre une alerte manuellement

```bash
curl -X PATCH https://votre-instance-probr/api/alerts/<alert_id>/resolve
```
