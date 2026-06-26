"""Use case: list the expenses recorded in a given month."""

from __future__ import annotations

from dataclasses import dataclass

from app.expenses.domain.entities import Expense
from app.expenses.ports.repository import ExpenseRepository
from app.shared.domain.errors import DomainValidationError


@dataclass(frozen=True, slots=True)
class ListExpensesForMonthQuery:
    year: int
    month: int


class ListExpensesForMonth:
    def __init__(self, repository: ExpenseRepository) -> None:
        self._repository = repository

    def __call__(self, query: ListExpensesForMonthQuery) -> list[Expense]:
        if not 1 <= query.month <= 12:
            raise DomainValidationError("month must be between 1 and 12")
        return self._repository.list_for_month(query.year, query.month)
