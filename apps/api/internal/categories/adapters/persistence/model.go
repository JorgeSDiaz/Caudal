package persistence

type CategoryModel struct {
	ID        int64   `gorm:"primaryKey;column:id"`
	Name      string  `gorm:"column:name"`
	Icon      *string `gorm:"column:icon"`
	SortOrder int     `gorm:"column:sort_order"`
	IsSystem  bool    `gorm:"column:is_system"`
	IsActive  bool    `gorm:"column:is_active"`
	Kind      string  `gorm:"column:kind"`
}

func (CategoryModel) TableName() string {
	return "category"
}
