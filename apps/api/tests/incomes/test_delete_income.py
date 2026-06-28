from datetime import date

import pytest

from app.incomes.application.create_income import CreateIncome, CreateIncomeCommand
from app.incomes.application.delete_income import DeleteIncome
from app.incomes.domain.errors import IncomeNotFoundError
from tests.fakes import InMemoryIncomeRepository, InMemorySourceChecker


def test_delete_soft_deletes_existing_income() -> None:
    repository = InMemoryIncomeRepository()
    income = CreateIncome(repository, InMemorySourceChecker({1}))(
        CreateIncomeCommand(
            amount_cents=1000,
            currency="COP",
            source_id=1,
            occurred_on=date(2026, 6, 1),
        )
    )

    DeleteIncome(repository)(income.id)

    assert repository.list_all() == []


def test_delete_rejects_missing_income() -> None:
    with pytest.raises(IncomeNotFoundError):
        DeleteIncome(InMemoryIncomeRepository())(404)
