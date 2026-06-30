"""HTTP DTOs for the expenses endpoints (the boundary; validated by Pydantic)."""

from __future__ import annotations

from datetime import date

from pydantic import BaseModel, Field

from app.expenses.domain.entities import Expense


class CreateExpenseRequest(BaseModel):
    amount_cents: int = Field(gt=0)
    currency: str = Field(min_length=3, max_length=3)
    category_id: int = Field(gt=0)
    occurred_on: date
    note: str | None = None


class UpdateExpenseRequest(BaseModel):
    """All fields optional; only the ones provided by the client are changed."""

    amount_cents: int | None = Field(default=None, gt=0)
    currency: str | None = Field(default=None, min_length=3, max_length=3)
    category_id: int | None = Field(default=None, gt=0)
    occurred_on: date | None = None
    note: str | None = None


class ExpenseResponse(BaseModel):
    id: int
    amount_cents: int
    currency: str
    category_id: int
    occurred_on: date
    note: str | None

    @classmethod
    def from_entity(cls, expense: Expense) -> ExpenseResponse:
        return cls(
            id=expense.id,
            amount_cents=expense.money.amount_cents,
            currency=expense.money.currency,
            category_id=expense.category_id,
            occurred_on=expense.occurred_on,
            note=expense.note,
        )


class ExpensePageResponse(BaseModel):
    """A page of expenses plus the full count for the month (for "load more")."""

    items: list[ExpenseResponse]
    total: int
