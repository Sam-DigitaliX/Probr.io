"""Workstream 0 sanity checks: proves the harness itself works.

- `test_app_health` runs everywhere (no DB).
- `test_db_and_migrations` runs only where a Postgres is available (CI), and
  proves the DB connection + that Alembic migrations were applied.
"""

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text


async def test_app_health():
    from app.main import app

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        resp = await c.get("/health")

    assert resp.status_code == 200
    assert resp.json() == {"status": "ok", "service": "probr"}


@pytest.mark.integration
async def test_db_and_migrations(db_session):
    # Connectivity
    assert (await db_session.execute(text("SELECT 1"))).scalar() == 1
    # A migrated table must exist (proves `alembic upgrade head` ran)
    await db_session.execute(text("SELECT count(*) FROM clients"))
