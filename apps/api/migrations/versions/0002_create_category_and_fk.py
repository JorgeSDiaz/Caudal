"""create category table, seed defaults, and add expense.category_id FK

Revision ID: 0002
Revises: 0001
Create Date: 2026-06-25
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0002"
down_revision: str | None = "0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

DEFAULT_CATEGORIES = [
    "Comida",
    "Transporte",
    "Mercado",
    "Ocio",
    "Salud",
    "Hogar/Servicios",
    "Suscripciones",
    "Otros",
]


def upgrade() -> None:
    op.create_table(
        "category",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("name", sa.Text, nullable=False, unique=True),
        sa.Column("icon", sa.Text, nullable=True),
        sa.Column("sort_order", sa.Integer, nullable=False, server_default="0"),
        sa.Column("is_system", sa.Boolean, nullable=False, server_default=sa.true()),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default=sa.true()),
    )

    category = sa.table(
        "category",
        sa.column("name", sa.Text),
        sa.column("sort_order", sa.Integer),
    )
    op.bulk_insert(
        category,
        [{"name": name, "sort_order": i} for i, name in enumerate(DEFAULT_CATEGORIES, start=1)],
    )

    op.create_foreign_key(
        "fk_expense_category", "expense", "category", ["category_id"], ["id"]
    )


def downgrade() -> None:
    op.drop_constraint("fk_expense_category", "expense", type_="foreignkey")
    op.drop_table("category")
