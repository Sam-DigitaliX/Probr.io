"""Unit tests for the pure decision logic of the revenue_triangulation probe.

No DB, no network — this is the "brain": ratio computation + threshold→status
mapping + anomaly payload. Highest-value surface, so it's heavily covered.
"""

from datetime import datetime, timezone

from app.models import ProbeStatus
from app.probes.revenue_triangulation import SourceRevenue, evaluate_triangulation

W_START = datetime(2026, 4, 21, tzinfo=timezone.utc)
W_END = datetime(2026, 4, 28, tzinfo=timezone.utc)


def _eval(backend_rev=85.0, ga4_rev=100.0, *, backend_ccy="EUR", ga4_ccy="EUR", config=None):
    backend = SourceRevenue(revenue=backend_rev, currency=backend_ccy, basis="ht") if backend_rev is not None else None
    ga4 = SourceRevenue(revenue=ga4_rev, currency=ga4_ccy, basis="ttc") if ga4_rev is not None else None
    return evaluate_triangulation(
        backend=backend, ga4=ga4, window_start=W_START, window_end=W_END, config=config
    )


# ── Status mapping ────────────────────────────────────────────

def test_nominal_ratio_is_ok():
    res = _eval(85.0, 100.0)  # ratio 0.85 == expected
    assert res.status == ProbeStatus.OK
    assert res.details["anomalies"] == []


def test_small_deviation_stays_ok():
    res = _eval(80.0, 100.0)  # ratio 0.80 -> -5.9% < 10%
    assert res.status == ProbeStatus.OK


def test_deviation_past_warning_threshold():
    res = _eval(74.0, 100.0)  # ratio 0.74 -> -12.9% (>=10, <20)
    assert res.status == ProbeStatus.WARNING
    anomaly = res.details["anomalies"][0]
    assert anomaly["code"] == "ratio_drift"
    assert anomaly["severity"] == "warning"
    assert anomaly["delta_pct"] < 0


def test_deviation_past_critical_threshold():
    res = _eval(65.0, 100.0)  # ratio 0.65 -> -23.5% (>=20)
    assert res.status == ProbeStatus.CRITICAL
    assert res.details["anomalies"][0]["severity"] == "critical"


def test_drift_above_expected_also_flags():
    res = _eval(110.0, 100.0)  # ratio 1.10 -> +29% -> critical (direction-agnostic)
    assert res.status == ProbeStatus.CRITICAL
    assert res.details["anomalies"][0]["delta_pct"] > 0


# ── Error cases ───────────────────────────────────────────────

def test_missing_backend_is_error():
    assert _eval(None, 100.0).status == ProbeStatus.ERROR


def test_missing_ga4_is_error():
    assert _eval(85.0, None).status == ProbeStatus.ERROR


def test_zero_ga4_revenue_is_error():
    assert _eval(85.0, 0.0).status == ProbeStatus.ERROR


def test_negative_revenue_is_error():
    assert _eval(-5.0, 100.0).status == ProbeStatus.ERROR


def test_currency_mismatch_is_error():
    assert _eval(85.0, 100.0, ga4_ccy="USD").status == ProbeStatus.ERROR


# ── Config overrides ──────────────────────────────────────────

def test_custom_thresholds_change_classification():
    # ratio 0.80 -> -5.9% ; default OK, but tight thresholds make it WARNING
    res = _eval(80.0, 100.0, config={"warning_threshold_pct": 5.0, "critical_threshold_pct": 50.0})
    assert res.status == ProbeStatus.WARNING


def test_custom_expected_ratio():
    # expected 0.80 -> ratio 0.80 is now nominal
    res = _eval(80.0, 100.0, config={"expected_ht_ratio": 0.80})
    assert res.status == ProbeStatus.OK


# ── Details payload shape (spec §4.1) ─────────────────────────

def test_details_payload_shape():
    res = _eval(70019.0, 82375.3)
    d = res.details
    assert d["window"]["start"] == W_START.isoformat()
    assert d["window"]["end"] == W_END.isoformat()
    assert d["sources"]["backend"]["revenue"] == 70019.0
    assert d["sources"]["backend"]["basis"] == "ht"
    assert d["sources"]["ga4"]["basis"] == "ttc"
    assert "backend_ht_over_ga4_ttc" in d["ratios"]
    assert isinstance(d["anomalies"], list)
