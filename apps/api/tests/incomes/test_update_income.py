from datetime import date

import pytest

from app.incomes.application.create_income import CreateIncome, CreateIncomeCommand
from app.incomes.application.update_income import UpdateIncome, UpdateIncomeCommand
from app.incomes.domain.errors import IncomeNotFoundError, UnknownSourceError
from tests.fakes import InMemoryIncomeRepository, InMemorySourceChecker


def _seed(repository: InMemoryIncomeRepository, source_id: int = 1) -> int:
    income = CreateIncome(repository, InMemorySourceChecker({1, 2}))(
        CreateIncomeCommand(
            amount_cents=1000,
            currency="COP",
            source_id=source_id,
            occurred_on=date(2026, 6, 1),
            note="original",
        )
    )
    return income.id


def test_update_changes_only_provided_fields() -> None:
    repository = InMemoryIncomeRepository()
    income_id = _seed(repository)
    update = UpdateIncome(repository, InMemorySourceChecker({1, 2}))

    updated = update(
        UpdateIncomeCommand(
            income_id=income_id,
            fields=frozenset({"amount_cents"}),
            amount_cents=5000,
        )
    )

    assert updated.money.amount_cents == 5000
    assert updated.source_id == 1
    assert updated.note == "original"


def test_update_rejects_unknown_source() -> None:
    repository = InMemoryIncomeRepository()
    income_id = _seed(repository)
    update = UpdateIncome(repository, InMemorySourceChecker({1, 2}))

    with pytest.raises(UnknownSourceError):
        update(
            UpdateIncomeCommand(
                income_id=income_id,
                fields=frozenset({"source_id"}),
                source_id=99,
            )
        )


def test_update_rejects_missing_income() -> None:
    update = UpdateIncome(InMemoryIncomeRepository(), InMemorySourceChecker({1}))

    with pytest.raises(IncomeNotFoundError):
        update(
            UpdateIncomeCommand(income_id=404, fields=frozenset({"amount_cents"}), amount_cents=1)
        )
