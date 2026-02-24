# Alert Management

## Overview

Probr automatically creates alerts when probes detect issues and resolves them when the issue clears. Alerts can be delivered via Slack webhooks and email (SMTP).

## Alert Lifecycle

```
Probe detects CRITICAL or WARNING status
        ↓
   New alert created (or existing alert updated)
        ↓
   Notifications sent (Slack + Email)
        ↓
   Probe returns to OK status
        ↓
   Alert auto-resolved
```

### Automatic Alert Creation

When a probe execution returns a `critical` or `warning` status:
- If **no open alert** exists for that probe → a **new alert** is created
- If an **open alert** already exists → its severity and message are **updated**

### Automatic Alert Resolution

When a probe returns to `ok` status and an open alert exists for that probe:
- The alert is marked as **resolved**
- The `resolved_at` timestamp is set

### Manual Resolution

You can also resolve alerts manually via the API.

## Alert Severity

| Severity | Triggered When |
|---|---|
| `critical` | Probe status is `critical` |
| `warning` | Probe status is `warning` |

## Notification Channels

### Slack Webhooks

Alerts are sent to Slack with color-coded formatting:
- **Critical**: red attachment with :red_circle: emoji
- **Warning**: orange attachment with :warning: emoji

Two levels of Slack webhooks:
1. **Global webhook** (configured in `.env` → `SLACK_WEBHOOK_URL`): receives all alerts
2. **Client webhook** (configured per client → `slack_webhook` field): receives alerts for that client only

### Email (SMTP)

Email notifications are sent to the client's email address (the `email` field on the Client object).

SMTP configuration (in `.env`):

| Variable | Description |
|---|---|
| `SMTP_HOST` | SMTP server hostname |
| `SMTP_PORT` | SMTP server port |
| `SMTP_USER` | SMTP username |
| `SMTP_PASSWORD` | SMTP password |
| `SMTP_FROM` | Sender email address |

## API Endpoints

### `GET /api/alerts`

List alerts with optional filtering.

**Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `site_id` | UUID | optional | Filter by site |
| `resolved` | bool | optional | Filter by resolution status (`true` / `false`) |
| `limit` | int | 100 | Maximum number of alerts to return |

**Response:**

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

Manually resolve an alert.

**Response:** The updated alert object with `is_resolved: true` and `resolved_at` set.

## Examples

### Get all unresolved alerts

```bash
curl -s https://your-probr-instance/api/alerts?resolved=false
```

### Get alerts for a specific site

```bash
curl -s https://your-probr-instance/api/alerts?site_id=<uuid>
```

### Resolve an alert manually

```bash
curl -X PATCH https://your-probr-instance/api/alerts/<alert_id>/resolve
```
