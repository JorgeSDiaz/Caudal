-- +goose Up
UPDATE category SET sort_order = 10 WHERE name = 'Otros' AND kind = 'expense';
INSERT INTO category (name, sort_order, kind, is_system, is_active)
VALUES ('Ahorro', 9, 'expense', true, true)
ON CONFLICT DO NOTHING;

-- +goose Down
DELETE FROM category WHERE name = 'Ahorro' AND kind = 'expense';
UPDATE category SET sort_order = 9 WHERE name = 'Otros' AND kind = 'expense';
