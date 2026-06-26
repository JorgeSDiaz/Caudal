"""Inbound HTTP adapter for categories."""

from __future__ import annotations

from fastapi import APIRouter

from app.categories.adapters.inbound.http.schemas import CategoryResponse
from app.categories.wiring import ListCategoriesDep

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=list[CategoryResponse])
def list_categories(use_case: ListCategoriesDep) -> list[CategoryResponse]:
    return [CategoryResponse.from_entity(category) for category in use_case()]
