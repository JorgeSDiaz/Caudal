from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_router
from app.expenses.domain.errors import ExpenseNotFoundError, UnknownCategoryError
from app.incomes.domain.errors import IncomeNotFoundError, UnknownSourceError
from app.recurrences.domain.errors import (
    RecurrenceNotFoundError,
    UnknownRecurrenceCategoryError,
)
from app.shared.config import get_settings
from app.shared.domain.errors import DomainValidationError

app = FastAPI(title="Caudal API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_settings().cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(api_router, prefix="/api/v1")


@app.exception_handler(ExpenseNotFoundError)
def _handle_expense_not_found(_: Request, exc: ExpenseNotFoundError) -> JSONResponse:
    return JSONResponse(status_code=404, content={"detail": str(exc)})


@app.exception_handler(UnknownCategoryError)
def _handle_unknown_category(_: Request, exc: UnknownCategoryError) -> JSONResponse:
    return JSONResponse(status_code=422, content={"detail": str(exc)})


@app.exception_handler(IncomeNotFoundError)
def _handle_income_not_found(_: Request, exc: IncomeNotFoundError) -> JSONResponse:
    return JSONResponse(status_code=404, content={"detail": str(exc)})


@app.exception_handler(UnknownSourceError)
def _handle_unknown_source(_: Request, exc: UnknownSourceError) -> JSONResponse:
    return JSONResponse(status_code=422, content={"detail": str(exc)})


@app.exception_handler(RecurrenceNotFoundError)
def _handle_recurrence_not_found(_: Request, exc: RecurrenceNotFoundError) -> JSONResponse:
    return JSONResponse(status_code=404, content={"detail": str(exc)})


@app.exception_handler(UnknownRecurrenceCategoryError)
def _handle_unknown_recurrence_category(
    _: Request, exc: UnknownRecurrenceCategoryError
) -> JSONResponse:
    return JSONResponse(status_code=422, content={"detail": str(exc)})


@app.exception_handler(DomainValidationError)
def _handle_domain_validation(_: Request, exc: DomainValidationError) -> JSONResponse:
    return JSONResponse(status_code=422, content={"detail": str(exc)})


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
