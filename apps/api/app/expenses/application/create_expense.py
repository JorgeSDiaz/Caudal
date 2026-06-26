"""Use case: record a new expense."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date

from app.expenses.domain.entities import DraftExpense, Expense
from app.expenses.domain.errors import UnknownCategoryError
from app.expenses.ports.category_checker import CategoryChecker
from app.expenses.ports.repository import ExpenseRepository
from app.shared.domain.money import Money


@dataclass(frozen=True, slots=True)
class CreateExpenseCommand:
    amount_cents: int
    currency: str
    category_id: int
    occurred_on: date
    note: str | None = None


class CreateExpense:
    def __init__(self, repository: ExpenseRepository, categories: CategoryChecker) -> None:
        self._repository = repository
        self._categories = categories

    def __call__(self, command: CreateExpenseCommand) -> Expense:
        if not self._categories.exists(command.category_id):
            raise UnknownCategoryError(command.category_id)
        draft = DraftExpense(
            money=Money(command.amount_cents, command.currency),
            category_id=command.category_id,
            occurred_on=command.occurred_on,
            note=command.note,
        )
        return self._repository.add(draft)
