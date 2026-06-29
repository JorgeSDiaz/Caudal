from datetime import date

from app.recurrences.application.run_due_recurrences import RunDueRecurrences
from app.recurrences.domain.entities import DraftRecurrence
from app.shared.domain.money import Money
from tests.fakes import InMemoryRecurrenceRepository, RecordingMovementWriter


def _seed_monthly_income(repository: InMemoryRecurrenceRepository) -> None:
    repository.add(
        DraftRecurrence(
            kind="income",
            money=Money(2_500_000, "COP"),
            category_id=19,
            frequency="monthly",
            day_of_month=15,
            start_date=date(2026, 1, 1),
        )
    )


def test_run_materializes_due_occurrences_as_movements() -> None:
    repository = InMemoryRecurrenceRepository()
    _seed_monthly_income(repository)
    writer = RecordingMovementWriter()

    generated = RunDueRecurrences(repository, writer)(today=date(2026, 3, 20))

    assert generated == 3
    assert [movement[3] for movement in writer.created] == [
        date(2026, 1, 15),
        date(2026, 2, 15),
        date(2026, 3, 15),
    ]
    assert all(movement[0] == "income" for movement in writer.created)


def test_run_is_idempotent_on_a_second_call_the_same_day() -> None:
    repository = InMemoryRecurrenceRepository()
    _seed_monthly_income(repository)
    writer = RecordingMovementWriter()
    run = RunDueRecurrences(repository, writer)

    first = run(today=date(2026, 3, 20))
    second = run(today=date(2026, 3, 20))

    assert first == 3
    assert second == 0  # cursor advanced; nothing new to generate
