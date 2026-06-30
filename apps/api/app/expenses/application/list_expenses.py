from __future__ import annotations

from dataclasses import dataclass

from app.expenses.domain.entities import Expense
from app.expenses.ports.repository import ExpenseRepository
from app.shared.domain.errors import DomainValidationError


@dataclass(frozen=True, slots=True)
class ListExpensesForMonthQuery:
    year: int
    month: int
    limit: int = 50
    offset: int = 0


@dataclass(frozen=True, slots=True)
class ExpensePage:
    items: list[Expense]
    total: int


class ListExpensesForMonth:
    def __init__(self, repository: ExpenseRepository) -> None:
        self._repository = repository

    def __call__(self, query: ListExpensesForMonthQuery) -> ExpensePage:
        if not 1 <= query.month <= 12:
            raise DomainValidationError("month must be between 1 and 12")
        items = self._repository.list_for_month(
            query.year, query.month, limit=query.limit, offset=query.offset
        )
        total = self._repository.count_for_month(query.year, query.month)
        return ExpensePage(items=items, total=total)
