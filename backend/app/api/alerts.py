import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Alert
from app.schemas import AlertRead, AlertResolve

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("", response_model=list[AlertRead])
async def list_alerts(
    site_id: uuid.UUID | None = None,
    resolved: bool | None = None,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Alert).order_by(Alert.created_at.desc()).limit(limit)
    if site_id:
        stmt = stmt.where(Alert.site_id == site_id)
    if resolved is not None:
        stmt = stmt.where(Alert.is_resolved == resolved)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.patch("/{alert_id}/resolve", response_model=AlertRead)
async def resolve_alert(alert_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Alert).where(Alert.id == alert_id))
    alert = result.scalar_one_or_none()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.is_resolved = True
    alert.resolved_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(alert)
    return alert
