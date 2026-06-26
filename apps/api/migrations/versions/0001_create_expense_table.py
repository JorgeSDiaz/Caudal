"""create expense table

Revision ID: 0001
Revises:
Create Date: 2026-06-25
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "expense",
        sa.Column("id", sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column("amount_cents", sa.BigInteger, nullable=False),
        sa.Column("currency", sa.String(length=3), nullable=False, server_default="COP"),
        sa.Column("category_id", sa.Integer, nullable=False),
        sa.Column("occurred_on", sa.Date, nullable=False, server_default=sa.text("CURRENT_DATE")),
        sa.Column("note", sa.Text, nullable=True),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint("amount_cents > 0", name="ck_expense_amount_positive"),
    )
    op.create_index(
        "idx_expense_date", "expense", ["occurred_on"],
        postgresql_where=sa.text("deleted_at IS NULL"),
    )
    op.create_index(
        "idx_expense_category", "expense", ["category_id"],
        postgresql_where=sa.text("deleted_at IS NULL"),
    )


def downgrade() -> None:
    op.drop_index("idx_expense_category", table_name="expense")
    op.drop_index("idx_expense_date", table_name="expense")
    op.drop_table("expense")
