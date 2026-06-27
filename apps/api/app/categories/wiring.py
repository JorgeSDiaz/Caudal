from __future__ import annotations

from typing import Annotated

from fastapi import Depends
from sqlmodel import Session

from app.categories.adapters.outbound.persistence.repository import SqlCategoryRepository
from app.categories.application.list_categories import ListActiveCategories
from app.categories.ports.repository import CategoryRepository
from app.shared.database import get_session

SessionDep = Annotated[Session, Depends(get_session)]


def provide_repository(session: SessionDep) -> CategoryRepository:
    return SqlCategoryRepository(session)


RepositoryDep = Annotated[CategoryRepository, Depends(provide_repository)]


def provide_list_categories(repository: RepositoryDep) -> ListActiveCategories:
    return ListActiveCategories(repository)


ListCategoriesDep = Annotated[ListActiveCategories, Depends(provide_list_categories)]
