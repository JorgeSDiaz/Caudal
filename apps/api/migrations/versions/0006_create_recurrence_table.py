"""create recurrence table

Revision ID: 0006
Revises: 0005
Create Date: 2026-06-28
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0006"
down_revision: str | None = "0005"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "recurrence",
        sa.Column("id", sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column("kind", sa.Text, nullable=False),
        sa.Column("amount_cents", sa.BigInteger, nullable=False),
        sa.Column("currency", sa.String(length=3), nullable=False, server_default="COP"),
        sa.Column("category_id", sa.Integer, nullable=False),
        sa.Column("frequency", sa.Text, nullable=False),
        sa.Column("day_of_month", sa.Integer, nullable=False),
        sa.Column("second_day_of_month", sa.Integer, nullable=True),
        sa.Column("start_date", sa.Date, nullable=False),
        sa.Column("end_date", sa.Date, nullable=True),
        sa.Column("note", sa.Text, nullable=True),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default=sa.true()),
        sa.Column("last_generated_on", sa.Date, nullable=True),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint("amount_cents > 0", name="ck_recurrence_amount_positive"),
    )
    op.create_foreign_key(
        "fk_recurrence_category", "recurrence", "category", ["category_id"], ["id"]
    )
    op.create_index(
        "idx_recurrence_active", "recurrence", ["is_active"],
        postgresql_where=sa.text("deleted_at IS NULL"),
    )


def downgrade() -> None:
    op.drop_index("idx_recurrence_active", table_name="recurrence")
    op.drop_constraint("fk_recurrence_category", "recurrence", type_="foreignkey")
    op.drop_table("recurrence")
