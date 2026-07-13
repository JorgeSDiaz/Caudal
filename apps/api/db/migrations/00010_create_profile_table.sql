-- +goose Up
CREATE TABLE profile (
    id smallint PRIMARY KEY DEFAULT 1,
    alias text NULL,
    birth_year integer NULL,
    city text NULL,
    estimated_monthly_income bigint NULL,
    estimated_monthly_expenses bigint NULL,
    income_type text NULL,
    dependents_count integer NULL,
    housing text NULL,
    risk_tolerance text NULL,
    concerns text[] NOT NULL DEFAULT '{}',
    goals jsonb NOT NULL DEFAULT '[]'::jsonb,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ck_profile_singleton CHECK (id = 1),
    CONSTRAINT ck_profile_birth_year CHECK (birth_year IS NULL OR birth_year BETWEEN 1900 AND 2100),
    CONSTRAINT ck_profile_income_nonnegative CHECK (estimated_monthly_income IS NULL OR estimated_monthly_income >= 0),
    CONSTRAINT ck_profile_expenses_nonnegative CHECK (estimated_monthly_expenses IS NULL OR estimated_monthly_expenses >= 0),
    CONSTRAINT ck_profile_dependents_nonnegative CHECK (dependents_count IS NULL OR dependents_count >= 0),
    CONSTRAINT ck_profile_income_type CHECK (income_type IS NULL OR income_type IN ('fixed', 'variable', 'mixed')),
    CONSTRAINT ck_profile_housing CHECK (housing IS NULL OR housing IN ('rent', 'owned', 'family')),
    CONSTRAINT ck_profile_risk_tolerance CHECK (risk_tolerance IS NULL OR risk_tolerance IN ('low', 'medium', 'high')),
    CONSTRAINT ck_profile_goals_array CHECK (jsonb_typeof(goals) = 'array'),
    CONSTRAINT ck_profile_metadata_object CHECK (jsonb_typeof(metadata) = 'object')
);

-- +goose Down
DROP TABLE IF EXISTS profile;
