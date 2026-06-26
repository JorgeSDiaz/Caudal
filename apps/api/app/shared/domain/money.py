"""Money value object.

Amounts are stored as an integer number of cents to avoid floating-point
rounding errors, which would silently corrupt financial totals.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class Money:
    amount_cents: int
    currency: str

    def __post_init__(self) -> None:
        if isinstance(self.amount_cents, bool) or not isinstance(self.amount_cents, int):
            raise TypeError("amount_cents must be an int")
        if self.amount_cents < 0:
            raise ValueError("amount_cents cannot be negative")
        if len(self.currency) != 3 or not self.currency.isalpha():
            raise ValueError("currency must be a 3-letter ISO 4217 code")
        object.__setattr__(self, "currency", self.currency.upper())
