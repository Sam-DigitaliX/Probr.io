import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

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
