create table if not exists prizm_item_update_record (
    record_id bigserial primary key,
    division bigint not null,
    subject_no bigint not null,
    item_no bigint not null,
    item_name varchar(255),
    admin_id varchar(100),
    update_memo varchar(1000),
    before_payload jsonb not null,
    after_payload jsonb not null,
    reg_date timestamp not null default now()
);

create index if not exists ix_prizm_item_update_record_item
    on prizm_item_update_record (division, subject_no, item_no, reg_date desc);

create index if not exists ix_prizm_item_update_record_reg_date
    on prizm_item_update_record (reg_date desc);
