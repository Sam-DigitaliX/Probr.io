# Limits and Quotas

## Payload Size

| Limit | Value |
|---|---|
| Maximum body size | 1 MB |
| Max tags per event | 500 |

> In practice, a per-event payload is ~1-5 KB. A batch of 200 aggregated events is ~10-50 KB.

## In-Memory Aggregation

The ingest endpoint uses an in-memory aggregation layer to minimize database write load:

- Events are aggregated into **1-minute windows** per site and container
- The buffer is **flushed every 30 seconds** to the database
- Only completed minute windows are flushed (the current minute stays in memory)
- You can force a flush via `POST /api/ingest/flush` (useful for debugging)

## Rate Limit Behavior

The current self-hosted version of Probr does **not** enforce rate limits or monthly quotas. Performance is limited only by your server's resources (CPU, memory, database).

### Recommendations

To keep your instance performant:

1. **Use batched mode** for high-traffic sites (>100 events/second) to reduce the number of HTTP requests
2. **Exclude unnecessary tags** via the "Tag IDs to Exclude" field to reduce payload size
3. **Monitor database size** — monitoring batches accumulate over time; consider setting up a retention policy (e.g., delete batches older than 90 days)
4. **Scale horizontally** if needed — the aggregation buffer is per-instance, so multiple backend instances can share the load

## Best Practices

1. **Use batched mode** if your site generates high event volumes
2. **Exclude unnecessary tags** via the "Tag IDs to Exclude" field to reduce payload size
3. **Set appropriate probe intervals** — 5 minutes (300s) is a good default; don't go below 60s unless necessary
4. **Monitor the `/health` endpoint** of your Probr instance to ensure it stays up
