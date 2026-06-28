"""Outbound port: what the incomes context needs to know about income sources.

Kept as a small, income-owned contract so this context stays decoupled from the
categories module — an adapter wires the two together at the composition root.
"""

from __future__ import annotations

from typing import Protocol


class SourceChecker(Protocol):
    def exists(self, source_id: int) -> bool: ...
