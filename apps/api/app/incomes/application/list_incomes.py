from __future__ import annotations

from dataclasses import dataclass

from app.incomes.domain.entities import Income
from app.incomes.ports.repository import IncomeRepository
from app.shared.domain.errors import DomainValidationError


@dataclass(frozen=True, slots=True)
class ListIncomesForMonthQuery:
    year: int
    month: int
    limit: int = 50
    offset: int = 0


@dataclass(frozen=True, slots=True)
class IncomePage:
    items: list[Income]
    total: int


class ListIncomesForMonth:
    def __init__(self, repository: IncomeRepository) -> None:
        self._repository = repository

    def __call__(self, query: ListIncomesForMonthQuery) -> IncomePage:
        if not 1 <= query.month <= 12:
            raise DomainValidationError("month must be between 1 and 12")
        items = self._repository.list_for_month(
            query.year, query.month, limit=query.limit, offset=query.offset
        )
        total = self._repository.count_for_month(query.year, query.month)
        return IncomePage(items=items, total=total)
