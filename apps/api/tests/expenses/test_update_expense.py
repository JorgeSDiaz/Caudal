from datetime import date

import pytest

from app.expenses.application.create_expense import CreateExpense, CreateExpenseCommand
from app.expenses.application.update_expense import UpdateExpense, UpdateExpenseCommand
from app.expenses.domain.errors import ExpenseNotFoundError, UnknownCategoryError
from tests.fakes import InMemoryCategoryChecker, InMemoryExpenseRepository


def _repo_with_one() -> InMemoryExpenseRepository:
    repository = InMemoryExpenseRepository()
    CreateExpense(repository, InMemoryCategoryChecker({1}))(
        CreateExpenseCommand(
            amount_cents=4500, currency="COP", category_id=1, occurred_on=date(2026, 6, 25)
        )
    )
    return repository


def test_update_changes_only_provided_fields() -> None:
    repository = _repo_with_one()
    update = UpdateExpense(repository, InMemoryCategoryChecker({1}))

    updated = update(UpdateExpenseCommand(expense_id=1, fields=frozenset({"note"}), note="lunch"))

    assert updated.note == "lunch"
    assert updated.money.amount_cents == 4500  # untouched
    assert updated.category_id == 1  # untouched


def test_update_rejects_unknown_category() -> None:
    update = UpdateExpense(_repo_with_one(), InMemoryCategoryChecker({1}))

    with pytest.raises(UnknownCategoryError):
        update(
            UpdateExpenseCommand(expense_id=1, fields=frozenset({"category_id"}), category_id=99)
        )


def test_update_missing_expense_raises() -> None:
    update = UpdateExpense(InMemoryExpenseRepository(), InMemoryCategoryChecker({1}))

    with pytest.raises(ExpenseNotFoundError):
        update(UpdateExpenseCommand(expense_id=404, fields=frozenset({"note"}), note="x"))
