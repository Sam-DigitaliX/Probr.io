# Clients & Sites

## Overview

Probr organizes monitoring in a two-level hierarchy:

```
Client → Sites → Probes
```

- A **Client** represents a company or project
- A **Site** represents a specific web property belonging to a client
- Each site has its own **ingest key**, **probe configurations**, and **tracking infrastructure settings**

## Clients

### Data Model

| Field | Type | Description |
|---|---|---|
| `id` | UUID | Auto-generated unique identifier |
| `name` | string | Client name (required) |
| `email` | string | Contact email — used for email alert notifications |
| `slack_webhook` | string | Client-specific Slack webhook URL — receives alerts for this client |
| `is_active` | bool | Whether the client is active (default: `true`) |
| `created_at` | datetime | Creation timestamp |

### API Endpoints

#### `GET /api/clients`

List all clients.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `active_only` | bool | `false` | Only return active clients |

#### `GET /api/clients/{client_id}`

Get a single client by ID.

#### `POST /api/clients`

Create a new client.

```json
{
  "name": "Acme Corp",
  "email": "ops@acme.com",
  "slack_webhook": "https://hooks.slack.com/services/T.../B.../xxx"
}
```

#### `PATCH /api/clients/{client_id}`

Update a client. Only include the fields you want to change.

```json
{
  "email": "new-ops@acme.com"
}
```

#### `DELETE /api/clients/{client_id}`

Delete a client and **all associated sites, probes, and alerts** (cascade).

## Sites

### Data Model

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | UUID | auto | Unique identifier |
| `client_id` | UUID | yes | Parent client |
| `name` | string | yes | Site name (e.g., "acme.com - Production") |
| `url` | string | yes | Main URL of the website |
| `ingest_key` | string | auto | Auto-generated key for GTM Listener authentication |
| `is_active` | bool | auto | Default: `true` |

### Tracking Infrastructure Fields

These optional fields configure which probes can run and what they monitor:

| Field | Type | Used By | Description |
|---|---|---|---|
| `sgtm_url` | string | `http_health`, `sgtm_infra` | URL of the sGTM endpoint |
| `gtm_web_container_id` | string | `gtm_version` | Web GTM container ID (e.g., `GTM-XXXXX`) |
| `gtm_server_container_id` | string | `gtm_version` | Server GTM container ID |
| `ga4_property_id` | string | — | GA4 property ID (e.g., `123456789`) |
| `ga4_measurement_id` | string | — | GA4 measurement ID (e.g., `G-XXXXXXXX`) |
| `bigquery_project` | string | `bq_events` | GCP project ID for BigQuery |
| `bigquery_dataset` | string | `bq_events` | BigQuery dataset name |
| `stape_container_id` | string | `sgtm_infra` | Stape container identifier |
| `addingwell_container_id` | string | `sgtm_infra` | Addingwell container identifier |
| `cmp_provider` | string | `cmp_check` | CMP provider name (`axeptio`, `didomi`, `cookiebot`, etc.) |

### API Endpoints

#### `GET /api/sites`

List all sites.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `client_id` | UUID | optional | Filter by client |
| `active_only` | bool | `false` | Only return active sites |

#### `GET /api/sites/{site_id}`

Get a single site by ID. Returns the full site object including the `ingest_key`.

#### `POST /api/sites`

Create a new site. The `ingest_key` is auto-generated.

```json
{
  "client_id": "uuid",
  "name": "acme.com - Production",
  "url": "https://acme.com",
  "sgtm_url": "https://sgtm.acme.com",
  "gtm_server_container_id": "GTM-XXXXXX"
}
```

#### `PATCH /api/sites/{site_id}`

Update a site. Only include the fields you want to change.

```json
{
  "sgtm_url": "https://new-sgtm.acme.com",
  "stape_container_id": "abc-123"
}
```

#### `DELETE /api/sites/{site_id}`

Delete a site and **all associated probes, alerts, and monitoring data** (cascade).

## Ingest Keys

Each site receives an auto-generated **ingest key** upon creation. This key is used by the GTM Listener tag to authenticate requests to the `POST /api/ingest` endpoint.

- Keys are 32-byte URL-safe tokens
- Keys are unique across all sites
- To rotate a key, delete and recreate the site (or update via API when rotation is implemented)

The ingest key is returned in the `SiteRead` response and must be configured in the GTM Listener tag's "Probr Ingest Key" field.
