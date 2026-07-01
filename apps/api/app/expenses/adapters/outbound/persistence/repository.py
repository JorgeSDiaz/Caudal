from __future__ import annotations

from sqlalchemy import func
from sqlmodel import Session, select

from app.expenses.adapters.outbound.persistence.models import ExpenseModel, utcnow
from app.expenses.domain.entities import DraftExpense, Expense
from app.expenses.domain.errors import ExpenseNotFoundError
from app.shared.domain.financial_period import financial_month_bounds
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

    def add_many(self, drafts: list[DraftExpense]) -> int:
        models = [
            ExpenseModel(
                amount_cents=draft.money.amount_cents,
                currency=draft.money.currency,
                category_id=draft.category_id,
                occurred_on=draft.occurred_on,
                note=draft.note,
            )
            for draft in drafts
        ]
        self._session.add_all(models)
        self._session.commit()
        return len(models)

    def get(self, expense_id: int) -> Expense | None:
        model = self._session.get(ExpenseModel, expense_id)
        if model is None or model.deleted_at is not None:
            return None
        return _to_entity(model)

    def list_all(self) -> list[Expense]:
        statement = (
            select(ExpenseModel)
            .where(ExpenseModel.deleted_at.is_(None))  # type: ignore[union-attr]
            .order_by(ExpenseModel.occurred_on, ExpenseModel.id)  # type: ignore[arg-type]
        )
        return [_to_entity(row) for row in self._session.exec(statement).all()]

    def update(self, expense: Expense) -> Expense:
        model = self._session.get(ExpenseModel, expense.id)
        if model is None or model.deleted_at is not None:
            raise ExpenseNotFoundError(expense.id)
        model.amount_cents = expense.money.amount_cents
        model.currency = expense.money.currency
        model.category_id = expense.category_id
        model.occurred_on = expense.occurred_on
        model.note = expense.note
        model.updated_at = utcnow()
        self._session.add(model)
        self._session.commit()
        self._session.refresh(model)
        return _to_entity(model)

    def soft_delete(self, expense_id: int) -> bool:
        model = self._session.get(ExpenseModel, expense_id)
        if model is None or model.deleted_at is not None:
            return False
        model.deleted_at = utcnow()
        self._session.add(model)
        self._session.commit()
        return True

    def list_for_month(
        self, year: int, month: int, limit: int | None = None, offset: int = 0
    ) -> list[Expense]:
        start, end = financial_month_bounds(year, month)
        statement = (
            select(ExpenseModel)
            .where(
                ExpenseModel.deleted_at.is_(None),  # type: ignore[union-attr]
                ExpenseModel.occurred_on >= start,
                ExpenseModel.occurred_on < end,
            )
            # Most recent first (and stable for same-day entries by id).
            .order_by(ExpenseModel.occurred_on.desc(), ExpenseModel.id.desc())  # type: ignore[union-attr]
            .offset(offset)
            .limit(limit)
        )
        return [_to_entity(row) for row in self._session.exec(statement).all()]

    def count_for_month(self, year: int, month: int) -> int:
        start, end = financial_month_bounds(year, month)
        statement = select(func.count()).where(
            ExpenseModel.deleted_at.is_(None),  # type: ignore[union-attr]
            ExpenseModel.occurred_on >= start,
            ExpenseModel.occurred_on < end,
        )
        return int(self._session.exec(statement).one())


def _to_entity(model: ExpenseModel) -> Expense:
    assert model.id is not None
    return Expense(
        id=model.id,
        money=Money(model.amount_cents, model.currency),
        category_id=model.category_id,
        occurred_on=model.occurred_on,
        note=model.note,
    )
