"""SQLModel table mapping for expenses. Source of truth for DDL is the Alembic migration."""

from __future__ import annotations

from datetime import date, datetime

from sqlmodel import Field, SQLModel


class ExpenseModel(SQLModel, table=True):
    __tablename__ = "expense"

    id: int | None = Field(default=None, primary_key=True)
    amount_cents: int
    currency: str = Field(default="COP")
    category_id: int = Field(index=True, foreign_key="category.id")
    occurred_on: date = Field(index=True)
    note: str | None = None
    # created_at / updated_at are managed by the DB (server defaults); we omit them
    # from the model so inserts don't send NULL into those NOT NULL columns.
    deleted_at: datetime | None = None
