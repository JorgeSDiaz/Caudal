from __future__ import annotations

from typing import Annotated

from fastapi import Depends
from sqlmodel import Session

from app.reports.adapters.outbound.persistence.reader import SqlMonthlyExpenseReader
from app.reports.application.monthly_report import BuildMonthlyReport
from app.reports.ports.reader import MonthlyExpenseReader
from app.shared.database import get_session

SessionDep = Annotated[Session, Depends(get_session)]


def provide_reader(session: SessionDep) -> MonthlyExpenseReader:
    return SqlMonthlyExpenseReader(session)


ReaderDep = Annotated[MonthlyExpenseReader, Depends(provide_reader)]


def provide_monthly_report(reader: ReaderDep) -> BuildMonthlyReport:
    return BuildMonthlyReport(reader)


MonthlyReportDep = Annotated[BuildMonthlyReport, Depends(provide_monthly_report)]
