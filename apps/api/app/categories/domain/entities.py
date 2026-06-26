"""Category domain entity. Pure Python: no framework, no persistence concerns."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class Category:
    id: int
    name: str
    sort_order: int
    is_system: bool
    is_active: bool
    icon: str | None = None
