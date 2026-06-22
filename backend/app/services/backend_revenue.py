"""Shared write path for backend revenue.

The push endpoint (Phase 1) and future native connectors (Shopify, Magento…)
both funnel through `upsert_backend_revenue`, so the probe only ever reads the
`backend_revenue` table and doesn't care how rows got there. No premature class
hierarchy — just one idempotent write function keyed on the unique window.
"""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import BackendRevenue
from app.schemas import BackendRevenuePayload


async def upsert_backend_revenue(
    session: AsyncSession, site_id: uuid.UUID, payload: BackendRevenuePayload
) -> BackendRevenue:
    """Insert or update the revenue row for (site, window, source). Flushes; does not commit."""
    existing = await session.execute(
        select(BackendRevenue).where(
            BackendRevenue.site_id == site_id,
            BackendRevenue.window_start == payload.window_start,
            BackendRevenue.window_end == payload.window_end,
            BackendRevenue.source == payload.source,
        )
    )
    row = existing.scalar_one_or_none()

    if row is None:
        row = BackendRevenue(
            site_id=site_id,
            window_start=payload.window_start,
            window_end=payload.window_end,
            source=payload.source,
        )
        session.add(row)

    row.revenue = payload.revenue
    row.currency = payload.currency
    row.order_count = payload.order_count
    row.basis = payload.basis

    await session.flush()
    return row
