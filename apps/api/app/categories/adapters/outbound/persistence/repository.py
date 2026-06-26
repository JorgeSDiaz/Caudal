"""Postgres adapter implementing the CategoryRepository port (maps model <-> entity)."""

from __future__ import annotations

from sqlmodel import Session, select

from app.categories.adapters.outbound.persistence.models import CategoryModel
from app.categories.domain.entities import Category


class SqlCategoryRepository:
    """Satisfies the CategoryRepository port (structural typing)."""

    def __init__(self, session: Session) -> None:
        self._session = session

    def list_all(self) -> list[Category]:
        rows = self._session.exec(select(CategoryModel)).all()
        return [_to_entity(row) for row in rows]


def _to_entity(model: CategoryModel) -> Category:
    assert model.id is not None
    return Category(
        id=model.id,
        name=model.name,
        sort_order=model.sort_order,
        is_system=model.is_system,
        is_active=model.is_active,
        icon=model.icon,
    )
