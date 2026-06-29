"""Outbound port: how the recurrences context materializes a movement.

The concrete writer delegates to the expenses/incomes create use cases, wired at
the composition root, so recurrences never imports another context's internals.
"""

from __future__ import annotations

from datetime import date
from typing import Protocol

from app.recurrences.domain.entities import RecurrenceKind


class MovementWriter(Protocol):
    def create(
        self,
        kind: RecurrenceKind,
        amount_cents: int,
        currency: str,
        category_id: int,
        occurred_on: date,
        note: str | None,
    ) -> None: ...
