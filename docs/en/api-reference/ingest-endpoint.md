# Ingest Endpoint

The main Probr API endpoint receives monitoring data from the sGTM tag.

## POST /ingest

```
POST https://api.probr.io/ingest
```

### Required Headers

| Header | Value | Required |
|---|---|---|
| `Content-Type` | `application/json` | Yes |
| `X-Probr-Key` | Your ingest key | Yes |

---

## Payload: Per Event Mode

Sent for each event when the send mode is `per_event`.

### Schema

```json
{
  "container_id": "string",
  "event_name": "string",
  "timestamp_ms": 0,
  "tags": [
    {
      "id": "string",
      "name": "string",
      "status": "string",
      "execution_time": 0
    }
  ],
  "user_data": {
    "has_email": false,
    "has_phone": false,
    "has_first_name": false,
    "has_last_name": false,
    "has_city": false,
    "has_country": false
  },
  "ecommerce": {
    "has_value": false,
    "has_currency": false,
    "has_transaction_id": false,
    "has_items": false
  }
}
```

### Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `container_id` | string | Yes | sGTM container ID (e.g., `GTM-XXXXXX`) |
| `event_name` | string | Yes | GA4 event name (e.g., `purchase`, `page_view`) |
| `timestamp_ms` | integer | Yes | Unix timestamp in milliseconds |
| `tags` | array | Yes | List of tags executed for this event |
| `tags[].id` | string | Yes | Numeric tag ID in GTM |
| `tags[].name` | string | No | Tag name (if metadata configured) |
| `tags[].status` | string | Yes | `success`, `failure`, `timeout`, or `exception` |
| `tags[].execution_time` | integer | No | Execution duration in ms |
| `user_data` | object | No | Presence of enhanced conversion fields |
| `ecommerce` | object | No | Presence of e-commerce fields (commerce events only) |

### Full Example

```bash
curl -X POST https://api.probr.io/ingest \
  -H "Content-Type: application/json" \
  -H "X-Probr-Key: pk_live_abc123" \
  -d '{
    "container_id": "GTM-ABC123",
    "event_name": "purchase",
    "timestamp_ms": 1708790400000,
    "tags": [
      {
        "id": "15",
        "name": "GA4 - Event",
        "status": "success",
        "execution_time": 120
      },
      {
        "id": "22",
        "name": "Meta CAPI",
        "status": "failure",
        "execution_time": 5000
      }
    ],
    "user_data": {
      "has_email": true,
      "has_phone": false,
      "has_first_name": true,
      "has_last_name": true,
      "has_city": false,
      "has_country": true
    },
    "ecommerce": {
      "has_value": true,
      "has_currency": true,
      "has_transaction_id": true,
      "has_items": true
    }
  }'
```

---

## Payload: Batched Mode

Sent when the buffer reaches the configured size (`batchSize`).

### Schema

```json
{
  "container_id": "string",
  "batch": true,
  "window_start_ms": 0,
  "window_end_ms": 0,
  "total_events": 0,
  "event_counts": {},
  "tag_metrics": {},
  "user_data_quality": {},
  "ecommerce_quality": {}
}
```

### Fields

| Field | Type | Description |
|---|---|---|
| `container_id` | string | sGTM container ID |
| `batch` | boolean | Always `true` — used to distinguish from per-event mode |
| `window_start_ms` | integer | Timestamp of the first event in the batch |
| `window_end_ms` | integer | Timestamp of the last event in the batch |
| `total_events` | integer | Total number of events in the batch |
| `event_counts` | object | `{ "event_name": count }` — volume by event type |
| `tag_metrics` | object | Aggregated metrics per tag (see below) |
| `user_data_quality` | object | User data presence counters |
| `ecommerce_quality` | object | E-commerce data presence counters |

### `tag_metrics` Structure

```json
{
  "GA4 - Event": {
    "success": 48,
    "failure": 2,
    "timeout": 0,
    "exception": 0,
    "total_exec_ms": 6240,
    "count": 50
  }
}
```

| Field | Type | Description |
|---|---|---|
| `success` | integer | Number of successful executions |
| `failure` | integer | Number of failures |
| `timeout` | integer | Number of timeouts |
| `exception` | integer | Number of exceptions |
| `total_exec_ms` | integer | Total cumulative execution time (ms) |
| `count` | integer | Total number of executions |

### `user_data_quality` Structure

```json
{
  "email": 42,
  "phone": 15,
  "address": 38,
  "total": 50
}
```

Each value = number of events where the field was present. `total` = total number of events (for calculating percentages).

### `ecommerce_quality` Structure

```json
{
  "value": 5,
  "currency": 5,
  "transaction_id": 4,
  "items": 5,
  "total": 5
}
```

Same logic: number of e-commerce events where each field was present.

---

## Responses

| Code | Body | Description |
|---|---|---|
| `200` | `{"status": "ok"}` | Data received and stored |
| `400` | `{"error": "invalid_payload"}` | Invalid JSON payload or missing fields |
| `401` | `{"error": "unauthorized"}` | Missing or invalid API key |
| `403` | `{"error": "forbidden"}` | Revoked key or disabled site |
| `413` | `{"error": "payload_too_large"}` | Payload > 1 MB |
| `429` | `{"error": "rate_limited"}` | Too many requests (see [Limits](./rate-limits.md)) |
| `500` | `{"error": "internal_error"}` | Server error — retry |

## Timeout

The sGTM tag sends requests with a timeout of:
- **5 seconds** in per-event mode
- **10 seconds** in batched mode

The Probr API typically responds in **<100ms**.
