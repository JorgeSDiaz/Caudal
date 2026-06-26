"""Postgres adapter implementing the ExpenseRepository port (maps model <-> entity)."""

from __future__ import annotations

from datetime import date

from sqlmodel import Session, select

from app.expenses.adapters.outbound.persistence.models import ExpenseModel
from app.expenses.domain.entities import DraftExpense, Expense
from app.shared.domain.money import Money


class SqlExpenseRepository:
    """Satisfies the ExpenseRepository port (structural typing)."""

    def __init__(self, session: Session) -> None:
        self._session = session

    def add(self, draft: DraftExpense) -> Expense:
        model = ExpenseModel(
            amount_cents=draft.money.amount_cents,
            currency=draft.money.currency,
            category_id=draft.category_id,
            occurred_on=draft.occurred_on,
            note=draft.note,
        )
        self._session.add(model)
        self._session.commit()
        self._session.refresh(model)
        return _to_entity(model)

    def list_for_month(self, year: int, month: int) -> list[Expense]:
        start = date(year, month, 1)
        end = date(year + 1, 1, 1) if month == 12 else date(year, month + 1, 1)
        statement = (
            select(ExpenseModel)
            .where(
                ExpenseModel.deleted_at.is_(None),  # type: ignore[union-attr]
                ExpenseModel.occurred_on >= start,
                ExpenseModel.occurred_on < end,
            )
            .order_by(ExpenseModel.occurred_on)  # type: ignore[arg-type]
        )
        return [_to_entity(row) for row in self._session.exec(statement).all()]


def _to_entity(model: ExpenseModel) -> Expense:
    assert model.id is not None
    return Expense(
        id=model.id,
        money=Money(model.amount_cents, model.currency),
        category_id=model.category_id,
        occurred_on=model.occurred_on,
        note=model.note,
    )
