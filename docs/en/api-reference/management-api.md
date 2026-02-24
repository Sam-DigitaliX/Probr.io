# Management API

This page documents all CRUD endpoints for managing clients, sites, probes, and alerts.

## Clients

### `GET /api/clients`

List all clients.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `active_only` | bool | `false` | Only return active clients |

**Response:** `200` — Array of client objects.

```json
[
  {
    "id": "uuid",
    "name": "Acme Corp",
    "email": "ops@acme.com",
    "slack_webhook": "https://hooks.slack.com/services/...",
    "is_active": true,
    "created_at": "2025-02-24T10:00:00Z"
  }
]
```

### `GET /api/clients/{client_id}`

Get a single client by ID.

**Response:** `200` — Client object. `404` if not found.

### `POST /api/clients`

Create a new client.

**Request body:**

```json
{
  "name": "Acme Corp",
  "email": "ops@acme.com",
  "slack_webhook": "https://hooks.slack.com/services/T.../B.../xxx"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes | Client name |
| `email` | string | no | Contact email (used for alert notifications) |
| `slack_webhook` | string | no | Client-specific Slack webhook URL |

**Response:** `201` — Created client object.

### `PATCH /api/clients/{client_id}`

Update a client. Only include fields you want to change.

```json
{ "email": "new-ops@acme.com", "is_active": false }
```

**Response:** `200` — Updated client object.

### `DELETE /api/clients/{client_id}`

Delete a client. **Cascades** to all associated sites, probes, alerts, and monitoring data.

**Response:** `204` — No content.

---

## Sites

### `GET /api/sites`

List all sites.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `client_id` | UUID | optional | Filter by client |
| `active_only` | bool | `false` | Only return active sites |

**Response:** `200` — Array of site objects.

### `GET /api/sites/{site_id}`

Get a single site by ID. Returns the full site object including the `ingest_key`.

**Response:** `200` — Site object. `404` if not found.

```json
{
  "id": "uuid",
  "client_id": "uuid",
  "name": "acme.com - Production",
  "url": "https://acme.com",
  "sgtm_url": "https://sgtm.acme.com",
  "gtm_web_container_id": "GTM-XXXXX",
  "gtm_server_container_id": "GTM-YYYYYY",
  "ga4_property_id": "123456789",
  "ga4_measurement_id": "G-XXXXXXXX",
  "bigquery_project": null,
  "bigquery_dataset": null,
  "stape_container_id": null,
  "addingwell_container_id": null,
  "cmp_provider": null,
  "ingest_key": "abc123def456...",
  "is_active": true,
  "created_at": "2025-02-24T10:00:00Z"
}
```

### `POST /api/sites`

Create a new site. The `ingest_key` is auto-generated.

**Request body:**

```json
{
  "client_id": "uuid",
  "name": "acme.com - Production",
  "url": "https://acme.com",
  "sgtm_url": "https://sgtm.acme.com",
  "gtm_server_container_id": "GTM-XXXXXX"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `client_id` | UUID | yes | Parent client ID |
| `name` | string | yes | Site name |
| `url` | string | yes | Main URL |
| `sgtm_url` | string | no | sGTM endpoint URL |
| `gtm_web_container_id` | string | no | Web GTM container ID |
| `gtm_server_container_id` | string | no | Server GTM container ID |
| `ga4_property_id` | string | no | GA4 property ID |
| `ga4_measurement_id` | string | no | GA4 measurement ID |
| `bigquery_project` | string | no | GCP project for BigQuery |
| `bigquery_dataset` | string | no | BigQuery dataset name |
| `stape_container_id` | string | no | Stape container ID |
| `addingwell_container_id` | string | no | Addingwell container ID |
| `cmp_provider` | string | no | CMP provider (`axeptio`, `didomi`, `cookiebot`, etc.) |

**Response:** `201` — Created site object (includes `ingest_key`).

### `PATCH /api/sites/{site_id}`

Update a site. Only include fields you want to change.

**Response:** `200` — Updated site object.

### `DELETE /api/sites/{site_id}`

Delete a site. **Cascades** to all associated probes, alerts, and monitoring data.

**Response:** `204` — No content.

---

## Probes

### `GET /api/probes`

List all probe configurations.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `site_id` | UUID | optional | Filter by site |
| `active_only` | bool | `false` | Only return active probes |

**Response:** `200` — Array of probe config objects.

### `POST /api/probes`

Create a new probe configuration.

**Request body:**

```json
{
  "site_id": "uuid",
  "probe_type": "http_health",
  "config": {},
  "interval_seconds": 300,
  "is_active": true
}
```

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `site_id` | UUID | yes | — | Target site |
| `probe_type` | string | yes | — | `http_health`, `sgtm_infra`, `gtm_version`, `data_volume`, `bq_events`, `tag_check`, `cmp_check` |
| `config` | object | no | `{}` | Probe-specific settings |
| `interval_seconds` | int | no | `300` | Execution interval in seconds |
| `is_active` | bool | no | `true` | Whether to schedule immediately |

**Response:** `201` — Created probe config object.

### `PATCH /api/probes/{probe_id}`

Update a probe. Changes to `interval_seconds` or `is_active` immediately update the scheduler.

```json
{ "interval_seconds": 60, "is_active": true }
```

**Response:** `200` — Updated probe config object.

### `DELETE /api/probes/{probe_id}`

Delete a probe and remove it from the scheduler.

**Response:** `204` — No content.

### `POST /api/probes/{probe_id}/run`

Manually trigger a single probe execution and return the result.

**Response:** `200` — Probe result object.

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

Get historical probe results.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `limit` | int | `50` | Max results to return |

**Response:** `200` — Array of probe results (most recent first).

---

## Alerts

### `GET /api/alerts`

List alerts with optional filtering.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `site_id` | UUID | optional | Filter by site |
| `resolved` | bool | optional | Filter by resolution status |
| `limit` | int | `100` | Max alerts to return |

**Response:** `200` — Array of alert objects.

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

Manually resolve an alert. Sets `is_resolved: true` and `resolved_at` to the current time.

**Response:** `200` — Updated alert object.
