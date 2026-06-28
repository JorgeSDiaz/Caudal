"""create income table

Revision ID: 0005
Revises: 0004
Create Date: 2026-06-28
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0005"
down_revision: str | None = "0004"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "income",
        sa.Column("id", sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column("amount_cents", sa.BigInteger, nullable=False),
        sa.Column("currency", sa.String(length=3), nullable=False, server_default="COP"),
        sa.Column("source_id", sa.Integer, nullable=False),
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
        sa.CheckConstraint("amount_cents > 0", name="ck_income_amount_positive"),
    )
    op.create_foreign_key("fk_income_source", "income", "category", ["source_id"], ["id"])
    op.create_index(
        "idx_income_date", "income", ["occurred_on"],
        postgresql_where=sa.text("deleted_at IS NULL"),
    )
    op.create_index(
        "idx_income_source", "income", ["source_id"],
        postgresql_where=sa.text("deleted_at IS NULL"),
    )


def downgrade() -> None:
    op.drop_index("idx_income_source", table_name="income")
    op.drop_index("idx_income_date", table_name="income")
    op.drop_constraint("fk_income_source", "income", type_="foreignkey")
    op.drop_table("income")
