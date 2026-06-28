"""SQLModel table mapping for categories. Source of truth for DDL is the Alembic migration."""

from __future__ import annotations

from sqlalchemy import UniqueConstraint
from sqlmodel import Field, SQLModel


class CategoryModel(SQLModel, table=True):
    __tablename__ = "category"
    # A name is unique within a kind, not globally (e.g. "Otros" exists for both).
    __table_args__ = (UniqueConstraint("name", "kind", name="uq_category_name_kind"),)

    id: int | None = Field(default=None, primary_key=True)
    name: str
    icon: str | None = None
    sort_order: int = 0
    is_system: bool = True
    is_active: bool = True
    kind: str = Field(default="expense", index=True)
