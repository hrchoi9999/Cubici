# Cubici MySQL Schema Inventory

작성일: 2026-06-30

## 검증 원칙

- 원본 INSERT 값은 출력하지 않았다.
- 테이블, 컬럼, PK, index, dump 내 INSERT row count만 기록했다.
- row count는 dump INSERT tuple separator 기준 산출값이므로 PostgreSQL 적재 후 재검증한다.

## 요약

- 테이블 수: 72
- dump INSERT row count 합계: 2053953

## 테이블 목록

| Table | Columns | PK | Keys | Dump Rows |
|---|---:|---|---:|---:|
| `api_report` | 8 | `api_no` | 0 | 640 |
| `attach_file` | 13 | `uuid` | 0 | 14 |
| `CBCI_FILE` | 10 | `uuid` | 0 | 12 |
| `charge` | 14 | `charge_code` | 0 | 5 |
| `column_stats` | 11 | `db_name, table_name, column_name` | 0 | 0 |
| `columns_priv` | 7 | `Host, Db, User, Table_name, Column_name` | 0 | 0 |
| `db` | 23 | `Host, Db, User` | 1 | 3 |
| `event` | 22 | `db, name` | 0 | 0 |
| `faq` | 9 | `faq_id` | 0 | 31 |
| `fintech` | 12 | `id` | 1 | 2 |
| `fintech_info` | 11 | `fintech_id` | 0 | 1 |
| `fintech_request` | 15 | `id` | 1 | 159 |
| `firm_request_bin` | 18 | `comp_code, req_date, seq_no` | 0 | 48 |
| `func` | 4 | `name` | 0 | 0 |
| `global_priv` | 3 | `Host, User` | 0 | 12 |
| `gtid_slave_pos` | 4 | `domain_id, sub_id` | 0 | 1 |
| `help_category` | 4 | `help_category_id` | 1 | 44 |
| `help_keyword` | 2 | `help_keyword_id` | 1 | 16 |
| `help_relation` | 2 | `help_keyword_id, help_topic_id` | 1 | 36 |
| `help_topic` | 6 | `help_topic_id` | 1 | 958 |
| `holiday` | 2 | `date` | 0 | 91 |
| `hyphen_bank_bin` | 16 | `hyphen_bank_no` | 0 | 137 |
| `hyphen_bank_code` | 2 | `code` | 0 | 158 |
| `index_stats` | 5 | `db_name, table_name, index_name, prefix_arity` | 0 | 0 |
| `innodb_index_stats` | 8 | `database_name, table_name, index_name, stat_name` | 0 | 218 |
| `innodb_table_stats` | 6 | `database_name, table_name` | 0 | 48 |
| `message_auth` | 5 | `auth_no` | 0 | 92 |
| `message_template` | 10 | `message_no` | 0 | 8 |
| `moneybank_advance_contract` | 10 | `advance_contract_id` | 0 | 4 |
| `moneybank_contract` | 24 | `mbid` | 0 | 7 |
| `moneybank_contract_certificate` | 8 | `mbid` | 0 | 1 |
| `moneybank_contract_document` | 20 | `mbid` | 0 | 6 |
| `moneybank_contract_fee` | 9 | `id` | 0 | 6 |
| `moneybank_contract_fee_rates` | 6 | `id` | 0 | 17 |
| `moneybank_contract_shop` | 6 | `id` | 0 | 12 |
| `moneybank_redemption_deposit` | 7 | `id` | 1 | 399 |
| `moneybank_redemption_history` | 6 | `id` | 0 | 388 |
| `moneybank_redemption_provision` | 11 | `id` | 2 | 538 |
| `moneybank_redemption_repayment` | 11 | `id` | 1 | 339 |
| `moneybank_redemption_sales` | 12 | `id` | 2 | 2098 |
| `notice` | 9 | `notice_id` | 0 | 5 |
| `partner` | 12 | `partner_id` | 0 | 4 |
| `partner_manager` | 8 | `manager_type, partner_code` | 0 | 2 |
| `plugin` | 2 | `name` | 0 | 0 |
| `prizm_items` | 16 | `division, subject_no, item_no` | 0 | 26 |
| `prizm_pcs_result` | 21 | `pcs_no` | 0 | 536 |
| `prizm_pms_result` | 17 | `pms_no` | 0 | 44 |
| `proc` | 21 | `db, name, type` | 0 | 3 |
| `procs_priv` | 8 | `Host, Db, User, Routine_name, Routine_type` | 1 | 0 |
| `promotion` | 16 | `promo_code` | 0 | 1 |
| `proxies_priv` | 7 | `Host, User, Proxied_host, Proxied_user` | 1 | 2 |
| `qna` | 10 | `qna_id` | 0 | 1 |
| `qna_reply` | 8 | `reply_id` | 0 | 1 |
| `roles_mapping` | 4 | `` | 1 | 0 |
| `sale` | 50 | `sales_id` | 1 | 2390 |
| `sale_return` | 25 | `returns_id` | 1 | 775 |
| `servers` | 9 | `Server_name` | 0 | 0 |
| `settlement` | 21 | `settlements_id` | 1 | 469 |
| `shop_accounts` | 14 | `id` | 0 | 19 |
| `site_visitor` | 6 | `no` | 0 | 253 |
| `table_stats` | 3 | `db_name, table_name` | 0 | 0 |
| `tables_priv` | 8 | `Host, Db, User, Table_name` | 1 | 5 |
| `ticker` | 16 | `ticker_id` | 2 | 2036608 |
| `time_zone` | 2 | `Time_zone_id` | 0 | 0 |
| `time_zone_leap_second` | 2 | `Transition_time` | 0 | 0 |
| `time_zone_name` | 2 | `Name` | 0 | 0 |
| `time_zone_transition` | 3 | `Time_zone_id, Transition_time` | 0 | 0 |
| `time_zone_transition_type` | 5 | `Time_zone_id, Transition_type_id` | 0 | 0 |
| `TRADE_REQUEST_BIN` | 21 | `REQ_DATE, BANK_CODE, COMP_CODE, SEQ_NO` | 1 | 4142 |
| `trade_result_inquiry` | 23 | `id` | 0 | 2073 |
| `users` | 18 | `user_no` | 0 | 45 |
| `warning` | 5 | `id` | 0 | 0 |

## 다음 액션

- MySQL type을 PostgreSQL type으로 매핑한다.
- PostgreSQL DDL 초안을 생성하고 수작업 검토한다.
- 실제 적재 후 row count, 금액 합계, 상태별 건수를 재검증한다.
