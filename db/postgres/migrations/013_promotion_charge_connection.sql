\set ON_ERROR_STOP on
BEGIN;

CREATE TABLE IF NOT EXISTS promotion_charge (
    promo_code varchar(255) NOT NULL REFERENCES promotion(promo_code) ON DELETE CASCADE,
    charge_code varchar(20) NOT NULL REFERENCES charge(charge_code),
    PRIMARY KEY (promo_code, charge_code)
);

CREATE INDEX IF NOT EXISTS idx_promotion_charge_charge_code
    ON promotion_charge(charge_code);

COMMIT;
