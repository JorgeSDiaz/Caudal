from __future__ import annotations

from datetime import date

from app.expenses.application.create_expense import CreateExpense, CreateExpenseCommand
from app.incomes.application.create_income import CreateIncome, CreateIncomeCommand
from app.recurrences.domain.entities import RecurrenceKind


class UseCaseMovementWriter:
    """Satisfies the MovementWriter port by delegating to the create use cases.

    Keeps recurrences decoupled from how expenses/incomes are persisted: it speaks
    their application commands, not their repositories.
    """

    def __init__(self, create_expense: CreateExpense, create_income: CreateIncome) -> None:
        self._create_expense = create_expense
        self._create_income = create_income

    def create(
        self,
        kind: RecurrenceKind,
        amount_cents: int,
        currency: str,
        category_id: int,
        occurred_on: date,
        note: str | None,
    ) -> None:
        if kind == "expense":
            self._create_expense(
                CreateExpenseCommand(
                    amount_cents=amount_cents,
                    currency=currency,
                    category_id=category_id,
                    occurred_on=occurred_on,
                    note=note,
                )
            )
        else:
            self._create_income(
                CreateIncomeCommand(
                    amount_cents=amount_cents,
                    currency=currency,
                    source_id=category_id,
                    occurred_on=occurred_on,
                    note=note,
                )
            )
