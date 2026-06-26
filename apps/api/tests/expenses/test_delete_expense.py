from datetime import date

import pytest

from app.expenses.application.create_expense import CreateExpense, CreateExpenseCommand
from app.expenses.application.delete_expense import DeleteExpense
from app.expenses.domain.errors import ExpenseNotFoundError
from tests.fakes import InMemoryCategoryChecker, InMemoryExpenseRepository


def test_delete_soft_removes_from_listings() -> None:
    repository = InMemoryExpenseRepository()
    CreateExpense(repository, InMemoryCategoryChecker({1}))(
        CreateExpenseCommand(
            amount_cents=4500, currency="COP", category_id=1, occurred_on=date(2026, 6, 25)
        )
    )

    DeleteExpense(repository)(1)

    assert repository.get(1) is None
    assert repository.list_for_month(2026, 6) == []


def test_delete_missing_expense_raises() -> None:
    with pytest.raises(ExpenseNotFoundError):
        DeleteExpense(InMemoryExpenseRepository())(404)
