# API Authentication

All requests to the Probr API must be authenticated.

## Authentication Method

The API uses **API key** authentication transmitted in an HTTP header.

### Header

```
X-Probr-Key: your_key_here
```

### Example

```bash
curl -X POST https://api.probr.io/ingest \
  -H "Content-Type: application/json" \
  -H "X-Probr-Key: pk_live_abc123def456" \
  -d '{"container_id": "GTM-XXXXXX", "event_name": "test"}'
```

## Key Types

| Type | Prefix | Usage |
|---|---|---|
| **Ingest key** | `pk_live_` | Sending data from the sGTM tag |
| **Test key** | `pk_test_` | Sending test data (does not pollute production dashboards) |

## Where to Find Your Keys

1. Log in to the [Probr dashboard](https://app.probr.io)
2. Go to **Sites** > select your site
3. **Settings** tab > **API Keys** section
4. Copy the desired key

## Security

- Keys are **scoped per site**: a key can only send data for the site it is attached to
- Keys are transmitted **server-side only** (sGTM -> Probr API) — they are never exposed in the client browser
- You can **revoke and regenerate** a key at any time from the dashboard
- Requests with an invalid or revoked key receive a `401 Unauthorized` response

## Key Rotation

To rotate a key without downtime:

1. Generate a new key in the Probr dashboard
2. Update the key in your GTM tag
3. Publish the new version of the sGTM container
4. Wait for all instances to have the new version
5. Revoke the old key

> Probr accepts both keys (old and new) during a 24-hour grace period after revocation.

## Authentication Response Codes

| Code | Meaning |
|---|---|
| `200` | Success |
| `401` | Missing or invalid key |
| `403` | Revoked key or disabled site |
| `429` | Rate limit exceeded (see [Limits](./rate-limits.md)) |
