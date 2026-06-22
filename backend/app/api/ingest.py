"""Ingestion endpoint for the Probr GTM Listener tag.

Receives per-event or batched monitoring data from the GTM server-side tag,
aggregates in-memory into 1-minute buckets, and flushes to the database
periodically to minimize write load.
"""

import asyncio
import logging
import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import async_session, get_db
from app.models import MonitoringBatch, Site
from app.schemas import BackendRevenuePayload, IngestBatchPayload, IngestEventPayload
from app.services.backend_revenue import upsert_backend_revenue

logger = logging.getLogger("probr.ingest")

router = APIRouter(prefix="/ingest", tags=["ingest"])


# ── In-Memory Aggregator ──────────────────────────────────────


class AggregationBucket:
    """Holds aggregated data for a single (site_id, container_id, minute) window."""

    __slots__ = (
        "site_id", "container_id", "window_start",
        "total_events", "event_counts", "tag_metrics",
        "user_data_quality", "ecommerce_quality",
    )

    def __init__(self, site_id: uuid.UUID, container_id: str, window_start: datetime):
        self.site_id = site_id
        self.container_id = container_id
        self.window_start = window_start
        self.total_events: int = 0
        self.event_counts: dict[str, int] = {}
        self.tag_metrics: dict[str, dict[str, int]] = {}
        self.user_data_quality: dict[str, int] = {"email": 0, "phone": 0, "address": 0, "total": 0}
        self.ecommerce_quality: dict[str, int] = {"value": 0, "currency": 0, "transaction_id": 0, "items": 0, "total": 0}

    def add_event(self, payload: IngestEventPayload) -> None:
        self.total_events += 1
        self.event_counts[payload.event_name] = self.event_counts.get(payload.event_name, 0) + 1

        # Aggregate tag metrics
        for tag in payload.tags:
            tag_key = tag.name or f"tag_{tag.id}"
            if tag_key not in self.tag_metrics:
                self.tag_metrics[tag_key] = {
                    "success": 0, "failure": 0, "timeout": 0,
                    "exception": 0, "total_exec_ms": 0, "count": 0,
                }
            m = self.tag_metrics[tag_key]
            m["count"] += 1
            m["total_exec_ms"] += tag.execution_time
            status_key = tag.status if tag.status in ("success", "failure", "timeout", "exception") else "failure"
            m[status_key] = m.get(status_key, 0) + 1

        # User data quality
        ud = payload.user_data
        self.user_data_quality["total"] += 1
        if ud.has_email:
            self.user_data_quality["email"] += 1
        if ud.has_phone:
            self.user_data_quality["phone"] += 1
        if ud.has_first_name or ud.has_last_name:
            self.user_data_quality["address"] += 1

        # Ecommerce quality (only for ecommerce events)
        ec = payload.ecommerce
        if ec.has_value or ec.has_currency or ec.has_transaction_id or ec.has_items:
            self.ecommerce_quality["total"] += 1
            if ec.has_value:
                self.ecommerce_quality["value"] += 1
            if ec.has_currency:
                self.ecommerce_quality["currency"] += 1
            if ec.has_transaction_id:
                self.ecommerce_quality["transaction_id"] += 1
            if ec.has_items:
                self.ecommerce_quality["items"] += 1

    def merge_batch(self, payload: IngestBatchPayload) -> None:
        self.total_events += payload.total_events

        for event_name, count in payload.event_counts.items():
            self.event_counts[event_name] = self.event_counts.get(event_name, 0) + count

        for tag_name, metrics in payload.tag_metrics.items():
            if tag_name not in self.tag_metrics:
                self.tag_metrics[tag_name] = {
                    "success": 0, "failure": 0, "timeout": 0,
                    "exception": 0, "total_exec_ms": 0, "count": 0,
                }
            m = self.tag_metrics[tag_name]
            m["success"] += metrics.success
            m["failure"] += metrics.failure
            m["timeout"] += metrics.timeout
            m["exception"] += metrics.exception
            m["total_exec_ms"] += metrics.total_exec_ms
            m["count"] += metrics.count

        udq = payload.user_data_quality
        self.user_data_quality["total"] += udq.total
        self.user_data_quality["email"] += udq.email
        self.user_data_quality["phone"] += udq.phone
        self.user_data_quality["address"] += udq.address

        ecq = payload.ecommerce_quality
        self.ecommerce_quality["total"] += ecq.total
        self.ecommerce_quality["value"] += ecq.value
        self.ecommerce_quality["currency"] += ecq.currency
        self.ecommerce_quality["transaction_id"] += ecq.transaction_id
        self.ecommerce_quality["items"] += ecq.items

    def to_db_model(self) -> MonitoringBatch:
        return MonitoringBatch(
            site_id=self.site_id,
            container_id=self.container_id,
            window_start=self.window_start,
            window_seconds=60,
            total_events=self.total_events,
            event_counts=self.event_counts,
            tag_metrics=self.tag_metrics,
            user_data_quality=self.user_data_quality,
            ecommerce_quality=self.ecommerce_quality,
        )


class MonitoringAggregator:
    """In-memory buffer that aggregates incoming events into 1-minute windows
    and flushes to the database periodically."""

    def __init__(self):
        self._buckets: dict[tuple[uuid.UUID, str, str], AggregationBucket] = {}
        self._lock = asyncio.Lock()
        self._key_cache: dict[str, uuid.UUID] = {}  # ingest_key -> site_id

    def _minute_key(self, ts_ms: int | None = None) -> str:
        """Get the current minute as an ISO string for bucketing."""
        if ts_ms:
            dt = datetime.fromtimestamp(ts_ms / 1000, tz=timezone.utc)
        else:
            dt = datetime.now(timezone.utc)
        return dt.replace(second=0, microsecond=0).isoformat()

    def _minute_dt(self, ts_ms: int | None = None) -> datetime:
        if ts_ms:
            dt = datetime.fromtimestamp(ts_ms / 1000, tz=timezone.utc)
        else:
            dt = datetime.now(timezone.utc)
        return dt.replace(second=0, microsecond=0)

    async def resolve_site_id(self, ingest_key: str) -> uuid.UUID | None:
        """Resolve an ingest key to a site_id, with caching."""
        if ingest_key in self._key_cache:
            return self._key_cache[ingest_key]

        async with async_session() as session:
            result = await session.execute(
                select(Site.id).where(Site.ingest_key == ingest_key, Site.is_active.is_(True))
            )
            site_id = result.scalar_one_or_none()

        if site_id:
            self._key_cache[ingest_key] = site_id
        return site_id

    async def ingest_event(self, site_id: uuid.UUID, payload: IngestEventPayload) -> None:
        minute_key = self._minute_key(payload.timestamp_ms)
        bucket_key = (site_id, payload.container_id, minute_key)

        async with self._lock:
            if bucket_key not in self._buckets:
                self._buckets[bucket_key] = AggregationBucket(
                    site_id=site_id,
                    container_id=payload.container_id,
                    window_start=self._minute_dt(payload.timestamp_ms),
                )
            self._buckets[bucket_key].add_event(payload)

    async def ingest_batch(self, site_id: uuid.UUID, payload: IngestBatchPayload) -> None:
        minute_key = self._minute_key(payload.window_start_ms)
        bucket_key = (site_id, payload.container_id, minute_key)

        async with self._lock:
            if bucket_key not in self._buckets:
                self._buckets[bucket_key] = AggregationBucket(
                    site_id=site_id,
                    container_id=payload.container_id,
                    window_start=self._minute_dt(payload.window_start_ms),
                )
            self._buckets[bucket_key].merge_batch(payload)

    async def flush(self) -> int:
        """Flush all completed buckets to the database.

        Returns the number of buckets flushed.
        """
        current_minute = self._minute_key()

        async with self._lock:
            # Only flush buckets from completed minutes (not the current one)
            to_flush: dict[tuple, AggregationBucket] = {}
            to_keep: dict[tuple, AggregationBucket] = {}
            for key, bucket in self._buckets.items():
                if key[2] < current_minute:
                    to_flush[key] = bucket
                else:
                    to_keep[key] = bucket
            self._buckets = to_keep

        if not to_flush:
            return 0

        flushed = 0
        async with async_session() as session:
            for bucket in to_flush.values():
                # Check if a row already exists for this window (from a previous partial flush)
                existing = await session.execute(
                    select(MonitoringBatch).where(
                        MonitoringBatch.site_id == bucket.site_id,
                        MonitoringBatch.container_id == bucket.container_id,
                        MonitoringBatch.window_start == bucket.window_start,
                    )
                )
                row = existing.scalar_one_or_none()

                if row:
                    # Merge into existing row
                    row.total_events += bucket.total_events
                    for k, v in bucket.event_counts.items():
                        row.event_counts[k] = row.event_counts.get(k, 0) + v
                    for k, v in bucket.tag_metrics.items():
                        if k not in row.tag_metrics:
                            row.tag_metrics[k] = v
                        else:
                            for mk, mv in v.items():
                                row.tag_metrics[k][mk] = row.tag_metrics[k].get(mk, 0) + mv
                    for k, v in bucket.user_data_quality.items():
                        row.user_data_quality[k] = row.user_data_quality.get(k, 0) + v
                    for k, v in bucket.ecommerce_quality.items():
                        row.ecommerce_quality[k] = row.ecommerce_quality.get(k, 0) + v
                else:
                    session.add(bucket.to_db_model())

                flushed += 1

            await session.commit()

        logger.info(f"Flushed {flushed} monitoring buckets to database")
        return flushed


# Global aggregator instance
aggregator = MonitoringAggregator()


# ── Flush scheduler ───────────────────────────────────────────


async def start_flush_loop() -> None:
    """Background task that flushes the aggregator every 30 seconds."""
    while True:
        try:
            await asyncio.sleep(30)
            await aggregator.flush()
        except asyncio.CancelledError:
            # Final flush on shutdown
            await aggregator.flush()
            break
        except Exception:
            logger.exception("Error during monitoring flush")


# ── API Endpoints ─────────────────────────────────────────────


@router.post("", status_code=202)
async def ingest_monitoring_data(
    request: Request,
    x_probr_key: str = Header(..., alias="X-Probr-Key"),
):
    """Receive monitoring data from the Probr GTM Listener tag.

    Accepts both per-event and batched payloads. Data is aggregated
    in-memory and flushed to the database every 30 seconds.
    """
    # Authenticate via ingest key
    site_id = await aggregator.resolve_site_id(x_probr_key)
    if not site_id:
        raise HTTPException(status_code=401, detail="Invalid ingest key")

    body: dict[str, Any] = await request.json()

    if body.get("batch"):
        payload = IngestBatchPayload(**body)
        await aggregator.ingest_batch(site_id, payload)
    else:
        payload = IngestEventPayload(**body)
        await aggregator.ingest_event(site_id, payload)

    return {"status": "accepted"}


@router.post("/revenue", status_code=201)
async def ingest_backend_revenue(
    payload: BackendRevenuePayload,
    x_probr_key: str = Header(..., alias="X-Probr-Key"),
    db: AsyncSession = Depends(get_db),
):
    """Receive real order revenue from a site's backend (push source).

    Independent of GTM/GA4 — this is the reference truth for revenue_triangulation.
    Idempotent on (site, window, source).
    """
    site_id = (
        await db.execute(
            select(Site.id).where(Site.ingest_key == x_probr_key, Site.is_active.is_(True))
        )
    ).scalar_one_or_none()
    if not site_id:
        raise HTTPException(status_code=401, detail="Invalid ingest key")

    row = await upsert_backend_revenue(db, site_id, payload)
    await db.commit()
    return {"status": "accepted", "id": str(row.id), "source": payload.source}


@router.post("/flush", status_code=200)
async def force_flush():
    """Force an immediate flush of the in-memory aggregation buffer.

    Useful for debugging or before graceful shutdown.
    """
    count = await aggregator.flush()
    return {"flushed_buckets": count}
