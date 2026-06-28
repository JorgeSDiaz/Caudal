from datetime import date

import pytest

from app.incomes.application.create_income import CreateIncome, CreateIncomeCommand
from app.incomes.domain.errors import UnknownSourceError
from tests.fakes import InMemoryIncomeRepository, InMemorySourceChecker


def _command(source_id: int = 1) -> CreateIncomeCommand:
    return CreateIncomeCommand(
        amount_cents=1_500_000,
        currency="COP",
        source_id=source_id,
        occurred_on=date(2026, 6, 25),
        note="quincena",
    )


def test_create_income_persists_and_returns_identity() -> None:
    repository = InMemoryIncomeRepository()
    create = CreateIncome(repository, InMemorySourceChecker({1}))

    income = create(_command())

    assert income.id == 1
    assert repository.list_for_month(2026, 6) == [income]


def test_create_income_rejects_unknown_source() -> None:
    create = CreateIncome(InMemoryIncomeRepository(), InMemorySourceChecker(set()))

    with pytest.raises(UnknownSourceError):
        create(_command(source_id=999))


def test_create_income_rejects_non_positive_amount() -> None:
    create = CreateIncome(InMemoryIncomeRepository(), InMemorySourceChecker({1}))

    with pytest.raises(ValueError):
        create(
            CreateIncomeCommand(
                amount_cents=0,
                currency="COP",
                source_id=1,
                occurred_on=date(2026, 6, 25),
            )
        )
