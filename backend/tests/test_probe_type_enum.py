"""Workstream 2: the REVENUE_TRIANGULATION probe type exists and persists.

- `test_enum_member` runs everywhere (no DB).
- `test_enum_persists` runs in CI: proves migration 003 added the value to the
  Postgres `probetype` enum and a row using it can be inserted.
"""

import pytest

from app.models import ProbeType


def test_enum_member_exists():
    assert ProbeType.REVENUE_TRIANGULATION.value == "revenue_triangulation"


@pytest.mark.integration
async def test_enum_persists(db_session):
    from app.models import Client, ProbeConfig, Site

    client = Client(name="ACME")
    db_session.add(client)
    await db_session.flush()

    site = Site(client_id=client.id, name="shop", url="https://shop.example")
    db_session.add(site)
    await db_session.flush()

    pc = ProbeConfig(site_id=site.id, probe_type=ProbeType.REVENUE_TRIANGULATION)
    db_session.add(pc)
    await db_session.flush()
    await db_session.refresh(pc)

    assert pc.probe_type == ProbeType.REVENUE_TRIANGULATION
