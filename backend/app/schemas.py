import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models import AlertSeverity, ProbeStatus, ProbeType


# ---------- Client ----------

class ClientCreate(BaseModel):
    name: str
    email: str | None = None
    slack_webhook: str | None = None


class ClientUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    slack_webhook: str | None = None
    is_active: bool | None = None


class ClientRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    email: str | None
    slack_webhook: str | None
    is_active: bool
    created_at: datetime


# ---------- Site ----------

class SiteCreate(BaseModel):
    client_id: uuid.UUID
    name: str
    url: str
    sgtm_url: str | None = None
    gtm_web_container_id: str | None = None
    gtm_server_container_id: str | None = None
    ga4_property_id: str | None = None
    ga4_measurement_id: str | None = None
    bigquery_project: str | None = None
    bigquery_dataset: str | None = None
    stape_container_id: str | None = None
    addingwell_container_id: str | None = None
    cmp_provider: str | None = None


class SiteUpdate(BaseModel):
    name: str | None = None
    url: str | None = None
    sgtm_url: str | None = None
    gtm_web_container_id: str | None = None
    gtm_server_container_id: str | None = None
    ga4_property_id: str | None = None
    ga4_measurement_id: str | None = None
    bigquery_project: str | None = None
    bigquery_dataset: str | None = None
    stape_container_id: str | None = None
    addingwell_container_id: str | None = None
    cmp_provider: str | None = None
    is_active: bool | None = None


class SiteRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    client_id: uuid.UUID
    name: str
    url: str
    sgtm_url: str | None
    gtm_web_container_id: str | None
    gtm_server_container_id: str | None
    ga4_property_id: str | None
    ga4_measurement_id: str | None
    bigquery_project: str | None
    bigquery_dataset: str | None
    stape_container_id: str | None
    addingwell_container_id: str | None
    cmp_provider: str | None
    ingest_key: str | None
    is_active: bool
    created_at: datetime


# ---------- ProbeConfig ----------

class ProbeConfigCreate(BaseModel):
    site_id: uuid.UUID
    probe_type: ProbeType
    config: dict = {}
    interval_seconds: int = 300
    is_active: bool = True


class ProbeConfigUpdate(BaseModel):
    config: dict | None = None
    interval_seconds: int | None = None
    is_active: bool | None = None


class ProbeConfigRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    site_id: uuid.UUID
    probe_type: ProbeType
    config: dict
    interval_seconds: int
    is_active: bool
    created_at: datetime


# ---------- ProbeResult ----------

class ProbeResultRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    probe_config_id: uuid.UUID
    status: ProbeStatus
    response_time_ms: float | None
    message: str
    details: dict | None
    executed_at: datetime


# ---------- Alert ----------

class AlertRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    site_id: uuid.UUID
    probe_config_id: uuid.UUID
    severity: AlertSeverity
    probe_type: ProbeType
    title: str
    message: str
    is_resolved: bool
    resolved_at: datetime | None
    notified_at: datetime | None
    created_at: datetime


class AlertResolve(BaseModel):
    is_resolved: bool = True


# ---------- Dashboard ----------

class ProbeStatusSummary(BaseModel):
    probe_type: ProbeType
    status: ProbeStatus
    message: str
    last_check: datetime | None
    response_time_ms: float | None = None


class SiteOverview(BaseModel):
    site_id: uuid.UUID
    site_name: str
    site_url: str
    overall_status: ProbeStatus
    probes: list[ProbeStatusSummary]
    active_alerts: int


class ClientOverview(BaseModel):
    client_id: uuid.UUID
    client_name: str
    overall_status: ProbeStatus
    total_sites: int
    sites_ok: int
    sites_warning: int
    sites_critical: int
    active_alerts: int
    sites: list[SiteOverview]


class DashboardOverview(BaseModel):
    total_clients: int
    total_sites: int
    total_ok: int
    total_warning: int
    total_critical: int
    clients: list[ClientOverview]
    recent_alerts: list[AlertRead]


# ---------- Ingest (from GTM Probr Listener tag) ----------

class IngestTagResult(BaseModel):
    id: str
    name: str = ""
    status: str  # success, failure, timeout, exception
    execution_time: int = 0


class IngestUserData(BaseModel):
    has_email: bool = False
    has_phone: bool = False
    has_first_name: bool = False
    has_last_name: bool = False
    has_city: bool = False
    has_country: bool = False


class IngestEcommerce(BaseModel):
    has_value: bool = False
    has_currency: bool = False
    has_transaction_id: bool = False
    has_items: bool = False


class IngestEventPayload(BaseModel):
    """Single event sent by the Probr GTM tag (per_event mode)."""
    container_id: str
    event_name: str
    timestamp_ms: int
    tags: list[IngestTagResult] = []
    user_data: IngestUserData = IngestUserData()
    ecommerce: IngestEcommerce = IngestEcommerce()
    batch: bool = False


class IngestBatchTagMetrics(BaseModel):
    success: int = 0
    failure: int = 0
    timeout: int = 0
    exception: int = 0
    total_exec_ms: int = 0
    count: int = 0


class IngestBatchUserData(BaseModel):
    email: int = 0
    phone: int = 0
    address: int = 0
    total: int = 0


class IngestBatchEcommerce(BaseModel):
    value: int = 0
    currency: int = 0
    transaction_id: int = 0
    items: int = 0
    total: int = 0


class IngestBatchPayload(BaseModel):
    """Aggregated batch sent by the Probr GTM tag (batched mode)."""
    container_id: str
    batch: bool = True
    window_start_ms: int
    window_end_ms: int
    total_events: int
    event_counts: dict[str, int] = {}
    tag_metrics: dict[str, IngestBatchTagMetrics] = {}
    user_data_quality: IngestBatchUserData = IngestBatchUserData()
    ecommerce_quality: IngestBatchEcommerce = IngestBatchEcommerce()


# ---------- Backend revenue ingest (revenue_triangulation source) ----------

class BackendRevenuePayload(BaseModel):
    """Real order totals pushed by a site's e-commerce backend for one window."""
    window_start: datetime
    window_end: datetime
    revenue: float = Field(ge=0)
    currency: str = Field(default="EUR", min_length=3, max_length=3)
    order_count: int = Field(default=0, ge=0)
    basis: Literal["ht", "ttc"] = "ht"
    source: str = Field(default="manual", max_length=50)

    @model_validator(mode="after")
    def _window_order(self) -> "BackendRevenuePayload":
        if self.window_end <= self.window_start:
            raise ValueError("window_end must be after window_start")
        return self


# ---------- Monitoring Dashboard ----------

class MonitoringBatchRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    site_id: uuid.UUID
    container_id: str
    window_start: datetime
    window_seconds: int
    total_events: int
    event_counts: dict
    tag_metrics: dict
    user_data_quality: dict
    ecommerce_quality: dict
    received_at: datetime


class TagHealthSummary(BaseModel):
    tag_name: str
    total_executions: int
    success_count: int
    failure_count: int
    success_rate: float
    avg_execution_time_ms: float


class EventVolumeSummary(BaseModel):
    event_name: str
    total_count: int
    trend_pct: float | None = None  # vs previous period


class UserDataQualitySummary(BaseModel):
    email_rate: float
    phone_rate: float
    address_rate: float
    total_events: int


class MonitoringOverview(BaseModel):
    site_id: uuid.UUID
    site_name: str
    container_id: str | None
    period_hours: int
    total_events: int
    events: list[EventVolumeSummary]
    tags: list[TagHealthSummary]
    user_data: UserDataQualitySummary | None
    last_seen: datetime | None
