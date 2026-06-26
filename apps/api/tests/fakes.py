"""In-memory adapters for testing use cases without infrastructure."""

from __future__ import annotations

from itertools import count

from app.expenses.domain.entities import DraftExpense, Expense


class InMemoryExpenseRepository:
    """Satisfies the ExpenseRepository port structurally (typing.Protocol)."""

    def __init__(self) -> None:
        self._items: list[Expense] = []
        self._ids = count(1)

    def add(self, draft: DraftExpense) -> Expense:
        expense = Expense(
            id=next(self._ids),
            money=draft.money,
            category_id=draft.category_id,
            occurred_on=draft.occurred_on,
            note=draft.note,
        )
        self._items.append(expense)
        return expense

    def list_for_month(self, year: int, month: int) -> list[Expense]:
        return [
            item
            for item in self._items
            if item.occurred_on.year == year and item.occurred_on.month == month
        ]
