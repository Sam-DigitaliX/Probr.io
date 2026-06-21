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
from datetime import datetime

from app.models import ProbeStatus
from app.probes.base import ProbeResultData

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
