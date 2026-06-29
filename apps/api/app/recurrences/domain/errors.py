"""Domain errors for the recurrences context."""

from __future__ import annotations


class UnknownRecurrenceCategoryError(Exception):
    """Raised when a recurrence targets a category that does not exist for its kind."""

    def __init__(self, category_id: int) -> None:
        super().__init__(f"category {category_id} does not exist for this kind")
        self.category_id = category_id


class RecurrenceNotFoundError(Exception):
    """Raised when a recurrence cannot be found (or was already deleted)."""

    def __init__(self, recurrence_id: int) -> None:
        super().__init__(f"recurrence {recurrence_id} not found")
        self.recurrence_id = recurrence_id
