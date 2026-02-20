import enum
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


# ---------- Enums ----------

class ProbeType(str, enum.Enum):
    HTTP_HEALTH = "http_health"
    SGTM_INFRA = "sgtm_infra"
    GTM_VERSION = "gtm_version"
    DATA_VOLUME = "data_volume"
    BQ_EVENTS = "bq_events"
    TAG_CHECK = "tag_check"
    CMP_CHECK = "cmp_check"


class ProbeStatus(str, enum.Enum):
    OK = "ok"
    WARNING = "warning"
    CRITICAL = "critical"
    ERROR = "error"


class AlertSeverity(str, enum.Enum):
    WARNING = "warning"
    CRITICAL = "critical"


# ---------- Models ----------

class Client(Base):
    __tablename__ = "clients"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str | None] = mapped_column(String(255))
    slack_webhook: Mapped[str | None] = mapped_column(String(500))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    sites: Mapped[list["Site"]] = relationship(back_populates="client", cascade="all, delete-orphan")


class Site(Base):
    __tablename__ = "sites"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    client_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    url: Mapped[str] = mapped_column(String(500), nullable=False)

    # Tracking infrastructure URLs / IDs
    sgtm_url: Mapped[str | None] = mapped_column(String(500))
    gtm_web_container_id: Mapped[str | None] = mapped_column(String(50))
    gtm_server_container_id: Mapped[str | None] = mapped_column(String(50))
    ga4_property_id: Mapped[str | None] = mapped_column(String(50))
    ga4_measurement_id: Mapped[str | None] = mapped_column(String(50))
    bigquery_project: Mapped[str | None] = mapped_column(String(255))
    bigquery_dataset: Mapped[str | None] = mapped_column(String(255))
    stape_container_id: Mapped[str | None] = mapped_column(String(100))
    addingwell_container_id: Mapped[str | None] = mapped_column(String(100))
    cmp_provider: Mapped[str | None] = mapped_column(String(50))  # axeptio, didomi, cookiebot, etc.

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    client: Mapped["Client"] = relationship(back_populates="sites")
    probe_configs: Mapped[list["ProbeConfig"]] = relationship(back_populates="site", cascade="all, delete-orphan")
    alerts: Mapped[list["Alert"]] = relationship(back_populates="site", cascade="all, delete-orphan")


class ProbeConfig(Base):
    """Configuration for a monitoring probe on a site."""
    __tablename__ = "probe_configs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    site_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("sites.id", ondelete="CASCADE"), nullable=False)
    probe_type: Mapped[ProbeType] = mapped_column(Enum(ProbeType), nullable=False)
    config: Mapped[dict] = mapped_column(JSON, default=dict)  # Probe-specific settings
    interval_seconds: Mapped[int] = mapped_column(Integer, default=300)  # 5 min default
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    site: Mapped["Site"] = relationship(back_populates="probe_configs")
    results: Mapped[list["ProbeResult"]] = relationship(back_populates="probe_config", cascade="all, delete-orphan")


class ProbeResult(Base):
    """Result of a single probe execution."""
    __tablename__ = "probe_results"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    probe_config_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("probe_configs.id", ondelete="CASCADE"), nullable=False)
    status: Mapped[ProbeStatus] = mapped_column(Enum(ProbeStatus), nullable=False)
    response_time_ms: Mapped[float | None] = mapped_column(Float)
    message: Mapped[str] = mapped_column(Text, default="")
    details: Mapped[dict | None] = mapped_column(JSON)
    executed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    probe_config: Mapped["ProbeConfig"] = relationship(back_populates="results")


class Alert(Base):
    """Alert triggered when a probe detects an issue."""
    __tablename__ = "alerts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    site_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("sites.id", ondelete="CASCADE"), nullable=False)
    probe_config_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("probe_configs.id", ondelete="CASCADE"), nullable=False)
    severity: Mapped[AlertSeverity] = mapped_column(Enum(AlertSeverity), nullable=False)
    probe_type: Mapped[ProbeType] = mapped_column(Enum(ProbeType), nullable=False)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    message: Mapped[str] = mapped_column(Text, default="")
    is_resolved: Mapped[bool] = mapped_column(Boolean, default=False)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    notified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    site: Mapped["Site"] = relationship(back_populates="alerts")
    probe_config: Mapped["ProbeConfig"] = relationship()
