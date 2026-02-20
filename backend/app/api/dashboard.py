from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models import Alert, Client, ProbeConfig, ProbeResult, ProbeStatus, Site
from app.schemas import (
    AlertRead,
    ClientOverview,
    DashboardOverview,
    ProbeStatusSummary,
    SiteOverview,
)

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


def _worst_status(statuses: list[ProbeStatus]) -> ProbeStatus:
    """Return the worst status from a list (CRITICAL > WARNING > ERROR > OK)."""
    priority = {
        ProbeStatus.CRITICAL: 0,
        ProbeStatus.ERROR: 1,
        ProbeStatus.WARNING: 2,
        ProbeStatus.OK: 3,
    }
    if not statuses:
        return ProbeStatus.OK
    return min(statuses, key=lambda s: priority.get(s, 99))


@router.get("/overview", response_model=DashboardOverview)
async def get_dashboard_overview(db: AsyncSession = Depends(get_db)):
    """Main control room endpoint — returns full status of all clients and sites."""

    # Load all active clients with their sites and probe configs
    clients_stmt = (
        select(Client)
        .where(Client.is_active.is_(True))
        .options(
            selectinload(Client.sites)
            .selectinload(Site.probe_configs)
        )
        .order_by(Client.name)
    )
    clients_result = await db.execute(clients_stmt)
    clients = clients_result.scalars().unique().all()

    # For each probe config, get the latest result
    # We do this in a single query for efficiency
    all_probe_config_ids = []
    for client in clients:
        for site in client.sites:
            if site.is_active:
                for pc in site.probe_configs:
                    if pc.is_active:
                        all_probe_config_ids.append(pc.id)

    # Get latest result per probe config using a lateral join / subquery
    latest_results: dict = {}
    if all_probe_config_ids:
        # Subquery: max executed_at per probe_config_id
        max_date_sub = (
            select(
                ProbeResult.probe_config_id,
                func.max(ProbeResult.executed_at).label("max_date"),
            )
            .where(ProbeResult.probe_config_id.in_(all_probe_config_ids))
            .group_by(ProbeResult.probe_config_id)
            .subquery()
        )

        results_stmt = (
            select(ProbeResult)
            .join(
                max_date_sub,
                (ProbeResult.probe_config_id == max_date_sub.c.probe_config_id)
                & (ProbeResult.executed_at == max_date_sub.c.max_date),
            )
        )
        results = await db.execute(results_stmt)
        for r in results.scalars().all():
            latest_results[r.probe_config_id] = r

    # Count active (unresolved) alerts per site
    alert_counts_stmt = (
        select(Alert.site_id, func.count(Alert.id))
        .where(Alert.is_resolved.is_(False))
        .group_by(Alert.site_id)
    )
    alert_result = await db.execute(alert_counts_stmt)
    alert_counts = dict(alert_result.all())

    # Recent alerts (last 20)
    recent_alerts_stmt = (
        select(Alert)
        .order_by(Alert.created_at.desc())
        .limit(20)
    )
    recent_alerts_result = await db.execute(recent_alerts_stmt)
    recent_alerts = recent_alerts_result.scalars().all()

    # Build response
    client_overviews = []
    total_ok = 0
    total_warning = 0
    total_critical = 0
    total_sites = 0

    for client in clients:
        site_overviews = []
        client_sites_ok = 0
        client_sites_warning = 0
        client_sites_critical = 0

        for site in client.sites:
            if not site.is_active:
                continue

            total_sites += 1
            probe_summaries = []
            site_statuses = []

            for pc in site.probe_configs:
                if not pc.is_active:
                    continue

                latest = latest_results.get(pc.id)
                if latest:
                    status = latest.status
                    probe_summaries.append(ProbeStatusSummary(
                        probe_type=pc.probe_type,
                        status=status,
                        message=latest.message,
                        last_check=latest.executed_at,
                        response_time_ms=latest.response_time_ms,
                    ))
                    site_statuses.append(status)
                else:
                    probe_summaries.append(ProbeStatusSummary(
                        probe_type=pc.probe_type,
                        status=ProbeStatus.OK,
                        message="Awaiting first check",
                        last_check=None,
                    ))

            site_status = _worst_status(site_statuses)
            site_alert_count = alert_counts.get(site.id, 0)

            if site_status == ProbeStatus.CRITICAL:
                client_sites_critical += 1
            elif site_status in (ProbeStatus.WARNING, ProbeStatus.ERROR):
                client_sites_warning += 1
            else:
                client_sites_ok += 1

            site_overviews.append(SiteOverview(
                site_id=site.id,
                site_name=site.name,
                site_url=site.url,
                overall_status=site_status,
                probes=probe_summaries,
                active_alerts=site_alert_count,
            ))

        total_ok += client_sites_ok
        total_warning += client_sites_warning
        total_critical += client_sites_critical

        client_statuses = [s.overall_status for s in site_overviews]
        client_overviews.append(ClientOverview(
            client_id=client.id,
            client_name=client.name,
            overall_status=_worst_status(client_statuses),
            total_sites=len(site_overviews),
            sites_ok=client_sites_ok,
            sites_warning=client_sites_warning,
            sites_critical=client_sites_critical,
            active_alerts=sum(s.active_alerts for s in site_overviews),
            sites=site_overviews,
        ))

    return DashboardOverview(
        total_clients=len(client_overviews),
        total_sites=total_sites,
        total_ok=total_ok,
        total_warning=total_warning,
        total_critical=total_critical,
        clients=client_overviews,
        recent_alerts=[AlertRead.model_validate(a) for a in recent_alerts],
    )
