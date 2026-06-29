from datetime import date

import pytest

from app.recurrences.application.create_recurrence import (
    CreateRecurrence,
    CreateRecurrenceCommand,
)
from app.recurrences.domain.errors import UnknownRecurrenceCategoryError
from app.shared.domain.errors import DomainValidationError
from tests.fakes import InMemoryKindCategoryChecker, InMemoryRecurrenceRepository


def _command(**overrides: object) -> CreateRecurrenceCommand:
    base = dict(
        kind="income",
        amount_cents=2_500_000,
        currency="COP",
        category_id=19,
        frequency="monthly",
        day_of_month=15,
        start_date=date(2026, 6, 1),
    )
    base.update(overrides)
    return CreateRecurrenceCommand(**base)  # type: ignore[arg-type]


def test_create_persists_recurrence() -> None:
    repository = InMemoryRecurrenceRepository()
    create = CreateRecurrence(repository, InMemoryKindCategoryChecker({(19, "income")}))

    recurrence = create(_command())

    assert recurrence.id == 1
    assert recurrence.day_of_month == 15
    assert repository.list_active() == [recurrence]


def test_create_rejects_category_of_wrong_kind() -> None:
    # Category 19 exists as income, but the recurrence claims it's an expense.
    create = CreateRecurrence(
        InMemoryRecurrenceRepository(), InMemoryKindCategoryChecker({(19, "income")})
    )

    with pytest.raises(UnknownRecurrenceCategoryError):
        create(_command(kind="expense", category_id=19))


def test_create_rejects_biweekly_without_second_day() -> None:
    create = CreateRecurrence(
        InMemoryRecurrenceRepository(), InMemoryKindCategoryChecker({(19, "income")})
    )

    with pytest.raises(DomainValidationError):
        create(_command(frequency="biweekly"))
