# Cubici PostgreSQL Status Count Verification

작성일: 2026-06-30

## 요약

- 검증 컬럼 수: 106
- 불일치 컬럼 수: 0
- 코드 값 원문은 문서에 기록하지 않았다.

## 컬럼별 검증

| Table | Column | Expected Distinct | Actual Distinct | Mismatch Categories |
|---|---|---:|---:|---:|
| `api_report` | `api_type` | 1 | 1 | 0 |
| `api_report` | `shop_type` | 3 | 3 | 0 |
| `api_report` | `status` | 1 | 1 | 0 |
| `attach_file` | `type` | 4 | 4 | 0 |
| `CBCI_FILE` | `enc_type` | 2 | 2 | 0 |
| `charge` | `charge_code` | 5 | 5 | 0 |
| `charge` | `charge_type` | 2 | 2 | 0 |
| `faq` | `type` | 5 | 5 | 0 |
| `fintech` | `fintech_bank_code` | 2 | 2 | 0 |
| `fintech` | `fintech_prd_code` | 2 | 2 | 0 |
| `fintech` | `fintech_pay_code` | 2 | 2 | 0 |
| `fintech` | `process_type` | 2 | 2 | 0 |
| `fintech_info` | `ks_code` | 1 | 1 | 0 |
| `fintech_info` | `comp_code` | 1 | 1 | 0 |
| `fintech_info` | `fac_code` | 1 | 1 | 0 |
| `fintech_info` | `send_code` | 1 | 1 | 0 |
| `fintech_info` | `recv_code` | 1 | 1 | 0 |
| `fintech_request` | `fintech_product_code` | 1 | 1 | 0 |
| `fintech_request` | `request_code` | 159 | 159 | 0 |
| `fintech_request` | `status` | 1 | 1 | 0 |
| `fintech_request` | `product_type` | 1 | 1 | 0 |
| `fintech_request` | `process_type` | 2 | 2 | 0 |
| `firm_request_bin` | `req_type` | 3 | 3 | 0 |
| `firm_request_bin` | `comp_code` | 1 | 1 | 0 |
| `firm_request_bin` | `out_bank_code` | 2 | 2 | 0 |
| `firm_request_bin` | `in_bank_code` | 2 | 2 | 0 |
| `firm_request_bin` | `reply_code` | 1 | 1 | 0 |
| `firm_request_bin` | `success_yn` | 1 | 1 | 0 |
| `hyphen_bank_bin` | `info_code` | 2 | 2 | 0 |
| `hyphen_bank_bin` | `bank_code` | 2 | 2 | 0 |
| `hyphen_bank_bin` | `result` | 3 | 3 | 0 |
| `hyphen_bank_bin` | `error_code` | 3 | 3 | 0 |
| `message_template` | `msg_code` | 6 | 6 | 0 |
| `moneybank_advance_contract` | `business_type` | 1 | 1 | 0 |
| `moneybank_advance_contract` | `success` | 1 | 1 | 0 |
| `moneybank_contract` | `product_code` | 1 | 1 | 0 |
| `moneybank_contract` | `status` | 3 | 3 | 0 |
| `moneybank_contract` | `payer_status` | 2 | 2 | 0 |
| `moneybank_contract` | `demand_acc_bank_code` | 3 | 3 | 0 |
| `moneybank_contract` | `main_acc_bank_code` | 3 | 3 | 0 |
| `moneybank_contract_document` | `tax_type` | 2 | 2 | 0 |
| `moneybank_contract_document` | `debt_status` | 2 | 2 | 0 |
| `moneybank_contract_document` | `financial_disorder_status` | 2 | 2 | 0 |
| `moneybank_contract_document` | `public_information_status` | 2 | 2 | 0 |
| `moneybank_contract_document` | `overdue_status` | 2 | 2 | 0 |
| `moneybank_contract_document` | `cb_check` | 3 | 3 | 0 |
| `moneybank_contract_document` | `cb_confirm_admin` | 2 | 2 | 0 |
| `moneybank_contract_document` | `final_confirm_admin` | 2 | 2 | 0 |
| `moneybank_contract_fee_rates` | `fee_type` | 5 | 5 | 0 |
| `moneybank_contract_shop` | `contract_shop_type` | 5 | 5 | 0 |
| `moneybank_redemption_deposit` | `deposit_code` | 399 | 399 | 0 |
| `moneybank_redemption_deposit` | `repayment_code` | 189 | 189 | 0 |
| `moneybank_redemption_provision` | `request_code` | 280 | 280 | 0 |
| `moneybank_redemption_provision` | `provision_code` | 538 | 538 | 0 |
| `moneybank_redemption_provision` | `status` | 2 | 2 | 0 |
| `moneybank_redemption_repayment` | `repayment_code` | 339 | 339 | 0 |
| `moneybank_redemption_repayment` | `status` | 1 | 1 | 0 |
| `moneybank_redemption_sales` | `request_code` | 280 | 280 | 0 |
| `moneybank_redemption_sales` | `sales_code` | 2098 | 2098 | 0 |
| `moneybank_redemption_sales` | `class_code` | 5 | 5 | 0 |
| `notice` | `type` | 3 | 3 | 0 |
| `partner` | `partner_code` | 4 | 4 | 0 |
| `partner` | `partner_status` | 1 | 1 | 0 |
| `partner` | `partner_type` | 3 | 3 | 0 |
| `partner_manager` | `partner_code` | 1 | 1 | 0 |
| `partner_manager` | `manager_type` | 2 | 2 | 0 |
| `promotion` | `promo_code` | 1 | 1 | 0 |
| `promotion` | `partner_code` | 1 | 1 | 0 |
| `promotion` | `status` | 1 | 1 | 0 |
| `qna` | `type` | 1 | 1 | 0 |
| `sale` | `shop_type` | 5 | 5 | 0 |
| `sale` | `status` | 16 | 16 | 0 |
| `sale` | `oversea_delivery_yn` | 2 | 2 | 0 |
| `sale` | `seller_purchase_discount_type` | 2 | 2 | 0 |
| `sale_return` | `shop_type` | 5 | 5 | 0 |
| `sale_return` | `status` | 11 | 11 | 0 |
| `sale_return` | `claim_status` | 6 | 6 | 0 |
| `sale_return` | `receipt_type` | 3 | 3 | 0 |
| `sale_return` | `release_stop_status` | 3 | 3 | 0 |
| `sale_return` | `complete_confirm_type` | 4 | 4 | 0 |
| `sale_return` | `release_status` | 4 | 4 | 0 |
| `sale_return` | `reason_code` | 1 | 1 | 0 |
| `settlement` | `shop_type` | 5 | 5 | 0 |
| `settlement` | `settlement_type` | 4 | 4 | 0 |
| `settlement` | `status` | 2 | 2 | 0 |
| `shop_accounts` | `shop_type` | 5 | 5 | 0 |
| `shop_accounts` | `status` | 2 | 2 | 0 |
| `shop_accounts` | `del_yn` | 1 | 1 | 0 |
| `ticker` | `event_type` | 2 | 2 | 0 |
| `TRADE_REQUEST_BIN` | `REQ_TYPE` | 8 | 8 | 0 |
| `TRADE_REQUEST_BIN` | `SVC_TYPE` | 3 | 3 | 0 |
| `TRADE_REQUEST_BIN` | `BANK_CODE` | 1 | 1 | 0 |
| `TRADE_REQUEST_BIN` | `COMP_CODE` | 2 | 2 | 0 |
| `TRADE_REQUEST_BIN` | `MSG_CODE` | 6 | 6 | 0 |
| `TRADE_REQUEST_BIN` | `PROCESS_STATUS` | 1 | 1 | 0 |
| `trade_result_inquiry` | `svc_type` | 2 | 2 | 0 |
| `trade_result_inquiry` | `message_code` | 1 | 1 | 0 |
| `trade_result_inquiry` | `business_class_code` | 3 | 3 | 0 |
| `trade_result_inquiry` | `withdrawal_bank_code` | 1 | 1 | 0 |
| `trade_result_inquiry` | `deposit_bank_code` | 6 | 6 | 0 |
| `trade_result_inquiry` | `processing_status` | 1 | 1 | 0 |
| `users` | `user_type` | 3 | 3 | 0 |
| `users` | `zip_code` | 15 | 15 | 0 |
| `users` | `biz_type` | 4 | 4 | 0 |
| `users` | `partner_code` | 2 | 2 | 0 |
| `warning` | `status` | 0 | 0 | 0 |
