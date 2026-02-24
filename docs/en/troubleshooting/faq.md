# FAQ

## General Questions

### Does Probr collect personal data?

**No.** Probr does not collect any personal data (PII). The tag only checks the **presence** of fields (true/false), never their content. No email, phone number, or address is transmitted to Probr.

### Is Probr GDPR compliant?

Yes. Probr does not process any personal data from your site visitors. It only analyzes technical metadata (event names, tag statuses, field presence counters). No visitor consent is required for Probr to operate.

### Does Probr work with all sGTM hosting providers?

Yes. Probr is hosting-agnostic. It works with:
- **Stape** (cloud and on-premise)
- **Addingwell**
- **Google Cloud Run** (self-hosted)
- **AWS** (ECS, Fargate, EC2)
- **Azure** (Container Apps, ACI)
- Any other sGTM-compatible hosting

### Does Probr work with client-side GTM?

No. The Probr Listener tag is designed exclusively for **server-side** containers. It uses server-side sandboxed APIs (`addEventCallback`, `sendHttpRequest`, `templateDataStorage`) that are not available client-side.

### How many sites can I monitor?

Since Probr is self-hosted, there is **no built-in limit** on the number of sites. You can monitor as many sites as your server resources allow. Each site has its own ingest key and probe configurations.

---

## Technical Questions

### Does the Probr tag impact my container's performance?

No. The tag:
1. Calls `data.gtmOnSuccess()` immediately (non-blocking)
2. Sends data in the `addEventCallback` callback which executes after event processing
3. Adds no latency to the container's HTTP response to the browser

### Can I use Probr with multiple containers?

Yes. Each sGTM container will have its own Probr Listener tag with the same ingest key (if it's the same site) or different keys (if they are different sites). The Probr dashboard distinguishes containers by their `container_id`.

### What happens if the Probr API is unavailable?

The tag logs an error message in the sGTM console (`Probr: send failed`) but **never blocks** execution of other tags. Your tracking continues to work normally. Data during the outage is simply lost (not resent).

### Can I send data to a self-hosted endpoint?

Yes. If you host your own Probr instance, configure your endpoint URL in the tag's "Probr Ingest Endpoint" field. The API must follow the same payload and response format (see [API Reference](../api-reference/ingest-endpoint.md)).

### How does storage work in batched mode?

The tag uses `templateDataStorage`, a GTM server-side API that stores data in memory at the instance level. Key points:
- **No persistence**: data is lost if the instance restarts
- **Per instance**: each Cloud Run instance has its own buffer
- **No explicit size limit**, but Google recommends keeping stored objects reasonably small

### Can I use a GTM variable for the endpoint or key?

Yes. The "Probr Ingest Endpoint" and "Probr Ingest Key" fields accept GTM variables. For example, you can use an environment variable to differentiate production and staging:
- Production: `pk_live_xxx`
- Staging: `pk_test_xxx`

---

## Dashboard Questions

### How often is the dashboard updated?

- **Per-event mode**: near real-time (a few seconds of latency)
- **Batched mode**: on each batch flush (depends on batch size and traffic volume)

### Can I configure alerts?

Yes. Probr automatically creates alerts when probes detect issues (CRITICAL or WARNING status). Alerts are delivered via:
- **Slack webhooks** (global and per-client)
- **Email** (via SMTP)

Alerts are automatically resolved when the probe returns to OK status. You can also resolve alerts manually via the API. See [Alert Management](../monitoring/alerts.md) for details.

### How long is data retained?

Since Probr is self-hosted, data is retained indefinitely by default in your PostgreSQL database. You can set up your own retention policy (e.g., a cron job to delete monitoring batches older than 90 days).
