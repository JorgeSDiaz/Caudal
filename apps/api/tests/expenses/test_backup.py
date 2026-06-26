from datetime import date

import pytest

from app.expenses.application.create_expense import CreateExpense, CreateExpenseCommand
from app.expenses.application.export_expenses import ExportExpenses
from app.expenses.application.import_expenses import ImportExpenses, ImportExpensesCommand
from app.expenses.domain.errors import UnknownCategoryError
from tests.fakes import InMemoryCategoryChecker, InMemoryExpenseRepository


def _command(category_id: int = 1, amount_cents: int = 1000) -> CreateExpenseCommand:
    return CreateExpenseCommand(
        amount_cents=amount_cents,
        currency="COP",
        category_id=category_id,
        occurred_on=date(2026, 6, 1),
    )


def test_export_returns_all_active_expenses() -> None:
    repository = InMemoryExpenseRepository()
    create = CreateExpense(repository, InMemoryCategoryChecker({1}))
    create(_command(amount_cents=1000))
    create(_command(amount_cents=2000))

    exported = ExportExpenses(repository)()

    assert [expense.money.amount_cents for expense in exported] == [1000, 2000]


def test_import_creates_all_items() -> None:
    repository = InMemoryExpenseRepository()
    do_import = ImportExpenses(repository, InMemoryCategoryChecker({1}))

    imported = do_import(ImportExpensesCommand(items=(_command(), _command())))

    assert imported == 2
    assert len(repository.list_all()) == 2


def test_import_is_atomic_on_unknown_category() -> None:
    repository = InMemoryExpenseRepository()
    do_import = ImportExpenses(repository, InMemoryCategoryChecker({1}))

    with pytest.raises(UnknownCategoryError):
        do_import(ImportExpensesCommand(items=(_command(category_id=1), _command(category_id=99))))

    assert repository.list_all() == []  # nothing persisted when one item is invalid
