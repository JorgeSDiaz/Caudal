from __future__ import annotations

from app.expenses.domain.errors import ExpenseNotFoundError
from app.expenses.ports.repository import ExpenseRepository


class DeleteExpense:
    def __init__(self, repository: ExpenseRepository) -> None:
        self._repository = repository

    def __call__(self, expense_id: int) -> None:
        if not self._repository.soft_delete(expense_id):
            raise ExpenseNotFoundError(expense_id)
