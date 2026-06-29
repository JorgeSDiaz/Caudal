"""Outbound port: the contract the application needs from any recurrence store."""

from __future__ import annotations

from datetime import date
from typing import Protocol

from app.recurrences.domain.entities import DraftRecurrence, Recurrence


class RecurrenceRepository(Protocol):
    def add(self, draft: DraftRecurrence) -> Recurrence: ...

    def get(self, recurrence_id: int) -> Recurrence | None: ...

    def list_all(self) -> list[Recurrence]: ...

    def list_active(self) -> list[Recurrence]: ...

    def update(self, recurrence: Recurrence) -> Recurrence: ...

    def soft_delete(self, recurrence_id: int) -> bool: ...

    def mark_generated(self, recurrence_id: int, last_generated_on: date) -> None: ...
