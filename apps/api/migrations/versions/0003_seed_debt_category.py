"""seed the Deudas/Préstamos category before Otros

Revision ID: 0003
Revises: 0002
Create Date: 2026-06-27
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0003"
down_revision: str | None = "0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

DEBT_CATEGORY = "Deudas/Préstamos"
DEBT_SORT_ORDER = 8
OTHERS_CATEGORY = "Otros"
OTHERS_SORT_ORDER_AFTER = 9
OTHERS_SORT_ORDER_BEFORE = 8

category = sa.table(
    "category",
    sa.column("name", sa.Text),
    sa.column("sort_order", sa.Integer),
)


def upgrade() -> None:
    # Push "Otros" down so the catch-all category stays last in display order.
    op.execute(
        category.update()
        .where(category.c.name == OTHERS_CATEGORY)
        .values(sort_order=OTHERS_SORT_ORDER_AFTER)
    )
    op.bulk_insert(
        category,
        [{"name": DEBT_CATEGORY, "sort_order": DEBT_SORT_ORDER}],
    )


def downgrade() -> None:
    op.execute(category.delete().where(category.c.name == DEBT_CATEGORY))
    op.execute(
        category.update()
        .where(category.c.name == OTHERS_CATEGORY)
        .values(sort_order=OTHERS_SORT_ORDER_BEFORE)
    )
