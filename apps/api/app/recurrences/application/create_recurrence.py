from __future__ import annotations

from dataclasses import dataclass
from datetime import date

from app.recurrences.domain.entities import (
    DraftRecurrence,
    Frequency,
    Recurrence,
    RecurrenceKind,
)
from app.recurrences.domain.errors import UnknownRecurrenceCategoryError
from app.recurrences.ports.category_checker import CategoryChecker
from app.recurrences.ports.repository import RecurrenceRepository
from app.shared.domain.money import Money


@dataclass(frozen=True, slots=True)
class CreateRecurrenceCommand:
    kind: RecurrenceKind
    amount_cents: int
    currency: str
    category_id: int
    frequency: Frequency
    day_of_month: int
    start_date: date
    second_day_of_month: int | None = None
    end_date: date | None = None
    note: str | None = None


class CreateRecurrence:
    def __init__(self, repository: RecurrenceRepository, categories: CategoryChecker) -> None:
        self._repository = repository
        self._categories = categories

    def __call__(self, command: CreateRecurrenceCommand) -> Recurrence:
        if not self._categories.exists_of_kind(command.category_id, command.kind):
            raise UnknownRecurrenceCategoryError(command.category_id)
        draft = DraftRecurrence(
            kind=command.kind,
            money=Money(command.amount_cents, command.currency),
            category_id=command.category_id,
            frequency=command.frequency,
            day_of_month=command.day_of_month,
            second_day_of_month=command.second_day_of_month,
            start_date=command.start_date,
            end_date=command.end_date,
            note=command.note,
        )
        return self._repository.add(draft)
