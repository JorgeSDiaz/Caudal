from app.categories.application.list_categories import ListActiveCategories
from app.categories.domain.entities import Category
from tests.fakes import InMemoryCategoryRepository


def _category(id: int, name: str, sort_order: int, *, is_active: bool = True) -> Category:
    return Category(
        id=id,
        name=name,
        sort_order=sort_order,
        is_system=True,
        is_active=is_active,
    )


def test_list_excludes_inactive_categories() -> None:
    repository = InMemoryCategoryRepository(
        [
            _category(1, "Food", 1),
            _category(2, "Retired", 2, is_active=False),
        ]
    )

    result = ListActiveCategories(repository)()

    assert [category.name for category in result] == ["Food"]


def test_list_is_sorted_by_display_order() -> None:
    repository = InMemoryCategoryRepository(
        [
            _category(1, "Other", 3),
            _category(2, "Food", 1),
            _category(3, "Transport", 2),
        ]
    )

    result = ListActiveCategories(repository)()

    assert [category.name for category in result] == ["Food", "Transport", "Other"]
