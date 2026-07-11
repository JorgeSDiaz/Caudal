-- +goose Up
CREATE TABLE IF NOT EXISTS recurrence (
    id bigserial PRIMARY KEY,
    kind text NOT NULL,
    amount_cents bigint NOT NULL,
    currency varchar(3) NOT NULL DEFAULT 'COP',
    category_id integer NOT NULL,
    frequency text NOT NULL,
    day_of_month integer NOT NULL,
    second_day_of_month integer NULL,
    start_date date NOT NULL,
    end_date date NULL,
    note text NULL,
    is_active boolean NOT NULL DEFAULT true,
    last_generated_on date NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz NULL,
    CONSTRAINT ck_recurrence_amount_positive CHECK (amount_cents > 0)
);

-- +goose StatementBegin
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_recurrence_category'
    ) THEN
        ALTER TABLE recurrence
        ADD CONSTRAINT fk_recurrence_category FOREIGN KEY (category_id) REFERENCES category(id);
    END IF;
END $$;
-- +goose StatementEnd

CREATE INDEX IF NOT EXISTS idx_recurrence_active ON recurrence (is_active) WHERE deleted_at IS NULL;

-- +goose Down
DROP INDEX IF EXISTS idx_recurrence_active;
ALTER TABLE recurrence DROP CONSTRAINT IF EXISTS fk_recurrence_category;
DROP TABLE IF EXISTS recurrence;
