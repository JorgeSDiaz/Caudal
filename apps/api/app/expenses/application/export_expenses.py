from __future__ import annotations

from app.expenses.domain.entities import Expense
from app.expenses.ports.repository import ExpenseRepository


class ExportExpenses:
    def __init__(self, repository: ExpenseRepository) -> None:
        self._repository = repository

    def __call__(self) -> list[Expense]:
        return self._repository.list_all()
