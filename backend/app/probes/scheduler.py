import asyncio
import logging

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy import select

from app.database import async_session
from app.models import ProbeConfig
from app.probes.runner import run_probe

logger = logging.getLogger("trackguard.scheduler")

scheduler = AsyncIOScheduler()


async def _run_probe_wrapper(probe_config_id: str) -> None:
    """Wrapper to run a probe in an async context from APScheduler."""
    try:
        await run_probe(probe_config_id, async_session)
    except Exception:
        logger.exception(f"Failed to run probe {probe_config_id}")


async def load_all_probes() -> None:
    """Load all active probe configs from DB and schedule them."""
    async with async_session() as session:
        stmt = select(ProbeConfig).where(ProbeConfig.is_active.is_(True))
        result = await session.execute(stmt)
        probe_configs = result.scalars().all()

    # Clear existing jobs
    scheduler.remove_all_jobs()

    for pc in probe_configs:
        add_probe_job(str(pc.id), pc.interval_seconds)

    logger.info(f"Loaded {len(probe_configs)} active probes into scheduler")


def add_probe_job(probe_config_id: str, interval_seconds: int) -> None:
    """Add or replace a scheduled probe job."""
    job_id = f"probe_{probe_config_id}"

    # Remove existing job if any
    if scheduler.get_job(job_id):
        scheduler.remove_job(job_id)

    scheduler.add_job(
        _run_probe_wrapper,
        "interval",
        seconds=interval_seconds,
        args=[probe_config_id],
        id=job_id,
        replace_existing=True,
        max_instances=1,  # Don't stack runs if previous is still executing
    )
    logger.info(f"Scheduled probe {probe_config_id} every {interval_seconds}s")


def remove_probe_job(probe_config_id: str) -> None:
    """Remove a probe job from the scheduler."""
    job_id = f"probe_{probe_config_id}"
    if scheduler.get_job(job_id):
        scheduler.remove_job(job_id)
        logger.info(f"Removed probe job {probe_config_id}")


def start_scheduler() -> None:
    if not scheduler.running:
        scheduler.start()
        logger.info("Scheduler started")


def stop_scheduler() -> None:
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("Scheduler stopped")
