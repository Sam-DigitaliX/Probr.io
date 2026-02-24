# Probe Management

## Overview

Probes are automated checks that run at regular intervals to monitor the health of your tracking infrastructure. Each probe is configured per site and produces results with a status (`ok`, `warning`, `critical`, or `error`).

## Probe Types

Probr supports the following probe types:

| Probe Type | Status | Description |
|---|---|---|
| `http_health` | Active | Checks HTTP availability of the sGTM endpoint |
| `sgtm_infra` | Planned | Monitors sGTM infrastructure (Stape, Addingwell) |
| `gtm_version` | Planned | Tracks GTM container version changes |
| `data_volume` | Planned | Monitors event volume trends and anomalies |
| `bq_events` | Planned | Checks BigQuery event pipeline health |
| `tag_check` | Planned | Validates specific tag execution patterns |
| `cmp_check` | Planned | Monitors CMP (Consent Management Platform) status |

### `http_health` Probe

The HTTP health probe sends an HTTP request to the site's `sgtm_url` and checks:
- That the server responds with a successful status code
- The response time

**Statuses:**
- `ok`: Server responded with 2xx, response time within thresholds
- `warning`: Server responded but response time is high
- `critical`: Server did not respond or returned an error status code
- `error`: The probe execution itself failed (network error, configuration issue)

## Probe Configuration

### Data Model

| Field | Type | Default | Description |
|---|---|---|---|
| `id` | UUID | auto | Unique identifier |
| `site_id` | UUID | required | The site this probe monitors |
| `probe_type` | string | required | One of the probe types above |
| `config` | object | `{}` | Probe-specific configuration (JSON) |
| `interval_seconds` | int | `300` | How often to run the probe (in seconds) |
| `is_active` | bool | `true` | Whether the probe is scheduled |

### Scheduling

Active probes are registered in the APScheduler background task runner. When you create or update a probe:
- If `is_active` is `true`, the probe is added to the scheduler
- If `is_active` is `false`, the probe is removed from the scheduler
- Changing `interval_seconds` updates the schedule immediately

## API Endpoints

### `GET /api/probes`

List all probe configurations.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `site_id` | UUID | optional | Filter by site |
| `active_only` | bool | `false` | Only return active probes |

### `POST /api/probes`

Create a new probe configuration. If `is_active` is `true`, it is immediately scheduled.

```json
{
  "site_id": "uuid",
  "probe_type": "http_health",
  "config": {},
  "interval_seconds": 300,
  "is_active": true
}
```

**Response:** `201 Created` with the full probe configuration object.

### `PATCH /api/probes/{probe_id}`

Update a probe configuration.

```json
{
  "interval_seconds": 60,
  "is_active": true
}
```

### `DELETE /api/probes/{probe_id}`

Delete a probe configuration. Also removes it from the scheduler. Returns `204 No Content`.

### `POST /api/probes/{probe_id}/run`

Manually trigger a probe execution. Returns the result immediately.

**Response:**

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

Get historical results for a probe.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `limit` | int | `50` | Maximum number of results to return |

Results are ordered by `executed_at` descending (most recent first).

## Probe Results

Each probe execution produces a result with:

| Field | Type | Description |
|---|---|---|
| `status` | string | `ok`, `warning`, `critical`, or `error` |
| `response_time_ms` | float | Execution time in milliseconds |
| `message` | string | Human-readable status message |
| `details` | object | Additional probe-specific data (optional) |
| `executed_at` | datetime | When the probe ran |

## Alert Integration

When a probe returns `critical` or `warning`:
- An alert is **automatically created** (or the existing open alert is updated)
- Notifications are sent via Slack and/or email

When a probe returns to `ok`:
- Any open alert for that probe is **automatically resolved**

See [Alert Management](../monitoring/alerts.md) for details.
