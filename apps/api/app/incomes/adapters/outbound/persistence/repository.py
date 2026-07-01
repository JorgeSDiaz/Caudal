from __future__ import annotations

from sqlalchemy import func
from sqlmodel import Session, select

from app.incomes.adapters.outbound.persistence.models import IncomeModel, utcnow
from app.incomes.domain.entities import DraftIncome, Income
from app.incomes.domain.errors import IncomeNotFoundError
from app.shared.domain.financial_period import financial_month_bounds
from app.shared.domain.money import Money


class SqlIncomeRepository:
    """Satisfies the IncomeRepository port (structural typing)."""

    def __init__(self, session: Session) -> None:
        self._session = session

    def add(self, draft: DraftIncome) -> Income:
        model = IncomeModel(
            amount_cents=draft.money.amount_cents,
            currency=draft.money.currency,
            source_id=draft.source_id,
            occurred_on=draft.occurred_on,
            note=draft.note,
        )
        self._session.add(model)
        self._session.commit()
        self._session.refresh(model)
        return _to_entity(model)

    def add_many(self, drafts: list[DraftIncome]) -> int:
        models = [
            IncomeModel(
                amount_cents=draft.money.amount_cents,
                currency=draft.money.currency,
                source_id=draft.source_id,
                occurred_on=draft.occurred_on,
                note=draft.note,
            )
            for draft in drafts
        ]
        self._session.add_all(models)
        self._session.commit()
        return len(models)

    def get(self, income_id: int) -> Income | None:
        model = self._session.get(IncomeModel, income_id)
        if model is None or model.deleted_at is not None:
            return None
        return _to_entity(model)

    def list_all(self) -> list[Income]:
        statement = (
            select(IncomeModel)
            .where(IncomeModel.deleted_at.is_(None))  # type: ignore[union-attr]
            .order_by(IncomeModel.occurred_on, IncomeModel.id)  # type: ignore[arg-type]
        )
        return [_to_entity(row) for row in self._session.exec(statement).all()]

    def update(self, income: Income) -> Income:
        model = self._session.get(IncomeModel, income.id)
        if model is None or model.deleted_at is not None:
            raise IncomeNotFoundError(income.id)
        model.amount_cents = income.money.amount_cents
        model.currency = income.money.currency
        model.source_id = income.source_id
        model.occurred_on = income.occurred_on
        model.note = income.note
        model.updated_at = utcnow()
        self._session.add(model)
        self._session.commit()
        self._session.refresh(model)
        return _to_entity(model)

    def soft_delete(self, income_id: int) -> bool:
        model = self._session.get(IncomeModel, income_id)
        if model is None or model.deleted_at is not None:
            return False
        model.deleted_at = utcnow()
        self._session.add(model)
        self._session.commit()
        return True

    def list_for_month(
        self, year: int, month: int, limit: int | None = None, offset: int = 0
    ) -> list[Income]:
        start, end = financial_month_bounds(year, month)
        statement = (
            select(IncomeModel)
            .where(
                IncomeModel.deleted_at.is_(None),  # type: ignore[union-attr]
                IncomeModel.occurred_on >= start,
                IncomeModel.occurred_on < end,
            )
            # Most recent first (and stable for same-day entries by id).
            .order_by(IncomeModel.occurred_on.desc(), IncomeModel.id.desc())  # type: ignore[union-attr]
            .offset(offset)
            .limit(limit)
        )
        return [_to_entity(row) for row in self._session.exec(statement).all()]

    def count_for_month(self, year: int, month: int) -> int:
        start, end = financial_month_bounds(year, month)
        statement = select(func.count()).where(
            IncomeModel.deleted_at.is_(None),  # type: ignore[union-attr]
            IncomeModel.occurred_on >= start,
            IncomeModel.occurred_on < end,
        )
        return int(self._session.exec(statement).one())


def _to_entity(model: IncomeModel) -> Income:
    assert model.id is not None
    return Income(
        id=model.id,
        money=Money(model.amount_cents, model.currency),
        source_id=model.source_id,
        occurred_on=model.occurred_on,
        note=model.note,
    )
