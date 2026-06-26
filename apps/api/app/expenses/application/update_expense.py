"""Use case: edit an existing expense (partial update)."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from typing import Any, TypeVar

from app.expenses.domain.entities import Expense
from app.expenses.domain.errors import ExpenseNotFoundError, UnknownCategoryError
from app.expenses.ports.category_checker import CategoryChecker
from app.expenses.ports.repository import ExpenseRepository
from app.shared.domain.money import Money

_T = TypeVar("_T")


@dataclass(frozen=True, slots=True)
class UpdateExpenseCommand:
    expense_id: int
    fields: frozenset[str]  # which attributes the caller intends to change
    amount_cents: int | None = None
    currency: str | None = None
    category_id: int | None = None
    occurred_on: date | None = None
    note: str | None = None


class UpdateExpense:
    def __init__(self, repository: ExpenseRepository, categories: CategoryChecker) -> None:
        self._repository = repository
        self._categories = categories

    def __call__(self, command: UpdateExpenseCommand) -> Expense:
        existing = self._repository.get(command.expense_id)
        if existing is None:
            raise ExpenseNotFoundError(command.expense_id)

        amount_cents = self._pick(command, "amount_cents", existing.money.amount_cents)
        currency = self._pick(command, "currency", existing.money.currency)
        category_id = self._pick(command, "category_id", existing.category_id)
        occurred_on = self._pick(command, "occurred_on", existing.occurred_on)
        note = self._pick(command, "note", existing.note)

        if "category_id" in command.fields and not self._categories.exists(category_id):
            raise UnknownCategoryError(category_id)

        updated = Expense(
            id=existing.id,
            money=Money(amount_cents, currency),
            category_id=category_id,
            occurred_on=occurred_on,
            note=note,
        )
        return self._repository.update(updated)

    @staticmethod
    def _pick(command: UpdateExpenseCommand, name: str, current: _T) -> _T:
        value: Any = getattr(command, name)
        return value if name in command.fields else current
