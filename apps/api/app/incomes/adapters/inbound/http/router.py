from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Query, status

from app.incomes.adapters.inbound.http.schemas import (
    CreateIncomeRequest,
    IncomePageResponse,
    IncomeResponse,
    UpdateIncomeRequest,
)
from app.incomes.application.create_income import CreateIncomeCommand
from app.incomes.application.list_incomes import ListIncomesForMonthQuery
from app.incomes.application.update_income import UpdateIncomeCommand
from app.incomes.wiring import (
    CreateIncomeDep,
    DeleteIncomeDep,
    ListIncomesDep,
    UpdateIncomeDep,
)

router = APIRouter(prefix="/incomes", tags=["incomes"])

MonthParam = Annotated[str, Query(pattern=r"^\d{4}-\d{2}$", description="Month as YYYY-MM")]
LimitParam = Annotated[int, Query(ge=1, le=200, description="Page size")]
OffsetParam = Annotated[int, Query(ge=0, description="Rows to skip")]


@router.post("", response_model=IncomeResponse, status_code=status.HTTP_201_CREATED)
def create_income(body: CreateIncomeRequest, use_case: CreateIncomeDep) -> IncomeResponse:
    income = use_case(
        CreateIncomeCommand(
            amount_cents=body.amount_cents,
            currency=body.currency,
            source_id=body.source_id,
            occurred_on=body.occurred_on,
            note=body.note,
        )
    )
    return IncomeResponse.from_entity(income)


@router.get("", response_model=IncomePageResponse)
def list_incomes(
    use_case: ListIncomesDep, month: MonthParam, limit: LimitParam = 50, offset: OffsetParam = 0
) -> IncomePageResponse:
    year, month_number = (int(part) for part in month.split("-"))
    page = use_case(
        ListIncomesForMonthQuery(year=year, month=month_number, limit=limit, offset=offset)
    )
    return IncomePageResponse(
        items=[IncomeResponse.from_entity(income) for income in page.items],
        total=page.total,
    )


@router.patch("/{income_id}", response_model=IncomeResponse)
def update_income(
    income_id: int, body: UpdateIncomeRequest, use_case: UpdateIncomeDep
) -> IncomeResponse:
    changes = body.model_dump(exclude_unset=True)
    command = UpdateIncomeCommand(income_id=income_id, fields=frozenset(changes), **changes)
    return IncomeResponse.from_entity(use_case(command))


@router.delete("/{income_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_income(income_id: int, use_case: DeleteIncomeDep) -> None:
    use_case(income_id)
