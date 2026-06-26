"""Domain errors for the expenses context."""

from __future__ import annotations


class UnknownCategoryError(Exception):
    """Raised when an expense references a category that does not exist."""

    def __init__(self, category_id: int) -> None:
        super().__init__(f"category {category_id} does not exist")
        self.category_id = category_id


class ExpenseNotFoundError(Exception):
    """Raised when an expense cannot be found (or was already deleted)."""

    def __init__(self, expense_id: int) -> None:
        super().__init__(f"expense {expense_id} not found")
        self.expense_id = expense_id
