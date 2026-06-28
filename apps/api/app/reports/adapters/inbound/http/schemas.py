from __future__ import annotations

from pydantic import BaseModel

from app.reports.domain.entities import CategoryBreakdown, MonthlyReport, SourceBreakdown


class CategoryBreakdownResponse(BaseModel):
    category_id: int
    category_name: str
    total_cents: int

    @classmethod
    def from_entity(cls, breakdown: CategoryBreakdown) -> CategoryBreakdownResponse:
        return cls(
            category_id=breakdown.category_id,
            category_name=breakdown.category_name,
            total_cents=breakdown.total_cents,
        )


class SourceBreakdownResponse(BaseModel):
    source_id: int
    source_name: str
    total_cents: int

    @classmethod
    def from_entity(cls, breakdown: SourceBreakdown) -> SourceBreakdownResponse:
        return cls(
            source_id=breakdown.source_id,
            source_name=breakdown.source_name,
            total_cents=breakdown.total_cents,
        )


class MonthlyReportResponse(BaseModel):
    year: int
    month: int
    expense_total_cents: int
    previous_month_expense_total_cents: int
    income_total_cents: int
    previous_month_income_total_cents: int
    net_cents: int
    by_category: list[CategoryBreakdownResponse]
    by_source: list[SourceBreakdownResponse]

    @classmethod
    def from_entity(cls, report: MonthlyReport) -> MonthlyReportResponse:
        return cls(
            year=report.year,
            month=report.month,
            expense_total_cents=report.expense_total_cents,
            previous_month_expense_total_cents=report.previous_month_expense_total_cents,
            income_total_cents=report.income_total_cents,
            previous_month_income_total_cents=report.previous_month_income_total_cents,
            net_cents=report.net_cents,
            by_category=[
                CategoryBreakdownResponse.from_entity(item) for item in report.by_category
            ],
            by_source=[SourceBreakdownResponse.from_entity(item) for item in report.by_source],
        )
