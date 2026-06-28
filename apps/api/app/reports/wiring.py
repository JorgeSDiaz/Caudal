from __future__ import annotations

from typing import Annotated

from fastapi import Depends
from sqlmodel import Session

from app.reports.adapters.outbound.persistence.reader import (
    SqlMonthlyExpenseReader,
    SqlMonthlyIncomeReader,
)
from app.reports.application.monthly_report import BuildMonthlyReport
from app.reports.ports.reader import MonthlyExpenseReader, MonthlyIncomeReader
from app.shared.database import get_session

SessionDep = Annotated[Session, Depends(get_session)]


def provide_expense_reader(session: SessionDep) -> MonthlyExpenseReader:
    return SqlMonthlyExpenseReader(session)


def provide_income_reader(session: SessionDep) -> MonthlyIncomeReader:
    return SqlMonthlyIncomeReader(session)


ExpenseReaderDep = Annotated[MonthlyExpenseReader, Depends(provide_expense_reader)]
IncomeReaderDep = Annotated[MonthlyIncomeReader, Depends(provide_income_reader)]


def provide_monthly_report(
    expenses: ExpenseReaderDep, incomes: IncomeReaderDep
) -> BuildMonthlyReport:
    return BuildMonthlyReport(expenses, incomes)


MonthlyReportDep = Annotated[BuildMonthlyReport, Depends(provide_monthly_report)]
