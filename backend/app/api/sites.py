import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Client, Site
from app.schemas import SiteCreate, SiteRead, SiteUpdate

router = APIRouter(prefix="/sites", tags=["sites"])


@router.get("", response_model=list[SiteRead])
async def list_sites(
    client_id: uuid.UUID | None = None,
    active_only: bool = False,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Site).order_by(Site.name)
    if client_id:
        stmt = stmt.where(Site.client_id == client_id)
    if active_only:
        stmt = stmt.where(Site.is_active.is_(True))
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{site_id}", response_model=SiteRead)
async def get_site(site_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Site).where(Site.id == site_id))
    site = result.scalar_one_or_none()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    return site


@router.post("", response_model=SiteRead, status_code=201)
async def create_site(payload: SiteCreate, db: AsyncSession = Depends(get_db)):
    # Verify client exists
    client_result = await db.execute(select(Client).where(Client.id == payload.client_id))
    if not client_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Client not found")

    site = Site(**payload.model_dump())
    db.add(site)
    await db.commit()
    await db.refresh(site)
    return site


@router.patch("/{site_id}", response_model=SiteRead)
async def update_site(site_id: uuid.UUID, payload: SiteUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Site).where(Site.id == site_id))
    site = result.scalar_one_or_none()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(site, field, value)
    await db.commit()
    await db.refresh(site)
    return site


@router.delete("/{site_id}", status_code=204)
async def delete_site(site_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Site).where(Site.id == site_id))
    site = result.scalar_one_or_none()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    await db.delete(site)
    await db.commit()
