from __future__ import annotations

from datetime import date

from sqlalchemy import func
from sqlmodel import Session, select

from app.categories.adapters.outbound.persistence.models import CategoryModel
from app.expenses.adapters.outbound.persistence.models import ExpenseModel
from app.incomes.adapters.outbound.persistence.models import IncomeModel
from app.reports.domain.entities import CategoryBreakdown, SourceBreakdown


class SqlMonthlyExpenseReader:
    """Satisfies the MonthlyExpenseReader port (structural typing)."""

    def __init__(self, session: Session) -> None:
        self._session = session

    def total_for_month(self, year: int, month: int) -> int:
        start, end = _month_bounds(year, month)
        statement = select(func.coalesce(func.sum(ExpenseModel.amount_cents), 0)).where(
            ExpenseModel.deleted_at.is_(None),  # type: ignore[union-attr]
            ExpenseModel.occurred_on >= start,
            ExpenseModel.occurred_on < end,
        )
        return int(self._session.exec(statement).one())

    def breakdown_for_month(self, year: int, month: int) -> list[CategoryBreakdown]:
        start, end = _month_bounds(year, month)
        total = func.coalesce(func.sum(ExpenseModel.amount_cents), 0)
        statement = (
            select(CategoryModel.id, CategoryModel.name, total)
            .join(ExpenseModel, ExpenseModel.category_id == CategoryModel.id)  # type: ignore[arg-type]
            .where(
                ExpenseModel.deleted_at.is_(None),  # type: ignore[union-attr]
                ExpenseModel.occurred_on >= start,
                ExpenseModel.occurred_on < end,
            )
            .group_by(CategoryModel.id, CategoryModel.name)
            .order_by(total.desc())
        )
        rows = self._session.exec(statement).all()
        return [
            CategoryBreakdown(category_id=row[0], category_name=row[1], total_cents=int(row[2]))
            for row in rows
        ]


class SqlMonthlyIncomeReader:
    """Satisfies the MonthlyIncomeReader port (structural typing)."""

    def __init__(self, session: Session) -> None:
        self._session = session

    def total_for_month(self, year: int, month: int) -> int:
        start, end = _month_bounds(year, month)
        statement = select(func.coalesce(func.sum(IncomeModel.amount_cents), 0)).where(
            IncomeModel.deleted_at.is_(None),  # type: ignore[union-attr]
            IncomeModel.occurred_on >= start,
            IncomeModel.occurred_on < end,
        )
        return int(self._session.exec(statement).one())

    def breakdown_for_month(self, year: int, month: int) -> list[SourceBreakdown]:
        start, end = _month_bounds(year, month)
        total = func.coalesce(func.sum(IncomeModel.amount_cents), 0)
        statement = (
            select(CategoryModel.id, CategoryModel.name, total)
            .join(IncomeModel, IncomeModel.source_id == CategoryModel.id)  # type: ignore[arg-type]
            .where(
                IncomeModel.deleted_at.is_(None),  # type: ignore[union-attr]
                IncomeModel.occurred_on >= start,
                IncomeModel.occurred_on < end,
            )
            .group_by(CategoryModel.id, CategoryModel.name)
            .order_by(total.desc())
        )
        rows = self._session.exec(statement).all()
        return [
            SourceBreakdown(source_id=row[0], source_name=row[1], total_cents=int(row[2]))
            for row in rows
        ]


def _month_bounds(year: int, month: int) -> tuple[date, date]:
    start = date(year, month, 1)
    end = date(year + 1, 1, 1) if month == 12 else date(year, month + 1, 1)
    return start, end
