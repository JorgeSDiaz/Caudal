from app.categories.application.list_categories import ListActiveCategories
from app.categories.domain.entities import Category
from tests.fakes import InMemoryCategoryRepository


def _repository() -> InMemoryCategoryRepository:
    return InMemoryCategoryRepository(
        [
            Category(id=1, name="Comida", sort_order=1, is_system=True, is_active=True),
            Category(
                id=2, name="Sueldo", sort_order=1, is_system=True, is_active=True, kind="income"
            ),
            Category(
                id=3, name="Freelance", sort_order=2, is_system=True, is_active=True, kind="income"
            ),
        ]
    )


def test_defaults_to_expense_kind() -> None:
    result = ListActiveCategories(_repository())()

    assert [category.name for category in result] == ["Comida"]


def test_lists_income_sources_when_requested() -> None:
    result = ListActiveCategories(_repository())("income")

    assert [category.name for category in result] == ["Sueldo", "Freelance"]
