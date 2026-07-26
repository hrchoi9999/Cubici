alter table moneybank_contract
    add column if not exists electronic_signature_method varchar(30),
    add column if not exists electronic_signature_status varchar(30),
    add column if not exists electronic_signature_reference varchar(100),
    add column if not exists electronic_signed_at timestamp;

create index if not exists ix_moneybank_contract_electronic_signature
    on moneybank_contract (electronic_signature_status, electronic_signed_at);
