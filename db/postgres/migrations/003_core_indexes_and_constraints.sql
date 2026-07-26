-- Cubici core workflow indexes and relational constraints.
-- Generated for local PostgreSQL migration verification.

CREATE INDEX IF NOT EXISTS idx_cubici_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_cubici_users_fintech_id ON users (fintech_id);
CREATE INDEX IF NOT EXISTS idx_cubici_users_user_type_reg_date ON users (user_type, reg_date);

CREATE INDEX IF NOT EXISTS idx_cubici_shop_accounts_user_no ON shop_accounts (user_no);
CREATE INDEX IF NOT EXISTS idx_cubici_shop_accounts_shop ON shop_accounts (shop_type, shop_id);
CREATE INDEX IF NOT EXISTS idx_cubici_shop_accounts_user_status ON shop_accounts (user_no, status, del_yn);

CREATE INDEX IF NOT EXISTS idx_cubici_sale_shop_paid ON sale (shop_type, shop_id, paid_date);
CREATE INDEX IF NOT EXISTS idx_cubici_sale_shop_order ON sale (shop_type, shop_id, order_no);
CREATE INDEX IF NOT EXISTS idx_cubici_sale_status_paid ON sale (status, paid_date);
CREATE INDEX IF NOT EXISTS idx_cubici_sale_settle_estimate ON sale (settle_estimate_date);

CREATE INDEX IF NOT EXISTS idx_cubici_sale_return_shop_order ON sale_return (shop_type, shop_id, order_no);
CREATE INDEX IF NOT EXISTS idx_cubici_sale_return_status_request ON sale_return (status, request_date);
CREATE INDEX IF NOT EXISTS idx_cubici_sale_return_claim_complete ON sale_return (claim_status, claim_complete_date);

CREATE INDEX IF NOT EXISTS idx_cubici_settlement_shop_date ON settlement (shop_type, shop_id, settlement_date);
CREATE INDEX IF NOT EXISTS idx_cubici_settlement_status_date ON settlement (status, settlement_date);

CREATE INDEX IF NOT EXISTS idx_cubici_moneybank_advance_user_no ON moneybank_advance_contract (user_no);
CREATE INDEX IF NOT EXISTS idx_cubici_moneybank_contract_user_no ON moneybank_contract (user_no);
CREATE INDEX IF NOT EXISTS idx_cubici_moneybank_contract_fintech_id ON moneybank_contract (fintech_id);
CREATE INDEX IF NOT EXISTS idx_cubici_moneybank_contract_status_request ON moneybank_contract (status, request_date);
CREATE INDEX IF NOT EXISTS idx_cubici_moneybank_contract_dates ON moneybank_contract (contract_date, expire_date);

CREATE INDEX IF NOT EXISTS idx_cubici_moneybank_contract_shop_mbid ON moneybank_contract_shop (mbid);
CREATE INDEX IF NOT EXISTS idx_cubici_moneybank_contract_shop_shop ON moneybank_contract_shop (contract_shop_type, contract_shop_id);
CREATE INDEX IF NOT EXISTS idx_cubici_moneybank_contract_fee_mbid ON moneybank_contract_fee (mbid);
CREATE INDEX IF NOT EXISTS idx_cubici_moneybank_contract_fee_rates_fee_id ON moneybank_contract_fee_rates (contract_fee_id);

CREATE INDEX IF NOT EXISTS idx_cubici_moneybank_contract_certificate_user_no ON moneybank_contract_certificate (user_no);

CREATE INDEX IF NOT EXISTS idx_cubici_redemption_deposit_mbid_date ON moneybank_redemption_deposit (mbid, deposit_date);
CREATE INDEX IF NOT EXISTS idx_cubici_redemption_history_mbid_reg ON moneybank_redemption_history (mbid, reg_date);
CREATE INDEX IF NOT EXISTS idx_cubici_redemption_provision_mbid_status_date ON moneybank_redemption_provision (mbid, status, provision_date);
CREATE INDEX IF NOT EXISTS idx_cubici_redemption_provision_request ON moneybank_redemption_provision (request_code);
CREATE INDEX IF NOT EXISTS idx_cubici_redemption_repayment_mbid_status_date ON moneybank_redemption_repayment (mbid, status, balance_provision_date);
CREATE INDEX IF NOT EXISTS idx_cubici_redemption_repayment_code ON moneybank_redemption_repayment (repayment_code);
CREATE INDEX IF NOT EXISTS idx_cubici_redemption_sales_mbid_paid ON moneybank_redemption_sales (mbid, paid_date);
CREATE INDEX IF NOT EXISTS idx_cubici_redemption_sales_request ON moneybank_redemption_sales (request_code);
CREATE INDEX IF NOT EXISTS idx_cubici_redemption_sales_order ON moneybank_redemption_sales (order_no);

CREATE INDEX IF NOT EXISTS idx_cubici_prizm_pcs_mbid ON prizm_pcs_result (mbid);
CREATE INDEX IF NOT EXISTS idx_cubici_prizm_pcs_user_no ON prizm_pcs_result (user_no);
CREATE INDEX IF NOT EXISTS idx_cubici_prizm_pms_mbid ON prizm_pms_result (mbid);
CREATE INDEX IF NOT EXISTS idx_cubici_prizm_pms_user_no ON prizm_pms_result (user_no);

CREATE INDEX IF NOT EXISTS idx_cubici_trade_request_bin_mbid ON "TRADE_REQUEST_BIN" (mbid);
CREATE INDEX IF NOT EXISTS idx_cubici_trade_request_bin_status_date ON "TRADE_REQUEST_BIN" ("PROCESS_STATUS", "REQ_DATE");
CREATE INDEX IF NOT EXISTS idx_cubici_firm_request_bin_mbid ON firm_request_bin (mbid);
CREATE INDEX IF NOT EXISTS idx_cubici_firm_request_bin_success_date ON firm_request_bin (success_yn, req_date);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_cubici_users_fintech') THEN
    ALTER TABLE users ADD CONSTRAINT fk_cubici_users_fintech FOREIGN KEY (fintech_id) REFERENCES fintech (id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_cubici_fintech_info_fintech') THEN
    ALTER TABLE fintech_info ADD CONSTRAINT fk_cubici_fintech_info_fintech FOREIGN KEY (fintech_id) REFERENCES fintech (id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_cubici_shop_accounts_user') THEN
    ALTER TABLE shop_accounts ADD CONSTRAINT fk_cubici_shop_accounts_user FOREIGN KEY (user_no) REFERENCES users (user_no);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_cubici_advance_contract_user') THEN
    ALTER TABLE moneybank_advance_contract ADD CONSTRAINT fk_cubici_advance_contract_user FOREIGN KEY (user_no) REFERENCES users (user_no);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_cubici_contract_user') THEN
    ALTER TABLE moneybank_contract ADD CONSTRAINT fk_cubici_contract_user FOREIGN KEY (user_no) REFERENCES users (user_no);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_cubici_contract_fintech') THEN
    ALTER TABLE moneybank_contract ADD CONSTRAINT fk_cubici_contract_fintech FOREIGN KEY (fintech_id) REFERENCES fintech (id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_cubici_contract_shop_contract') THEN
    ALTER TABLE moneybank_contract_shop ADD CONSTRAINT fk_cubici_contract_shop_contract FOREIGN KEY (mbid) REFERENCES moneybank_contract (mbid);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_cubici_contract_fee_contract') THEN
    ALTER TABLE moneybank_contract_fee ADD CONSTRAINT fk_cubici_contract_fee_contract FOREIGN KEY (mbid) REFERENCES moneybank_contract (mbid);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_cubici_contract_fee_rates_fee') THEN
    ALTER TABLE moneybank_contract_fee_rates ADD CONSTRAINT fk_cubici_contract_fee_rates_fee FOREIGN KEY (contract_fee_id) REFERENCES moneybank_contract_fee (id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_cubici_contract_certificate_contract') THEN
    ALTER TABLE moneybank_contract_certificate ADD CONSTRAINT fk_cubici_contract_certificate_contract FOREIGN KEY (mbid) REFERENCES moneybank_contract (mbid);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_cubici_contract_document_contract') THEN
    ALTER TABLE moneybank_contract_document ADD CONSTRAINT fk_cubici_contract_document_contract FOREIGN KEY (mbid) REFERENCES moneybank_contract (mbid);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_cubici_redemption_deposit_contract') THEN
    ALTER TABLE moneybank_redemption_deposit ADD CONSTRAINT fk_cubici_redemption_deposit_contract FOREIGN KEY (mbid) REFERENCES moneybank_contract (mbid);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_cubici_redemption_history_contract') THEN
    ALTER TABLE moneybank_redemption_history ADD CONSTRAINT fk_cubici_redemption_history_contract FOREIGN KEY (mbid) REFERENCES moneybank_contract (mbid);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_cubici_redemption_provision_contract') THEN
    ALTER TABLE moneybank_redemption_provision ADD CONSTRAINT fk_cubici_redemption_provision_contract FOREIGN KEY (mbid) REFERENCES moneybank_contract (mbid);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_cubici_redemption_repayment_contract') THEN
    ALTER TABLE moneybank_redemption_repayment ADD CONSTRAINT fk_cubici_redemption_repayment_contract FOREIGN KEY (mbid) REFERENCES moneybank_contract (mbid);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_cubici_redemption_sales_contract') THEN
    ALTER TABLE moneybank_redemption_sales ADD CONSTRAINT fk_cubici_redemption_sales_contract FOREIGN KEY (mbid) REFERENCES moneybank_contract (mbid);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_cubici_prizm_pms_contract') THEN
    ALTER TABLE prizm_pms_result ADD CONSTRAINT fk_cubici_prizm_pms_contract FOREIGN KEY (mbid) REFERENCES moneybank_contract (mbid);
  END IF;
END $$;
