package domain

import (
	"errors"
	"strings"
)

type Kind string

const (
	ExpenseKind Kind = "expense"
	IncomeKind  Kind = "income"
)

type Category struct {
	ID        int64
	Name      string
	Icon      *string
	SortOrder int
	Kind      Kind
	IsSystem  bool
	IsActive  bool
}

var (
	ErrNotFound       = errors.New("category not found")
	ErrDuplicateName  = errors.New("category name already exists")
	ErrSystemCategory = errors.New("system categories cannot be deactivated")
)

var validIcons = map[string]struct{}{
	"Banknote": {}, "Briefcase": {}, "Bus": {}, "Car": {}, "CreditCard": {},
	"DollarSign": {}, "Dumbbell": {}, "Gamepad2": {}, "Gift": {}, "GraduationCap": {},
	"HeartPulse": {}, "HelpCircle": {}, "Home": {}, "Landmark": {}, "Laptop": {},
	"PiggyBank": {}, "Plane": {}, "Receipt": {}, "Repeat": {}, "ShoppingCart": {},
	"Shirt": {}, "TrendingUp": {}, "Utensils": {}, "Wallet": {},
}

func ParseKind(value string) (Kind, error) {
	switch Kind(value) {
	case ExpenseKind, IncomeKind:
		return Kind(value), nil
	default:
		return "", errors.New("category kind must be expense or income")
	}
}

func NewCategory(id int64, name string, icon *string, sortOrder int, kind Kind, isSystem bool, isActive bool) (Category, error) {
	name, err := NormalizeName(name)
	if err != nil {
		return Category{}, err
	}
	icon, err = NormalizeIcon(icon)
	if err != nil {
		return Category{}, err
	}
	if _, err := ParseKind(string(kind)); err != nil {
		return Category{}, err
	}
	return Category{
		ID: id, Name: name, Icon: icon, SortOrder: sortOrder, Kind: kind,
		IsSystem: isSystem, IsActive: isActive,
	}, nil
}

func NormalizeName(value string) (string, error) {
	name := strings.TrimSpace(value)
	if name == "" {
		return "", errors.New("category name is required")
	}
	if len(name) > 80 {
		return "", errors.New("category name is too long")
	}
	return name, nil
}

func NormalizeIcon(value *string) (*string, error) {
	if value == nil {
		return nil, nil
	}
	icon := strings.TrimSpace(*value)
	if icon == "" {
		return nil, nil
	}
	if _, ok := validIcons[icon]; !ok {
		return nil, errors.New("category icon is not supported")
	}
	return &icon, nil
}
