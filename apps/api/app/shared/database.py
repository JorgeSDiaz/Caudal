"""Database engine and session management (outbound infrastructure)."""

from __future__ import annotations

from collections.abc import Iterator

from sqlmodel import Session, create_engine

from app.shared.config import get_settings

_engine = create_engine(get_settings().database_url)


def get_session() -> Iterator[Session]:
    with Session(_engine) as session:
        yield session
