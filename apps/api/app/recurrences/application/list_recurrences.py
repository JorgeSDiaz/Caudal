from __future__ import annotations

from app.recurrences.domain.entities import Recurrence, RecurrenceKind
from app.recurrences.ports.repository import RecurrenceRepository


class ListRecurrences:
    def __init__(self, repository: RecurrenceRepository) -> None:
        self._repository = repository

    def __call__(self, kind: RecurrenceKind | None = None) -> list[Recurrence]:
        recurrences = self._repository.list_active()
        if kind is not None:
            recurrences = [item for item in recurrences if item.kind == kind]
        return sorted(recurrences, key=lambda item: item.id)
