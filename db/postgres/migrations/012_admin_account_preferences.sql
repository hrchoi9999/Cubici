\set ON_ERROR_STOP on
BEGIN;

CREATE TABLE IF NOT EXISTS admin_account (
    admin_id varchar(100) PRIMARY KEY,
    admin_type varchar(2) NOT NULL,
    admin_name varchar(100) NOT NULL,
    admin_phone varchar(30) NULL,
    admin_email varchar(150) NULL,
    admin_department varchar(100) NULL,
    admin_grade varchar(2) NOT NULL DEFAULT '02',
    admin_password_hash varchar(128) NULL,
    admin_reg_date timestamp NOT NULL DEFAULT now(),
    admin_approval_date timestamp NULL,
    modified_date timestamp NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_account_type_grade
    ON admin_account(admin_type, admin_grade);

CREATE INDEX IF NOT EXISTS idx_admin_account_reg_date
    ON admin_account(admin_reg_date DESC);

COMMIT;
