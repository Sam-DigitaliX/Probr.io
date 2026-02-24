# Endpoint d'ingestion

L'endpoint principal de l'API Probr reçoit les données de monitoring depuis le tag sGTM.

## POST /ingest

```
POST https://api.probr.io/ingest
```

### Headers requis

| Header | Valeur | Obligatoire |
|---|---|---|
| `Content-Type` | `application/json` | Oui |
| `X-Probr-Key` | Votre clé d'ingestion | Oui |

---

## Payload : mode Per Event

Envoyé pour chaque événement quand le mode d'envoi est `per_event`.

### Schéma

```json
{
  "container_id": "string",
  "event_name": "string",
  "timestamp_ms": 0,
  "tags": [
    {
      "id": "string",
      "name": "string",
      "status": "string",
      "execution_time": 0
    }
  ],
  "user_data": {
    "has_email": false,
    "has_phone": false,
    "has_first_name": false,
    "has_last_name": false,
    "has_city": false,
    "has_country": false
  },
  "ecommerce": {
    "has_value": false,
    "has_currency": false,
    "has_transaction_id": false,
    "has_items": false
  }
}
```

### Champs

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `container_id` | string | Oui | ID du conteneur sGTM (ex. `GTM-XXXXXX`) |
| `event_name` | string | Oui | Nom de l'événement GA4 (ex. `purchase`, `page_view`) |
| `timestamp_ms` | integer | Oui | Horodatage Unix en millisecondes |
| `tags` | array | Oui | Liste des tags exécutés pour cet événement |
| `tags[].id` | string | Oui | ID numérique du tag dans GTM |
| `tags[].name` | string | Non | Nom du tag (si métadonnées configurées) |
| `tags[].status` | string | Oui | `success`, `failure`, `timeout`, ou `exception` |
| `tags[].execution_time` | integer | Non | Durée d'exécution en ms |
| `user_data` | object | Non | Présence des champs enhanced conversions |
| `ecommerce` | object | Non | Présence des champs e-commerce (events commerce uniquement) |

### Exemple complet

```bash
curl -X POST https://api.probr.io/ingest \
  -H "Content-Type: application/json" \
  -H "X-Probr-Key: pk_live_abc123" \
  -d '{
    "container_id": "GTM-ABC123",
    "event_name": "purchase",
    "timestamp_ms": 1708790400000,
    "tags": [
      {
        "id": "15",
        "name": "GA4 - Event",
        "status": "success",
        "execution_time": 120
      },
      {
        "id": "22",
        "name": "Meta CAPI",
        "status": "failure",
        "execution_time": 5000
      }
    ],
    "user_data": {
      "has_email": true,
      "has_phone": false,
      "has_first_name": true,
      "has_last_name": true,
      "has_city": false,
      "has_country": true
    },
    "ecommerce": {
      "has_value": true,
      "has_currency": true,
      "has_transaction_id": true,
      "has_items": true
    }
  }'
```

---

## Payload : mode Batched

Envoyé quand le buffer atteint la taille configurée (`batchSize`).

### Schéma

```json
{
  "container_id": "string",
  "batch": true,
  "window_start_ms": 0,
  "window_end_ms": 0,
  "total_events": 0,
  "event_counts": {},
  "tag_metrics": {},
  "user_data_quality": {},
  "ecommerce_quality": {}
}
```

### Champs

| Champ | Type | Description |
|---|---|---|
| `container_id` | string | ID du conteneur sGTM |
| `batch` | boolean | Toujours `true` — permet de distinguer du mode per-event |
| `window_start_ms` | integer | Timestamp du premier événement du batch |
| `window_end_ms` | integer | Timestamp du dernier événement du batch |
| `total_events` | integer | Nombre total d'événements dans le batch |
| `event_counts` | object | `{ "event_name": count }` — volume par type d'événement |
| `tag_metrics` | object | Métriques agrégées par tag (voir ci-dessous) |
| `user_data_quality` | object | Compteurs de présence des données utilisateur |
| `ecommerce_quality` | object | Compteurs de présence des données e-commerce |

### Structure de `tag_metrics`

```json
{
  "GA4 - Event": {
    "success": 48,
    "failure": 2,
    "timeout": 0,
    "exception": 0,
    "total_exec_ms": 6240,
    "count": 50
  }
}
```

| Champ | Type | Description |
|---|---|---|
| `success` | integer | Nombre d'exécutions réussies |
| `failure` | integer | Nombre d'échecs |
| `timeout` | integer | Nombre de timeouts |
| `exception` | integer | Nombre d'exceptions |
| `total_exec_ms` | integer | Temps total d'exécution cumulé (ms) |
| `count` | integer | Nombre total d'exécutions |

### Structure de `user_data_quality`

```json
{
  "email": 42,
  "phone": 15,
  "address": 38,
  "total": 50
}
```

Chaque valeur = nombre d'événements où le champ était présent. `total` = nombre total d'événements (pour calculer les pourcentages).

### Structure de `ecommerce_quality`

```json
{
  "value": 5,
  "currency": 5,
  "transaction_id": 4,
  "items": 5,
  "total": 5
}
```

Même logique : nombre d'événements e-commerce où chaque champ était présent.

---

## Réponses

| Code | Corps | Description |
|---|---|---|
| `200` | `{"status": "ok"}` | Données reçues et enregistrées |
| `400` | `{"error": "invalid_payload"}` | Payload JSON invalide ou champs manquants |
| `401` | `{"error": "unauthorized"}` | Clé API manquante ou invalide |
| `403` | `{"error": "forbidden"}` | Clé révoquée ou site désactivé |
| `413` | `{"error": "payload_too_large"}` | Payload > 1 MB |
| `429` | `{"error": "rate_limited"}` | Trop de requêtes (voir [Limites](./rate-limits.md)) |
| `500` | `{"error": "internal_error"}` | Erreur serveur — réessayez |

## Timeout

Le tag sGTM envoie les requêtes avec un timeout de :
- **5 secondes** en mode per-event
- **10 secondes** en mode batched

L'API Probr répond généralement en **<100ms**.
