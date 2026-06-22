"""Add backend_revenue table

Revision ID: 004
Revises: 003
Create Date: 2026-06-22
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import UUID

revision: str = "004"
down_revision: Union[str, None] = "003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "backend_revenue",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("site_id", UUID(as_uuid=True), sa.ForeignKey("sites.id", ondelete="CASCADE"), nullable=False),
        sa.Column("window_start", sa.DateTime(timezone=True), nullable=False),
        sa.Column("window_end", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revenue", sa.Numeric(14, 2), nullable=False),
        sa.Column("currency", sa.String(3), server_default="EUR"),
        sa.Column("order_count", sa.Integer(), server_default=sa.text("0")),
        sa.Column("basis", sa.String(8), server_default="ht"),
        sa.Column("source", sa.String(50), server_default="manual"),
        sa.Column("received_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.UniqueConstraint("site_id", "window_start", "window_end", "source", name="uq_backend_revenue_window"),
    )
    op.create_index("ix_backend_revenue_site_window", "backend_revenue", ["site_id", "window_start", "window_end"])


def downgrade() -> None:
    op.drop_index("ix_backend_revenue_site_window", table_name="backend_revenue")
    op.drop_table("backend_revenue")
