import pytest

from app.reports.application.monthly_report import BuildMonthlyReport, MonthlyReportQuery
from app.reports.domain.entities import CategoryBreakdown, SourceBreakdown
from tests.fakes import StubMonthlyExpenseReader, StubMonthlyIncomeReader


def _build(
    expenses: StubMonthlyExpenseReader | None = None,
    incomes: StubMonthlyIncomeReader | None = None,
) -> BuildMonthlyReport:
    return BuildMonthlyReport(
        expenses or StubMonthlyExpenseReader(),
        incomes or StubMonthlyIncomeReader(),
    )


def test_expense_total_is_the_sum_of_the_category_breakdown() -> None:
    expenses = StubMonthlyExpenseReader(
        breakdowns={
            (2026, 6): [
                CategoryBreakdown(category_id=1, category_name="Food", total_cents=3000),
                CategoryBreakdown(category_id=2, category_name="Transport", total_cents=1500),
            ]
        }
    )

    report = _build(expenses=expenses)(MonthlyReportQuery(2026, 6))

    assert report.expense_total_cents == 4500
    assert len(report.by_category) == 2


def test_income_total_is_the_sum_of_the_source_breakdown() -> None:
    incomes = StubMonthlyIncomeReader(
        breakdowns={
            (2026, 6): [
                SourceBreakdown(source_id=1, source_name="Sueldo", total_cents=8000),
                SourceBreakdown(source_id=2, source_name="Freelance", total_cents=2000),
            ]
        }
    )

    report = _build(incomes=incomes)(MonthlyReportQuery(2026, 6))

    assert report.income_total_cents == 10000
    assert len(report.by_source) == 2


def test_net_is_income_minus_expense() -> None:
    expenses = StubMonthlyExpenseReader(
        breakdowns={(2026, 6): [CategoryBreakdown(1, "Food", 3000)]}
    )
    incomes = StubMonthlyIncomeReader(breakdowns={(2026, 6): [SourceBreakdown(1, "Sueldo", 8000)]})

    report = _build(expenses=expenses, incomes=incomes)(MonthlyReportQuery(2026, 6))

    assert report.net_cents == 5000


def test_previous_month_totals_roll_over_january_to_december() -> None:
    expenses = StubMonthlyExpenseReader(totals={(2025, 12): 9900})
    incomes = StubMonthlyIncomeReader(totals={(2025, 12): 12000})

    report = _build(expenses=expenses, incomes=incomes)(MonthlyReportQuery(2026, 1))

    assert report.previous_month_expense_total_cents == 9900
    assert report.previous_month_income_total_cents == 12000


def test_report_rejects_invalid_month() -> None:
    with pytest.raises(ValueError):
        _build()(MonthlyReportQuery(2026, 13))
