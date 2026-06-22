import enum
import secrets
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, Float, ForeignKey, Integer, Numeric, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


def _generate_ingest_key() -> str:
    return secrets.token_urlsafe(32)


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
    REVENUE_TRIANGULATION = "revenue_triangulation"


class ProbeStatus(str, enum.Enum):
    OK = "ok"
    WARNING = "warning"
    CRITICAL = "critical"
    ERROR = "error"


class AlertSeverity(str, enum.Enum):
    WARNING = "warning"
    CRITICAL = "critical"


def _pg_enum(enum_cls: type[enum.Enum]) -> Enum:
    """Postgres enum column that persists the member *values* (lowercase strings),
    matching what the Alembic migrations create — not the member names, which is
    SQLAlchemy's surprising default.
    """
    return Enum(
        enum_cls,
        name=enum_cls.__name__.lower(),
        values_callable=lambda e: [m.value for m in e],
    )


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

    # Probr listener ingest key (auto-generated)
    ingest_key: Mapped[str | None] = mapped_column(String(64), unique=True, default=_generate_ingest_key)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    client: Mapped["Client"] = relationship(back_populates="sites")
    probe_configs: Mapped[list["ProbeConfig"]] = relationship(back_populates="site", cascade="all, delete-orphan")
    alerts: Mapped[list["Alert"]] = relationship(back_populates="site", cascade="all, delete-orphan")
    monitoring_batches: Mapped[list["MonitoringBatch"]] = relationship(back_populates="site", cascade="all, delete-orphan")


class ProbeConfig(Base):
    """Configuration for a monitoring probe on a site."""
    __tablename__ = "probe_configs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    site_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("sites.id", ondelete="CASCADE"), nullable=False)
    probe_type: Mapped[ProbeType] = mapped_column(_pg_enum(ProbeType), nullable=False)
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
    status: Mapped[ProbeStatus] = mapped_column(_pg_enum(ProbeStatus), nullable=False)
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
    severity: Mapped[AlertSeverity] = mapped_column(_pg_enum(AlertSeverity), nullable=False)
    probe_type: Mapped[ProbeType] = mapped_column(_pg_enum(ProbeType), nullable=False)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    message: Mapped[str] = mapped_column(Text, default="")
    is_resolved: Mapped[bool] = mapped_column(Boolean, default=False)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    notified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    site: Mapped["Site"] = relationship(back_populates="alerts")
    probe_config: Mapped["ProbeConfig"] = relationship()


class MonitoringBatch(Base):
    """Aggregated monitoring data from the Probr GTM listener tag.

    Each row represents a time window (typically 1 minute) of aggregated
    event and tag execution data for a given site/container.
    """
    __tablename__ = "monitoring_batches"
    __table_args__ = (
        UniqueConstraint("site_id", "container_id", "window_start", name="uq_monitoring_batch_window"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    site_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("sites.id", ondelete="CASCADE"), nullable=False)
    container_id: Mapped[str] = mapped_column(String(50), nullable=False)
    window_start: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    window_seconds: Mapped[int] = mapped_column(Integer, default=60)

    total_events: Mapped[int] = mapped_column(Integer, default=0)

    # {"page_view": 847, "purchase": 12, "add_to_cart": 43, ...}
    event_counts: Mapped[dict] = mapped_column(JSON, default=dict)

    # {"GA4": {"success": 891, "failure": 2, "timeout": 0, "total_exec_ms": 40095, "count": 893}, ...}
    tag_metrics: Mapped[dict] = mapped_column(JSON, default=dict)

    # {"email": 340, "phone": 120, "address": 80, "total": 1000}
    user_data_quality: Mapped[dict] = mapped_column(JSON, default=dict)

    # {"value": 12, "currency": 12, "transaction_id": 12, "items": 12, "total": 12}
    ecommerce_quality: Mapped[dict] = mapped_column(JSON, default=dict)

    received_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    site: Mapped["Site"] = relationship(back_populates="monitoring_batches")


class BackendRevenue(Base):
    """Real order revenue pushed from a site's e-commerce backend.

    Independent source of truth for the revenue_triangulation probe — decoupled
    from GTM/GA4. Phase 1 is fed by the generic push endpoint
    (POST /api/ingest/revenue); native connectors (Shopify, etc.) will later
    write rows here too, via the same upsert path.
    """
    __tablename__ = "backend_revenue"
    __table_args__ = (
        UniqueConstraint("site_id", "window_start", "window_end", "source", name="uq_backend_revenue_window"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    site_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("sites.id", ondelete="CASCADE"), nullable=False)
    window_start: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    window_end: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    revenue: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="EUR")
    order_count: Mapped[int] = mapped_column(Integer, default=0)
    basis: Mapped[str] = mapped_column(String(8), default="ht")  # "ht" | "ttc"
    source: Mapped[str] = mapped_column(String(50), default="manual")  # manual | shopify | magento | ...
    received_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    site: Mapped["Site"] = relationship()
