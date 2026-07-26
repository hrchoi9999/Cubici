-- PostgreSQL DDL draft generated from MySQL schema inventory.
-- Review required before applying to a real database.

CREATE TABLE IF NOT EXISTS "api_report" (
  "api_no" bigint NOT NULL,
  "api_type" varchar(200),
  "shop_type" varchar(10),
  "shop_id" varchar(30),
  "subject" varchar(100),
  "content" varchar(1000),
  "status" varchar(255),
  "reg_date" timestamp(6) NOT NULL,
  PRIMARY KEY ("api_no")
);

CREATE TABLE IF NOT EXISTS "attach_file" (
  "uuid" varchar(36) NOT NULL,
  "type" varchar(30),
  "type_id" varchar(20),
  "origin_name" varchar(200),
  "store_name" varchar(500),
  "ext" varchar(5),
  "size" varchar(50),
  "path" varchar(300),
  "encryption" char(1),
  "created_by" varchar(50),
  "last_modified_by" varchar(50),
  "reg_date" timestamp,
  "modified_date" timestamp,
  PRIMARY KEY ("uuid")
);

CREATE TABLE IF NOT EXISTS "CBCI_FILE" (
  "uuid" char(36) NOT NULL,
  "file_division" varchar(20) NOT NULL,
  "file_division_pk" varchar(20) NOT NULL,
  "origin_file_name" varchar(200) NOT NULL,
  "store_file_name" varchar(500) NOT NULL,
  "file_ext" varchar(5) NOT NULL,
  "file_size" varchar(2000) NOT NULL,
  "file_path" varchar(300) NOT NULL,
  "enc_type" char(1) NOT NULL,
  "input_date" timestamp NOT NULL,
  PRIMARY KEY ("uuid")
);

CREATE TABLE IF NOT EXISTS "charge" (
  "charge_code" varchar(5) NOT NULL,
  "charge_name" varchar(20) NOT NULL,
  "charge_type" varchar(1) NOT NULL,
  "start_date" date,
  "expire_date" date,
  "sub_id" bigint,
  "sales_count" varchar(3),
  "product_count" varchar(3),
  "amount" bigint,
  "period" bigint,
  "period_unit" varchar(1),
  "charge_detail" varchar(100),
  "reg_date" timestamp(6) NOT NULL,
  "update_date" timestamp(6),
  PRIMARY KEY ("charge_code")
);

CREATE TABLE IF NOT EXISTS "faq" (
  "faq_id" bigint NOT NULL,
  "user_id" bigint NOT NULL,
  "type" varchar(15) NOT NULL,
  "title" varchar(100) NOT NULL,
  "content" text NOT NULL,
  "created_by" varchar(50),
  "last_modified_by" varchar(50),
  "reg_date" timestamp,
  "modified_date" timestamp,
  PRIMARY KEY ("faq_id")
);

CREATE TABLE IF NOT EXISTS "fintech" (
  "id" bigint NOT NULL,
  "fintech_name" varchar(25),
  "fintech_bank_code" char(3),
  "fintech_prd_code" varchar(15),
  "fintech_pay_code" varchar(15),
  "fintech_account_number" varchar(30),
  "fintech_account_holder" varchar(10),
  "fintech_interest_rate" decimal(4,2),
  "fintech_repayment_date" bigint,
  "process_type" varchar(20),
  "reg_date" timestamp,
  "modified_date" timestamp,
  PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "idx_fintech_fintech_UN" ON "fintech" ("fintech_name");

CREATE TABLE IF NOT EXISTS "fintech_info" (
  "fintech_id" bigint NOT NULL,
  "ks_code" varchar(4),
  "e_key" varchar(32),
  "m_salt" varchar(4),
  "password" varchar(100),
  "comp_code" varchar(20),
  "fac_code" varchar(20),
  "send_code" varchar(4),
  "recv_code" varchar(4),
  "reg_date" timestamp,
  "modified_date" timestamp,
  PRIMARY KEY ("fintech_id")
);

CREATE TABLE IF NOT EXISTS "fintech_request" (
  "id" bigint NOT NULL,
  "fintech_id" bigint NOT NULL,
  "fintech_product_code" varchar(30),
  "request_code" varchar(30),
  "request_date" timestamp,
  "request_amount" bigint,
  "approval_date" timestamp,
  "interest_rate" decimal(4,2),
  "repayment_expire_date" timestamp,
  "repayment_complete_date" timestamp,
  "status" varchar(20),
  "product_type" varchar(10),
  "process_type" varchar(20),
  "reg_date" timestamp,
  "modified_date" timestamp,
  PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "idx_fintech_request_fintech_request_UN" ON "fintech_request" ("fintech_product_code", "request_code");

CREATE TABLE IF NOT EXISTS "firm_request_bin" (
  "mbid" varchar(10),
  "req_type" varchar(20) NOT NULL,
  "comp_code" varchar(20) NOT NULL,
  "req_date" varchar(8) NOT NULL,
  "seq_no" varchar(6) NOT NULL,
  "req_time" varchar(6),
  "out_bank_code" varchar(3),
  "out_account" varchar(30),
  "in_bank_code" varchar(3),
  "in_account" varchar(30),
  "amount" bigint,
  "reply_code" varchar(4),
  "success_yn" varchar(1),
  "trade_time" varchar(6),
  "balance" bigint,
  "svc_charge" bigint,
  "reg_date" timestamp,
  "modified_date" timestamp,
  PRIMARY KEY ("comp_code", "req_date", "seq_no")
);

CREATE TABLE IF NOT EXISTS "holiday" (
  "date" timestamp NOT NULL,
  "date_name" varchar(20) NOT NULL,
  PRIMARY KEY ("date")
);

CREATE TABLE IF NOT EXISTS "hyphen_bank_bin" (
  "hyphen_bank_no" bigint NOT NULL,
  "mbid" varchar(10) NOT NULL,
  "payer_number" varchar(10) NOT NULL,
  "round_no" varchar(10),
  "info_code" varchar(3) NOT NULL,
  "send_date" varchar(6),
  "seq_no" varchar(6),
  "bank_code" varchar(3),
  "bank_account" varchar(16),
  "req_amount" bigint,
  "res_amount" bigint,
  "fail_amount" bigint,
  "result" varchar(1),
  "error_code" varchar(4),
  "reg_date" timestamp NOT NULL,
  "modified_date" timestamp NOT NULL,
  PRIMARY KEY ("hyphen_bank_no")
);

CREATE TABLE IF NOT EXISTS "hyphen_bank_code" (
  "code" varchar(10) NOT NULL,
  "message" varchar(1000) NOT NULL,
  PRIMARY KEY ("code")
);

CREATE TABLE IF NOT EXISTS "message_auth" (
  "auth_no" bigint NOT NULL,
  "email" varchar(255),
  "phone" varchar(255),
  "auth_num" char(6) NOT NULL,
  "reg_date" timestamp(6),
  PRIMARY KEY ("auth_no")
);

CREATE TABLE IF NOT EXISTS "message_template" (
  "message_no" bigint NOT NULL,
  "msg_key" char(2) NOT NULL,
  "msg_code" char(2) NOT NULL,
  "msg_menu" varchar(20) NOT NULL,
  "msg_division" varchar(20) NOT NULL,
  "msg_item" varchar(30) NOT NULL,
  "msg_title" varchar(50),
  "msg_content" text NOT NULL,
  "reg_user" varchar(10) NOT NULL,
  "reg_date" timestamp(6) NOT NULL,
  PRIMARY KEY ("message_no")
);

CREATE TABLE IF NOT EXISTS "moneybank_advance_contract" (
  "advance_contract_id" bigint NOT NULL,
  "user_no" bigint,
  "business_period" bit(1),
  "business_type" bit(1),
  "individual" bit(1),
  "sales_amount" bit(1),
  "user_age" bit(1),
  "success" bit(1),
  "reg_date" timestamp,
  "modified_date" timestamp,
  PRIMARY KEY ("advance_contract_id")
);

CREATE TABLE IF NOT EXISTS "moneybank_contract" (
  "mbid" char(10) NOT NULL,
  "user_no" bigint NOT NULL,
  "fintech_id" bigint,
  "product_code" char(2) NOT NULL,
  "status" varchar(20),
  "request_date" timestamp(6),
  "approval_date" timestamp(6),
  "agree_date" timestamp(6),
  "contract_date" timestamp(6),
  "expire_date" timestamp(6),
  "cancel_request_date" timestamp(6),
  "reg_no_first" varchar(30) NOT NULL,
  "reg_no_second" varchar(30),
  "sales_amount" integer,
  "payer_number" varchar(20),
  "payer_status" varchar(10),
  "demand_acc_bank_code" char(3),
  "demand_acc_holder" varchar(10),
  "demand_acc_number" varchar(30),
  "main_acc_bank_code" char(3),
  "main_acc_holder" varchar(10),
  "main_acc_number" varchar(30),
  "reg_date" timestamp(6) NOT NULL,
  "modified_date" timestamp(6),
  PRIMARY KEY ("mbid")
);

CREATE TABLE IF NOT EXISTS "moneybank_contract_certificate" (
  "mbid" char(10) NOT NULL,
  "user_no" bigint NOT NULL,
  "certificate" text NOT NULL,
  "private_key" text NOT NULL,
  "password" varchar(100) NOT NULL,
  "expiration_date" date NOT NULL,
  "reg_date" timestamp(6) NOT NULL,
  "modified_date" timestamp(6),
  PRIMARY KEY ("mbid")
);

CREATE TABLE IF NOT EXISTS "moneybank_contract_document" (
  "mbid" char(10) NOT NULL,
  "business_no" char(10),
  "business_start_date" char(8),
  "tax_type" char(2),
  "cb_score_current" integer,
  "cb_score_rank" integer,
  "cb_score_past" integer,
  "debt_status" bit(1),
  "financial_disorder_status" bit(1),
  "public_information_status" bit(1),
  "overdue_status" bit(1),
  "cb_check" bit(1),
  "national_tax_full_payment" bit(1),
  "local_tax_full_payment" bit(1),
  "health_insurance_full_payment" bit(1),
  "health_insurance_paid_amount" integer,
  "cb_confirm_admin" varchar(20),
  "final_confirm_admin" varchar(20),
  "reg_date" timestamp,
  "modified_date" timestamp,
  PRIMARY KEY ("mbid")
);

CREATE TABLE IF NOT EXISTS "moneybank_contract_fee" (
  "id" bigint NOT NULL,
  "mbid" char(10),
  "payment_rate" bigint,
  "sales_limit_per_order" bigint,
  "max_outstanding_balance" bigint,
  "created_by" varchar(15),
  "reg_date" timestamp,
  "last_modified_by" varchar(15),
  "modified_date" timestamp,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "moneybank_contract_fee_rates" (
  "id" bigint NOT NULL,
  "contract_fee_id" bigint,
  "fee_type" varchar(15),
  "fee_rate" decimal(4,2),
  "reg_date" timestamp,
  "modified_date" timestamp,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "moneybank_contract_shop" (
  "id" bigint NOT NULL,
  "mbid" char(10),
  "contract_shop_type" varchar(20),
  "contract_shop_id" varchar(50),
  "reg_date" timestamp,
  "modified_date" timestamp,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "moneybank_redemption_deposit" (
  "id" bigint NOT NULL,
  "mbid" char(10),
  "deposit_code" varchar(15),
  "repayment_code" varchar(15),
  "deposit_date" varchar(10),
  "deposit_amount" bigint,
  "reg_date" timestamp(6),
  PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "idx_moneybank_redemption_deposit_FKcpus1tcnd9vjw2pjy1fidwmw6" ON "moneybank_redemption_deposit" ("repayment_code");

CREATE TABLE IF NOT EXISTS "moneybank_redemption_history" (
  "id" bigint NOT NULL,
  "mbid" char(10),
  "cumulative_provision_amount" bigint,
  "cumulative_repayment_amount" bigint,
  "outstanding_balance" bigint,
  "reg_date" timestamp(6),
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "moneybank_redemption_provision" (
  "id" bigint NOT NULL,
  "mbid" char(10),
  "request_code" varchar(30),
  "provision_code" varchar(15),
  "total_payment_amount" bigint,
  "total_usage_fee" bigint,
  "total_provision_amount" bigint,
  "provision_date" timestamp(6),
  "status" varchar(20),
  "reg_date" timestamp(6),
  "modified_date" timestamp(6),
  PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "idx_moneybank_redemption_provision_UKcke55g9m66chf5wa19jxh0q6f" ON "moneybank_redemption_provision" ("provision_code");
CREATE INDEX IF NOT EXISTS "idx_moneybank_redemption_provision_FKtqbmdybvyte9ei278m1bv3fkk" ON "moneybank_redemption_provision" ("request_code");

CREATE TABLE IF NOT EXISTS "moneybank_redemption_repayment" (
  "id" bigint NOT NULL,
  "mbid" char(10),
  "repayment_code" varchar(15),
  "repayment_amount" bigint,
  "repayment_usage_fee" bigint,
  "remittance_fee" bigint,
  "balance_provision_amount" bigint,
  "balance_provision_date" timestamp(6),
  "status" varchar(15),
  "reg_date" timestamp(6),
  "modified_date" timestamp(6),
  PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "idx_moneybank_redemption_repayment_UK_f3abcwawtnybytw9kvm9abyy6" ON "moneybank_redemption_repayment" ("repayment_code");

CREATE TABLE IF NOT EXISTS "moneybank_redemption_sales" (
  "id" bigint NOT NULL,
  "mbid" char(10),
  "request_code" varchar(30),
  "sales_code" varchar(15),
  "class_code" varchar(20),
  "order_no" varchar(30),
  "payment_amount" bigint,
  "usage_fee" bigint,
  "provision_amount" bigint,
  "paid_date" timestamp(6),
  "reg_date" timestamp(6),
  "modified_date" timestamp(6),
  PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "idx_moneybank_redemption_sales_UKq5mlfdbou5l59bv6pcjw5nhoa" ON "moneybank_redemption_sales" ("sales_code");
CREATE INDEX IF NOT EXISTS "idx_moneybank_redemption_sales_FK8o6w9h2y2u7pbk21dpy40rkk6" ON "moneybank_redemption_sales" ("request_code");

CREATE TABLE IF NOT EXISTS "notice" (
  "notice_id" bigint NOT NULL,
  "user_id" bigint NOT NULL,
  "type" varchar(15) NOT NULL,
  "title" varchar(100) NOT NULL,
  "content" text NOT NULL,
  "created_by" varchar(50),
  "last_modified_by" varchar(50),
  "reg_date" timestamp,
  "modified_date" timestamp,
  PRIMARY KEY ("notice_id")
);

CREATE TABLE IF NOT EXISTS "partner" (
  "partner_id" varchar(10) NOT NULL,
  "partner_code" varchar(5) NOT NULL,
  "partner_name" varchar(50) NOT NULL,
  "rep_name" varchar(50) NOT NULL,
  "partner_zip" varchar(5) NOT NULL,
  "partner_address" varchar(300) NOT NULL,
  "partner_status" varchar(2),
  "partner_type" varchar(2),
  "memo" varchar(1000),
  "financing" varchar(1),
  "reg_date" timestamp(6),
  "update_date" timestamp(6),
  PRIMARY KEY ("partner_id")
);

CREATE TABLE IF NOT EXISTS "partner_manager" (
  "partner_code" varchar(255) NOT NULL,
  "manager_type" varchar(255) NOT NULL,
  "manager_name" varchar(255),
  "manager_rank" varchar(255),
  "manager_email" varchar(255),
  "manager_phone" varchar(255),
  "reg_date" timestamp(6) NOT NULL,
  "update_date" timestamp(6),
  PRIMARY KEY ("manager_type", "partner_code")
);

CREATE TABLE IF NOT EXISTS "prizm_items" (
  "division" bigint NOT NULL,
  "subject_no" bigint NOT NULL,
  "item_no" bigint NOT NULL,
  "item_definition" varchar(255),
  "item_nm" varchar(255),
  "item_weight" varchar(255),
  "item_standard_low1" varchar(255),
  "item_standard_high1" varchar(255),
  "item_standard_low2" varchar(255),
  "item_standard_high2" varchar(255),
  "item_standard_low3" varchar(255),
  "item_standard_high3" varchar(255),
  "item_standard_low4" varchar(255),
  "item_standard_high4" varchar(255),
  "item_standard_low5" varchar(255),
  "item_standard_high5" varchar(255),
  PRIMARY KEY ("division", "subject_no", "item_no")
);

CREATE TABLE IF NOT EXISTS "prizm_pcs_result" (
  "pcs_no" integer NOT NULL,
  "mbid" char(10),
  "user_no" bigint,
  "prizm_grade" varchar(100),
  "prizm_score" double precision NOT NULL,
  "business_period" double precision NOT NULL,
  "operating_period" double precision NOT NULL,
  "shop_count" bigint,
  "month_sales_value" bigint,
  "month_sales_quantity" bigint,
  "month_settlement_amount" bigint,
  "month_settlement_period" double precision NOT NULL,
  "month_settlement_to_sales_rate" double precision NOT NULL,
  "month_promotion_rate" double precision,
  "month_delivery_period" double precision,
  "month_return_rate" double precision,
  "cb_score_current" bigint,
  "cb_score_rank" bigint,
  "cb_score_change_rate" double precision NOT NULL,
  "reg_date" timestamp(6) NOT NULL,
  "modified_date" timestamp(6),
  PRIMARY KEY ("pcs_no")
);

CREATE TABLE IF NOT EXISTS "prizm_pms_result" (
  "pms_no" integer NOT NULL,
  "mbid" char(10) NOT NULL,
  "user_no" bigint NOT NULL,
  "pms_grade" varchar(100) NOT NULL,
  "pms_score" double precision NOT NULL,
  "sales_total_score" double precision NOT NULL,
  "manage_total_score" double precision NOT NULL,
  "bsvc" double precision NOT NULL,
  "bsqc" double precision NOT NULL,
  "baupc" double precision NOT NULL,
  "bdsr" double precision NOT NULL,
  "bprc" double precision NOT NULL,
  "brrc" double precision NOT NULL,
  "bstsc" double precision NOT NULL,
  "bdltc" double precision NOT NULL,
  "reg_date" timestamp(6) NOT NULL,
  "modified_date" timestamp(6),
  PRIMARY KEY ("pms_no")
);

CREATE TABLE IF NOT EXISTS "promotion" (
  "promo_code" varchar(255) NOT NULL,
  "promo_name" varchar(255),
  "promo_target" varchar(255),
  "partner_code" varchar(255),
  "charges" varchar(255),
  "status" varchar(255),
  "period" bigint,
  "period_unit" varchar(255),
  "sub_id" bigint,
  "discount_rate" bigint,
  "discount_amount" bigint,
  "promo_detail" varchar(255),
  "start_date" date,
  "expire_date" date,
  "reg_date" timestamp(6) NOT NULL,
  "update_date" timestamp(6),
  PRIMARY KEY ("promo_code")
);

CREATE TABLE IF NOT EXISTS "qna" (
  "qna_id" bigint NOT NULL,
  "user_no" bigint NOT NULL,
  "type" varchar(15) NOT NULL,
  "title" varchar(100) NOT NULL,
  "content" text NOT NULL,
  "visibility" bit(1) NOT NULL,
  "created_by" varchar(50),
  "last_modified_by" varchar(50),
  "reg_date" timestamp,
  "modified_date" timestamp,
  PRIMARY KEY ("qna_id")
);

CREATE TABLE IF NOT EXISTS "qna_reply" (
  "reply_id" bigint NOT NULL,
  "user_no" bigint NOT NULL,
  "content" text NOT NULL,
  "qna_id" bigint,
  "created_by" varchar(50),
  "last_modified_by" varchar(50),
  "reg_date" timestamp,
  "modified_date" timestamp,
  PRIMARY KEY ("reply_id")
);

CREATE TABLE IF NOT EXISTS "sale" (
  "sales_id" bigint NOT NULL,
  "shop_type" varchar(10) NOT NULL,
  "shop_id" varchar(30) NOT NULL,
  "order_no" varchar(20) NOT NULL,
  "product_no" varchar(20),
  "option_no" varchar(50),
  "status" varchar(20),
  "ordered_date" timestamp(6),
  "paid_date" timestamp(6),
  "shipment_date" timestamp(6),
  "delivered_date" timestamp(6),
  "confirm_date" timestamp(6),
  "settle_estimate_date" timestamp(6),
  "settle_complete_date" timestamp(6),
  "product_name" varchar(100),
  "option_name" varchar(100),
  "quantity" integer,
  "sales_unit_price" integer,
  "sales_amount" integer,
  "discount_amount" integer,
  "payment_amount" integer,
  "settle_estimate_amount" integer,
  "settlement_amount" integer,
  "pcc" varchar(20),
  "shipment_no" varchar(20),
  "seller_product_no" varchar(100),
  "canceled" varchar(20),
  "orderer_id" varchar(50),
  "orderer_name" varchar(30),
  "shipment_box_no" varchar(20),
  "option_sales_amount" integer,
  "delivery_method" varchar(20),
  "deduction_amount" integer,
  "oversea_delivery_yn" char(1),
  "shipping_policy" varchar(20),
  "instant_discount_coupon" integer,
  "downloadable_coupon" integer,
  "product_instant_discount_amount" integer,
  "product_discount_coupon_amount" integer,
  "product_purchase_discount_amount" integer,
  "seller_discount_coupon_amount" integer,
  "seller_purchase_discount_amount" integer,
  "seller_discounts_amount" integer,
  "seller_purchase_discount_type" integer,
  "shopping_mall_discount_amount" integer,
  "delivery_charges" integer,
  "delivery_charges2" integer,
  "order_amount" integer,
  "reg_date" timestamp(6),
  "modified_date" timestamp(6),
  PRIMARY KEY ("sales_id")
);
CREATE INDEX IF NOT EXISTS "idx_sale_UKiupekg46a2m5onek9sqjnk5xe" ON "sale" ("shop_type", "shop_id", "order_no", "product_no", "option_no");

CREATE TABLE IF NOT EXISTS "sale_return" (
  "returns_id" bigint NOT NULL,
  "shop_type" varchar(10) NOT NULL,
  "shop_id" varchar(30) NOT NULL,
  "order_no" varchar(20) NOT NULL,
  "product_no" varchar(20),
  "option_no" varchar(20),
  "status" varchar(20),
  "payment_amount" integer,
  "receipt_no" varchar(20),
  "claim_status" varchar(20),
  "payment_no" varchar(20),
  "receipt_type" varchar(20),
  "total_cancel_count" integer,
  "return_delivery_no" varchar(20),
  "release_stop_status" varchar(20),
  "pre_refund" varchar(10),
  "complete_confirm_type" varchar(20),
  "cancel_count" integer,
  "order_count" integer,
  "release_status" varchar(20),
  "reason_code" varchar(10),
  "request_date" timestamp(6),
  "claim_complete_date" timestamp(6),
  "reg_date" timestamp(6),
  "modified_date" timestamp(6),
  PRIMARY KEY ("returns_id")
);
CREATE INDEX IF NOT EXISTS "idx_sale_return_UKt8taoae5ijxayv5l2ka3t2yhx" ON "sale_return" ("shop_type", "shop_id", "order_no", "product_no", "option_no");

CREATE TABLE IF NOT EXISTS "settlement" (
  "settlements_id" bigint NOT NULL,
  "shop_type" varchar(10) NOT NULL,
  "shop_id" varchar(30) NOT NULL,
  "settlement_type" varchar(10),
  "settlement_date" timestamp(6),
  "total_sale" integer,
  "service_fee" integer,
  "settlement_target_amount" integer,
  "settlement_amount" integer,
  "pending_released_amount" integer,
  "seller_discount_coupon" integer,
  "downloadable_coupon" integer,
  "seller_service_fee" integer,
  "store_fee_discount" integer,
  "debt_of_last_week" integer,
  "bank_account_holder" varchar(20),
  "bank_name" varchar(20),
  "bank_account" varchar(30),
  "status" varchar(7),
  "reg_date" timestamp(6),
  "modified_date" timestamp(6),
  PRIMARY KEY ("settlements_id")
);
CREATE INDEX IF NOT EXISTS "idx_settlement_UK97tkrs0vw3rcvkc907o4iljc3" ON "settlement" ("shop_type", "shop_id", "settlement_type", "settlement_date");

CREATE TABLE IF NOT EXISTS "shop_accounts" (
  "id" bigint NOT NULL,
  "user_no" bigint,
  "shop_type" varchar(255),
  "shop_id" varchar(50),
  "shop_account_id" varchar(50),
  "shop_account_password" varchar(100),
  "vendor_id" varchar(20),
  "api_key" varchar(100),
  "api_secret_key" varchar(100) NOT NULL,
  "settlement" varchar(100),
  "status" char(1),
  "del_yn" char(1),
  "reg_date" timestamp(6),
  "modified_date" timestamp(6),
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "site_visitor" (
  "no" bigint NOT NULL,
  "today_visitor" integer,
  "current_month_visitor" integer,
  "previous_month_visitor" integer,
  "date" date,
  "reg_date" timestamp,
  PRIMARY KEY ("no")
);

CREATE TABLE IF NOT EXISTS "ticker" (
  "ticker_id" integer NOT NULL,
  "event_time" varchar(14) NOT NULL,
  "symbol" varchar(200) NOT NULL,
  "event_type" char(3) NOT NULL,
  "name" varchar(200),
  "market_price" decimal(22,4),
  "bithumb_price" decimal(22,4),
  "bithumb_traded" decimal(22,4),
  "upbit_price" decimal(22,4),
  "upbit_traded" decimal(22,4),
  "coinone_price" decimal(22,4),
  "coinone_traded" decimal(22,4),
  "korbit_price" decimal(22,4),
  "korbit_traded" decimal(22,4),
  "reg_date" timestamp,
  "modified_date" timestamp,
  PRIMARY KEY ("ticker_id")
);
CREATE INDEX IF NOT EXISTS "idx_ticker_UK_Event_Time_Type_Symbol" ON "ticker" ("event_time", "symbol", "event_type");
CREATE INDEX IF NOT EXISTS "idx_ticker_symbol_event_type_reg_date" ON "ticker" ("symbol", "event_type", "reg_date");

CREATE TABLE IF NOT EXISTS "TRADE_REQUEST_BIN" (
  "mbid" char(10),
  "REQ_TYPE" varchar(15),
  "REQ_DATE" char(8) NOT NULL,
  "REQ_TIME" char(6) NOT NULL,
  "SVC_TYPE" char(3),
  "BANK_CODE" char(3) NOT NULL,
  "COMP_CODE" char(8) NOT NULL,
  "SEQ_NO" char(6) NOT NULL,
  "MSG_CODE" char(7) NOT NULL,
  "SEND_FLAG" char(1) NOT NULL,
  "RECV_FLAG" char(1) NOT NULL,
  "SEND_DATE" char(8),
  "SEND_TIME" char(6),
  "RECV_DATE" char(8),
  "RECV_TIME" char(6),
  "SEND_MSG" varchar(2100),
  "RECV_MSG" varchar(2100),
  "BIN_DATA" bytea,
  "PROCESS_STATUS" varchar(7),
  "reg_date" timestamp,
  "modified_date" timestamp,
  PRIMARY KEY ("REQ_DATE", "BANK_CODE", "COMP_CODE", "SEQ_NO")
);
CREATE INDEX IF NOT EXISTS "idx_TRADE_REQUEST_BIN_TRADE_REQUEST_BIN_PK" ON "TRADE_REQUEST_BIN" ("REQ_DATE", "BANK_CODE", "COMP_CODE", "SEQ_NO");

CREATE TABLE IF NOT EXISTS "trade_result_inquiry" (
  "id" bigint NOT NULL,
  "mbid" char(10) NOT NULL,
  "send_date" char(8) NOT NULL,
  "send_time" char(6) NOT NULL,
  "svc_type" char(3),
  "message_code" char(4) NOT NULL,
  "business_class_code" char(4) NOT NULL,
  "processing_result" char(4),
  "full_text_number" char(6) NOT NULL,
  "original_processing_result" char(4),
  "original_full_text_number" char(6),
  "payer_number" varchar(20),
  "withdrawal_bank_code" char(3),
  "withdrawal_account_number" varchar(100),
  "deposit_bank_code" char(3),
  "deposit_account_number" varchar(100),
  "result_amount" integer,
  "result_fee" integer,
  "payment_number" varchar(15),
  "transfer_time" char(6),
  "processing_status" varchar(7),
  "reg_date" timestamp,
  "modified_date" timestamp,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "users" (
  "user_no" bigint NOT NULL,
  "email" varchar(50) NOT NULL,
  "password" varchar(100) NOT NULL,
  "user_type" varchar(20),
  "name" varchar(50),
  "phone" varchar(20),
  "zip_code" char(5),
  "address" varchar(300),
  "biz_num" char(10),
  "biz_name" varchar(50),
  "biz_setup_date" varchar(8),
  "biz_type" varchar(20),
  "sectors" varchar(30),
  "partner_code" varchar(10),
  "fintech_id" bigint,
  "last_login_date" timestamp,
  "reg_date" timestamp,
  "modified_date" timestamp,
  PRIMARY KEY ("user_no")
);

CREATE TABLE IF NOT EXISTS "warning" (
  "id" bigint NOT NULL,
  "mbid" char(10) NOT NULL,
  "content" text,
  "status" varchar(20),
  "reg_date" timestamp,
  PRIMARY KEY ("id")
);
