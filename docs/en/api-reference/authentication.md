# API Authentication

## Authentication Model

Probr uses two different authentication mechanisms depending on the endpoint:

| Endpoint Group | Authentication | Description |
|---|---|---|
| `POST /api/ingest` | `X-Probr-Key` header | Ingest key (auto-generated per site) |
| All other `/api/*` | None (current version) | Secure via network/firewall |
| `GET /health` | None | Public health check |

## Ingest Key Authentication

The ingest endpoint requires an API key transmitted via the `X-Probr-Key` HTTP header.

### Header

```
X-Probr-Key: your_ingest_key_here
```

### Example

```bash
curl -X POST https://your-probr-instance/api/ingest \
  -H "Content-Type: application/json" \
  -H "X-Probr-Key: abc123def456..." \
  -d '{"container_id": "GTM-XXXXXX", "event_name": "page_view", "timestamp_ms": 1708770000000}'
```

## How Ingest Keys Work

- Each site receives an **auto-generated** ingest key upon creation (32-byte URL-safe token)
- Keys are **scoped per site**: a key can only send data for the site it is attached to
- Keys are transmitted **server-side only** (sGTM -> Probr API) — never exposed in the client browser
- Keys are unique across all sites in the database

## Where to Find Your Key

The ingest key is returned when you create or retrieve a site via the API:

```bash
# Get a site (includes ingest_key in response)
curl -s https://your-probr-instance/api/sites/{site_id}
```

The key is in the `ingest_key` field of the response. Configure it in the GTM Listener tag's "Probr Ingest Key" field.

## Key Rotation

To rotate a key, you currently need to delete and recreate the site (the key is auto-generated). A dedicated key rotation endpoint may be added in a future version.

## Security Recommendations

1. **Network-level security**: Since management endpoints have no authentication in the current version, restrict access to the Probr API via firewall rules, VPN, or reverse proxy authentication
2. **Never expose ingest keys client-side**: The GTM Listener tag runs server-side, so keys are never visible to end users
3. **Monitor the `/health` endpoint**: Set up external monitoring to detect if your Probr instance goes down

## Authentication Response Codes

| Code | Meaning |
|---|---|
| `202` | Ingest accepted |
| `401` | Missing or invalid ingest key |
| `404` | Site not found or inactive |
