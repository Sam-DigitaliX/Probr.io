import logging

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Alert, AlertSeverity, ProbeConfig, ProbeResult, ProbeStatus, ProbeType, Site
from app.probes.base import BaseProbe, ProbeResultData
from app.probes.http_health import HttpHealthProbe

logger = logging.getLogger("trackguard.runner")

# Registry mapping probe types to their implementation
PROBE_REGISTRY: dict[ProbeType, BaseProbe] = {
    ProbeType.HTTP_HEALTH: HttpHealthProbe(),
    # Future probes will be registered here:
    # ProbeType.GTM_VERSION: GtmVersionProbe(),
    # ProbeType.DATA_VOLUME: DataVolumeProbe(),
    # ProbeType.SGTM_INFRA: SgtmInfraProbe(),
    # ProbeType.BQ_EVENTS: BqEventsProbe(),
    # ProbeType.TAG_CHECK: TagCheckProbe(),
    # ProbeType.CMP_CHECK: CmpCheckProbe(),
}


def _site_to_config(site: Site) -> dict:
    """Extract site fields into a dict for probe execution."""
    return {
        "url": site.url,
        "sgtm_url": site.sgtm_url,
        "gtm_web_container_id": site.gtm_web_container_id,
        "gtm_server_container_id": site.gtm_server_container_id,
        "ga4_property_id": site.ga4_property_id,
        "ga4_measurement_id": site.ga4_measurement_id,
        "bigquery_project": site.bigquery_project,
        "bigquery_dataset": site.bigquery_dataset,
        "stape_container_id": site.stape_container_id,
        "addingwell_container_id": site.addingwell_container_id,
        "cmp_provider": site.cmp_provider,
    }


async def run_probe(probe_config_id: str, db_session_factory) -> None:
    """Execute a single probe and store the result.

    Called by the scheduler for each configured probe at its interval.
    """
    async with db_session_factory() as session:
        # Load probe config + site
        stmt = (
            select(ProbeConfig)
            .where(ProbeConfig.id == probe_config_id)
            .where(ProbeConfig.is_active.is_(True))
        )
        result = await session.execute(stmt)
        probe_config = result.scalar_one_or_none()

        if not probe_config:
            logger.warning(f"Probe config {probe_config_id} not found or inactive, skipping")
            return

        site_stmt = select(Site).where(Site.id == probe_config.site_id)
        site_result = await session.execute(site_stmt)
        site = site_result.scalar_one_or_none()

        if not site or not site.is_active:
            logger.warning(f"Site {probe_config.site_id} not found or inactive, skipping")
            return

        # Get the probe implementation
        probe_impl = PROBE_REGISTRY.get(probe_config.probe_type)
        if not probe_impl:
            logger.error(f"No implementation for probe type {probe_config.probe_type}")
            return

        # Execute the probe
        logger.info(f"Running {probe_config.probe_type.value} probe for site '{site.name}'")
        try:
            probe_result_data = await probe_impl.execute(
                site_config=_site_to_config(site),
                probe_config=probe_config.config or {},
            )
        except Exception as e:
            logger.exception(f"Probe execution failed unexpectedly: {e}")
            probe_result_data = ProbeResultData(
                status=ProbeStatus.ERROR,
                message=f"Probe execution error: {e}",
            )

        # Store result
        db_result = ProbeResult(
            probe_config_id=probe_config.id,
            status=probe_result_data.status,
            response_time_ms=probe_result_data.response_time_ms,
            message=probe_result_data.message,
            details=probe_result_data.details,
        )
        session.add(db_result)

        # Handle alerting logic
        await _handle_alert_logic(session, site, probe_config, probe_result_data)

        await session.commit()
        logger.info(
            f"Probe {probe_config.probe_type.value} for '{site.name}': "
            f"{probe_result_data.status.value} — {probe_result_data.message}"
        )


async def _handle_alert_logic(
    session: AsyncSession,
    site: Site,
    probe_config: ProbeConfig,
    result: ProbeResultData,
) -> None:
    """Create or resolve alerts based on probe results."""

    # Check for existing unresolved alert for this probe
    stmt = (
        select(Alert)
        .where(Alert.probe_config_id == probe_config.id)
        .where(Alert.is_resolved.is_(False))
    )
    existing = await session.execute(stmt)
    open_alert = existing.scalar_one_or_none()

    if result.status in (ProbeStatus.CRITICAL, ProbeStatus.WARNING):
        severity = (
            AlertSeverity.CRITICAL
            if result.status == ProbeStatus.CRITICAL
            else AlertSeverity.WARNING
        )

        if not open_alert:
            # Create new alert
            alert = Alert(
                site_id=site.id,
                probe_config_id=probe_config.id,
                severity=severity,
                probe_type=probe_config.probe_type,
                title=f"[{severity.value.upper()}] {probe_config.probe_type.value} — {site.name}",
                message=result.message,
            )
            session.add(alert)
            logger.warning(f"NEW ALERT: {alert.title}")
        else:
            # Update existing alert severity/message if changed
            open_alert.severity = severity
            open_alert.message = result.message

    elif result.status == ProbeStatus.OK and open_alert:
        # Auto-resolve alert when probe returns OK
        from datetime import datetime, timezone
        open_alert.is_resolved = True
        open_alert.resolved_at = datetime.now(timezone.utc)
        logger.info(f"RESOLVED: {open_alert.title}")
