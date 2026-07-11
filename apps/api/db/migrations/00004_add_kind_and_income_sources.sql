-- +goose Up
ALTER TABLE category ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'expense';
CREATE INDEX IF NOT EXISTS idx_category_kind ON category (kind);
ALTER TABLE category DROP CONSTRAINT IF EXISTS category_name_key;
-- +goose StatementBegin
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_category_name_kind'
    ) THEN
        ALTER TABLE category ADD CONSTRAINT uq_category_name_kind UNIQUE (name, kind);
    END IF;
END $$;
-- +goose StatementEnd

INSERT INTO category (name, sort_order, kind) VALUES
('Sueldo', 1, 'income'),
('Freelance', 2, 'income'),
('Ocasional', 3, 'income'),
('Cashback', 4, 'income'),
('Bonos', 5, 'income'),
('Inversiones', 6, 'income'),
('Reembolsos', 7, 'income'),
('Otros', 8, 'income')
ON CONFLICT DO NOTHING;

-- +goose Down
DELETE FROM category WHERE kind = 'income';
ALTER TABLE category DROP CONSTRAINT uq_category_name_kind;
ALTER TABLE category ADD CONSTRAINT category_name_key UNIQUE (name);
DROP INDEX IF EXISTS idx_category_kind;
ALTER TABLE category DROP COLUMN kind;
