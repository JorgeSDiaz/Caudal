from __future__ import annotations

from app.incomes.domain.entities import Income
from app.incomes.ports.repository import IncomeRepository


class ExportIncomes:
    def __init__(self, repository: IncomeRepository) -> None:
        self._repository = repository

    def __call__(self) -> list[Income]:
        return self._repository.list_all()
