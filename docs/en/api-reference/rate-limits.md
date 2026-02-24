# Limits and Quotas

## Rate Limits

Limits depend on your Probr plan:

| Plan | Requests / second | Events / month |
|---|---|---|
| **Free** | 10 req/s | 100,000 |
| **Pro** | 100 req/s | 1,000,000 |
| **Business** | 500 req/s | 10,000,000 |
| **Enterprise** | Custom | Custom |

### How Limits Apply

- **Requests/second**: per ingest key (i.e., per site)
- **Events/month**: cumulative total of all events received for the site
  - In per-event mode: 1 request = 1 event
  - In batched mode: 1 request = N events (`total_events` in the payload)

### Rate Limit Exceeded

If the rate limit is exceeded, the API returns:

```
HTTP 429 Too Many Requests
```

```json
{
  "error": "rate_limited",
  "retry_after_ms": 1000
}
```

The GTM tag will log: `Probr: send failed (429)`

> Occasional exceedances do not cause permanent data loss. On the tag side, data is simply not resent (per-event mode) or stays in the buffer (batched mode).

### Monthly Quota Exceeded

When the monthly quota is reached:

- The API returns `403` with `{"error": "quota_exceeded"}`
- A notification is sent by email
- Data is no longer stored until renewal
- The tag continues to work (it logs the error but does not block execution of other tags)

## Payload Size

| Limit | Value |
|---|---|
| Maximum body size | 1 MB |
| Max tags per event | 500 |

> In practice, a per-event payload is ~1-5 KB. A batch of 200 aggregated events is ~10-50 KB.

## Best Practices

1. **Use batched mode** if you're approaching requests/second limits
2. **Exclude unnecessary tags** via the "Tag IDs to Exclude" field to reduce payload size
3. **Monitor your usage** in Probr dashboard > Settings > Usage
