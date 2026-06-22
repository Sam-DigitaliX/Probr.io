"""Workstream 4: GA4 revenue client.

The Google API is mocked at the `_run_report` boundary, so these are pure unit
tests — no google libraries, no network, no credentials needed. They run
everywhere (no @integration marker).
"""

from datetime import date, datetime

import pytest

from app.probes.revenue_triangulation import SourceRevenue
from app.services import ga4_client


def test_fmt_handles_date_and_datetime():
    assert ga4_client._fmt(date(2026, 4, 21)) == "2026-04-21"
    assert ga4_client._fmt(datetime(2026, 4, 21, 13, 30, 5)) == "2026-04-21"


async def test_fetch_returns_source_revenue(monkeypatch):
    monkeypatch.setattr(ga4_client, "_run_report", lambda pid, s, e, info: (82352.0, 243.0))
    res = await ga4_client.fetch_ga4_revenue(
        "123456789", date(2026, 4, 21), date(2026, 4, 28),
        currency="EUR", credentials_info={"type": "service_account"},
    )
    assert isinstance(res, SourceRevenue)
    assert res.revenue == 82352.0
    assert res.conversions == 243.0
    assert res.currency == "EUR"
    assert res.basis == "ttc"


async def test_credentials_loaded_from_env(monkeypatch):
    monkeypatch.setenv("GA4_SERVICE_ACCOUNT_JSON", '{"type": "service_account"}')
    captured = {}

    def fake_run(pid, s, e, info):
        captured["info"] = info
        return (10.0, 1.0)

    monkeypatch.setattr(ga4_client, "_run_report", fake_run)
    res = await ga4_client.fetch_ga4_revenue("123", date(2026, 4, 21), date(2026, 4, 28))
    assert res.revenue == 10.0
    assert captured["info"] == {"type": "service_account"}


async def test_missing_credentials_raises(monkeypatch):
    monkeypatch.delenv("GA4_SERVICE_ACCOUNT_JSON", raising=False)
    with pytest.raises(RuntimeError):
        await ga4_client.fetch_ga4_revenue("123", date(2026, 4, 21), date(2026, 4, 28))
