"""Category domain entity. Pure Python: no framework, no persistence concerns."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

# A category groups either money that goes out (expense) or money that comes in
# (income). The same table serves both; this discriminator keeps them apart.
CategoryKind = Literal["expense", "income"]


@dataclass(frozen=True, slots=True)
class Category:
    id: int
    name: str
    sort_order: int
    is_system: bool
    is_active: bool
    kind: CategoryKind = "expense"
    icon: str | None = None
