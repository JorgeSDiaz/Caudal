"""Expense domain entities. Pure Python: no framework, no persistence concerns."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date

from app.shared.domain.errors import DomainValidationError
from app.shared.domain.money import Money


@dataclass(frozen=True, slots=True)
class DraftExpense:
    """An expense that has not been persisted yet (no identity)."""

    money: Money
    category_id: int
    occurred_on: date
    note: str | None = None

    def __post_init__(self) -> None:
        if self.money.amount_cents <= 0:
            raise DomainValidationError("an expense amount must be positive")


@dataclass(frozen=True, slots=True)
class Expense:
    """A persisted expense (carries its identity)."""

    id: int
    money: Money
    category_id: int
    occurred_on: date
    note: str | None = None

    def __post_init__(self) -> None:
        if self.money.amount_cents <= 0:
            raise DomainValidationError("an expense amount must be positive")
