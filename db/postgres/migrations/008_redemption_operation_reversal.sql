alter table moneybank_redemption_operation_history
    add column if not exists is_reversal boolean not null default false,
    add column if not exists reversed_operation_history_id bigint,
    add column if not exists canceled_by_operation_history_id bigint;

create unique index if not exists ux_redemption_operation_history_reversed_once
    on moneybank_redemption_operation_history (reversed_operation_history_id)
    where is_reversal = true and reversed_operation_history_id is not null;

create index if not exists idx_redemption_operation_history_reversal_refs
    on moneybank_redemption_operation_history (
        reversed_operation_history_id,
        canceled_by_operation_history_id
    );
