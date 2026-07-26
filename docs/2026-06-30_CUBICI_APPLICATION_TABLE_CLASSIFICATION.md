# Cubici Application Table Classification

작성일: 2026-06-30

## 요약

- 전체 테이블 수: 72
- 애플리케이션 테이블 후보: 45
- MySQL 시스템 테이블 제외 후보: 27
- 애플리케이션 dump row count: 2052607

## 애플리케이션 테이블 후보

| Table | Columns | PK | Dump Rows |
|---|---:|---|---:|
| `api_report` | 8 | `api_no` | 640 |
| `attach_file` | 13 | `uuid` | 14 |
| `CBCI_FILE` | 10 | `uuid` | 12 |
| `charge` | 14 | `charge_code` | 5 |
| `faq` | 9 | `faq_id` | 31 |
| `fintech` | 12 | `id` | 2 |
| `fintech_info` | 11 | `fintech_id` | 1 |
| `fintech_request` | 15 | `id` | 159 |
| `firm_request_bin` | 18 | `comp_code, req_date, seq_no` | 48 |
| `holiday` | 2 | `date` | 91 |
| `hyphen_bank_bin` | 16 | `hyphen_bank_no` | 137 |
| `hyphen_bank_code` | 2 | `code` | 158 |
| `message_auth` | 5 | `auth_no` | 92 |
| `message_template` | 10 | `message_no` | 8 |
| `moneybank_advance_contract` | 10 | `advance_contract_id` | 4 |
| `moneybank_contract` | 24 | `mbid` | 7 |
| `moneybank_contract_certificate` | 8 | `mbid` | 1 |
| `moneybank_contract_document` | 20 | `mbid` | 6 |
| `moneybank_contract_fee` | 9 | `id` | 6 |
| `moneybank_contract_fee_rates` | 6 | `id` | 17 |
| `moneybank_contract_shop` | 6 | `id` | 12 |
| `moneybank_redemption_deposit` | 7 | `id` | 399 |
| `moneybank_redemption_history` | 6 | `id` | 388 |
| `moneybank_redemption_provision` | 11 | `id` | 538 |
| `moneybank_redemption_repayment` | 11 | `id` | 339 |
| `moneybank_redemption_sales` | 12 | `id` | 2098 |
| `notice` | 9 | `notice_id` | 5 |
| `partner` | 12 | `partner_id` | 4 |
| `partner_manager` | 8 | `manager_type, partner_code` | 2 |
| `prizm_items` | 16 | `division, subject_no, item_no` | 26 |
| `prizm_pcs_result` | 21 | `pcs_no` | 536 |
| `prizm_pms_result` | 17 | `pms_no` | 44 |
| `promotion` | 16 | `promo_code` | 1 |
| `qna` | 10 | `qna_id` | 1 |
| `qna_reply` | 8 | `reply_id` | 1 |
| `sale` | 50 | `sales_id` | 2390 |
| `sale_return` | 25 | `returns_id` | 775 |
| `settlement` | 21 | `settlements_id` | 469 |
| `shop_accounts` | 14 | `id` | 19 |
| `site_visitor` | 6 | `no` | 253 |
| `ticker` | 16 | `ticker_id` | 2036608 |
| `TRADE_REQUEST_BIN` | 21 | `REQ_DATE, BANK_CODE, COMP_CODE, SEQ_NO` | 4142 |
| `trade_result_inquiry` | 23 | `id` | 2073 |
| `users` | 18 | `user_no` | 45 |
| `warning` | 5 | `id` | 0 |

## 제외 후보: MySQL 시스템 테이블

| Table | Columns | Dump Rows |
|---|---:|---:|
| `column_stats` | 11 | 0 |
| `columns_priv` | 7 | 0 |
| `db` | 23 | 3 |
| `event` | 22 | 0 |
| `func` | 4 | 0 |
| `global_priv` | 3 | 12 |
| `gtid_slave_pos` | 4 | 1 |
| `help_category` | 4 | 44 |
| `help_keyword` | 2 | 16 |
| `help_relation` | 2 | 36 |
| `help_topic` | 6 | 958 |
| `index_stats` | 5 | 0 |
| `innodb_index_stats` | 8 | 218 |
| `innodb_table_stats` | 6 | 48 |
| `plugin` | 2 | 0 |
| `proc` | 21 | 3 |
| `procs_priv` | 8 | 0 |
| `proxies_priv` | 7 | 2 |
| `roles_mapping` | 4 | 0 |
| `servers` | 9 | 0 |
| `table_stats` | 3 | 0 |
| `tables_priv` | 8 | 5 |
| `time_zone` | 2 | 0 |
| `time_zone_leap_second` | 2 | 0 |
| `time_zone_name` | 2 | 0 |
| `time_zone_transition` | 3 | 0 |
| `time_zone_transition_type` | 5 | 0 |

## 판단

- PostgreSQL 1차 전환 대상은 애플리케이션 테이블 후보로 제한한다.
- MySQL 권한/시스템 테이블은 서비스 DB 재현 대상에서 제외한다.
- 제외 여부는 기존 Java/MyBatis 참조 여부 점검 후 최종 확정한다.
