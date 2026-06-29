from __future__ import annotations

from datetime import date

from app.recurrences.domain.schedule import due_occurrences
from app.recurrences.ports.movement_writer import MovementWriter
from app.recurrences.ports.repository import RecurrenceRepository


class RunDueRecurrences:
    """Materializes every occurrence that has come due into a real movement.

    Idempotent: the repository's last_generated_on cursor means a second run on
    the same day creates nothing.
    """

    def __init__(self, repository: RecurrenceRepository, writer: MovementWriter) -> None:
        self._repository = repository
        self._writer = writer

    def __call__(self, today: date) -> int:
        generated = 0
        for recurrence in self._repository.list_active():
            occurrences = due_occurrences(recurrence, today)
            for occurrence in occurrences:
                self._writer.create(
                    kind=recurrence.kind,
                    amount_cents=recurrence.money.amount_cents,
                    currency=recurrence.money.currency,
                    category_id=recurrence.category_id,
                    occurred_on=occurrence,
                    note=recurrence.note,
                )
                generated += 1
            if occurrences:
                self._repository.mark_generated(recurrence.id, occurrences[-1])
        return generated
