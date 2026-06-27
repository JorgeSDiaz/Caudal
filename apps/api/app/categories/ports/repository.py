"""Outbound port: the contract the application needs from any category store."""

from __future__ import annotations

from typing import Protocol

from app.categories.domain.entities import Category


class CategoryRepository(Protocol):
    def list_all(self) -> list[Category]: ...

    def exists(self, category_id: int) -> bool: ...
