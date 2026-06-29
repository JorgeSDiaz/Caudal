from __future__ import annotations

from app.categories.ports.repository import CategoryRepository
from app.recurrences.domain.entities import RecurrenceKind


class CategoryRepositoryChecker:
    """Satisfies the CategoryChecker port by delegating to the categories repository."""

    def __init__(self, categories: CategoryRepository) -> None:
        self._categories = categories

    def exists_of_kind(self, category_id: int, kind: RecurrenceKind) -> bool:
        return self._categories.exists_of_kind(category_id, kind)
