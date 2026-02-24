# Send Modes

The Probr Listener tag supports two modes for sending data to the API.

## Per Event (recommended)

**One HTTP call per event.**

```
page_view event   ->  POST /ingest  ->  Probr API
purchase event    ->  POST /ingest  ->  Probr API
add_to_cart event ->  POST /ingest  ->  Probr API
```

### Advantages

- **Real-time**: each event appears immediately in the dashboard
- **No data loss**: no in-memory buffer, so no risk of loss if the sGTM instance restarts
- **Simplicity**: no additional configuration needed

### Disadvantages

- **More HTTP requests**: one request per event. On very high-traffic sites (>100k events/hour), this generates a significant request volume
- **Network latency**: each request has its own latency (although the tag is non-blocking)

### When to Use

- Low to medium traffic sites (<100k events/hour)
- When real-time monitoring is a priority
- During debug or initial setup phase
- When in doubt: **start with this mode**

### Payload Sent

```json
{
  "container_id": "GTM-XXXXXX",
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
      "status": "success",
      "execution_time": 350
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
}
```

---

## Batched (high traffic)

**Accumulates N events in memory, then sends an aggregated summary.**

```
Event 1  --+
Event 2  --+
...        +-- Buffer (templateDataStorage)
Event 49 --+
Event 50 --+---> POST /ingest (aggregated batch) -> Probr API
```

### Advantages

- **Fewer HTTP requests**: a single call for N events
- **Reduced network load**: suitable for very high-traffic sites
- **Optimized payload**: data is aggregated (counters), not raw events

### Disadvantages

- **Not real-time**: data appears in the dashboard in windows (every N events)
- **Risk of loss**: if the sGTM instance is terminated before the buffer is flushed, pending events are lost
- **Buffer per instance**: each Cloud Run instance maintains its own independent buffer

### When to Use

- Very high-traffic sites (>100k events/hour)
- When reducing network load takes priority over real-time
- Stable environments with few instance restarts

### Batch Configuration

| Parameter | Description | Default |
|---|---|---|
| **Batch Size** | Number of events before sending | 50 |

**Recommended batch sizes:**

| Traffic | Recommended batch size |
|---|---|
| 100k - 500k events/hour | 50 (default) |
| 500k - 1M events/hour | 100 |
| >1M events/hour | 200 |

> Do not exceed 500: the risk of data loss on restart increases with buffer size.

### Payload Sent (aggregated batch)

```json
{
  "container_id": "GTM-XXXXXX",
  "batch": true,
  "window_start_ms": 1708790400000,
  "window_end_ms": 1708790460000,
  "total_events": 50,
  "event_counts": {
    "page_view": 32,
    "purchase": 5,
    "add_to_cart": 8,
    "begin_checkout": 3,
    "view_item": 2
  },
  "tag_metrics": {
    "GA4 - Event": {
      "success": 48,
      "failure": 2,
      "timeout": 0,
      "exception": 0,
      "total_exec_ms": 6240,
      "count": 50
    },
    "Meta CAPI": {
      "success": 45,
      "failure": 3,
      "timeout": 2,
      "exception": 0,
      "total_exec_ms": 17500,
      "count": 50
    }
  },
  "user_data_quality": {
    "email": 42,
    "phone": 15,
    "address": 38,
    "total": 50
  },
  "ecommerce_quality": {
    "value": 5,
    "currency": 5,
    "transaction_id": 4,
    "items": 5,
    "total": 5
  }
}
```

### Reading Aggregated Metrics

- **tag_metrics**: to calculate a tag's success rate, divide `success` by `count`
  - Example: Meta CAPI -> 45/50 = **90% success rate**
  - Average execution time: `total_exec_ms / count` -> 17500/50 = **350ms**

- **user_data_quality**: to calculate email presence rate, divide `email` by `total`
  - Example: 42/50 = **84% of events have an email**

- **ecommerce_quality**: same logic, relative to e-commerce events only
  - Example: `transaction_id` 4/5 = **80% of purchases have a transaction_id**

---

## Comparison

| Criteria | Per Event | Batched |
|---|---|---|
| Real-time | Yes | No (windowed) |
| HTTP requests | 1 per event | 1 per N events |
| Data loss possible | No | Yes (on restart) |
| Configuration | None | Batch size |
| Recommended for | Most sites | Very high-traffic sites |
