"""Outbound port: the contract the application needs from any category store."""

from __future__ import annotations

from typing import Protocol

from app.categories.domain.entities import Category, CategoryKind


class CategoryRepository(Protocol):
    def list_by_kind(self, kind: CategoryKind) -> list[Category]: ...

    def exists_of_kind(self, category_id: int, kind: CategoryKind) -> bool: ...
