import pytest

from app.reports.application.monthly_report import BuildMonthlyReport, MonthlyReportQuery
from app.reports.domain.entities import CategoryBreakdown
from tests.fakes import StubMonthlyExpenseReader


def test_total_is_the_sum_of_the_category_breakdown() -> None:
    reader = StubMonthlyExpenseReader(
        breakdowns={
            (2026, 6): [
                CategoryBreakdown(category_id=1, category_name="Food", total_cents=3000),
                CategoryBreakdown(category_id=2, category_name="Transport", total_cents=1500),
            ]
        }
    )

    report = BuildMonthlyReport(reader)(MonthlyReportQuery(2026, 6))

    assert report.total_cents == 4500
    assert len(report.by_category) == 2


def test_previous_month_total_rolls_over_january_to_december() -> None:
    reader = StubMonthlyExpenseReader(totals={(2025, 12): 9900})

    report = BuildMonthlyReport(reader)(MonthlyReportQuery(2026, 1))

    assert report.previous_month_total_cents == 9900


def test_report_rejects_invalid_month() -> None:
    with pytest.raises(ValueError):
        BuildMonthlyReport(StubMonthlyExpenseReader())(MonthlyReportQuery(2026, 13))
