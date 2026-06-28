"""Dependency wiring: builds use cases from adapters for the HTTP layer.

Exposes Annotated dependency aliases so routers stay free of Depends() boilerplate.
"""

from __future__ import annotations

from typing import Annotated

from fastapi import Depends
from sqlmodel import Session

from app.categories.adapters.outbound.persistence.repository import SqlCategoryRepository
from app.incomes.adapters.outbound.persistence.repository import SqlIncomeRepository
from app.incomes.adapters.outbound.source_checker import CategorySourceChecker
from app.incomes.application.create_income import CreateIncome
from app.incomes.application.delete_income import DeleteIncome
from app.incomes.application.export_incomes import ExportIncomes
from app.incomes.application.import_incomes import ImportIncomes
from app.incomes.application.list_incomes import ListIncomesForMonth
from app.incomes.application.update_income import UpdateIncome
from app.incomes.ports.repository import IncomeRepository
from app.incomes.ports.source_checker import SourceChecker
from app.shared.database import get_session

SessionDep = Annotated[Session, Depends(get_session)]


def provide_repository(session: SessionDep) -> IncomeRepository:
    return SqlIncomeRepository(session)


def provide_source_checker(session: SessionDep) -> SourceChecker:
    return CategorySourceChecker(SqlCategoryRepository(session))


RepositoryDep = Annotated[IncomeRepository, Depends(provide_repository)]
SourceCheckerDep = Annotated[SourceChecker, Depends(provide_source_checker)]


def provide_create_income(repository: RepositoryDep, sources: SourceCheckerDep) -> CreateIncome:
    return CreateIncome(repository, sources)


def provide_update_income(repository: RepositoryDep, sources: SourceCheckerDep) -> UpdateIncome:
    return UpdateIncome(repository, sources)


def provide_delete_income(repository: RepositoryDep) -> DeleteIncome:
    return DeleteIncome(repository)


def provide_list_incomes(repository: RepositoryDep) -> ListIncomesForMonth:
    return ListIncomesForMonth(repository)


def provide_export_incomes(repository: RepositoryDep) -> ExportIncomes:
    return ExportIncomes(repository)


def provide_import_incomes(repository: RepositoryDep, sources: SourceCheckerDep) -> ImportIncomes:
    return ImportIncomes(repository, sources)


CreateIncomeDep = Annotated[CreateIncome, Depends(provide_create_income)]
UpdateIncomeDep = Annotated[UpdateIncome, Depends(provide_update_income)]
DeleteIncomeDep = Annotated[DeleteIncome, Depends(provide_delete_income)]
ListIncomesDep = Annotated[ListIncomesForMonth, Depends(provide_list_incomes)]
ExportIncomesDep = Annotated[ExportIncomes, Depends(provide_export_incomes)]
ImportIncomesDep = Annotated[ImportIncomes, Depends(provide_import_incomes)]
