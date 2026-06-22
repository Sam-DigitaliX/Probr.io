"""Workstream 5: the probe class wires backend + GA4 sources to the brain.

- registry + _site_to_config: unit (no DB)
- _run: integration (seeds backend_revenue, mocks the GA4 fetcher, fixed `now`)
"""

import uuid
from datetime import datetime, timedelta, timezone

import pytest

from app.models import BackendRevenue, Client, ProbeStatus, ProbeType, Site
from app.probes.revenue_triangulation import RevenueTriangulationProbe, SourceRevenue
from app.probes.runner import PROBE_REGISTRY, _site_to_config


# ── Unit ──────────────────────────────────────────────────────

def test_probe_registered():
    assert isinstance(PROBE_REGISTRY[ProbeType.REVENUE_TRIANGULATION], RevenueTriangulationProbe)


def test_site_to_config_includes_site_id():
    site = Site(id=uuid.uuid4(), client_id=uuid.uuid4(), name="shop", url="https://shop.example",
                ga4_property_id="123456789")
    cfg = _site_to_config(site)
    assert cfg["site_id"] == site.id
    assert cfg["ga4_property_id"] == "123456789"


# ── Integration ───────────────────────────────────────────────

def _fake_ga4(revenue=100.0):
    async def _fetch(property_id, start, end, *, currency="EUR"):
        return SourceRevenue(revenue=revenue, currency=currency, conversions=243, basis="ttc")
    return _fetch


async def _seed_site(db_session) -> Site:
    client = Client(name="ACME")
    db_session.add(client)
    await db_session.flush()
    site = Site(client_id=client.id, name="shop", url="https://shop.example", ga4_property_id="123456789")
    db_session.add(site)
    await db_session.flush()
    return site


async def _seed_backend(db_session, site, now, revenue):
    db_session.add(BackendRevenue(
        site_id=site.id,
        window_start=now - timedelta(days=2),
        window_end=now - timedelta(days=1),
        revenue=revenue, currency="EUR", order_count=243, basis="ht", source="manual",
    ))
    await db_session.flush()


@pytest.mark.integration
async def test_run_ok(db_session):
    now = datetime.now(timezone.utc)
    site = await _seed_site(db_session)
    await _seed_backend(db_session, site, now, revenue=85.0)  # 85/100 = 0.85 -> OK

    res = await RevenueTriangulationProbe()._run(
        db_session, {"site_id": site.id, "ga4_property_id": "123"}, {},
        now=now, ga4_fetch=_fake_ga4(100.0),
    )
    assert res.status == ProbeStatus.OK
    assert res.details["ratios"]["backend_ht_over_ga4_ttc"] == 0.85


@pytest.mark.integration
async def test_run_warning_on_drift(db_session):
    now = datetime.now(timezone.utc)
    site = await _seed_site(db_session)
    await _seed_backend(db_session, site, now, revenue=70.0)  # 70/100 = 0.70 -> -17.6% WARNING

    res = await RevenueTriangulationProbe()._run(
        db_session, {"site_id": site.id, "ga4_property_id": "123"}, {},
        now=now, ga4_fetch=_fake_ga4(100.0),
    )
    assert res.status == ProbeStatus.WARNING
    assert res.details["anomalies"][0]["code"] == "ratio_drift"


@pytest.mark.integration
async def test_run_error_without_backend_data(db_session):
    now = datetime.now(timezone.utc)
    site = await _seed_site(db_session)  # no backend_revenue rows

    res = await RevenueTriangulationProbe()._run(
        db_session, {"site_id": site.id, "ga4_property_id": "123"}, {},
        now=now, ga4_fetch=_fake_ga4(100.0),
    )
    assert res.status == ProbeStatus.ERROR


@pytest.mark.integration
async def test_run_error_without_ga4_property(db_session):
    now = datetime.now(timezone.utc)
    site = await _seed_site(db_session)
    await _seed_backend(db_session, site, now, revenue=85.0)

    res = await RevenueTriangulationProbe()._run(
        db_session, {"site_id": site.id}, {},  # no ga4_property_id
        now=now, ga4_fetch=_fake_ga4(100.0),
    )
    assert res.status == ProbeStatus.ERROR
