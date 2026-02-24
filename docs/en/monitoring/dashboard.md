# Dashboard & Control Room

## Overview

The Probr dashboard provides a centralized control room to monitor the health of all your clients, sites, and probes in real time. The main endpoint returns a hierarchical view:

```
Client → Sites → Probes → Latest results
```

Each level aggregates the status of its children using a **worst-status** priority system.

## Status Hierarchy

Probr uses four status levels, ordered from most severe to least:

| Status | Priority | Meaning |
|---|---|---|
| `critical` | Highest | A probe detected a major failure |
| `error` | High | The probe execution itself failed |
| `warning` | Medium | A threshold has been breached |
| `ok` | Normal | Everything is working correctly |

A site's overall status is the **worst** status among its active probes. A client's overall status is the **worst** status among its active sites.

## API Endpoint

### `GET /api/dashboard/overview`

Returns the full control room view with all active clients, their sites, probe statuses, and recent alerts.

**Response schema:**

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
  "recent_alerts": [
    {
      "id": "uuid",
      "site_id": "uuid",
      "probe_config_id": "uuid",
      "severity": "warning",
      "probe_type": "http_health",
      "title": "[WARNING] http_health — staging.acme.com",
      "message": "HTTP 503 — Service Unavailable",
      "is_resolved": false,
      "resolved_at": null,
      "notified_at": "2025-02-24T10:31:00Z",
      "created_at": "2025-02-24T10:30:00Z"
    }
  ]
}
```

### Response Fields

| Field | Type | Description |
|---|---|---|
| `total_clients` | int | Number of active clients |
| `total_sites` | int | Number of active sites across all clients |
| `total_ok` / `total_warning` / `total_critical` | int | Site count by status |
| `clients[]` | array | List of client overviews |
| `clients[].sites[]` | array | List of site overviews for this client |
| `clients[].sites[].probes[]` | array | Latest result for each active probe |
| `recent_alerts` | array | Last 20 alerts (resolved and unresolved) |

## How It Works

1. The endpoint loads all **active clients** with their sites and probe configurations
2. For each active probe, it fetches the **latest result** from the database
3. It counts **unresolved alerts** per site
4. It computes **aggregated statuses** bottom-up (probe → site → client)
5. It returns the last **20 recent alerts** across all sites

## Use Cases

- **At a glance monitoring**: see which clients/sites need attention
- **Drill down**: identify which specific probe triggered an issue
- **Alert feed**: review recent alerts and their resolution status
- **SLA reporting**: track uptime across your client portfolio
