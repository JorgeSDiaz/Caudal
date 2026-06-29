"""Pure scheduling logic: which occurrence dates a recurrence produces."""

from __future__ import annotations

import calendar
from datetime import date

from app.recurrences.domain.entities import Recurrence


def _clamp_day(year: int, month: int, day: int) -> date:
    """Map a nominal day onto a real date, clamping to the month's last day."""
    last = calendar.monthrange(year, month)[1]
    return date(year, month, min(day, last))


def _next_month(year: int, month: int) -> tuple[int, int]:
    return (year + 1, 1) if month == 12 else (year, month + 1)


def due_occurrences(recurrence: Recurrence, today: date) -> list[date]:
    """Occurrences that have come due but were not yet materialized, in order.

    Bounded by start_date, end_date, today and the last_generated_on cursor, so
    calling it repeatedly never produces the same occurrence twice.
    """
    if not recurrence.is_active:
        return []

    occurrences: list[date] = []
    year, month = recurrence.start_date.year, recurrence.start_date.month
    while (year, month) <= (today.year, today.month):
        for day in recurrence.days():
            occurrence = _clamp_day(year, month, day)
            if occurrence < recurrence.start_date or occurrence > today:
                continue
            if recurrence.end_date is not None and occurrence > recurrence.end_date:
                continue
            if (
                recurrence.last_generated_on is not None
                and occurrence <= recurrence.last_generated_on
            ):
                continue
            occurrences.append(occurrence)
        year, month = _next_month(year, month)
    return sorted(occurrences)


def next_occurrence(recurrence: Recurrence, today: date) -> date | None:
    """The next future occurrence strictly after `today`, or None if the recurrence
    has ended or is paused."""
    if not recurrence.is_active:
        return None

    year, month = today.year, today.month
    for _ in range(24):  # look at most two years ahead
        for day in recurrence.days():
            occurrence = _clamp_day(year, month, day)
            if occurrence <= today or occurrence < recurrence.start_date:
                continue
            if recurrence.end_date is not None and occurrence > recurrence.end_date:
                return None
            return occurrence
        year, month = _next_month(year, month)
    return None
