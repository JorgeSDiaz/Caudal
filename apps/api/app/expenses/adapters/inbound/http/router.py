from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Query, status

from app.expenses.adapters.inbound.http.schemas import (
    CreateExpenseRequest,
    ExpensePageResponse,
    ExpenseResponse,
    UpdateExpenseRequest,
)
from app.expenses.application.create_expense import CreateExpenseCommand
from app.expenses.application.list_expenses import ListExpensesForMonthQuery
from app.expenses.application.update_expense import UpdateExpenseCommand
from app.expenses.wiring import (
    CreateExpenseDep,
    DeleteExpenseDep,
    ListExpensesDep,
    UpdateExpenseDep,
)

router = APIRouter(prefix="/expenses", tags=["expenses"])

MonthParam = Annotated[str, Query(pattern=r"^\d{4}-\d{2}$", description="Month as YYYY-MM")]
LimitParam = Annotated[int, Query(ge=1, le=200, description="Page size")]
OffsetParam = Annotated[int, Query(ge=0, description="Rows to skip")]


@router.post("", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_expense(body: CreateExpenseRequest, use_case: CreateExpenseDep) -> ExpenseResponse:
    expense = use_case(
        CreateExpenseCommand(
            amount_cents=body.amount_cents,
            currency=body.currency,
            category_id=body.category_id,
            occurred_on=body.occurred_on,
            note=body.note,
        )
    )
    return ExpenseResponse.from_entity(expense)


@router.get("", response_model=ExpensePageResponse)
def list_expenses(
    use_case: ListExpensesDep, month: MonthParam, limit: LimitParam = 50, offset: OffsetParam = 0
) -> ExpensePageResponse:
    year, month_number = (int(part) for part in month.split("-"))
    page = use_case(
        ListExpensesForMonthQuery(year=year, month=month_number, limit=limit, offset=offset)
    )
    return ExpensePageResponse(
        items=[ExpenseResponse.from_entity(expense) for expense in page.items],
        total=page.total,
    )


@router.patch("/{expense_id}", response_model=ExpenseResponse)
def update_expense(
    expense_id: int, body: UpdateExpenseRequest, use_case: UpdateExpenseDep
) -> ExpenseResponse:
    changes = body.model_dump(exclude_unset=True)
    command = UpdateExpenseCommand(expense_id=expense_id, fields=frozenset(changes), **changes)
    return ExpenseResponse.from_entity(use_case(command))


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(expense_id: int, use_case: DeleteExpenseDep) -> None:
    use_case(expense_id)
