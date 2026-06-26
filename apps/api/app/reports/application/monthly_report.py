"""Use case: build the "where did the month go?" report."""

from __future__ import annotations

from dataclasses import dataclass

from app.reports.domain.entities import MonthlyReport
from app.reports.ports.reader import MonthlyExpenseReader
from app.shared.domain.errors import DomainValidationError


@dataclass(frozen=True, slots=True)
class MonthlyReportQuery:
    year: int
    month: int


class BuildMonthlyReport:
    def __init__(self, reader: MonthlyExpenseReader) -> None:
        self._reader = reader

    def __call__(self, query: MonthlyReportQuery) -> MonthlyReport:
        if not 1 <= query.month <= 12:
            raise DomainValidationError("month must be between 1 and 12")

        breakdown = self._reader.breakdown_for_month(query.year, query.month)
        total = sum(item.total_cents for item in breakdown)

        previous_year, previous_month = _previous_month(query.year, query.month)
        previous_total = self._reader.total_for_month(previous_year, previous_month)

        return MonthlyReport(
            year=query.year,
            month=query.month,
            total_cents=total,
            previous_month_total_cents=previous_total,
            by_category=breakdown,
        )


def _previous_month(year: int, month: int) -> tuple[int, int]:
    return (year - 1, 12) if month == 1 else (year, month - 1)
