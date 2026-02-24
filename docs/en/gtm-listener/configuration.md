# GTM Listener Configuration

This guide details all configuration options for the **Probr — Server-Side Listener** tag.

## Tag Parameters

### Probr Ingest Endpoint

| Property | Value |
|---|---|
| **Type** | URL (text) |
| **Required** | Yes |
| **Validation** | Must start with `https://` |

The URL of the Probr ingestion API where monitoring data is sent.

**Possible values:**

- **Probr Cloud**: `https://api.probr.io/ingest`
- **Self-hosted**: `https://your-instance.example.com/api/ingest`

### Probr Ingest Key

| Property | Value |
|---|---|
| **Type** | Text |
| **Required** | Yes |

The authentication key for your site. Each site in Probr has its own key.

**Where to find it**: Probr Dashboard > Sites > your site > Settings > Ingest Key

> **Security**: this key is sent server-side only (sGTM -> Probr API). It is never exposed client-side.

### Track user data quality

| Property | Value |
|---|---|
| **Type** | Checkbox |
| **Default** | Enabled |

When enabled, the tag checks the **presence** (not the content) of user data fields in the event's `user_data` object:

| Field checked | Path in event |
|---|---|
| Email | `user_data.email_address` |
| Phone | `user_data.phone_number` |
| First name | `user_data.address.first_name` |
| Last name | `user_data.address.last_name` |
| City | `user_data.address.city` |
| Country | `user_data.address.country` |

> **Important**: Probr does **not collect any personal data**. It only checks whether fields are populated (`true`/`false`), never their value.

### Tag IDs to Exclude

| Property | Value |
|---|---|
| **Type** | Text |
| **Default** | Empty |

Comma-separated list of tag IDs. These tags will be ignored in monitoring.

**Primary use**: exclude the Probr tag itself to avoid a loop.

**Example**: `42` or `42, 58, 103`

### Send Mode

| Property | Value |
|---|---|
| **Type** | Dropdown |
| **Default** | Per event |

See the detailed section [Send Modes](./send-modes.md).

### Batch Size

| Property | Value |
|---|---|
| **Type** | Number |
| **Default** | 50 |
| **Visible if** | Send Mode = Batched |

The number of events to accumulate before sending a batch. See [Send Modes](./send-modes.md).

## Automatically Collected Data

In addition to configurable parameters, the tag automatically collects:

### Container Information

| Data | Source | Description |
|---|---|---|
| `container_id` | `getContainerVersion()` | Unique sGTM container ID |
| `timestamp_ms` | `getTimestampMillis()` | Event timestamp in milliseconds |

### Tag Execution Results

For each tag that executes during an event:

| Data | Description |
|---|---|
| `id` | Numeric tag ID in GTM |
| `name` | Tag name (if metadata is configured) |
| `status` | `success`, `failure`, `timeout`, or `exception` |
| `execution_time` | Execution duration in milliseconds |

### E-commerce Quality

On `purchase`, `begin_checkout`, `add_to_cart`, and `add_payment_info` events, the tag checks for the presence of:

| Field | Path in event |
|---|---|
| Value | `value` |
| Currency | `currency` |
| Transaction ID | `transaction_id` |
| Items | `items` |

## Required Permissions

The tag requires the following server-side permissions:

| Permission | Usage |
|---|---|
| **send_http** | Send data to the Probr API |
| **read_event_data** | Read event name, user_data, and e-commerce parameters |
| **access_template_storage** | Store buffer in batched mode |
| **read_container_data** | Read container ID |
| **logging** | Debug logs in Preview mode |

These permissions are declared in the template and validated by Google during Gallery review.
