from datetime import date

import pytest

from app.expenses.application.create_expense import CreateExpense, CreateExpenseCommand
from tests.fakes import InMemoryExpenseRepository


def test_create_expense_persists_and_returns_identity() -> None:
    repository = InMemoryExpenseRepository()
    create = CreateExpense(repository)

    expense = create(
        CreateExpenseCommand(
            amount_cents=4500,
            currency="COP",
            category_id=1,
            occurred_on=date(2026, 6, 25),
            note="coffee",
        )
    )

    assert expense.id == 1
    assert repository.list_for_month(2026, 6) == [expense]


def test_create_expense_rejects_non_positive_amount() -> None:
    create = CreateExpense(InMemoryExpenseRepository())

    with pytest.raises(ValueError):
        create(
            CreateExpenseCommand(
                amount_cents=0,
                currency="COP",
                category_id=1,
                occurred_on=date(2026, 6, 25),
            )
        )
