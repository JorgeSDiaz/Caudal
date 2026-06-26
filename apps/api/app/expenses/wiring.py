"""Dependency wiring: builds use cases from adapters for the HTTP layer.

Exposes Annotated dependency aliases so routers stay free of Depends() boilerplate.
"""

from __future__ import annotations

from typing import Annotated

from fastapi import Depends
from sqlmodel import Session

from app.expenses.adapters.outbound.persistence.repository import SqlExpenseRepository
from app.expenses.application.create_expense import CreateExpense
from app.expenses.application.list_expenses import ListExpensesForMonth
from app.expenses.ports.repository import ExpenseRepository
from app.shared.database import get_session

SessionDep = Annotated[Session, Depends(get_session)]


def provide_repository(session: SessionDep) -> ExpenseRepository:
    return SqlExpenseRepository(session)


RepositoryDep = Annotated[ExpenseRepository, Depends(provide_repository)]


def provide_create_expense(repository: RepositoryDep) -> CreateExpense:
    return CreateExpense(repository)


def provide_list_expenses(repository: RepositoryDep) -> ListExpensesForMonth:
    return ListExpensesForMonth(repository)


CreateExpenseDep = Annotated[CreateExpense, Depends(provide_create_expense)]
ListExpensesDep = Annotated[ListExpensesForMonth, Depends(provide_list_expenses)]
