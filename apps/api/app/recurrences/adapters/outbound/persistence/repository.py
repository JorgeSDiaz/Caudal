from __future__ import annotations

from datetime import date
from typing import cast

from sqlmodel import Session, select

from app.recurrences.adapters.outbound.persistence.models import RecurrenceModel, utcnow
from app.recurrences.domain.entities import (
    DraftRecurrence,
    Frequency,
    Recurrence,
    RecurrenceKind,
)
from app.recurrences.domain.errors import RecurrenceNotFoundError
from app.shared.domain.money import Money


class SqlRecurrenceRepository:
    """Satisfies the RecurrenceRepository port (structural typing)."""

    def __init__(self, session: Session) -> None:
        self._session = session

    def add(self, draft: DraftRecurrence) -> Recurrence:
        model = RecurrenceModel(
            kind=draft.kind,
            amount_cents=draft.money.amount_cents,
            currency=draft.money.currency,
            category_id=draft.category_id,
            frequency=draft.frequency,
            day_of_month=draft.day_of_month,
            second_day_of_month=draft.second_day_of_month,
            start_date=draft.start_date,
            end_date=draft.end_date,
            note=draft.note,
            is_active=draft.is_active,
        )
        self._session.add(model)
        self._session.commit()
        self._session.refresh(model)
        return _to_entity(model)

    def get(self, recurrence_id: int) -> Recurrence | None:
        model = self._session.get(RecurrenceModel, recurrence_id)
        if model is None or model.deleted_at is not None:
            return None
        return _to_entity(model)

    def list_all(self) -> list[Recurrence]:
        statement = select(RecurrenceModel).where(RecurrenceModel.deleted_at.is_(None))  # type: ignore[union-attr]
        return [_to_entity(row) for row in self._session.exec(statement).all()]

    def list_active(self) -> list[Recurrence]:
        statement = select(RecurrenceModel).where(
            RecurrenceModel.deleted_at.is_(None),  # type: ignore[union-attr]
            RecurrenceModel.is_active.is_(True),  # type: ignore[union-attr]
        )
        return [_to_entity(row) for row in self._session.exec(statement).all()]

    def update(self, recurrence: Recurrence) -> Recurrence:
        model = self._session.get(RecurrenceModel, recurrence.id)
        if model is None or model.deleted_at is not None:
            raise RecurrenceNotFoundError(recurrence.id)
        model.amount_cents = recurrence.money.amount_cents
        model.currency = recurrence.money.currency
        model.category_id = recurrence.category_id
        model.frequency = recurrence.frequency
        model.day_of_month = recurrence.day_of_month
        model.second_day_of_month = recurrence.second_day_of_month
        model.start_date = recurrence.start_date
        model.end_date = recurrence.end_date
        model.note = recurrence.note
        model.is_active = recurrence.is_active
        model.updated_at = utcnow()
        self._session.add(model)
        self._session.commit()
        self._session.refresh(model)
        return _to_entity(model)

    def soft_delete(self, recurrence_id: int) -> bool:
        model = self._session.get(RecurrenceModel, recurrence_id)
        if model is None or model.deleted_at is not None:
            return False
        model.deleted_at = utcnow()
        self._session.add(model)
        self._session.commit()
        return True

    def mark_generated(self, recurrence_id: int, last_generated_on: date) -> None:
        model = self._session.get(RecurrenceModel, recurrence_id)
        if model is None:
            return
        model.last_generated_on = last_generated_on
        model.updated_at = utcnow()
        self._session.add(model)
        self._session.commit()


def _to_entity(model: RecurrenceModel) -> Recurrence:
    assert model.id is not None
    return Recurrence(
        id=model.id,
        kind=cast(RecurrenceKind, model.kind),
        money=Money(model.amount_cents, model.currency),
        category_id=model.category_id,
        frequency=cast(Frequency, model.frequency),
        day_of_month=model.day_of_month,
        second_day_of_month=model.second_day_of_month,
        start_date=model.start_date,
        end_date=model.end_date,
        note=model.note,
        is_active=model.is_active,
        last_generated_on=model.last_generated_on,
    )
