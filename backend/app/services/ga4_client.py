"""GA4 revenue source for the revenue_triangulation probe (Phase 1).

Auth = a shared Google **service account** (env `GA4_SERVICE_ACCOUNT_JSON`,
the JSON key as a string). The client adds the SA's email as a Viewer on their
GA4 property. OAuth self-service is deferred to Phase 2.

The Google Analytics Data API client is synchronous (gRPC), so the blocking call
is isolated in `_run_report` and executed via `asyncio.to_thread`. Tests mock
`_run_report`, so neither the google libraries nor the network are needed to run
the unit tests.
"""

import asyncio
import json
import os
from datetime import date, datetime

from app.probes.revenue_triangulation import SourceRevenue

GA4_SCOPES = ["https://www.googleapis.com/auth/analytics.readonly"]


def _fmt(d: date | datetime) -> str:
    """GA4 Data API expects 'YYYY-MM-DD'."""
    if isinstance(d, datetime):
        d = d.date()
    return d.isoformat()


def _load_credentials_info(override: dict | None = None) -> dict:
    if override is not None:
        return override
    raw = os.environ.get("GA4_SERVICE_ACCOUNT_JSON")
    if not raw:
        raise RuntimeError("GA4_SERVICE_ACCOUNT_JSON not configured")
    return json.loads(raw) if isinstance(raw, str) else raw


def _run_report(property_id: str, start: date | datetime, end: date | datetime, credentials_info: dict):
    """Blocking GA4 Data API call. Returns (revenue, conversions). google libs imported lazily."""
    from google.analytics.data_v1beta import BetaAnalyticsDataClient
    from google.analytics.data_v1beta.types import DateRange, Metric, RunReportRequest
    from google.oauth2 import service_account

    creds = service_account.Credentials.from_service_account_info(credentials_info, scopes=GA4_SCOPES)
    client = BetaAnalyticsDataClient(credentials=creds)
    request = RunReportRequest(
        property=f"properties/{property_id}",
        metrics=[Metric(name="purchaseRevenue"), Metric(name="transactions")],
        date_ranges=[DateRange(start_date=_fmt(start), end_date=_fmt(end))],
    )
    response = client.run_report(request)

    revenue, conversions = 0.0, 0.0
    if response.rows:  # no dimensions -> a single totals row
        values = response.rows[0].metric_values
        revenue = float(values[0].value or 0)
        conversions = float(values[1].value or 0)
    return revenue, conversions


async def fetch_ga4_revenue(
    property_id: str,
    start: date | datetime,
    end: date | datetime,
    *,
    currency: str = "EUR",
    credentials_info: dict | None = None,
) -> SourceRevenue:
    """Fetch GA4 revenue (purchaseRevenue) + conversions over the window.

    Currency isn't returned by the Data API; the caller passes the site's currency.
    Treated as TTC for the triangulation ratio.
    """
    info = _load_credentials_info(credentials_info)
    revenue, conversions = await asyncio.to_thread(_run_report, property_id, start, end, info)
    return SourceRevenue(revenue=revenue, currency=currency, conversions=conversions, basis="ttc")
