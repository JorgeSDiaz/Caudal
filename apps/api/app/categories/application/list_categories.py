from __future__ import annotations

from app.categories.domain.entities import Category, CategoryKind
from app.categories.ports.repository import CategoryRepository


class ListActiveCategories:
    def __init__(self, repository: CategoryRepository) -> None:
        self._repository = repository

    def __call__(self, kind: CategoryKind = "expense") -> list[Category]:
        active = [c for c in self._repository.list_by_kind(kind) if c.is_active]
        return sorted(active, key=lambda category: category.sort_order)
