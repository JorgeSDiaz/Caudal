"""Adapter implementing the expenses CategoryChecker port via the categories module."""

from __future__ import annotations

from app.categories.ports.repository import CategoryRepository


class CategoryRepositoryChecker:
    """Satisfies the CategoryChecker port by delegating to the categories repository."""

    def __init__(self, categories: CategoryRepository) -> None:
        self._categories = categories

    def exists(self, category_id: int) -> bool:
        return any(category.id == category_id for category in self._categories.list_all())
