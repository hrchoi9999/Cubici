create table if not exists contract_fee_adjustment_history (
    id bigserial primary key,
    mbid char(10) not null,
    contract_fee_id bigint,
    previous_payment_rate bigint,
    new_payment_rate bigint,
    previous_sales_limit_per_order bigint,
    new_sales_limit_per_order bigint,
    previous_max_outstanding_balance bigint,
    new_max_outstanding_balance bigint,
    previous_fee_rates jsonb not null default '[]'::jsonb,
    new_fee_rates jsonb not null default '[]'::jsonb,
    adjusted_by varchar(50) not null,
    reason text not null,
    reg_date timestamp not null default now()
);

create index if not exists idx_contract_fee_adjustment_history_mbid_reg_date
    on contract_fee_adjustment_history (mbid, reg_date desc, id desc);
