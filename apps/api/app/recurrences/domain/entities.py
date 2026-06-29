"""Recurrence domain entities. Pure Python: no framework, no persistence concerns.

A recurrence is a template that materializes real movements (an expense or an
income) on a schedule. `kind` decides which side it generates; `category_id`
points at the target category (an expense category or an income source).
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from typing import Literal

from app.shared.domain.errors import DomainValidationError
from app.shared.domain.money import Money

RecurrenceKind = Literal["expense", "income"]
Frequency = Literal["monthly", "biweekly"]


def _validate(
    money: Money,
    frequency: Frequency,
    day_of_month: int,
    second_day_of_month: int | None,
    start_date: date,
    end_date: date | None,
) -> None:
    if money.amount_cents <= 0:
        raise DomainValidationError("a recurrence amount must be positive")
    if not 1 <= day_of_month <= 31:
        raise DomainValidationError("day_of_month must be between 1 and 31")
    if frequency == "biweekly":
        if second_day_of_month is None:
            raise DomainValidationError("a biweekly recurrence needs a second day")
        if not 1 <= second_day_of_month <= 31:
            raise DomainValidationError("second_day_of_month must be between 1 and 31")
        if second_day_of_month == day_of_month:
            raise DomainValidationError("the two days of a biweekly recurrence must differ")
    elif second_day_of_month is not None:
        raise DomainValidationError("a monthly recurrence has only one day")
    if end_date is not None and end_date < start_date:
        raise DomainValidationError("end_date cannot be before start_date")


@dataclass(frozen=True, slots=True)
class DraftRecurrence:
    """A recurrence that has not been persisted yet (no identity)."""

    kind: RecurrenceKind
    money: Money
    category_id: int
    frequency: Frequency
    day_of_month: int
    start_date: date
    second_day_of_month: int | None = None
    end_date: date | None = None
    note: str | None = None
    is_active: bool = True

    def __post_init__(self) -> None:
        _validate(
            self.money,
            self.frequency,
            self.day_of_month,
            self.second_day_of_month,
            self.start_date,
            self.end_date,
        )


@dataclass(frozen=True, slots=True)
class Recurrence:
    """A persisted recurrence (carries its identity and generation cursor)."""

    id: int
    kind: RecurrenceKind
    money: Money
    category_id: int
    frequency: Frequency
    day_of_month: int
    start_date: date
    second_day_of_month: int | None = None
    end_date: date | None = None
    note: str | None = None
    is_active: bool = True
    # Latest occurrence already materialized; the cursor that makes generation idempotent.
    last_generated_on: date | None = None

    def __post_init__(self) -> None:
        _validate(
            self.money,
            self.frequency,
            self.day_of_month,
            self.second_day_of_month,
            self.start_date,
            self.end_date,
        )

    def days(self) -> list[int]:
        if self.second_day_of_month is None:
            return [self.day_of_month]
        return sorted({self.day_of_month, self.second_day_of_month})
