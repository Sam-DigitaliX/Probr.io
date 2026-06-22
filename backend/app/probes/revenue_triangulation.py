"""revenue_triangulation probe — Phase 1.

This module holds the *pure decision logic* (Workstream 1): given revenue from
the backend and from GA4 over the same window, compute the ratio, compare it to
the expected one, and map the deviation to a ProbeStatus + a details payload.

It performs NO I/O (no DB, no API). The probe class that fetches the data and
calls this lives in Workstream 5.

Spec: docs/internal/revenue-triangulation-probe.md (§4.1, §4.3, §4.4).
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import async_session
from app.models import BackendRevenue, ProbeStatus
from app.probes.base import BaseProbe, ProbeResultData

DEFAULT_CONFIG: dict = {
    "warning_threshold_pct": 10.0,   # |deviation| >= this -> WARNING
    "critical_threshold_pct": 20.0,  # |deviation| >= this -> CRITICAL
    "expected_ht_ratio": 0.85,       # backend_HT / GA4_TTC, FR std VAT 20%
    "currency": "EUR",
}


@dataclass
class SourceRevenue:
    """Revenue from one source over the evaluation window."""

    revenue: float
    currency: str = "EUR"
    conversions: float | None = None
    basis: str = "ht"  # "ht" or "ttc"


def _error(message: str, window: dict) -> ProbeResultData:
    return ProbeResultData(status=ProbeStatus.ERROR, message=message, details={"window": window})


def evaluate_triangulation(
    *,
    backend: SourceRevenue | None,
    ga4: SourceRevenue | None,
    window_start: datetime,
    window_end: datetime,
    config: dict | None = None,
) -> ProbeResultData:
    """Compare backend vs GA4 revenue and classify the drift.

    Returns ERROR on missing/invalid data, otherwise OK/WARNING/CRITICAL based on
    how far the observed ratio deviates from `expected_ht_ratio`.
    """
    cfg = {**DEFAULT_CONFIG, **(config or {})}
    warning_pct = float(cfg["warning_threshold_pct"])
    critical_pct = float(cfg["critical_threshold_pct"])
    expected = float(cfg["expected_ht_ratio"])

    window = {"start": window_start.isoformat(), "end": window_end.isoformat()}

    # --- Validity guards -> ERROR ---
    missing = [name for name, src in (("backend", backend), ("ga4", ga4)) if src is None]
    if missing:
        return _error(f"Source(s) manquante(s) : {', '.join(missing)}", window)
    assert backend is not None and ga4 is not None  # for type-checkers

    if expected <= 0:
        return _error("expected_ht_ratio doit être > 0", window)
    if backend.revenue < 0 or ga4.revenue < 0:
        return _error("Revenue négatif — données invalides", window)
    if ga4.revenue == 0:
        return _error("Revenue GA4 nul — ratio incalculable", window)
    if backend.currency != ga4.currency:
        return _error(
            f"Devises différentes (backend={backend.currency}, ga4={ga4.currency}) — comparaison impossible",
            window,
        )

    # --- Ratio + deviation ---
    ratio = backend.revenue / ga4.revenue
    delta_pct = (ratio - expected) / expected * 100.0
    abs_dev = abs(delta_pct)

    sources = {
        "backend": {
            "revenue": backend.revenue,
            "currency": backend.currency,
            "conversions": backend.conversions,
            "basis": backend.basis,
        },
        "ga4": {
            "revenue": ga4.revenue,
            "currency": ga4.currency,
            "conversions": ga4.conversions,
            "basis": ga4.basis,
        },
    }
    ratios = {"backend_ht_over_ga4_ttc": round(ratio, 4)}

    if abs_dev >= critical_pct:
        status, severity, threshold = ProbeStatus.CRITICAL, "critical", critical_pct
    elif abs_dev >= warning_pct:
        status, severity, threshold = ProbeStatus.WARNING, "warning", warning_pct
    else:
        status, severity, threshold = ProbeStatus.OK, None, None

    anomalies: list[dict] = []
    if severity is not None:
        anomalies.append(
            {
                "code": "ratio_drift",
                "severity": severity,
                "evidence": f"ratio backend/ga4 = {ratio:.4f} vs attendu {expected:.4f}",
                "delta_pct": round(delta_pct, 2),
            }
        )
        message = (
            f"Ratio backend/GA4 {ratio:.3f} — écart {delta_pct:+.1f}% vs attendu {expected:.2f} "
            f"(seuil {severity} {threshold:g}%)"
        )
    else:
        message = (
            f"Ratio backend/GA4 {ratio:.3f} conforme "
            f"(attendu {expected:.2f}, écart {delta_pct:+.1f}%)"
        )

    details = {"window": window, "sources": sources, "ratios": ratios, "anomalies": anomalies}
    return ProbeResultData(status=status, message=message, details=details)


# ── Probe class (Workstream 5: wires the sources to the brain) ──────────────


class RevenueTriangulationProbe(BaseProbe):
    """Fetches backend (push table) + GA4 revenue over the window and triangulates.

    Keeps the BaseProbe contract unchanged: execute() opens its own DB session and
    resolves the GA4 client, then delegates to the testable `_run` (which takes the
    session, the reference time and the GA4 fetcher as injectable parameters).
    """

    async def execute(self, site_config: dict, probe_config: dict) -> ProbeResultData:
        from app.services.ga4_client import fetch_ga4_revenue  # lazy: avoids import cycle

        async with async_session() as session:
            return await self._run(
                session,
                site_config,
                probe_config,
                now=datetime.now(timezone.utc),
                ga4_fetch=fetch_ga4_revenue,
            )

    async def _run(
        self,
        session: AsyncSession,
        site_config: dict,
        probe_config: dict,
        *,
        now: datetime,
        ga4_fetch,
    ) -> ProbeResultData:
        cfg = {**DEFAULT_CONFIG, **(probe_config or {})}
        window_days = int(cfg.get("window_days", 7))
        currency = str(cfg.get("currency", "EUR"))
        start, end = now - timedelta(days=window_days), now
        window = {"start": start.isoformat(), "end": end.isoformat()}

        # --- Backend source (push table) ---
        rows = (
            await session.execute(
                select(BackendRevenue).where(
                    BackendRevenue.site_id == site_config.get("site_id"),
                    BackendRevenue.window_start >= start,
                    BackendRevenue.window_end <= end,
                )
            )
        ).scalars().all()
        backend = None
        if rows:
            backend = SourceRevenue(
                revenue=sum(float(r.revenue) for r in rows),
                currency=rows[0].currency,
                conversions=sum(r.order_count for r in rows),
                basis=rows[0].basis,
            )

        # --- GA4 source ---
        property_id = site_config.get("ga4_property_id")
        if not property_id:
            return ProbeResultData(
                status=ProbeStatus.ERROR,
                message="Aucune propriété GA4 configurée pour ce site",
                details={"window": window},
            )
        try:
            ga4 = await ga4_fetch(property_id, start, end, currency=currency)
        except Exception as exc:  # noqa: BLE001 — surface any GA4/API failure as ERROR
            return ProbeResultData(
                status=ProbeStatus.ERROR,
                message=f"Échec récupération GA4 : {exc}",
                details={"window": window},
            )

        return evaluate_triangulation(
            backend=backend, ga4=ga4, window_start=start, window_end=end, config=probe_config
        )
