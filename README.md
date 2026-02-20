# TrackGuard

Active monitoring & alerting for client tracking infrastructure (sGTM, GTM, GA4, BigQuery, CMP, Stape, Addingwell).

## Architecture

```
FastAPI (Python) ──► PostgreSQL
    │
    ├── Probes: HTTP health, sGTM infra, GTM versions, data volume, CMP, tags
    ├── Scheduler: APScheduler (async, configurable intervals)
    ├── Alerts: Slack webhooks + email (SMTP)
    └── API: REST endpoints for dashboard + management
```

## Quick Start

```bash
# 1. Copy environment config
cp .env.example .env

# 2. Start PostgreSQL
docker compose up -d db

# 3. Install Python dependencies
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 4. Run database migrations
alembic upgrade head

# 5. Start the API
uvicorn app.main:app --reload
```

API docs available at `http://localhost:8000/docs`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/overview` | Control room — full status overview |
| GET/POST | `/api/clients` | Manage clients |
| GET/POST | `/api/sites` | Manage sites |
| GET/POST | `/api/probes` | Configure monitoring probes |
| POST | `/api/probes/{id}/run` | Manually trigger a probe |
| GET | `/api/alerts` | List alerts |
| PATCH | `/api/alerts/{id}/resolve` | Resolve an alert |

## Probe Types

| Probe | Description | Status |
|-------|-------------|--------|
| `http_health` | Ping sGTM endpoint, check status + latency | ✅ Implemented |
| `sgtm_infra` | Stape/Addingwell container status | Planned |
| `gtm_version` | Detect GTM container publications | Planned |
| `data_volume` | Anomaly detection on event volumes (BQ/GA4) | Planned |
| `bq_events` | Verify expected events in BigQuery | Planned |
| `tag_check` | Headless browser tag verification | Planned |
| `cmp_check` | Consent banner & signal verification | Planned |
