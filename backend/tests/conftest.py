"""Shared test fixtures.

Test DB strategy (decided 2026-06-22): the integration tests need a real
Postgres (enums, JSON, asyncpg behave differently from SQLite). It is provided
by `DATABASE_URL`:
  - in CI: a GitHub Actions `postgres` service container;
  - locally: nothing by default, so integration tests auto-skip.

Pure-logic tests (no DB) run everywhere.
"""

import os
from pathlib import Path

import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

BACKEND_DIR = Path(__file__).resolve().parent.parent
TEST_DATABASE_URL = os.environ.get("DATABASE_URL")


@pytest.fixture(scope="session", autouse=True)
def _apply_migrations():
    """Apply Alembic migrations once against the test DB (if one is configured)."""
    if not TEST_DATABASE_URL:
        return
    from alembic import command
    from alembic.config import Config

    cfg = Config(str(BACKEND_DIR / "alembic.ini"))
    cfg.set_main_option("script_location", str(BACKEND_DIR / "alembic"))
    command.upgrade(cfg, "head")


@pytest_asyncio.fixture
async def db_session() -> AsyncSession:
    """A transaction-isolated AsyncSession. Rolls back after each test.

    Skips the test if no Postgres is available (local runs without DATABASE_URL).
    """
    if not TEST_DATABASE_URL:
        pytest.skip("DATABASE_URL not set — integration test requires Postgres (runs in CI)")

    engine = create_async_engine(TEST_DATABASE_URL)
    conn = await engine.connect()
    trans = await conn.begin()
    # join_transaction_mode="create_savepoint": endpoints can call commit() and it
    # only releases a savepoint, so the outer transaction below still rolls back.
    session = async_sessionmaker(
        bind=conn, expire_on_commit=False, join_transaction_mode="create_savepoint"
    )()
    try:
        yield session
    finally:
        await session.close()
        await trans.rollback()
        await conn.close()
        await engine.dispose()


@pytest_asyncio.fixture
async def client(db_session: AsyncSession):
    """HTTP client bound to the app, with get_db routed to the test session."""
    from httpx import ASGITransport, AsyncClient

    from app.database import get_db
    from app.main import app

    async def _override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c
    app.dependency_overrides.clear()
