"""SQLModel table mapping for recurrences. Source of truth for DDL is the Alembic migration."""

from __future__ import annotations

from datetime import UTC, date, datetime

from sqlmodel import Field, SQLModel


def utcnow() -> datetime:
    return datetime.now(UTC)


class RecurrenceModel(SQLModel, table=True):
    __tablename__ = "recurrence"

    id: int | None = Field(default=None, primary_key=True)
    kind: str
    amount_cents: int
    currency: str = Field(default="COP")
    category_id: int = Field(index=True, foreign_key="category.id")
    frequency: str
    day_of_month: int
    second_day_of_month: int | None = None
    start_date: date
    end_date: date | None = None
    note: str | None = None
    is_active: bool = True
    last_generated_on: date | None = None
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)
    deleted_at: datetime | None = None
