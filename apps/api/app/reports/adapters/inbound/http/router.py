from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Query

from app.reports.adapters.inbound.http.schemas import MonthlyReportResponse
from app.reports.application.monthly_report import MonthlyReportQuery
from app.reports.wiring import MonthlyReportDep

router = APIRouter(prefix="/reports", tags=["reports"])

MonthParam = Annotated[str, Query(pattern=r"^\d{4}-\d{2}$", description="Month as YYYY-MM")]


@router.get("/monthly", response_model=MonthlyReportResponse)
def monthly_report(use_case: MonthlyReportDep, month: MonthParam) -> MonthlyReportResponse:
    year, month_number = (int(part) for part in month.split("-"))
    report = use_case(MonthlyReportQuery(year=year, month=month_number))
    return MonthlyReportResponse.from_entity(report)
