"""Outbound port: the contract the application needs from any income store.

Defined as a typing.Protocol so any adapter that has these methods satisfies it
structurally (checked by the type checker) — no inheritance required.
"""

from __future__ import annotations

from typing import Protocol

from app.incomes.domain.entities import DraftIncome, Income


class IncomeRepository(Protocol):
    def add(self, draft: DraftIncome) -> Income: ...

    def add_many(self, drafts: list[DraftIncome]) -> int: ...

    def get(self, income_id: int) -> Income | None: ...

    def list_all(self) -> list[Income]: ...

    def update(self, income: Income) -> Income: ...

    def soft_delete(self, income_id: int) -> bool: ...

    def list_for_month(self, year: int, month: int) -> list[Income]: ...
