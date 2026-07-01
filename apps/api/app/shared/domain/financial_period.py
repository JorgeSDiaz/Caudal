from __future__ import annotations

from calendar import monthrange
from datetime import date

PERIOD_BOUNDARY_DAY = 30


def financial_month_bounds(year: int, month: int) -> tuple[date, date]:
    previous_year, previous_month = _previous_month(year, month)
    return _boundary(previous_year, previous_month), _boundary(year, month)


def in_financial_month(value: date, year: int, month: int) -> bool:
    start, end = financial_month_bounds(year, month)
    return start <= value < end


def _boundary(year: int, month: int) -> date:
    return date(year, month, min(PERIOD_BOUNDARY_DAY, monthrange(year, month)[1]))


def _previous_month(year: int, month: int) -> tuple[int, int]:
    return (year - 1, 12) if month == 1 else (year, month - 1)
