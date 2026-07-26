\set ON_ERROR_STOP on
BEGIN;

CREATE TABLE IF NOT EXISTS billing_payment_detail (
    seq bigint PRIMARY KEY,
    user_no bigint NULL REFERENCES users(user_no),
    user_code varchar(80) NULL,
    start_date timestamp NULL,
    expire_date timestamp NULL,
    cancel_date timestamp NULL,
    change_date timestamp NULL,
    rest_date integer NULL,
    status varchar(20) NULL,
    promotion_code varchar(30) NULL,
    amount bigint NULL,
    vat bigint NULL,
    payment_base_amount bigint NULL,
    payment_base_vat bigint NULL,
    pg_id varchar(100) NULL,
    imp_uid varchar(100) NULL,
    pay_method varchar(30) NULL,
    card_type varchar(30) NULL,
    charge_code varchar(20) NULL REFERENCES charge(charge_code),
    ex_charge_code varchar(20) NULL,
    installments varchar(20) NULL,
    payment_date timestamp NULL,
    pay_confirm_date timestamp NULL,
    upd_datetime timestamp NULL
);

CREATE TABLE IF NOT EXISTS billing_refund (
    id bigserial PRIMARY KEY,
    seq bigint NULL REFERENCES billing_payment_detail(seq),
    new_seq bigint NULL REFERENCES billing_payment_detail(seq),
    user_no bigint NULL REFERENCES users(user_no),
    user_code varchar(80) NULL,
    refund_type varchar(5) NULL,
    status varchar(10) NULL,
    refund_user_name varchar(100) NULL,
    refund_account varchar(100) NULL,
    refund_bank varchar(50) NULL,
    refund_amount bigint NULL,
    refund_card varchar(100) NULL,
    request_date timestamp NULL,
    refund_date timestamp NULL
);

CREATE INDEX IF NOT EXISTS idx_billing_payment_detail_payment_date
    ON billing_payment_detail(payment_date DESC);

CREATE INDEX IF NOT EXISTS idx_billing_payment_detail_user_no
    ON billing_payment_detail(user_no);

CREATE INDEX IF NOT EXISTS idx_billing_payment_detail_user_code
    ON billing_payment_detail(user_code);

CREATE INDEX IF NOT EXISTS idx_billing_refund_seq
    ON billing_refund(seq);

CREATE INDEX IF NOT EXISTS idx_billing_refund_new_seq
    ON billing_refund(new_seq);

COMMIT;
