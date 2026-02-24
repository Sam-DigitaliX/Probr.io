# API de monitoring

Cette page documente les endpoints du dashboard et des analytics de monitoring.

## Dashboard

### `GET /api/dashboard/overview`

Retourne la vue complete du centre de controle : tous les clients actifs avec leurs sites, statuts des probes et alertes recentes.

**Parametres :** Aucun.

**Reponse :** `200`

```json
{
  "total_clients": 3,
  "total_sites": 8,
  "total_ok": 6,
  "total_warning": 1,
  "total_critical": 1,
  "clients": [
    {
      "client_id": "uuid",
      "client_name": "Acme Corp",
      "overall_status": "warning",
      "total_sites": 2,
      "sites_ok": 1,
      "sites_warning": 1,
      "sites_critical": 0,
      "active_alerts": 1,
      "sites": [
        {
          "site_id": "uuid",
          "site_name": "acme.com - Production",
          "site_url": "https://acme.com",
          "overall_status": "ok",
          "probes": [
            {
              "probe_type": "http_health",
              "status": "ok",
              "message": "HTTP 200 in 142ms",
              "last_check": "2025-02-24T10:30:00Z",
              "response_time_ms": 142.5
            }
          ],
          "active_alerts": 0
        }
      ]
    }
  ],
  "recent_alerts": []
}
```

### Agregation des statuts

Le statut est calcule de bas en haut avec une priorite au pire statut :

| Priorite | Statut |
|---|---|
| 0 (pire) | `critical` |
| 1 | `error` |
| 2 | `warning` |
| 3 (meilleur) | `ok` |

Le `overall_status` d'un site = pire statut parmi ses probes actives.
Le `overall_status` d'un client = pire statut parmi ses sites.

---

## Analytics de monitoring

### `GET /api/monitoring/sites/{site_id}/overview`

Vue d'ensemble agregee du monitoring d'un site sur une fenetre de temps configurable.

**Parametres :**

| Parametre | Type | Defaut | Description |
|---|---|---|---|
| `site_id` | UUID | requis | Site a interroger (path) |
| `hours` | int | `24` | Fenetre de temps en heures (query) |

**Reponse :** `200`

```json
{
  "site_id": "uuid",
  "site_name": "acme.com",
  "container_id": "GTM-XXXXX",
  "period_hours": 24,
  "total_events": 47832,
  "events": [
    { "event_name": "page_view", "total_count": 38210 },
    { "event_name": "purchase", "total_count": 412 }
  ],
  "tags": [
    {
      "tag_name": "GA4",
      "total_executions": 47832,
      "success_count": 47810,
      "failure_count": 22,
      "success_rate": 99.95,
      "avg_execution_time_ms": 45.2
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

Retourne des tableaux vides / null si aucune donnee n'existe pour la fenetre de temps.

### `GET /api/monitoring/sites/{site_id}/batches`

Batches de monitoring bruts pour les graphiques en series temporelles. Chaque batch = fenetre d'agregation de 1 minute.

**Parametres :**

| Parametre | Type | Defaut | Description |
|---|---|---|---|
| `site_id` | UUID | requis | Site a interroger (path) |
| `hours` | int | `24` | Fenetre de temps (query) |
| `limit` | int | `1440` | Nombre maximum de batches a retourner (query) |

**Reponse :** `200` — Tableau d'objets batch ordonnes par `window_start` croissant.

```json
[
  {
    "id": "uuid",
    "site_id": "uuid",
    "container_id": "GTM-XXXXX",
    "window_start": "2025-02-24T09:00:00Z",
    "window_seconds": 60,
    "total_events": 42,
    "event_counts": { "page_view": 35, "purchase": 2, "add_to_cart": 5 },
    "tag_metrics": {
      "GA4": { "success": 42, "failure": 0, "timeout": 0, "exception": 0, "total_exec_ms": 1890, "count": 42 }
    },
    "user_data_quality": { "email": 14, "phone": 5, "address": 3, "total": 42 },
    "ecommerce_quality": { "value": 2, "currency": 2, "transaction_id": 2, "items": 2, "total": 2 },
    "received_at": "2025-02-24T09:00:32Z"
  }
]
```

### `GET /api/monitoring/sites/{site_id}/tags/{tag_name}`

Metriques de sante detaillees pour un tag specifique sur une fenetre de temps.

**Parametres :**

| Parametre | Type | Defaut | Description |
|---|---|---|---|
| `site_id` | UUID | requis | Site a interroger (path) |
| `tag_name` | string | requis | Nom du tag, encode en URL si necessaire (path) |
| `hours` | int | `24` | Fenetre de temps (query) |

**Reponse :** `200`

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

**Erreur :** `404` si aucune donnee n'existe pour le nom de tag donne.

---

## Ingestion (flush)

### `POST /api/ingest/flush`

Forcer un vidage immediat du buffer d'agregation en memoire vers la base de donnees. Utile pour le debogage ou avant un arret propre.

**Parametres :** Aucun.

**Reponse :** `200`

```json
{ "flushed_buckets": 3 }
```
