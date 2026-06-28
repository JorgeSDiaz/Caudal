from datetime import date

import pytest

from app.incomes.application.create_income import CreateIncome, CreateIncomeCommand
from app.incomes.application.export_incomes import ExportIncomes
from app.incomes.application.import_incomes import ImportIncomes, ImportIncomesCommand
from app.incomes.domain.errors import UnknownSourceError
from tests.fakes import InMemoryIncomeRepository, InMemorySourceChecker


def _command(source_id: int = 1, amount_cents: int = 1000) -> CreateIncomeCommand:
    return CreateIncomeCommand(
        amount_cents=amount_cents,
        currency="COP",
        source_id=source_id,
        occurred_on=date(2026, 6, 1),
    )


def test_export_returns_all_active_incomes() -> None:
    repository = InMemoryIncomeRepository()
    create = CreateIncome(repository, InMemorySourceChecker({1}))
    create(_command(amount_cents=1000))
    create(_command(amount_cents=2000))

    exported = ExportIncomes(repository)()

    assert [income.money.amount_cents for income in exported] == [1000, 2000]


def test_import_creates_all_items() -> None:
    repository = InMemoryIncomeRepository()
    do_import = ImportIncomes(repository, InMemorySourceChecker({1}))

    imported = do_import(ImportIncomesCommand(items=(_command(), _command())))

    assert imported == 2
    assert len(repository.list_all()) == 2


def test_import_is_atomic_on_unknown_source() -> None:
    repository = InMemoryIncomeRepository()
    do_import = ImportIncomes(repository, InMemorySourceChecker({1}))

    with pytest.raises(UnknownSourceError):
        do_import(ImportIncomesCommand(items=(_command(source_id=1), _command(source_id=99))))

    assert repository.list_all() == []  # nothing persisted when one item is invalid
