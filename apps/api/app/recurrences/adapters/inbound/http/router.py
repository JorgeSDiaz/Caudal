from __future__ import annotations

from datetime import date
from typing import Annotated

from fastapi import APIRouter, Query, status

from app.recurrences.adapters.inbound.http.schemas import (
    CreateRecurrenceRequest,
    RecurrenceResponse,
    UpdateRecurrenceRequest,
)
from app.recurrences.application.create_recurrence import CreateRecurrenceCommand
from app.recurrences.application.update_recurrence import UpdateRecurrenceCommand
from app.recurrences.domain.entities import RecurrenceKind
from app.recurrences.wiring import (
    CreateRecurrenceDep,
    DeleteRecurrenceDep,
    ListRecurrencesDep,
    RunDueRecurrencesDep,
    UpdateRecurrenceDep,
)

router = APIRouter(prefix="/recurrences", tags=["recurrences"])

KindParam = Annotated[RecurrenceKind | None, Query(description="Filter by kind")]


@router.post("", response_model=RecurrenceResponse, status_code=status.HTTP_201_CREATED)
def create_recurrence(
    body: CreateRecurrenceRequest, use_case: CreateRecurrenceDep
) -> RecurrenceResponse:
    recurrence = use_case(
        CreateRecurrenceCommand(
            kind=body.kind,
            amount_cents=body.amount_cents,
            currency=body.currency,
            category_id=body.category_id,
            frequency=body.frequency,
            day_of_month=body.day_of_month,
            second_day_of_month=body.second_day_of_month,
            start_date=body.start_date,
            end_date=body.end_date,
            note=body.note,
        )
    )
    return RecurrenceResponse.from_entity(recurrence, date.today())


@router.get("", response_model=list[RecurrenceResponse])
def list_recurrences(
    use_case: ListRecurrencesDep, kind: KindParam = None
) -> list[RecurrenceResponse]:
    today = date.today()
    return [RecurrenceResponse.from_entity(item, today) for item in use_case(kind)]


@router.patch("/{recurrence_id}", response_model=RecurrenceResponse)
def update_recurrence(
    recurrence_id: int, body: UpdateRecurrenceRequest, use_case: UpdateRecurrenceDep
) -> RecurrenceResponse:
    changes = body.model_dump(exclude_unset=True)
    command = UpdateRecurrenceCommand(
        recurrence_id=recurrence_id, fields=frozenset(changes), **changes
    )
    return RecurrenceResponse.from_entity(use_case(command), date.today())


@router.delete("/{recurrence_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_recurrence(recurrence_id: int, use_case: DeleteRecurrenceDep) -> None:
    use_case(recurrence_id)


@router.post("/run")
def run_recurrences(use_case: RunDueRecurrencesDep) -> dict[str, int]:
    return {"generated": use_case(date.today())}
