from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from typing import Any, TypeVar

from app.incomes.domain.entities import Income
from app.incomes.domain.errors import IncomeNotFoundError, UnknownSourceError
from app.incomes.ports.repository import IncomeRepository
from app.incomes.ports.source_checker import SourceChecker
from app.shared.domain.money import Money

_T = TypeVar("_T")


@dataclass(frozen=True, slots=True)
class UpdateIncomeCommand:
    income_id: int
    fields: frozenset[str]  # which attributes the caller intends to change
    amount_cents: int | None = None
    currency: str | None = None
    source_id: int | None = None
    occurred_on: date | None = None
    note: str | None = None


class UpdateIncome:
    def __init__(self, repository: IncomeRepository, sources: SourceChecker) -> None:
        self._repository = repository
        self._sources = sources

    def __call__(self, command: UpdateIncomeCommand) -> Income:
        existing = self._repository.get(command.income_id)
        if existing is None:
            raise IncomeNotFoundError(command.income_id)

        amount_cents = self._pick(command, "amount_cents", existing.money.amount_cents)
        currency = self._pick(command, "currency", existing.money.currency)
        source_id = self._pick(command, "source_id", existing.source_id)
        occurred_on = self._pick(command, "occurred_on", existing.occurred_on)
        note = self._pick(command, "note", existing.note)

        if "source_id" in command.fields and not self._sources.exists(source_id):
            raise UnknownSourceError(source_id)

        updated = Income(
            id=existing.id,
            money=Money(amount_cents, currency),
            source_id=source_id,
            occurred_on=occurred_on,
            note=note,
        )
        return self._repository.update(updated)

    @staticmethod
    def _pick(command: UpdateIncomeCommand, name: str, current: _T) -> _T:
        value: Any = getattr(command, name)
        return value if name in command.fields else current
