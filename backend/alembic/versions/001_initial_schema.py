"""Initial schema — clients, sites, probes, results, alerts

Revision ID: 001
Revises:
Create Date: 2026-02-20
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSON

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- Clients ---
    op.create_table(
        "clients",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("email", sa.String(255)),
        sa.Column("slack_webhook", sa.String(500)),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # --- Sites ---
    op.create_table(
        "sites",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("client_id", UUID(as_uuid=True), sa.ForeignKey("clients.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("url", sa.String(500), nullable=False),
        sa.Column("sgtm_url", sa.String(500)),
        sa.Column("gtm_web_container_id", sa.String(50)),
        sa.Column("gtm_server_container_id", sa.String(50)),
        sa.Column("ga4_property_id", sa.String(50)),
        sa.Column("ga4_measurement_id", sa.String(50)),
        sa.Column("bigquery_project", sa.String(255)),
        sa.Column("bigquery_dataset", sa.String(255)),
        sa.Column("stape_container_id", sa.String(100)),
        sa.Column("addingwell_container_id", sa.String(100)),
        sa.Column("cmp_provider", sa.String(50)),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_sites_client_id", "sites", ["client_id"])

    # --- Probe Configs ---
    op.create_table(
        "probe_configs",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("site_id", UUID(as_uuid=True), sa.ForeignKey("sites.id", ondelete="CASCADE"), nullable=False),
        sa.Column("probe_type", sa.Enum("http_health", "sgtm_infra", "gtm_version", "data_volume", "bq_events", "tag_check", "cmp_check", name="probetype"), nullable=False),
        sa.Column("config", JSON, server_default=sa.text("'{}'")),
        sa.Column("interval_seconds", sa.Integer(), server_default=sa.text("300")),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_probe_configs_site_id", "probe_configs", ["site_id"])

    # --- Probe Results ---
    op.create_table(
        "probe_results",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("probe_config_id", UUID(as_uuid=True), sa.ForeignKey("probe_configs.id", ondelete="CASCADE"), nullable=False),
        sa.Column("status", sa.Enum("ok", "warning", "critical", "error", name="probestatus"), nullable=False),
        sa.Column("response_time_ms", sa.Float()),
        sa.Column("message", sa.Text(), server_default=sa.text("''")),
        sa.Column("details", JSON),
        sa.Column("executed_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_probe_results_probe_config_id", "probe_results", ["probe_config_id"])
    op.create_index("ix_probe_results_executed_at", "probe_results", ["executed_at"])

    # --- Alerts ---
    op.create_table(
        "alerts",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("site_id", UUID(as_uuid=True), sa.ForeignKey("sites.id", ondelete="CASCADE"), nullable=False),
        sa.Column("probe_config_id", UUID(as_uuid=True), sa.ForeignKey("probe_configs.id", ondelete="CASCADE"), nullable=False),
        sa.Column("severity", sa.Enum("warning", "critical", name="alertseverity"), nullable=False),
        sa.Column("probe_type", sa.Enum("http_health", "sgtm_infra", "gtm_version", "data_volume", "bq_events", "tag_check", "cmp_check", name="probetype", create_type=False), nullable=False),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column("message", sa.Text(), server_default=sa.text("''")),
        sa.Column("is_resolved", sa.Boolean(), server_default=sa.text("false")),
        sa.Column("resolved_at", sa.DateTime(timezone=True)),
        sa.Column("notified_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_alerts_site_id", "alerts", ["site_id"])
    op.create_index("ix_alerts_is_resolved", "alerts", ["is_resolved"])


def downgrade() -> None:
    op.drop_table("alerts")
    op.drop_table("probe_results")
    op.drop_table("probe_configs")
    op.drop_table("sites")
    op.drop_table("clients")
    op.execute("DROP TYPE IF EXISTS probetype")
    op.execute("DROP TYPE IF EXISTS probestatus")
    op.execute("DROP TYPE IF EXISTS alertseverity")
