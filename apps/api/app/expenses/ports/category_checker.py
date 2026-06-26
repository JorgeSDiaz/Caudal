"""Outbound port: what the expenses context needs to know about categories.

Kept as a small, expense-owned contract so this context stays decoupled from the
categories module — an adapter wires the two together at the composition root.
"""

from __future__ import annotations

from typing import Protocol


class CategoryChecker(Protocol):
    def exists(self, category_id: int) -> bool: ...
