from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from typing import Any, TypeVar

from app.recurrences.domain.entities import Frequency, Recurrence
from app.recurrences.domain.errors import (
    RecurrenceNotFoundError,
    UnknownRecurrenceCategoryError,
)
from app.recurrences.ports.category_checker import CategoryChecker
from app.recurrences.ports.repository import RecurrenceRepository
from app.shared.domain.money import Money

_T = TypeVar("_T")


@dataclass(frozen=True, slots=True)
class UpdateRecurrenceCommand:
    recurrence_id: int
    fields: frozenset[str]  # which attributes the caller intends to change
    amount_cents: int | None = None
    currency: str | None = None
    category_id: int | None = None
    frequency: Frequency | None = None
    day_of_month: int | None = None
    second_day_of_month: int | None = None
    start_date: date | None = None
    end_date: date | None = None
    note: str | None = None
    is_active: bool | None = None


class UpdateRecurrence:
    def __init__(self, repository: RecurrenceRepository, categories: CategoryChecker) -> None:
        self._repository = repository
        self._categories = categories

    def __call__(self, command: UpdateRecurrenceCommand) -> Recurrence:
        existing = self._repository.get(command.recurrence_id)
        if existing is None:
            raise RecurrenceNotFoundError(command.recurrence_id)

        amount_cents = self._pick(command, "amount_cents", existing.money.amount_cents)
        currency = self._pick(command, "currency", existing.money.currency)
        category_id = self._pick(command, "category_id", existing.category_id)

        if "category_id" in command.fields and not self._categories.exists_of_kind(
            category_id, existing.kind
        ):
            raise UnknownRecurrenceCategoryError(category_id)

        updated = Recurrence(
            id=existing.id,
            kind=existing.kind,
            money=Money(amount_cents, currency),
            category_id=category_id,
            frequency=self._pick(command, "frequency", existing.frequency),
            day_of_month=self._pick(command, "day_of_month", existing.day_of_month),
            second_day_of_month=self._pick(
                command, "second_day_of_month", existing.second_day_of_month
            ),
            start_date=self._pick(command, "start_date", existing.start_date),
            end_date=self._pick(command, "end_date", existing.end_date),
            note=self._pick(command, "note", existing.note),
            is_active=self._pick(command, "is_active", existing.is_active),
            last_generated_on=existing.last_generated_on,
        )
        return self._repository.update(updated)

    @staticmethod
    def _pick(command: UpdateRecurrenceCommand, name: str, current: _T) -> _T:
        value: Any = getattr(command, name)
        return value if name in command.fields else current
