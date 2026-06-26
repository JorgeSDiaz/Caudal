"""Inbound HTTP adapter: maps requests to use cases and entities to responses."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Query

from app.expenses.adapters.inbound.http.schemas import CreateExpenseRequest, ExpenseResponse
from app.expenses.application.create_expense import CreateExpenseCommand
from app.expenses.application.list_expenses import ListExpensesForMonthQuery
from app.expenses.wiring import CreateExpenseDep, ListExpensesDep

router = APIRouter(prefix="/expenses", tags=["expenses"])

MonthParam = Annotated[str, Query(pattern=r"^\d{4}-\d{2}$", description="Month as YYYY-MM")]


@router.post("", response_model=ExpenseResponse, status_code=201)
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


@router.get("", response_model=list[ExpenseResponse])
def list_expenses(use_case: ListExpensesDep, month: MonthParam) -> list[ExpenseResponse]:
    year, month_number = (int(part) for part in month.split("-"))
    expenses = use_case(ListExpensesForMonthQuery(year=year, month=month_number))
    return [ExpenseResponse.from_entity(expense) for expense in expenses]
