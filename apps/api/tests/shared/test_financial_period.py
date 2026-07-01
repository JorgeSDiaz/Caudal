from datetime import date

from app.shared.domain.financial_period import financial_month_bounds, in_financial_month


def test_financial_month_runs_from_previous_30_to_current_30() -> None:
    assert financial_month_bounds(2026, 7) == (date(2026, 6, 30), date(2026, 7, 30))


def test_financial_month_start_is_inclusive_and_end_is_exclusive() -> None:
    assert in_financial_month(date(2026, 6, 30), 2026, 7)
    assert in_financial_month(date(2026, 7, 29), 2026, 7)
    assert not in_financial_month(date(2026, 6, 29), 2026, 7)
    assert not in_financial_month(date(2026, 7, 30), 2026, 7)


def test_financial_month_uses_last_day_when_a_month_has_no_30th() -> None:
    assert financial_month_bounds(2026, 3) == (date(2026, 2, 28), date(2026, 3, 30))
