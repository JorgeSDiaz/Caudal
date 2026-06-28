from __future__ import annotations

from app.incomes.domain.errors import IncomeNotFoundError
from app.incomes.ports.repository import IncomeRepository


class DeleteIncome:
    def __init__(self, repository: IncomeRepository) -> None:
        self._repository = repository

    def __call__(self, income_id: int) -> None:
        if not self._repository.soft_delete(income_id):
            raise IncomeNotFoundError(income_id)
