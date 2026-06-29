"""Dependency wiring: builds use cases from adapters for the HTTP layer.

Exposes Annotated dependency aliases so routers stay free of Depends() boilerplate.
"""

from __future__ import annotations

from typing import Annotated

from fastapi import Depends
from sqlmodel import Session

from app.categories.adapters.outbound.persistence.repository import SqlCategoryRepository
from app.expenses.adapters.outbound.category_checker import (
    CategoryRepositoryChecker as ExpenseCategoryChecker,
)
from app.expenses.adapters.outbound.persistence.repository import SqlExpenseRepository
from app.expenses.application.create_expense import CreateExpense
from app.incomes.adapters.outbound.persistence.repository import SqlIncomeRepository
from app.incomes.adapters.outbound.source_checker import CategorySourceChecker
from app.incomes.application.create_income import CreateIncome
from app.recurrences.adapters.outbound.category_checker import CategoryRepositoryChecker
from app.recurrences.adapters.outbound.movement_writer import UseCaseMovementWriter
from app.recurrences.adapters.outbound.persistence.repository import SqlRecurrenceRepository
from app.recurrences.application.create_recurrence import CreateRecurrence
from app.recurrences.application.delete_recurrence import DeleteRecurrence
from app.recurrences.application.list_recurrences import ListRecurrences
from app.recurrences.application.run_due_recurrences import RunDueRecurrences
from app.recurrences.application.update_recurrence import UpdateRecurrence
from app.recurrences.ports.category_checker import CategoryChecker
from app.recurrences.ports.movement_writer import MovementWriter
from app.recurrences.ports.repository import RecurrenceRepository
from app.shared.database import get_session

SessionDep = Annotated[Session, Depends(get_session)]


def provide_repository(session: SessionDep) -> RecurrenceRepository:
    return SqlRecurrenceRepository(session)


def provide_category_checker(session: SessionDep) -> CategoryChecker:
    return CategoryRepositoryChecker(SqlCategoryRepository(session))


def provide_movement_writer(session: SessionDep) -> MovementWriter:
    categories = SqlCategoryRepository(session)
    create_expense = CreateExpense(
        SqlExpenseRepository(session), ExpenseCategoryChecker(categories)
    )
    create_income = CreateIncome(SqlIncomeRepository(session), CategorySourceChecker(categories))
    return UseCaseMovementWriter(create_expense, create_income)


RepositoryDep = Annotated[RecurrenceRepository, Depends(provide_repository)]
CategoryCheckerDep = Annotated[CategoryChecker, Depends(provide_category_checker)]
MovementWriterDep = Annotated[MovementWriter, Depends(provide_movement_writer)]


def provide_create_recurrence(
    repository: RepositoryDep, categories: CategoryCheckerDep
) -> CreateRecurrence:
    return CreateRecurrence(repository, categories)


def provide_update_recurrence(
    repository: RepositoryDep, categories: CategoryCheckerDep
) -> UpdateRecurrence:
    return UpdateRecurrence(repository, categories)


def provide_delete_recurrence(repository: RepositoryDep) -> DeleteRecurrence:
    return DeleteRecurrence(repository)


def provide_list_recurrences(repository: RepositoryDep) -> ListRecurrences:
    return ListRecurrences(repository)


def provide_run_due_recurrences(
    repository: RepositoryDep, writer: MovementWriterDep
) -> RunDueRecurrences:
    return RunDueRecurrences(repository, writer)


CreateRecurrenceDep = Annotated[CreateRecurrence, Depends(provide_create_recurrence)]
UpdateRecurrenceDep = Annotated[UpdateRecurrence, Depends(provide_update_recurrence)]
DeleteRecurrenceDep = Annotated[DeleteRecurrence, Depends(provide_delete_recurrence)]
ListRecurrencesDep = Annotated[ListRecurrences, Depends(provide_list_recurrences)]
RunDueRecurrencesDep = Annotated[RunDueRecurrences, Depends(provide_run_due_recurrences)]
