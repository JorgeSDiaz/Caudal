from __future__ import annotations

from pydantic import BaseModel

from app.reports.domain.entities import CategoryBreakdown, MonthlyReport


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


class MonthlyReportResponse(BaseModel):
    year: int
    month: int
    total_cents: int
    previous_month_total_cents: int
    by_category: list[CategoryBreakdownResponse]

    @classmethod
    def from_entity(cls, report: MonthlyReport) -> MonthlyReportResponse:
        return cls(
            year=report.year,
            month=report.month,
            total_cents=report.total_cents,
            previous_month_total_cents=report.previous_month_total_cents,
            by_category=[
                CategoryBreakdownResponse.from_entity(item) for item in report.by_category
            ],
        )
