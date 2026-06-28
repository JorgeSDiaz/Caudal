"""In-memory adapters for testing use cases without infrastructure."""

from __future__ import annotations

from itertools import count

from app.categories.domain.entities import Category, CategoryKind
from app.expenses.domain.entities import DraftExpense, Expense
from app.expenses.domain.errors import ExpenseNotFoundError
from app.incomes.domain.entities import DraftIncome, Income
from app.incomes.domain.errors import IncomeNotFoundError
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

    def list_by_kind(self, kind: CategoryKind) -> list[Category]:
        return [category for category in self._categories if category.kind == kind]

    def exists_of_kind(self, category_id: int, kind: CategoryKind) -> bool:
        return any(
            category.id == category_id and category.kind == kind for category in self._categories
        )


class InMemoryCategoryChecker:
    """Satisfies the CategoryChecker port; knows a fixed set of existing ids."""

    def __init__(self, existing_ids: set[int]) -> None:
        self._existing_ids = existing_ids

    def exists(self, category_id: int) -> bool:
        return category_id in self._existing_ids


class InMemoryIncomeRepository:
    """Satisfies the IncomeRepository port structurally (typing.Protocol)."""

    def __init__(self) -> None:
        self._items: dict[int, Income] = {}
        self._deleted: set[int] = set()
        self._ids = count(1)

    def add(self, draft: DraftIncome) -> Income:
        income = Income(
            id=next(self._ids),
            money=draft.money,
            source_id=draft.source_id,
            occurred_on=draft.occurred_on,
            note=draft.note,
        )
        self._items[income.id] = income
        return income

    def add_many(self, drafts: list[DraftIncome]) -> int:
        for draft in drafts:
            self.add(draft)
        return len(drafts)

    def list_all(self) -> list[Income]:
        return [item for item in self._items.values() if item.id not in self._deleted]

    def get(self, income_id: int) -> Income | None:
        if income_id in self._deleted:
            return None
        return self._items.get(income_id)

    def update(self, income: Income) -> Income:
        if income.id not in self._items or income.id in self._deleted:
            raise IncomeNotFoundError(income.id)
        self._items[income.id] = income
        return income

    def soft_delete(self, income_id: int) -> bool:
        if income_id not in self._items or income_id in self._deleted:
            return False
        self._deleted.add(income_id)
        return True

    def list_for_month(self, year: int, month: int) -> list[Income]:
        return [
            item
            for item in self._items.values()
            if item.id not in self._deleted
            and item.occurred_on.year == year
            and item.occurred_on.month == month
        ]


class InMemorySourceChecker:
    """Satisfies the SourceChecker port; knows a fixed set of existing ids."""

    def __init__(self, existing_ids: set[int]) -> None:
        self._existing_ids = existing_ids

    def exists(self, source_id: int) -> bool:
        return source_id in self._existing_ids


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
