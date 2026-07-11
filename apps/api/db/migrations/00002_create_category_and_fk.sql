-- +goose Up
CREATE TABLE IF NOT EXISTS category (
    id serial PRIMARY KEY,
    name text NOT NULL UNIQUE,
    icon text NULL,
    sort_order integer NOT NULL DEFAULT 0,
    is_system boolean NOT NULL DEFAULT true,
    is_active boolean NOT NULL DEFAULT true
);

INSERT INTO category (name, sort_order) VALUES
('Comida', 1),
('Transporte', 2),
('Mercado', 3),
('Ocio', 4),
('Salud', 5),
('Hogar/Servicios', 6),
('Suscripciones', 7),
('Otros', 8)
ON CONFLICT DO NOTHING;

-- +goose StatementBegin
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_expense_category'
    ) THEN
        ALTER TABLE expense
        ADD CONSTRAINT fk_expense_category FOREIGN KEY (category_id) REFERENCES category(id);
    END IF;
END $$;
-- +goose StatementEnd

-- +goose Down
ALTER TABLE expense DROP CONSTRAINT IF EXISTS fk_expense_category;
DROP TABLE IF EXISTS category;
