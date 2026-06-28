from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Query

from app.categories.adapters.inbound.http.schemas import CategoryResponse
from app.categories.domain.entities import CategoryKind
from app.categories.wiring import ListCategoriesDep

router = APIRouter(prefix="/categories", tags=["categories"])

KindParam = Annotated[CategoryKind, Query(description="Category kind: expense (default) or income")]


@router.get("", response_model=list[CategoryResponse])
def list_categories(
    use_case: ListCategoriesDep, kind: KindParam = "expense"
) -> list[CategoryResponse]:
    return [CategoryResponse.from_entity(category) for category in use_case(kind)]
