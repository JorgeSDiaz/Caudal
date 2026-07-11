-- +goose Up
CREATE TABLE IF NOT EXISTS income (
    id bigserial PRIMARY KEY,
    amount_cents bigint NOT NULL,
    currency varchar(3) NOT NULL DEFAULT 'COP',
    source_id integer NOT NULL,
    occurred_on date NOT NULL DEFAULT CURRENT_DATE,
    note text NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz NULL,
    CONSTRAINT ck_income_amount_positive CHECK (amount_cents > 0)
);

-- +goose StatementBegin
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_income_source'
    ) THEN
        ALTER TABLE income
        ADD CONSTRAINT fk_income_source FOREIGN KEY (source_id) REFERENCES category(id);
    END IF;
END $$;
-- +goose StatementEnd

CREATE INDEX IF NOT EXISTS idx_income_date ON income (occurred_on) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_income_source ON income (source_id) WHERE deleted_at IS NULL;

-- +goose Down
DROP INDEX IF EXISTS idx_income_source;
DROP INDEX IF EXISTS idx_income_date;
ALTER TABLE income DROP CONSTRAINT IF EXISTS fk_income_source;
DROP TABLE IF EXISTS income;
