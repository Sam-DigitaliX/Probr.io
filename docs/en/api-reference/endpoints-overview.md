# API Overview

## Base URL

All endpoints are relative to your Probr instance URL:

```
https://your-probr-instance.com/api
```

## Authentication

- **Ingest endpoints** (`/api/ingest`): authenticated via `X-Probr-Key` header
- **Management endpoints**: no authentication required in the current version (secure via network/firewall)
- **Health check** (`/health`): public, no authentication

See [Authentication](authentication.md) for details.

## All Endpoints

| Method | Endpoint | Description | Docs |
|---|---|---|---|
| `GET` | `/health` | Application health check | — |
| `POST` | `/api/ingest` | Receive monitoring data from GTM Listener | [Ingest API](ingest-endpoint.md) |
| `POST` | `/api/ingest/flush` | Force flush aggregation buffer | [Monitoring API](monitoring-api.md) |
| `GET` | `/api/clients` | List all clients | [Management API](management-api.md) |
| `GET` | `/api/clients/{id}` | Get a client | [Management API](management-api.md) |
| `POST` | `/api/clients` | Create a client | [Management API](management-api.md) |
| `PATCH` | `/api/clients/{id}` | Update a client | [Management API](management-api.md) |
| `DELETE` | `/api/clients/{id}` | Delete a client (cascade) | [Management API](management-api.md) |
| `GET` | `/api/sites` | List all sites | [Management API](management-api.md) |
| `GET` | `/api/sites/{id}` | Get a site | [Management API](management-api.md) |
| `POST` | `/api/sites` | Create a site | [Management API](management-api.md) |
| `PATCH` | `/api/sites/{id}` | Update a site | [Management API](management-api.md) |
| `DELETE` | `/api/sites/{id}` | Delete a site (cascade) | [Management API](management-api.md) |
| `GET` | `/api/probes` | List probe configurations | [Management API](management-api.md) |
| `POST` | `/api/probes` | Create a probe | [Management API](management-api.md) |
| `PATCH` | `/api/probes/{id}` | Update a probe | [Management API](management-api.md) |
| `DELETE` | `/api/probes/{id}` | Delete a probe | [Management API](management-api.md) |
| `POST` | `/api/probes/{id}/run` | Manually trigger a probe | [Management API](management-api.md) |
| `GET` | `/api/probes/{id}/results` | Get probe execution history | [Management API](management-api.md) |
| `GET` | `/api/alerts` | List alerts (filterable) | [Management API](management-api.md) |
| `PATCH` | `/api/alerts/{id}/resolve` | Resolve an alert | [Management API](management-api.md) |
| `GET` | `/api/dashboard/overview` | Full control room view | [Monitoring API](monitoring-api.md) |
| `GET` | `/api/monitoring/sites/{id}/overview` | Aggregated monitoring | [Monitoring API](monitoring-api.md) |
| `GET` | `/api/monitoring/sites/{id}/batches` | Time-series data | [Monitoring API](monitoring-api.md) |
| `GET` | `/api/monitoring/sites/{id}/tags/{name}` | Per-tag health | [Monitoring API](monitoring-api.md) |

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
