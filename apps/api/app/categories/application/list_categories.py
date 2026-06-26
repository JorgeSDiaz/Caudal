"""Use case: list the active categories a user can pick, in display order."""

from __future__ import annotations

from app.categories.domain.entities import Category
from app.categories.ports.repository import CategoryRepository


class ListActiveCategories:
    def __init__(self, repository: CategoryRepository) -> None:
        self._repository = repository

    def __call__(self) -> list[Category]:
        active = [category for category in self._repository.list_all() if category.is_active]
        return sorted(active, key=lambda category: category.sort_order)
