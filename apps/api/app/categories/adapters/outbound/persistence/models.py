"""SQLModel table mapping for categories. Source of truth for DDL is the Alembic migration."""

from __future__ import annotations

from sqlmodel import Field, SQLModel


class CategoryModel(SQLModel, table=True):
    __tablename__ = "category"

    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(unique=True)
    icon: str | None = None
    sort_order: int = 0
    is_system: bool = True
    is_active: bool = True
