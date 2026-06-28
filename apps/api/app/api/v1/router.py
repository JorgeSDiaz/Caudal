"""Aggregates all v1 routers under a single APIRouter (mounted at /api/v1)."""

from __future__ import annotations

from fastapi import APIRouter

from app.backup.router import router as backup_router
from app.categories.adapters.inbound.http.router import router as categories_router
from app.expenses.adapters.inbound.http.router import router as expenses_router
from app.incomes.adapters.inbound.http.router import router as incomes_router
from app.reports.adapters.inbound.http.router import router as reports_router

api_router = APIRouter()
api_router.include_router(expenses_router)
api_router.include_router(incomes_router)
api_router.include_router(categories_router)
api_router.include_router(reports_router)
api_router.include_router(backup_router)
