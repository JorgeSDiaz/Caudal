"""Dependency wiring: builds use cases from adapters for the HTTP layer.

Exposes Annotated dependency aliases so routers stay free of Depends() boilerplate.
"""

from __future__ import annotations

from typing import Annotated

from fastapi import Depends
from sqlmodel import Session

from app.categories.adapters.outbound.persistence.repository import SqlCategoryRepository
from app.expenses.adapters.outbound.category_checker import CategoryRepositoryChecker
from app.expenses.adapters.outbound.persistence.repository import SqlExpenseRepository
from app.expenses.application.create_expense import CreateExpense
from app.expenses.application.delete_expense import DeleteExpense
from app.expenses.application.export_expenses import ExportExpenses
from app.expenses.application.import_expenses import ImportExpenses
from app.expenses.application.list_expenses import ListExpensesForMonth
from app.expenses.application.update_expense import UpdateExpense
from app.expenses.ports.category_checker import CategoryChecker
from app.expenses.ports.repository import ExpenseRepository
from app.shared.database import get_session

SessionDep = Annotated[Session, Depends(get_session)]


def provide_repository(session: SessionDep) -> ExpenseRepository:
    return SqlExpenseRepository(session)


def provide_category_checker(session: SessionDep) -> CategoryChecker:
    return CategoryRepositoryChecker(SqlCategoryRepository(session))


RepositoryDep = Annotated[ExpenseRepository, Depends(provide_repository)]
CategoryCheckerDep = Annotated[CategoryChecker, Depends(provide_category_checker)]


def provide_create_expense(
    repository: RepositoryDep, categories: CategoryCheckerDep
) -> CreateExpense:
    return CreateExpense(repository, categories)


def provide_update_expense(
    repository: RepositoryDep, categories: CategoryCheckerDep
) -> UpdateExpense:
    return UpdateExpense(repository, categories)


def provide_delete_expense(repository: RepositoryDep) -> DeleteExpense:
    return DeleteExpense(repository)


def provide_list_expenses(repository: RepositoryDep) -> ListExpensesForMonth:
    return ListExpensesForMonth(repository)


def provide_export_expenses(repository: RepositoryDep) -> ExportExpenses:
    return ExportExpenses(repository)


def provide_import_expenses(
    repository: RepositoryDep, categories: CategoryCheckerDep
) -> ImportExpenses:
    return ImportExpenses(repository, categories)


CreateExpenseDep = Annotated[CreateExpense, Depends(provide_create_expense)]
UpdateExpenseDep = Annotated[UpdateExpense, Depends(provide_update_expense)]
DeleteExpenseDep = Annotated[DeleteExpense, Depends(provide_delete_expense)]
ListExpensesDep = Annotated[ListExpensesForMonth, Depends(provide_list_expenses)]
ExportExpensesDep = Annotated[ExportExpenses, Depends(provide_export_expenses)]
ImportExpensesDep = Annotated[ImportExpenses, Depends(provide_import_expenses)]
