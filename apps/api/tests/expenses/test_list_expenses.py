from datetime import date

import pytest

from app.expenses.application.create_expense import CreateExpense, CreateExpenseCommand
from app.expenses.application.list_expenses import (
    ListExpensesForMonth,
    ListExpensesForMonthQuery,
)
from tests.fakes import InMemoryCategoryChecker, InMemoryExpenseRepository


def _record(repository: InMemoryExpenseRepository, occurred_on: date) -> None:
    CreateExpense(repository, InMemoryCategoryChecker({1}))(
        CreateExpenseCommand(
            amount_cents=1000,
            currency="COP",
            category_id=1,
            occurred_on=occurred_on,
        )
    )


def test_list_returns_only_expenses_of_that_financial_month() -> None:
    repository = InMemoryExpenseRepository()
    _record(repository, date(2026, 6, 29))
    _record(repository, date(2026, 6, 30))
    _record(repository, date(2026, 7, 29))
    _record(repository, date(2026, 7, 30))

    page = ListExpensesForMonth(repository)(ListExpensesForMonthQuery(2026, 7))

    assert page.total == 2
    assert [expense.occurred_on for expense in page.items] == [date(2026, 7, 29), date(2026, 6, 30)]


def test_list_paginates_with_limit_and_offset() -> None:
    repository = InMemoryExpenseRepository()
    for day in range(1, 6):  # 5 expenses in June
        _record(repository, date(2026, 6, day))

    first = ListExpensesForMonth(repository)(ListExpensesForMonthQuery(2026, 6, limit=2, offset=0))
    second = ListExpensesForMonth(repository)(ListExpensesForMonthQuery(2026, 6, limit=2, offset=2))

    assert first.total == 5  # total is the full month count, not the page size
    assert len(first.items) == 2
    assert len(second.items) == 2
    # Pages don't overlap (most-recent-first ordering is stable).
    assert {e.id for e in first.items}.isdisjoint({e.id for e in second.items})


def test_list_rejects_invalid_month() -> None:
    list_expenses = ListExpensesForMonth(InMemoryExpenseRepository())

    with pytest.raises(ValueError):
        list_expenses(ListExpensesForMonthQuery(2026, 13))
