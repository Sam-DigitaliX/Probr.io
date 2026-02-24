# Introduction

Probr is a monitoring platform for server-side tracking (sGTM). It analyzes the quality of your server-side Google Tag Manager implementation in real time, regardless of your hosting provider.

## The Problem

Your sGTM container processes thousands of events per day. But how do you know if:

- Your tags are firing correctly?
- User data (enhanced conversions) is being properly transmitted?
- E-commerce parameters are complete on your conversions?
- A tag has started failing silently after an update?

Without a dedicated monitoring tool, you're flying blind.

## The Probr Solution

Probr installs a **tag listener** in your sGTM container that observes all events and tag execution results, then sends this data to your Probr dashboard.

### What Probr Monitors

| Metric | Description |
|---|---|
| **Tag Health** | Success rate, failures, timeouts, and exceptions per tag |
| **Execution Time** | Execution duration of each tag (in ms) |
| **Event Volume** | Number of events by type (page_view, purchase, etc.) |
| **User Data Quality** | Presence of enhanced conversion fields: email, phone, address |
| **E-commerce Quality** | Presence of value, currency, transaction_id, items on conversion events |

### Compatible with All Hosting Providers

Probr works with **any sGTM hosting provider**:

- Stape
- Addingwell
- Google Cloud Run (self-hosted)
- AWS / Azure / other cloud
- Any other sGTM setup

## Architecture

```
Browser
    |
    v
sGTM Container -------> Tags (GA4, Meta, TikTok, etc.)
    |                        |
    |                        v
    |               addEventCallback
    |                        |
    |                        v
    |               Probr Listener Tag
    |                        |
    |                        v
    |               POST -> Probr API
    |                        |
    |                        v
    +---------------> Probr Dashboard
                    (real-time monitoring)
```

## Next Step

Follow the [Prerequisites and Installation](./prerequisites.md) guide to get started.
