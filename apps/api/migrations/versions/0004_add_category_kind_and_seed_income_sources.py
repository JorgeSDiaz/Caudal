"""add category.kind discriminator and seed income sources

Revision ID: 0004
Revises: 0003
Create Date: 2026-06-28
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0004"
down_revision: str | None = "0003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

# Income sources, opinionated for personal finance in Colombia.
INCOME_SOURCES = [
    "Sueldo",
    "Freelance",
    "Ocasional",
    "Cashback",
    "Bonos",
    "Inversiones",
    "Reembolsos",
    "Otros",
]

category = sa.table(
    "category",
    sa.column("name", sa.Text),
    sa.column("sort_order", sa.Integer),
    sa.column("kind", sa.Text),
)


def upgrade() -> None:
    # Existing rows stay 'expense' by the server default; new income sources are 'income'.
    op.add_column(
        "category",
        sa.Column("kind", sa.Text, nullable=False, server_default="expense"),
    )
    op.create_index("idx_category_kind", "category", ["kind"])

    # A name is unique within a kind, not globally: "Otros" can be both an
    # expense category and an income source.
    op.drop_constraint("category_name_key", "category", type_="unique")
    op.create_unique_constraint("uq_category_name_kind", "category", ["name", "kind"])

    op.bulk_insert(
        category,
        [
            {"name": name, "sort_order": i, "kind": "income"}
            for i, name in enumerate(INCOME_SOURCES, start=1)
        ],
    )


def downgrade() -> None:
    op.execute(category.delete().where(category.c.kind == "income"))
    op.drop_constraint("uq_category_name_kind", "category", type_="unique")
    op.create_unique_constraint("category_name_key", "category", ["name"])
    op.drop_index("idx_category_kind", table_name="category")
    op.drop_column("category", "kind")
