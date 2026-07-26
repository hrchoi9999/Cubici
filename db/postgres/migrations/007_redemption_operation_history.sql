create table if not exists moneybank_redemption_operation_history (
    id bigserial primary key,
    mbid char(10) not null,
    operation_type varchar(30) not null,
    operation_code varchar(30) not null,
    related_table varchar(80) not null,
    related_id bigint,
    previous_cumulative_provision_amount bigint,
    previous_cumulative_repayment_amount bigint,
    previous_outstanding_balance bigint,
    new_cumulative_provision_amount bigint,
    new_cumulative_repayment_amount bigint,
    new_outstanding_balance bigint,
    payload jsonb not null default '{}'::jsonb,
    operated_by varchar(50) not null,
    reason text,
    reg_date timestamp not null default now()
);

create index if not exists idx_redemption_operation_history_mbid_reg_date
    on moneybank_redemption_operation_history (mbid, reg_date desc, id desc);

create unique index if not exists ux_redemption_operation_history_type_code
    on moneybank_redemption_operation_history (operation_type, operation_code);
