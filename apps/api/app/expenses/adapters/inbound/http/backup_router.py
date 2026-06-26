"""Inbound HTTP adapter for JSON backup (export / import)."""

from __future__ import annotations

from fastapi import APIRouter, status

from app.expenses.adapters.inbound.http.schemas import BackupDocument
from app.expenses.application.create_expense import CreateExpenseCommand
from app.expenses.application.import_expenses import ImportExpensesCommand
from app.expenses.wiring import ExportExpensesDep, ImportExpensesDep

router = APIRouter(prefix="/backup", tags=["backup"])


@router.get("", response_model=BackupDocument)
def export_backup(use_case: ExportExpensesDep) -> BackupDocument:
    return BackupDocument.from_entities(use_case())


@router.post("", status_code=status.HTTP_201_CREATED)
def import_backup(body: BackupDocument, use_case: ImportExpensesDep) -> dict[str, int]:
    command = ImportExpensesCommand(
        items=tuple(
            CreateExpenseCommand(
                amount_cents=item.amount_cents,
                currency=item.currency,
                category_id=item.category_id,
                occurred_on=item.occurred_on,
                note=item.note,
            )
            for item in body.expenses
        )
    )
    return {"imported": use_case(command)}
