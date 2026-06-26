"""Outbound port: the contract the application needs from any expense store.

Defined as a typing.Protocol so any adapter that has these methods satisfies it
structurally (checked by the type checker) — no inheritance required.
"""

from __future__ import annotations

from typing import Protocol

from app.expenses.domain.entities import DraftExpense, Expense


class ExpenseRepository(Protocol):
    def add(self, draft: DraftExpense) -> Expense: ...

    def add_many(self, drafts: list[DraftExpense]) -> int: ...

    def get(self, expense_id: int) -> Expense | None: ...

    def list_all(self) -> list[Expense]: ...

    def update(self, expense: Expense) -> Expense: ...

    def soft_delete(self, expense_id: int) -> bool: ...

    def list_for_month(self, year: int, month: int) -> list[Expense]: ...
