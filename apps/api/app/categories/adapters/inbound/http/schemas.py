"""HTTP DTOs for the categories endpoints."""

from __future__ import annotations

from pydantic import BaseModel

from app.categories.domain.entities import Category


class CategoryResponse(BaseModel):
    id: int
    name: str
    icon: str | None
    sort_order: int

    @classmethod
    def from_entity(cls, category: Category) -> CategoryResponse:
        return cls(
            id=category.id,
            name=category.name,
            icon=category.icon,
            sort_order=category.sort_order,
        )
