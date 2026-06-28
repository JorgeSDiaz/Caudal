from __future__ import annotations

from dataclasses import dataclass

from app.reports.domain.entities import MonthlyReport
from app.reports.ports.reader import MonthlyExpenseReader, MonthlyIncomeReader
from app.shared.domain.errors import DomainValidationError


@dataclass(frozen=True, slots=True)
class MonthlyReportQuery:
    year: int
    month: int


class BuildMonthlyReport:
    def __init__(self, expenses: MonthlyExpenseReader, incomes: MonthlyIncomeReader) -> None:
        self._expenses = expenses
        self._incomes = incomes

    def __call__(self, query: MonthlyReportQuery) -> MonthlyReport:
        if not 1 <= query.month <= 12:
            raise DomainValidationError("month must be between 1 and 12")

        previous_year, previous_month = _previous_month(query.year, query.month)

        by_category = self._expenses.breakdown_for_month(query.year, query.month)
        expense_total = sum(item.total_cents for item in by_category)
        previous_expense_total = self._expenses.total_for_month(previous_year, previous_month)

        by_source = self._incomes.breakdown_for_month(query.year, query.month)
        income_total = sum(item.total_cents for item in by_source)
        previous_income_total = self._incomes.total_for_month(previous_year, previous_month)

        return MonthlyReport(
            year=query.year,
            month=query.month,
            expense_total_cents=expense_total,
            previous_month_expense_total_cents=previous_expense_total,
            income_total_cents=income_total,
            previous_month_income_total_cents=previous_income_total,
            net_cents=income_total - expense_total,
            by_category=by_category,
            by_source=by_source,
        )


def _previous_month(year: int, month: int) -> tuple[int, int]:
    return (year - 1, 12) if month == 1 else (year, month - 1)
