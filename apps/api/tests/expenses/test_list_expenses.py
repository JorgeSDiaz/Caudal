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


def test_list_returns_only_expenses_of_that_month() -> None:
    repository = InMemoryExpenseRepository()
    _record(repository, date(2026, 6, 1))
    _record(repository, date(2026, 6, 30))
    _record(repository, date(2026, 5, 31))

    result = ListExpensesForMonth(repository)(ListExpensesForMonthQuery(2026, 6))

    assert len(result) == 2
    assert all(expense.occurred_on.month == 6 for expense in result)


def test_list_rejects_invalid_month() -> None:
    list_expenses = ListExpensesForMonth(InMemoryExpenseRepository())

    with pytest.raises(ValueError):
        list_expenses(ListExpensesForMonthQuery(2026, 13))
