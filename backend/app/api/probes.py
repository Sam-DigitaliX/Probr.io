import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db, async_session
from app.models import ProbeConfig, ProbeResult, Site
from app.probes.runner import run_probe
from app.probes.scheduler import add_probe_job, remove_probe_job
from app.schemas import ProbeConfigCreate, ProbeConfigRead, ProbeConfigUpdate, ProbeResultRead

router = APIRouter(prefix="/probes", tags=["probes"])


@router.get("", response_model=list[ProbeConfigRead])
async def list_probes(
    site_id: uuid.UUID | None = None,
    active_only: bool = False,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(ProbeConfig)
    if site_id:
        stmt = stmt.where(ProbeConfig.site_id == site_id)
    if active_only:
        stmt = stmt.where(ProbeConfig.is_active.is_(True))
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("", response_model=ProbeConfigRead, status_code=201)
async def create_probe(payload: ProbeConfigCreate, db: AsyncSession = Depends(get_db)):
    # Verify site exists
    site_result = await db.execute(select(Site).where(Site.id == payload.site_id))
    if not site_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Site not found")

    probe = ProbeConfig(**payload.model_dump())
    db.add(probe)
    await db.commit()
    await db.refresh(probe)

    # Register in scheduler if active
    if probe.is_active:
        add_probe_job(str(probe.id), probe.interval_seconds)

    return probe


@router.patch("/{probe_id}", response_model=ProbeConfigRead)
async def update_probe(probe_id: uuid.UUID, payload: ProbeConfigUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ProbeConfig).where(ProbeConfig.id == probe_id))
    probe = result.scalar_one_or_none()
    if not probe:
        raise HTTPException(status_code=404, detail="Probe config not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(probe, field, value)
    await db.commit()
    await db.refresh(probe)

    # Update scheduler
    if probe.is_active:
        add_probe_job(str(probe.id), probe.interval_seconds)
    else:
        remove_probe_job(str(probe.id))

    return probe


@router.delete("/{probe_id}", status_code=204)
async def delete_probe(probe_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ProbeConfig).where(ProbeConfig.id == probe_id))
    probe = result.scalar_one_or_none()
    if not probe:
        raise HTTPException(status_code=404, detail="Probe config not found")
    remove_probe_job(str(probe.id))
    await db.delete(probe)
    await db.commit()


@router.post("/{probe_id}/run", response_model=ProbeResultRead)
async def run_probe_now(probe_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Manually trigger a probe execution."""
    result = await db.execute(select(ProbeConfig).where(ProbeConfig.id == probe_id))
    probe = result.scalar_one_or_none()
    if not probe:
        raise HTTPException(status_code=404, detail="Probe config not found")

    await run_probe(str(probe_id), async_session)

    # Return the latest result
    stmt = (
        select(ProbeResult)
        .where(ProbeResult.probe_config_id == probe_id)
        .order_by(ProbeResult.executed_at.desc())
        .limit(1)
    )
    latest = await db.execute(stmt)
    return latest.scalar_one()


@router.get("/{probe_id}/results", response_model=list[ProbeResultRead])
async def get_probe_results(
    probe_id: uuid.UUID,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(ProbeResult)
        .where(ProbeResult.probe_config_id == probe_id)
        .order_by(ProbeResult.executed_at.desc())
        .limit(limit)
    )
    result = await db.execute(stmt)
    return result.scalars().all()
