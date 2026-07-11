-- +goose Up
UPDATE category SET sort_order = 9 WHERE name = 'Otros';
INSERT INTO category (name, sort_order) VALUES ('Deudas/Préstamos', 8)
ON CONFLICT DO NOTHING;

-- +goose Down
DELETE FROM category WHERE name = 'Deudas/Préstamos';
UPDATE category SET sort_order = 8 WHERE name = 'Otros';
