from __future__ import annotations

from app.categories.ports.repository import CategoryRepository


class CategoryRepositoryChecker:
    """Satisfies the CategoryChecker port by delegating to the categories repository.

    Only expense-kind categories are valid targets for an expense.
    """

    def __init__(self, categories: CategoryRepository) -> None:
        self._categories = categories

    def exists(self, category_id: int) -> bool:
        return self._categories.exists_of_kind(category_id, "expense")
