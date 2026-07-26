create table if not exists cbci_err_report (
  shop_id varchar(100),
  code_id varchar(30),
  code_nm varchar(100),
  cause text,
  input_datetime timestamp,
  runtime integer,
  error_log text
);

create table if not exists cbci_scheduled_report (
  shop_id varchar(100),
  shop_type varchar(30),
  shop_nm varchar(100),
  scheduled_name text,
  input_date timestamp,
  runtime integer
);

create index if not exists idx_cbci_err_report_input_datetime on cbci_err_report (input_datetime desc);
create index if not exists idx_cbci_err_report_code_id on cbci_err_report (code_id);
create index if not exists idx_cbci_scheduled_report_input_date on cbci_scheduled_report (input_date desc);
create index if not exists idx_cbci_scheduled_report_shop_type on cbci_scheduled_report (shop_type);
