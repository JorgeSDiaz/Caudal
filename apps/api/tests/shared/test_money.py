import pytest

from app.shared.domain.money import Money


def test_money_keeps_amount_in_cents_and_normalizes_currency() -> None:
    money = Money(amount_cents=12345, currency="cop")

    assert money.amount_cents == 12345
    assert money.currency == "COP"


def test_money_rejects_invalid_currency() -> None:
    with pytest.raises(ValueError):
        Money(amount_cents=100, currency="PESOS")
