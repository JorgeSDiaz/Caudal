"""In-memory adapters for testing use cases without infrastructure."""

from __future__ import annotations

from itertools import count

from app.categories.domain.entities import Category
from app.expenses.domain.entities import DraftExpense, Expense
from app.expenses.domain.errors import ExpenseNotFoundError
from app.reports.domain.entities import CategoryBreakdown


class InMemoryExpenseRepository:
    """Satisfies the ExpenseRepository port structurally (typing.Protocol)."""

    def __init__(self) -> None:
        self._items: dict[int, Expense] = {}
        self._deleted: set[int] = set()
        self._ids = count(1)

    def add(self, draft: DraftExpense) -> Expense:
        expense = Expense(
            id=next(self._ids),
            money=draft.money,
            category_id=draft.category_id,
            occurred_on=draft.occurred_on,
            note=draft.note,
        )
        self._items[expense.id] = expense
        return expense

    def add_many(self, drafts: list[DraftExpense]) -> int:
        for draft in drafts:
            self.add(draft)
        return len(drafts)

    def list_all(self) -> list[Expense]:
        return [item for item in self._items.values() if item.id not in self._deleted]

    def get(self, expense_id: int) -> Expense | None:
        if expense_id in self._deleted:
            return None
        return self._items.get(expense_id)

    def update(self, expense: Expense) -> Expense:
        if expense.id not in self._items or expense.id in self._deleted:
            raise ExpenseNotFoundError(expense.id)
        self._items[expense.id] = expense
        return expense

    def soft_delete(self, expense_id: int) -> bool:
        if expense_id not in self._items or expense_id in self._deleted:
            return False
        self._deleted.add(expense_id)
        return True

    def list_for_month(self, year: int, month: int) -> list[Expense]:
        return [
            item
            for item in self._items.values()
            if item.id not in self._deleted
            and item.occurred_on.year == year
            and item.occurred_on.month == month
        ]


class InMemoryCategoryRepository:
    """Satisfies the CategoryRepository port structurally (typing.Protocol)."""

    def __init__(self, categories: list[Category]) -> None:
        self._categories = list(categories)

    def list_all(self) -> list[Category]:
        return list(self._categories)


class InMemoryCategoryChecker:
    """Satisfies the CategoryChecker port; knows a fixed set of existing ids."""

    def __init__(self, existing_ids: set[int]) -> None:
        self._existing_ids = existing_ids

    def exists(self, category_id: int) -> bool:
        return category_id in self._existing_ids


class StubMonthlyExpenseReader:
    """Satisfies the MonthlyExpenseReader port with canned data per (year, month)."""

    def __init__(
        self,
        breakdowns: dict[tuple[int, int], list[CategoryBreakdown]] | None = None,
        totals: dict[tuple[int, int], int] | None = None,
    ) -> None:
        self._breakdowns = breakdowns or {}
        self._totals = totals or {}

    def total_for_month(self, year: int, month: int) -> int:
        return self._totals.get((year, month), 0)

    def breakdown_for_month(self, year: int, month: int) -> list[CategoryBreakdown]:
        return self._breakdowns.get((year, month), [])
