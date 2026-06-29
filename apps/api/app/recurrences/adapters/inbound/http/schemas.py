"""HTTP DTOs for the recurrences endpoints (the boundary; validated by Pydantic)."""

from __future__ import annotations

from datetime import date

from pydantic import BaseModel, Field

from app.recurrences.domain.entities import Frequency, Recurrence, RecurrenceKind
from app.recurrences.domain.schedule import next_occurrence


class CreateRecurrenceRequest(BaseModel):
    kind: RecurrenceKind
    amount_cents: int = Field(gt=0)
    currency: str = Field(min_length=3, max_length=3)
    category_id: int = Field(gt=0)
    frequency: Frequency
    day_of_month: int = Field(ge=1, le=31)
    start_date: date
    second_day_of_month: int | None = Field(default=None, ge=1, le=31)
    end_date: date | None = None
    note: str | None = None


class UpdateRecurrenceRequest(BaseModel):
    """All fields optional; only the ones provided by the client are changed."""

    amount_cents: int | None = Field(default=None, gt=0)
    currency: str | None = Field(default=None, min_length=3, max_length=3)
    category_id: int | None = Field(default=None, gt=0)
    frequency: Frequency | None = None
    day_of_month: int | None = Field(default=None, ge=1, le=31)
    second_day_of_month: int | None = Field(default=None, ge=1, le=31)
    start_date: date | None = None
    end_date: date | None = None
    note: str | None = None
    is_active: bool | None = None


class RecurrenceResponse(BaseModel):
    id: int
    kind: RecurrenceKind
    amount_cents: int
    currency: str
    category_id: int
    frequency: Frequency
    day_of_month: int
    second_day_of_month: int | None
    start_date: date
    end_date: date | None
    note: str | None
    is_active: bool
    next_occurrence_on: date | None

    @classmethod
    def from_entity(cls, recurrence: Recurrence, today: date) -> RecurrenceResponse:
        return cls(
            id=recurrence.id,
            kind=recurrence.kind,
            amount_cents=recurrence.money.amount_cents,
            currency=recurrence.money.currency,
            category_id=recurrence.category_id,
            frequency=recurrence.frequency,
            day_of_month=recurrence.day_of_month,
            second_day_of_month=recurrence.second_day_of_month,
            start_date=recurrence.start_date,
            end_date=recurrence.end_date,
            note=recurrence.note,
            is_active=recurrence.is_active,
            next_occurrence_on=next_occurrence(recurrence, today),
        )
