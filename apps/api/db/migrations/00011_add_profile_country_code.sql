-- +goose Up
ALTER TABLE profile
ADD COLUMN country_code char(2) NULL,
ADD CONSTRAINT ck_profile_country_code
CHECK (country_code IS NULL OR country_code ~ '^[A-Z]{2}$');

-- +goose Down
ALTER TABLE profile DROP CONSTRAINT IF EXISTS ck_profile_country_code;
ALTER TABLE profile DROP COLUMN IF EXISTS country_code;
