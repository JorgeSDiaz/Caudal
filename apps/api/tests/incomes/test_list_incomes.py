from datetime import date

import pytest

from app.incomes.application.create_income import CreateIncome, CreateIncomeCommand
from app.incomes.application.list_incomes import ListIncomesForMonth, ListIncomesForMonthQuery
from app.shared.domain.errors import DomainValidationError
from tests.fakes import InMemoryIncomeRepository, InMemorySourceChecker


def _create(repository: InMemoryIncomeRepository, occurred_on: date) -> None:
    CreateIncome(repository, InMemorySourceChecker({1}))(
        CreateIncomeCommand(
            amount_cents=1000,
            currency="COP",
            source_id=1,
            occurred_on=occurred_on,
        )
    )


def test_list_returns_only_the_requested_financial_month() -> None:
    repository = InMemoryIncomeRepository()
    _create(repository, date(2026, 6, 29))
    _create(repository, date(2026, 6, 30))
    _create(repository, date(2026, 7, 29))
    _create(repository, date(2026, 7, 30))

    page = ListIncomesForMonth(repository)(ListIncomesForMonthQuery(year=2026, month=7))

    assert page.total == 2
    assert [income.occurred_on for income in page.items] == [date(2026, 7, 29), date(2026, 6, 30)]


def test_list_rejects_invalid_month() -> None:
    with pytest.raises(DomainValidationError):
        ListIncomesForMonth(InMemoryIncomeRepository())(
            ListIncomesForMonthQuery(year=2026, month=13)
        )
