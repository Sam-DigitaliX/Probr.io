# Monitoring API

This page documents the dashboard and monitoring analytics endpoints.

## Dashboard

### `GET /api/dashboard/overview`

Returns the full control room view: all active clients with their sites, probe statuses, and recent alerts.

**Parameters:** None.

**Response:** `200`

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

### Status aggregation

Status is computed bottom-up using worst-status priority:

| Priority | Status |
|---|---|
| 0 (worst) | `critical` |
| 1 | `error` |
| 2 | `warning` |
| 3 (best) | `ok` |

A site's `overall_status` = worst status among its active probes.
A client's `overall_status` = worst status among its sites.

---

## Monitoring Analytics

### `GET /api/monitoring/sites/{site_id}/overview`

Aggregated monitoring overview for a site over a configurable time window.

**Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `site_id` | UUID | required | Site to query (path) |
| `hours` | int | `24` | Time window in hours (query) |

**Response:** `200`

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

Returns empty arrays/null if no data exists for the time window.

### `GET /api/monitoring/sites/{site_id}/batches`

Raw monitoring batches for time-series charts. Each batch = 1-minute aggregation window.

**Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `site_id` | UUID | required | Site to query (path) |
| `hours` | int | `24` | Time window (query) |
| `limit` | int | `1440` | Max batches to return (query) |

**Response:** `200` — Array of batch objects ordered by `window_start` ascending.

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

Detailed health metrics for a specific tag over a time window.

**Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `site_id` | UUID | required | Site to query (path) |
| `tag_name` | string | required | Tag name, URL-encoded if needed (path) |
| `hours` | int | `24` | Time window (query) |

**Response:** `200`

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

**Error:** `404` if no data exists for the given tag name.

---

## Ingest (flush)

### `POST /api/ingest/flush`

Force an immediate flush of the in-memory aggregation buffer to the database. Useful for debugging or before graceful shutdown.

**Parameters:** None.

**Response:** `200`

```json
{ "flushed_buckets": 3 }
```
