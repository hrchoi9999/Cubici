create table if not exists prizm_raw_data_formula (
    raw_data_no bigserial primary key,
    raw_data_division varchar(2) not null,
    raw_data_id varchar(100) not null,
    raw_data_shop varchar(50),
    raw_data_title varchar(255) not null,
    raw_data_content text not null,
    reg_date timestamp not null default now(),
    update_date timestamp
);

create index if not exists ix_prizm_raw_data_formula_lookup
    on prizm_raw_data_formula (raw_data_division, raw_data_id, raw_data_shop);
