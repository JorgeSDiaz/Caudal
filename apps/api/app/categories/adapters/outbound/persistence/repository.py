from __future__ import annotations

from sqlmodel import Session, select

from app.categories.adapters.outbound.persistence.models import CategoryModel
from app.categories.domain.entities import Category, CategoryKind


class SqlCategoryRepository:
    """Satisfies the CategoryRepository port (structural typing)."""

    def __init__(self, session: Session) -> None:
        self._session = session

    def list_by_kind(self, kind: CategoryKind) -> list[Category]:
        statement = select(CategoryModel).where(CategoryModel.kind == kind)
        return [_to_entity(row) for row in self._session.exec(statement).all()]

    def exists_of_kind(self, category_id: int, kind: CategoryKind) -> bool:
        statement = select(CategoryModel.id).where(
            CategoryModel.id == category_id, CategoryModel.kind == kind
        )
        return self._session.exec(statement).first() is not None


def _to_entity(model: CategoryModel) -> Category:
    assert model.id is not None
    return Category(
        id=model.id,
        name=model.name,
        sort_order=model.sort_order,
        is_system=model.is_system,
        is_active=model.is_active,
        kind=_kind(model.kind),
        icon=model.icon,
    )


def _kind(value: str) -> CategoryKind:
    return "income" if value == "income" else "expense"
