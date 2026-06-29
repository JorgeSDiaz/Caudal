from datetime import date

from app.recurrences.domain.entities import Frequency, Recurrence
from app.recurrences.domain.schedule import due_occurrences, next_occurrence
from app.shared.domain.money import Money


def _recurrence(
    *,
    frequency: Frequency = "monthly",
    day_of_month: int = 15,
    second_day_of_month: int | None = None,
    start_date: date = date(2026, 1, 1),
    end_date: date | None = None,
    is_active: bool = True,
    last_generated_on: date | None = None,
) -> Recurrence:
    return Recurrence(
        id=1,
        kind="income",
        money=Money(100, "COP"),
        category_id=1,
        frequency=frequency,
        day_of_month=day_of_month,
        second_day_of_month=second_day_of_month,
        start_date=start_date,
        end_date=end_date,
        is_active=is_active,
        last_generated_on=last_generated_on,
    )


def test_monthly_generates_one_occurrence_per_month_up_to_today() -> None:
    recurrence = _recurrence(day_of_month=15, start_date=date(2026, 1, 1))

    occurrences = due_occurrences(recurrence, today=date(2026, 3, 20))

    assert occurrences == [date(2026, 1, 15), date(2026, 2, 15), date(2026, 3, 15)]


def test_day_is_clamped_to_the_last_day_of_short_months() -> None:
    recurrence = _recurrence(day_of_month=31, start_date=date(2026, 1, 1))

    occurrences = due_occurrences(recurrence, today=date(2026, 2, 28))

    assert occurrences == [date(2026, 1, 31), date(2026, 2, 28)]


def test_biweekly_generates_two_occurrences_per_month() -> None:
    recurrence = _recurrence(
        frequency="biweekly", day_of_month=15, second_day_of_month=30, start_date=date(2026, 1, 1)
    )

    occurrences = due_occurrences(recurrence, today=date(2026, 2, 15))

    assert occurrences == [
        date(2026, 1, 15),
        date(2026, 1, 30),
        date(2026, 2, 15),
    ]


def test_cursor_prevents_regenerating_past_occurrences() -> None:
    recurrence = _recurrence(
        day_of_month=15, start_date=date(2026, 1, 1), last_generated_on=date(2026, 2, 15)
    )

    occurrences = due_occurrences(recurrence, today=date(2026, 3, 20))

    assert occurrences == [date(2026, 3, 15)]


def test_end_date_stops_generation() -> None:
    recurrence = _recurrence(
        day_of_month=15, start_date=date(2026, 1, 1), end_date=date(2026, 2, 1)
    )

    occurrences = due_occurrences(recurrence, today=date(2026, 6, 1))

    assert occurrences == [date(2026, 1, 15)]


def test_paused_recurrence_generates_nothing() -> None:
    recurrence = _recurrence(is_active=False)

    assert due_occurrences(recurrence, today=date(2026, 6, 1)) == []


def test_future_start_generates_nothing_yet() -> None:
    recurrence = _recurrence(day_of_month=15, start_date=date(2026, 12, 1))

    assert due_occurrences(recurrence, today=date(2026, 6, 1)) == []


def test_next_occurrence_is_the_first_future_date() -> None:
    recurrence = _recurrence(day_of_month=15)

    assert next_occurrence(recurrence, today=date(2026, 6, 20)) == date(2026, 7, 15)


def test_next_occurrence_is_none_after_end_date() -> None:
    recurrence = _recurrence(day_of_month=15, end_date=date(2026, 5, 1))

    assert next_occurrence(recurrence, today=date(2026, 6, 20)) is None
