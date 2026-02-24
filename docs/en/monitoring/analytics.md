# Monitoring Analytics

## Overview

The monitoring analytics endpoints provide detailed insights into the data collected by the Probr GTM Listener tag. They aggregate event volumes, tag health metrics, and user data quality scores over configurable time windows.

## Endpoints

### `GET /api/monitoring/sites/{site_id}/overview`

Returns an aggregated overview of all monitoring data for a site over the last N hours.

**Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `site_id` | UUID | required | The site to query |
| `hours` | int | 24 | Time window in hours |

**Response:**

```json
{
  "site_id": "uuid",
  "site_name": "acme.com - Production",
  "container_id": "GTM-XXXXX",
  "period_hours": 24,
  "total_events": 47832,
  "events": [
    { "event_name": "page_view", "total_count": 38210 },
    { "event_name": "purchase", "total_count": 412 },
    { "event_name": "add_to_cart", "total_count": 1893 }
  ],
  "tags": [
    {
      "tag_name": "GA4",
      "total_executions": 47832,
      "success_count": 47810,
      "failure_count": 22,
      "success_rate": 99.95,
      "avg_execution_time_ms": 45.2
    },
    {
      "tag_name": "Facebook CAPI",
      "total_executions": 47832,
      "success_count": 47100,
      "failure_count": 732,
      "success_rate": 98.47,
      "avg_execution_time_ms": 120.8
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

### `GET /api/monitoring/sites/{site_id}/batches`

Returns raw monitoring batches for building time-series charts. Each batch represents a 1-minute aggregation window.

**Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `site_id` | UUID | required | The site to query |
| `hours` | int | 24 | Time window in hours |
| `limit` | int | 1440 | Maximum number of batches to return |

**Response:** An array of `MonitoringBatch` objects, each containing:

| Field | Type | Description |
|---|---|---|
| `window_start` | datetime | Start of the 1-minute window |
| `window_seconds` | int | Window duration (always 60) |
| `total_events` | int | Number of events in this window |
| `event_counts` | object | `{"page_view": 847, "purchase": 12, ...}` |
| `tag_metrics` | object | Per-tag success/failure/timeout/exception counts |
| `user_data_quality` | object | `{"email": 340, "phone": 120, "address": 80, "total": 1000}` |
| `ecommerce_quality` | object | `{"value": 12, "currency": 12, "transaction_id": 12, "items": 12, "total": 12}` |

### `GET /api/monitoring/sites/{site_id}/tags/{tag_name}`

Returns detailed health metrics for a specific tag.

**Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `site_id` | UUID | required | The site to query |
| `tag_name` | string | required | Tag name (URL-encoded if needed) |
| `hours` | int | 24 | Time window in hours |

**Response:**

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

Returns `404` if no data is found for the given tag.

## Key Metrics Explained

### Event Volume
Total number of events received from the GTM Listener tag, broken down by event name (`page_view`, `purchase`, `add_to_cart`, etc.).

### Tag Health
For each tag in your sGTM container, Probr tracks:
- **Success count**: tags that executed without errors
- **Failure count**: includes failures, timeouts, and exceptions
- **Success rate**: percentage of successful executions
- **Average execution time**: mean execution time across all runs

### User Data Quality
Measures the presence rate of key user data fields across all events:
- **Email rate**: % of events with a hashed email present
- **Phone rate**: % of events with a phone number present
- **Address rate**: % of events with name/address data present

### E-commerce Quality
For e-commerce events, tracks completeness of:
- `value`, `currency`, `transaction_id`, `items`

## Data Flow

```
GTM Listener Tag → POST /api/ingest → In-memory aggregation (1-min windows)
                                            ↓ (flush every 30s)
                                       PostgreSQL (monitoring_batches table)
                                            ↓
                                   /api/monitoring/* endpoints
```

The data goes through an in-memory aggregation layer before being written to the database, which minimizes write load while maintaining near real-time visibility.
