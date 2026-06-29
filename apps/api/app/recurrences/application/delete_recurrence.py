from __future__ import annotations

from app.recurrences.domain.errors import RecurrenceNotFoundError
from app.recurrences.ports.repository import RecurrenceRepository


class DeleteRecurrence:
    def __init__(self, repository: RecurrenceRepository) -> None:
        self._repository = repository

    def __call__(self, recurrence_id: int) -> None:
        if not self._repository.soft_delete(recurrence_id):
            raise RecurrenceNotFoundError(recurrence_id)
