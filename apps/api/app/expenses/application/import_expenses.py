from __future__ import annotations

from dataclasses import dataclass

from app.expenses.application.create_expense import CreateExpenseCommand
from app.expenses.domain.entities import DraftExpense
from app.expenses.domain.errors import UnknownCategoryError
from app.expenses.ports.category_checker import CategoryChecker
from app.expenses.ports.repository import ExpenseRepository
from app.shared.domain.money import Money


@dataclass(frozen=True, slots=True)
class ImportExpensesCommand:
    items: tuple[CreateExpenseCommand, ...]


class ImportExpenses:
    def __init__(self, repository: ExpenseRepository, categories: CategoryChecker) -> None:
        self._repository = repository
        self._categories = categories

    def __call__(self, command: ImportExpensesCommand) -> int:
        # Validate everything first, then persist in one transaction: an invalid
        # item aborts the whole import instead of leaving a partial restore.
        drafts: list[DraftExpense] = []
        for item in command.items:
            if not self._categories.exists(item.category_id):
                raise UnknownCategoryError(item.category_id)
            drafts.append(
                DraftExpense(
                    money=Money(item.amount_cents, item.currency),
                    category_id=item.category_id,
                    occurred_on=item.occurred_on,
                    note=item.note,
                )
            )
        return self._repository.add_many(drafts)
