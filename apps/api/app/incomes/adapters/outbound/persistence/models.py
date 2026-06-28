"""SQLModel table mapping for incomes. Source of truth for DDL is the Alembic migration."""

from __future__ import annotations

from datetime import UTC, date, datetime

from sqlmodel import Field, SQLModel


def utcnow() -> datetime:
    return datetime.now(UTC)


class IncomeModel(SQLModel, table=True):
    __tablename__ = "income"

    id: int | None = Field(default=None, primary_key=True)
    amount_cents: int
    currency: str = Field(default="COP")
    source_id: int = Field(index=True, foreign_key="category.id")
    occurred_on: date = Field(index=True)
    note: str | None = None
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)
    deleted_at: datetime | None = None
