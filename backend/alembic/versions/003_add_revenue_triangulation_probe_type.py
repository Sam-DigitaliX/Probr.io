"""Add revenue_triangulation value to the probetype enum

Revision ID: 003
Revises: 002
Create Date: 2026-06-22

Note on the Postgres "gotcha": before PG12, `ALTER TYPE ... ADD VALUE` could not
run inside a transaction at all. From PG12+ (we run PG18) it can — the only
remaining rule is that the new value can't be *used* in the same transaction,
which we don't. `IF NOT EXISTS` makes the migration idempotent.
"""
from typing import Sequence, Union

from alembic import op

revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TYPE probetype ADD VALUE IF NOT EXISTS 'revenue_triangulation'")


def downgrade() -> None:
    # Postgres has no direct "DROP VALUE" for an enum; removing a value requires
    # recreating the type and rewriting every dependent column. Not worth it for
    # an additive change — downgrade is intentionally a no-op.
    pass
