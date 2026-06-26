"""Monthly report read model. Pure Python value objects."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class CategoryBreakdown:
    category_id: int
    category_name: str
    total_cents: int


@dataclass(frozen=True, slots=True)
class MonthlyReport:
    year: int
    month: int
    total_cents: int
    previous_month_total_cents: int
    by_category: list[CategoryBreakdown]
