from datetime import date

import pytest

from app.expenses.application.create_expense import CreateExpense, CreateExpenseCommand
from app.expenses.domain.errors import UnknownCategoryError
from tests.fakes import InMemoryCategoryChecker, InMemoryExpenseRepository


def _command(category_id: int = 1) -> CreateExpenseCommand:
    return CreateExpenseCommand(
        amount_cents=4500,
        currency="COP",
        category_id=category_id,
        occurred_on=date(2026, 6, 25),
        note="coffee",
    )


def test_create_expense_persists_and_returns_identity() -> None:
    repository = InMemoryExpenseRepository()
    create = CreateExpense(repository, InMemoryCategoryChecker({1}))

    expense = create(_command())

    assert expense.id == 1
    assert repository.list_for_month(2026, 6) == [expense]


def test_create_expense_rejects_unknown_category() -> None:
    create = CreateExpense(InMemoryExpenseRepository(), InMemoryCategoryChecker(set()))

    with pytest.raises(UnknownCategoryError):
        create(_command(category_id=999))


def test_create_expense_rejects_non_positive_amount() -> None:
    create = CreateExpense(InMemoryExpenseRepository(), InMemoryCategoryChecker({1}))

    with pytest.raises(ValueError):
        create(
            CreateExpenseCommand(
                amount_cents=0,
                currency="COP",
                category_id=1,
                occurred_on=date(2026, 6, 25),
            )
        )
