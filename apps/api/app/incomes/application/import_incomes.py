from __future__ import annotations

from dataclasses import dataclass

from app.incomes.application.create_income import CreateIncomeCommand
from app.incomes.domain.entities import DraftIncome
from app.incomes.domain.errors import UnknownSourceError
from app.incomes.ports.repository import IncomeRepository
from app.incomes.ports.source_checker import SourceChecker
from app.shared.domain.money import Money


@dataclass(frozen=True, slots=True)
class ImportIncomesCommand:
    items: tuple[CreateIncomeCommand, ...]


class ImportIncomes:
    def __init__(self, repository: IncomeRepository, sources: SourceChecker) -> None:
        self._repository = repository
        self._sources = sources

    def __call__(self, command: ImportIncomesCommand) -> int:
        # Validate everything first, then persist in one transaction: an invalid
        # item aborts the whole import instead of leaving a partial restore.
        drafts: list[DraftIncome] = []
        for item in command.items:
            if not self._sources.exists(item.source_id):
                raise UnknownSourceError(item.source_id)
            drafts.append(
                DraftIncome(
                    money=Money(item.amount_cents, item.currency),
                    source_id=item.source_id,
                    occurred_on=item.occurred_on,
                    note=item.note,
                )
            )
        return self._repository.add_many(drafts)
