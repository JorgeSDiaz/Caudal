"""Outbound port: what the recurrences context needs to know about categories.

Kept as a small, recurrence-owned contract so this context stays decoupled from
the categories module — an adapter wires the two together at the composition root.
"""

from __future__ import annotations

from typing import Protocol

from app.recurrences.domain.entities import RecurrenceKind


class CategoryChecker(Protocol):
    def exists_of_kind(self, category_id: int, kind: RecurrenceKind) -> bool: ...
