-- +goose Up
UPDATE category SET icon = 'Utensils' WHERE name = 'Comida' AND kind = 'expense';
UPDATE category SET icon = 'Bus' WHERE name = 'Transporte' AND kind = 'expense';
UPDATE category SET icon = 'ShoppingCart' WHERE name = 'Mercado' AND kind = 'expense';
UPDATE category SET icon = 'Gamepad2' WHERE name = 'Ocio' AND kind = 'expense';
UPDATE category SET icon = 'HeartPulse' WHERE name = 'Salud' AND kind = 'expense';
UPDATE category SET icon = 'Home' WHERE name = 'Hogar/Servicios' AND kind = 'expense';
UPDATE category SET icon = 'CreditCard' WHERE name = 'Suscripciones' AND kind = 'expense';
UPDATE category SET icon = 'Receipt' WHERE name = 'Deudas/Préstamos' AND kind = 'expense';
UPDATE category SET icon = 'PiggyBank' WHERE name = 'Ahorro' AND kind = 'expense';
UPDATE category SET icon = 'HelpCircle' WHERE name = 'Otros' AND kind = 'expense';

UPDATE category SET icon = 'Wallet' WHERE name = 'Sueldo' AND kind = 'income';
UPDATE category SET icon = 'Laptop' WHERE name = 'Freelance' AND kind = 'income';
UPDATE category SET icon = 'DollarSign' WHERE name = 'Ocasional' AND kind = 'income';
UPDATE category SET icon = 'Repeat' WHERE name = 'Cashback' AND kind = 'income';
UPDATE category SET icon = 'Gift' WHERE name = 'Bonos' AND kind = 'income';
UPDATE category SET icon = 'TrendingUp' WHERE name = 'Inversiones' AND kind = 'income';
UPDATE category SET icon = 'Receipt' WHERE name = 'Reembolsos' AND kind = 'income';
UPDATE category SET icon = 'HelpCircle' WHERE name = 'Otros' AND kind = 'income';

-- +goose Down
UPDATE category SET icon = NULL WHERE is_system = true;
