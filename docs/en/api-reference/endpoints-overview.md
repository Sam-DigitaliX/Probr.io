# Complete API Reference

## Base URL

All endpoints are relative to your Probr instance URL:

```
https://your-probr-instance.com/api
```

## Authentication

- **Ingest endpoints** (`/api/ingest`): authenticated via `X-Probr-Key` header
- **Management endpoints**: no authentication required in the current version (secure via network/firewall)
- **Health check** (`/health`): public, no authentication

## Endpoints Overview

### Health

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Application health check |

### Ingest

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/ingest` | Receive monitoring data from GTM Listener tag |
| `POST` | `/api/ingest/flush` | Force flush in-memory aggregation buffer |

See [POST /ingest](ingest-endpoint.md) for detailed payload documentation.

### Clients

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/clients` | List all clients |
| `GET` | `/api/clients/{id}` | Get a client |
| `POST` | `/api/clients` | Create a client |
| `PATCH` | `/api/clients/{id}` | Update a client |
| `DELETE` | `/api/clients/{id}` | Delete a client (cascade) |

See [Clients & Sites](../administration/clients-and-sites.md) for details.

### Sites

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/sites` | List all sites |
| `GET` | `/api/sites/{id}` | Get a site |
| `POST` | `/api/sites` | Create a site |
| `PATCH` | `/api/sites/{id}` | Update a site |
| `DELETE` | `/api/sites/{id}` | Delete a site (cascade) |

See [Clients & Sites](../administration/clients-and-sites.md) for details.

### Probes

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/probes` | List probe configurations |
| `POST` | `/api/probes` | Create a probe |
| `PATCH` | `/api/probes/{id}` | Update a probe |
| `DELETE` | `/api/probes/{id}` | Delete a probe |
| `POST` | `/api/probes/{id}/run` | Manually trigger a probe |
| `GET` | `/api/probes/{id}/results` | Get probe execution history |

See [Probe Management](../administration/probes.md) for details.

### Alerts

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/alerts` | List alerts (filterable) |
| `PATCH` | `/api/alerts/{id}/resolve` | Manually resolve an alert |

See [Alert Management](../monitoring/alerts.md) for details.

### Dashboard

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard/overview` | Full control room view |

See [Dashboard & Control Room](../monitoring/dashboard.md) for details.

### Monitoring

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/monitoring/sites/{id}/overview` | Aggregated monitoring overview |
| `GET` | `/api/monitoring/sites/{id}/batches` | Raw time-series data |
| `GET` | `/api/monitoring/sites/{id}/tags/{name}` | Per-tag health metrics |

See [Monitoring Analytics](../monitoring/analytics.md) for details.

## Common Response Codes

| Code | Meaning |
|---|---|
| `200` | Success |
| `201` | Resource created |
| `202` | Accepted (ingest) |
| `204` | Deleted (no content) |
| `401` | Invalid ingest key |
| `404` | Resource not found |
| `422` | Validation error (invalid request body) |

## Data Types

All IDs are **UUIDs** (v4). All timestamps are **ISO 8601** with timezone (`UTC`). Request and response bodies use **JSON**.
