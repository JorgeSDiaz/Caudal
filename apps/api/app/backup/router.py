from __future__ import annotations

from fastapi import APIRouter, status

from app.backup.schemas import BackupDocument
from app.expenses.application.create_expense import CreateExpenseCommand
from app.expenses.application.import_expenses import ImportExpensesCommand
from app.expenses.wiring import ExportExpensesDep, ImportExpensesDep
from app.incomes.application.create_income import CreateIncomeCommand
from app.incomes.application.import_incomes import ImportIncomesCommand
from app.incomes.wiring import ExportIncomesDep, ImportIncomesDep

router = APIRouter(prefix="/backup", tags=["backup"])


@router.get("", response_model=BackupDocument)
def export_backup(
    export_expenses: ExportExpensesDep, export_incomes: ExportIncomesDep
) -> BackupDocument:
    return BackupDocument.from_entities(export_expenses(), export_incomes())


@router.post("", status_code=status.HTTP_201_CREATED)
def import_backup(
    body: BackupDocument,
    import_expenses: ImportExpensesDep,
    import_incomes: ImportIncomesDep,
) -> dict[str, int]:
    expenses_command = ImportExpensesCommand(
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
    incomes_command = ImportIncomesCommand(
        items=tuple(
            CreateIncomeCommand(
                amount_cents=item.amount_cents,
                currency=item.currency,
                source_id=item.source_id,
                occurred_on=item.occurred_on,
                note=item.note,
            )
            for item in body.incomes
        )
    )
    imported = import_expenses(expenses_command) + import_incomes(incomes_command)
    return {"imported": imported}
