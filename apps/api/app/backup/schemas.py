"""Cross-context backup payload: one document carrying expenses and incomes.

Backup spans more than one bounded context, so it lives at the application level
(composition) rather than inside either context.
"""

from __future__ import annotations

from pydantic import BaseModel, Field

from app.expenses.adapters.inbound.http.schemas import CreateExpenseRequest
from app.expenses.domain.entities import Expense
from app.incomes.adapters.inbound.http.schemas import CreateIncomeRequest
from app.incomes.domain.entities import Income


class BackupDocument(BaseModel):
    """Symmetric backup payload: GET /backup returns it, POST /backup accepts it.

    `incomes` defaults to empty so backups taken before incomes existed still import.
    """

    expenses: list[CreateExpenseRequest]
    incomes: list[CreateIncomeRequest] = Field(default_factory=list)

    @classmethod
    def from_entities(cls, expenses: list[Expense], incomes: list[Income]) -> BackupDocument:
        return cls(
            expenses=[
                CreateExpenseRequest(
                    amount_cents=expense.money.amount_cents,
                    currency=expense.money.currency,
                    category_id=expense.category_id,
                    occurred_on=expense.occurred_on,
                    note=expense.note,
                )
                for expense in expenses
            ],
            incomes=[
                CreateIncomeRequest(
                    amount_cents=income.money.amount_cents,
                    currency=income.money.currency,
                    source_id=income.source_id,
                    occurred_on=income.occurred_on,
                    note=income.note,
                )
                for income in incomes
            ],
        )
