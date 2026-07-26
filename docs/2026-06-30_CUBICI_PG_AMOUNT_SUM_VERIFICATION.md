# Cubici PostgreSQL Amount Sum Verification

작성일: 2026-06-30

## 요약

- 검증 컬럼 수: 74
- 불일치 컬럼 수: 0
- tolerance: 0.000001

## 컬럼별 검증

| Table | Column | Expected Sum | Actual Sum | Diff |
|---|---|---:|---:|---:|
| `charge` | `amount` | 104000 | 104000 | 0 |
| `fintech` | `fintech_interest_rate` | 25.00 | 25.00 | 0.00 |
| `fintech_request` | `request_amount` | 21318788 | 21318788 | 0 |
| `fintech_request` | `interest_rate` | 1925.00 | 1925.00 | 0.00 |
| `firm_request_bin` | `amount` | 1373704 | 1373704 | 0 |
| `firm_request_bin` | `balance` | 14690535 | 14690535 | 0 |
| `firm_request_bin` | `svc_charge` | 17400 | 17400 | 0 |
| `hyphen_bank_bin` | `req_amount` | 64559829 | 64559829 | 0 |
| `hyphen_bank_bin` | `res_amount` | 754523 | 754523 | 0 |
| `hyphen_bank_bin` | `fail_amount` | 48376094 | 48376094 | 0 |
| `moneybank_contract` | `sales_amount` | 52771210 | 52771210 | 0 |
| `moneybank_contract_document` | `health_insurance_paid_amount` | 0 | 0 | 0 |
| `moneybank_contract_fee` | `payment_rate` | 480 | 480 | 0 |
| `moneybank_contract_fee` | `sales_limit_per_order` | 18000000 | 18000000 | 0 |
| `moneybank_contract_fee` | `max_outstanding_balance` | 30000000 | 30000000 | 0 |
| `moneybank_contract_fee_rates` | `contract_fee_id` | 66 | 66 | 0 |
| `moneybank_contract_fee_rates` | `fee_rate` | 17.00 | 17.00 | 0.00 |
| `moneybank_redemption_deposit` | `deposit_amount` | 35353295 | 35353295 | 0 |
| `moneybank_redemption_history` | `cumulative_provision_amount` | 7075541180 | 7075541180 | 0 |
| `moneybank_redemption_history` | `cumulative_repayment_amount` | 6988933951 | 6988933951 | 0 |
| `moneybank_redemption_history` | `outstanding_balance` | 86610845 | 86610845 | 0 |
| `moneybank_redemption_provision` | `total_payment_amount` | 69766185 | 69766185 | 0 |
| `moneybank_redemption_provision` | `total_usage_fee` | 358346 | 358346 | 0 |
| `moneybank_redemption_provision` | `total_provision_amount` | 55686548 | 55686548 | 0 |
| `moneybank_redemption_repayment` | `repayment_amount` | 54772944 | 54772944 | 0 |
| `moneybank_redemption_repayment` | `repayment_usage_fee` | 566016 | 566016 | 0 |
| `moneybank_redemption_repayment` | `remittance_fee` | 288300 | 288300 | 0 |
| `moneybank_redemption_repayment` | `balance_provision_amount` | 11933671 | 11933671 | 0 |
| `moneybank_redemption_sales` | `payment_amount` | 69174385 | 69174385 | 0 |
| `moneybank_redemption_sales` | `usage_fee` | 358346 | 358346 | 0 |
| `moneybank_redemption_sales` | `provision_amount` | 55339508 | 55339508 | 0 |
| `prizm_pcs_result` | `month_sales_value` | 119869410 | 119869410 | 0 |
| `prizm_pcs_result` | `month_sales_quantity` | 5412 | 5412 | 0 |
| `prizm_pcs_result` | `month_settlement_amount` | 151949811 | 151949811 | 0 |
| `prizm_pcs_result` | `month_settlement_to_sales_rate` | 352.054 | 352.05400000000014 | 1.4E-13 |
| `prizm_pcs_result` | `month_promotion_rate` | 252.067 | 252.06699999999998 | -2E-14 |
| `prizm_pcs_result` | `month_return_rate` | 536.000 | 536 | 0.000 |
| `prizm_pcs_result` | `cb_score_change_rate` | 163.750 | 163.75 | 0.000 |
| `prizm_pms_result` | `sales_total_score` | 2708.000 | 2708 | 0.000 |
| `promotion` | `discount_rate` | 0 | 0 | 0 |
| `promotion` | `discount_amount` | 0 | 0 | 0 |
| `sale` | `sales_id` | 2907221 | 2907221 | 0 |
| `sale` | `sales_unit_price` | 95640755 | 95640755 | 0 |
| `sale` | `sales_amount` | 103241815 | 103241815 | 0 |
| `sale` | `discount_amount` | 29400 | 29400 | 0 |
| `sale` | `payment_amount` | 67620025 | 67620025 | 0 |
| `sale` | `settle_estimate_amount` | 63780217 | 63780217 | 0 |
| `sale` | `settlement_amount` | 61249667 | 61249667 | 0 |
| `sale` | `option_sales_amount` | 690 | 690 | 0 |
| `sale` | `deduction_amount` | 0 | 0 | 0 |
| `sale` | `product_instant_discount_amount` | 36073770 | 36073770 | 0 |
| `sale` | `product_discount_coupon_amount` | 36073770 | 36073770 | 0 |
| `sale` | `product_purchase_discount_amount` | 0 | 0 | 0 |
| `sale` | `seller_discount_coupon_amount` | 36073770 | 36073770 | 0 |
| `sale` | `seller_purchase_discount_amount` | 249640 | 249640 | 0 |
| `sale` | `seller_discounts_amount` | 36634470 | 36634470 | 0 |
| `sale` | `shopping_mall_discount_amount` | 72190 | 72190 | 0 |
| `sale` | `delivery_charges` | 6814200 | 6814200 | 0 |
| `sale` | `delivery_charges2` | 67000 | 67000 | 0 |
| `sale` | `order_amount` | 66585645 | 66585645 | 0 |
| `sale_return` | `payment_amount` | 20931630 | 20931630 | 0 |
| `settlement` | `service_fee` | 181063 | 181063 | 0 |
| `settlement` | `settlement_target_amount` | 1554437 | 1554437 | 0 |
| `settlement` | `settlement_amount` | 61554507 | 61554507 | 0 |
| `settlement` | `pending_released_amount` | 0 | 0 | 0 |
| `settlement` | `seller_service_fee` | 0 | 0 | 0 |
| `settlement` | `store_fee_discount` | 0 | 0 | 0 |
| `ticker` | `market_price` | 2857675510809.2451 | 2857675510809.2451 | 0.0000 |
| `ticker` | `bithumb_price` | 2503154214023.7914 | 2503154214023.7914 | 0.0000 |
| `ticker` | `upbit_price` | 2428947116603.4396 | 2428947116603.4396 | 0.0000 |
| `ticker` | `coinone_price` | 2772898649731.8349 | 2772898649731.8349 | 0.0000 |
| `ticker` | `korbit_price` | 2825515244890.2460 | 2825515244890.2460 | 0.0000 |
| `trade_result_inquiry` | `result_amount` | 230180397 | 230180397 | 0 |
| `trade_result_inquiry` | `result_fee` | 0 | 0 | 0 |
