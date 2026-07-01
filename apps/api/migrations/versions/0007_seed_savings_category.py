"""seed the Ahorro category before Otros

Revision ID: 0007
Revises: 0006
Create Date: 2026-06-30
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0007"
down_revision: str | None = "0006"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

AHORRO_CATEGORY = "Ahorro"
AHORRO_SORT_ORDER = 9
OTHERS_CATEGORY = "Otros"
OTHERS_SORT_ORDER_AFTER = 10
OTHERS_SORT_ORDER_BEFORE = 9

category = sa.table(
    "category",
    sa.column("name", sa.Text),
    sa.column("sort_order", sa.Integer),
    sa.column("kind", sa.Text),
    sa.column("is_system", sa.Boolean),
    sa.column("is_active", sa.Boolean),
)


def upgrade() -> None:
    op.execute(
        category.update()
        .where(category.c.name == OTHERS_CATEGORY, category.c.kind == "expense")
        .values(sort_order=OTHERS_SORT_ORDER_AFTER)
    )
    op.bulk_insert(
        category,
        [
            {
                "name": AHORRO_CATEGORY,
                "sort_order": AHORRO_SORT_ORDER,
                "kind": "expense",
                "is_system": True,
                "is_active": True,
            }
        ],
    )


def downgrade() -> None:
    op.execute(
        category.delete().where(
            category.c.name == AHORRO_CATEGORY, category.c.kind == "expense"
        )
    )
    op.execute(
        category.update()
        .where(category.c.name == OTHERS_CATEGORY, category.c.kind == "expense")
        .values(sort_order=OTHERS_SORT_ORDER_BEFORE)
    )
