create table if not exists raw_data_export_audit (
    export_audit_id bigserial primary key,
    admin_user_no bigint not null,
    table_name varchar(100) not null,
    selected_columns text[] not null,
    from_date date,
    to_date date,
    requested_limit integer not null,
    exported_rows integer not null,
    file_sha256 char(64) not null,
    status varchar(20) not null default 'SUCCESS',
    requested_at timestamp not null default now(),
    constraint ck_raw_data_export_audit_limit check (requested_limit between 1 and 5000),
    constraint ck_raw_data_export_audit_rows check (exported_rows between 0 and 5000)
);

create index if not exists ix_raw_data_export_audit_requested_at
    on raw_data_export_audit (requested_at desc);

create index if not exists ix_raw_data_export_audit_admin_user_no
    on raw_data_export_audit (admin_user_no, requested_at desc);
