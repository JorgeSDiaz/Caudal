"""HTTP DTOs for the incomes endpoints (the boundary; validated by Pydantic)."""

from __future__ import annotations

from datetime import date

from pydantic import BaseModel, Field

from app.incomes.domain.entities import Income


class CreateIncomeRequest(BaseModel):
    amount_cents: int = Field(gt=0)
    currency: str = Field(min_length=3, max_length=3)
    source_id: int = Field(gt=0)
    occurred_on: date
    note: str | None = None


class UpdateIncomeRequest(BaseModel):
    """All fields optional; only the ones provided by the client are changed."""

    amount_cents: int | None = Field(default=None, gt=0)
    currency: str | None = Field(default=None, min_length=3, max_length=3)
    source_id: int | None = Field(default=None, gt=0)
    occurred_on: date | None = None
    note: str | None = None


class IncomeResponse(BaseModel):
    id: int
    amount_cents: int
    currency: str
    source_id: int
    occurred_on: date
    note: str | None

    @classmethod
    def from_entity(cls, income: Income) -> IncomeResponse:
        return cls(
            id=income.id,
            amount_cents=income.money.amount_cents,
            currency=income.money.currency,
            source_id=income.source_id,
            occurred_on=income.occurred_on,
            note=income.note,
        )
