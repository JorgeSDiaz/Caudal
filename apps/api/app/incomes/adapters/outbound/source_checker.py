from __future__ import annotations

from app.categories.ports.repository import CategoryRepository


class CategorySourceChecker:
    """Satisfies the SourceChecker port by delegating to the categories repository.

    Only income-kind categories are valid sources for an income.
    """

    def __init__(self, categories: CategoryRepository) -> None:
        self._categories = categories

    def exists(self, source_id: int) -> bool:
        return self._categories.exists_of_kind(source_id, "income")
