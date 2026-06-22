"""Workstream 3: backend revenue push source.

- payload validation tests run everywhere (pure pydantic).
- endpoint/upsert tests are integration (need Postgres → CI).
"""

import pytest
from pydantic import ValidationError
from sqlalchemy import select

from app.models import BackendRevenue, Client, Site
from app.schemas import BackendRevenuePayload

WS = "2026-04-21T00:00:00Z"
WE = "2026-04-28T00:00:00Z"


def _valid(**over):
    data = {"window_start": WS, "window_end": WE, "revenue": 70019.0, "currency": "EUR",
            "order_count": 243, "basis": "ht", "source": "manual"}
    data.update(over)
    return data


# ── Payload validation (no DB) ────────────────────────────────

def test_valid_payload():
    p = BackendRevenuePayload(**_valid())
    assert p.revenue == 70019.0 and p.basis == "ht"


def test_negative_revenue_rejected():
    with pytest.raises(ValidationError):
        BackendRevenuePayload(**_valid(revenue=-1))


def test_bad_basis_rejected():
    with pytest.raises(ValidationError):
        BackendRevenuePayload(**_valid(basis="net"))


def test_bad_currency_rejected():
    with pytest.raises(ValidationError):
        BackendRevenuePayload(**_valid(currency="EURO"))


def test_window_order_enforced():
    with pytest.raises(ValidationError):
        BackendRevenuePayload(**_valid(window_start=WE, window_end=WS))


# ── Endpoint + upsert (integration) ───────────────────────────

async def _make_site(db_session) -> Site:
    client = Client(name="ACME")
    db_session.add(client)
    await db_session.flush()
    site = Site(client_id=client.id, name="shop", url="https://shop.example")
    db_session.add(site)
    await db_session.flush()
    return site


@pytest.mark.integration
async def test_ingest_revenue_creates_row(client, db_session):
    site = await _make_site(db_session)
    resp = await client.post("/api/ingest/revenue", json=_valid(), headers={"X-Probr-Key": site.ingest_key})
    assert resp.status_code == 201

    rows = (await db_session.execute(select(BackendRevenue).where(BackendRevenue.site_id == site.id))).scalars().all()
    assert len(rows) == 1
    assert float(rows[0].revenue) == 70019.0
    assert rows[0].order_count == 243
    assert rows[0].basis == "ht"


@pytest.mark.integration
async def test_ingest_revenue_invalid_key(client, db_session):
    await _make_site(db_session)
    resp = await client.post("/api/ingest/revenue", json=_valid(), headers={"X-Probr-Key": "not-a-real-key"})
    assert resp.status_code == 401


@pytest.mark.integration
async def test_ingest_revenue_is_idempotent_upsert(client, db_session):
    site = await _make_site(db_session)
    headers = {"X-Probr-Key": site.ingest_key}

    await client.post("/api/ingest/revenue", json=_valid(revenue=100.0), headers=headers)
    await client.post("/api/ingest/revenue", json=_valid(revenue=250.0), headers=headers)

    rows = (await db_session.execute(select(BackendRevenue).where(BackendRevenue.site_id == site.id))).scalars().all()
    assert len(rows) == 1  # same (site, window, source) → updated, not duplicated
    assert float(rows[0].revenue) == 250.0
