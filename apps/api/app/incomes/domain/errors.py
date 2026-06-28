"""Domain errors for the incomes context."""

from __future__ import annotations


class UnknownSourceError(Exception):
    """Raised when an income references a source (category) that does not exist."""

    def __init__(self, source_id: int) -> None:
        super().__init__(f"source {source_id} does not exist")
        self.source_id = source_id


class IncomeNotFoundError(Exception):
    """Raised when an income cannot be found (or was already deleted)."""

    def __init__(self, income_id: int) -> None:
        super().__init__(f"income {income_id} not found")
        self.income_id = income_id
