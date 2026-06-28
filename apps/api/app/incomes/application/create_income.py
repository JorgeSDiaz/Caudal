from __future__ import annotations

from dataclasses import dataclass
from datetime import date

from app.incomes.domain.entities import DraftIncome, Income
from app.incomes.domain.errors import UnknownSourceError
from app.incomes.ports.repository import IncomeRepository
from app.incomes.ports.source_checker import SourceChecker
from app.shared.domain.money import Money


@dataclass(frozen=True, slots=True)
class CreateIncomeCommand:
    amount_cents: int
    currency: str
    source_id: int
    occurred_on: date
    note: str | None = None


class CreateIncome:
    def __init__(self, repository: IncomeRepository, sources: SourceChecker) -> None:
        self._repository = repository
        self._sources = sources

    def __call__(self, command: CreateIncomeCommand) -> Income:
        if not self._sources.exists(command.source_id):
            raise UnknownSourceError(command.source_id)
        draft = DraftIncome(
            money=Money(command.amount_cents, command.currency),
            source_id=command.source_id,
            occurred_on=command.occurred_on,
            note=command.note,
        )
        return self._repository.add(draft)
