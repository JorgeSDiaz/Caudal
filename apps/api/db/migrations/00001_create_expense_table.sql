-- +goose Up
CREATE TABLE IF NOT EXISTS expense (
    id bigserial PRIMARY KEY,
    amount_cents bigint NOT NULL,
    currency varchar(3) NOT NULL DEFAULT 'COP',
    category_id integer NOT NULL,
    occurred_on date NOT NULL DEFAULT CURRENT_DATE,
    note text NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz NULL,
    CONSTRAINT ck_expense_amount_positive CHECK (amount_cents > 0)
);

CREATE INDEX IF NOT EXISTS idx_expense_date ON expense (occurred_on) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_expense_category ON expense (category_id) WHERE deleted_at IS NULL;

-- +goose Down
DROP INDEX IF EXISTS idx_expense_category;
DROP INDEX IF EXISTS idx_expense_date;
DROP TABLE IF EXISTS expense;
