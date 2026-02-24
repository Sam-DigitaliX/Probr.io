# Common Issues

## Tag Not Firing

### Symptom
The Probr Listener tag does not appear in GTM Preview mode, or appears with the status "Not Fired".

### Causes and Solutions

| Cause | Solution |
|---|---|
| **Missing trigger** | Verify that the "All Events" trigger (or your custom trigger) is attached to the tag |
| **Tag paused** | Check that the tag is not paused in GTM |
| **Version not published** | Publish a new container version |
| **Client-side container** | The tag is designed for **server-side** containers only. Verify you are in the correct container |

---

## Tag Fires but No Data in Probr

### Symptom
In Preview mode, the tag shows "Succeeded" but no data appears in the Probr dashboard.

### Checks

1. **Correct endpoint?**
   - Verify the URL in the tag configuration
   - Test with curl:
   ```bash
   curl -X POST https://api.probr.io/ingest \
     -H "Content-Type: application/json" \
     -H "X-Probr-Key: YOUR_KEY" \
     -d '{"container_id":"test","event_name":"test","timestamp_ms":0,"tags":[]}'
   ```
   - You should receive `{"status": "ok"}`

2. **Correct API key?**
   - Verify the key matches the site in the Probr dashboard
   - Check it hasn't been revoked

3. **Firewall / network?**
   - If your sGTM is behind a firewall, verify that outbound requests to `api.probr.io` (port 443) are allowed

4. **Preview vs Production mode**
   - GTM Preview mode can sometimes behave differently from production
   - Also check in production (wait a few minutes after publishing)

---

## "send failed (4xx)" Error in Console

### 401 — Unauthorized
The API key is missing or invalid.

**Solution**: check the "Probr Ingest Key" field in the tag configuration.

### 403 — Forbidden
The key has been revoked or the site is disabled.

**Solution**: go to Probr dashboard > Sites > check the site and key status.

### 429 — Rate Limited
You are exceeding your plan's requests per second limit.

**Solutions**:
- Switch to **batched** mode to reduce the number of requests
- Upgrade your Probr plan
- Check that you don't have multiple Probr tags firing on the same event

---

## Tag Names Not Showing in Dashboard

### Symptom
The dashboard shows "tag_15", "tag_22" instead of actual tag names.

### Cause
Tag metadata is not configured in GTM.

### Solution
For each tag in your container:

1. Open the tag in GTM
2. **Advanced Settings** > **Additional Tag Metadata**
3. Check **Include tag name**
4. Publish a new version

---

## user_data Always Shows False

### Symptom
The dashboard shows 0% email/phone/address presence even though you are sending this data.

### Possible Causes

1. **Data sent in wrong format**
   The tag checks the standard GA4 path:
   ```
   user_data.email_address
   user_data.phone_number
   user_data.address.first_name
   ```
   If your data is at a different path (e.g., `user.email`), it won't be detected.

2. **Data missing server-side**
   The sGTM client (GA4, custom) may not be transmitting `user_data` in the event data.
   - Check in Preview mode, **Event Data** tab, that `user_data` is present

3. **Consent not granted**
   If your CMP blocks sending `user_data` without marketing consent, the data won't be present in events without consent.

---

## E-commerce Data Always Empty

### Symptom
E-commerce metrics are all at 0% even though you have purchases.

### Cause
The tag only checks e-commerce data on these events:
- `purchase`
- `begin_checkout`
- `add_to_cart`
- `add_payment_info`

If your events use different names (e.g., `buy`, `checkout`), e-commerce data won't be checked.

### Solution
Use standard GA4 event names.

---

## Batched Mode: Data Lost on Restart

### Symptom
"Gaps" in data, often correlated with Cloud Run instance restarts.

### Cause
The batch buffer is stored in `templateDataStorage`, which is in-memory per instance. When an instance is terminated (scale down, redeployment), the unsent buffer is lost.

### Solutions

1. **Reduce batch size** so flushes happen more frequently
2. **Switch to per-event mode** if data loss is unacceptable
3. **Stabilize your instances**: configure a minimum instance count > 0 in Cloud Run (or equivalent)

---

## Tag Slowing Down My Container

### Symptom
Increased response time for the sGTM container after adding the Probr tag.

### Short Answer
**The Probr tag does not slow down your container.** It calls `data.gtmOnSuccess()` immediately, before data is even sent. The HTTP request is made **non-blocking** in the `addEventCallback` callback.

### If You Still Observe Slowdown

1. Check if the slowdown is caused by another tag added at the same time
2. Check latency to the Probr endpoint (should be <100ms)
3. In batched mode, `templateDataStorage` adds a read/write operation, but its impact is negligible (<1ms)
