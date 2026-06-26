"""Outbound port: read-only aggregation the reporting use cases need."""

from __future__ import annotations

from typing import Protocol

from app.reports.domain.entities import CategoryBreakdown


class MonthlyExpenseReader(Protocol):
    def total_for_month(self, year: int, month: int) -> int: ...

    def breakdown_for_month(self, year: int, month: int) -> list[CategoryBreakdown]: ...
