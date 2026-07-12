-- +goose Up
ALTER TABLE expense ADD COLUMN IF NOT EXISTS recurrence_id bigint NULL;
ALTER TABLE income ADD COLUMN IF NOT EXISTS recurrence_id bigint NULL;

-- +goose StatementBegin
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_expense_recurrence'
    ) THEN
        ALTER TABLE expense
        ADD CONSTRAINT fk_expense_recurrence
        FOREIGN KEY (recurrence_id) REFERENCES recurrence(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_income_recurrence'
    ) THEN
        ALTER TABLE income
        ADD CONSTRAINT fk_income_recurrence
        FOREIGN KEY (recurrence_id) REFERENCES recurrence(id) ON DELETE SET NULL;
    END IF;
END $$;
-- +goose StatementEnd

CREATE INDEX IF NOT EXISTS idx_expense_recurrence ON expense (recurrence_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_income_recurrence ON income (recurrence_id) WHERE deleted_at IS NULL;

-- +goose Down
DROP INDEX IF EXISTS idx_income_recurrence;
DROP INDEX IF EXISTS idx_expense_recurrence;
ALTER TABLE income DROP CONSTRAINT IF EXISTS fk_income_recurrence;
ALTER TABLE expense DROP CONSTRAINT IF EXISTS fk_expense_recurrence;
ALTER TABLE income DROP COLUMN IF EXISTS recurrence_id;
ALTER TABLE expense DROP COLUMN IF EXISTS recurrence_id;
