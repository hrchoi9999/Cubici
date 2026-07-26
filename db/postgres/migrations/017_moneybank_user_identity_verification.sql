alter table moneybank_contract
    add column if not exists identity_verification_method varchar(20),
    add column if not exists identity_verification_status varchar(20),
    add column if not exists identity_verification_reference varchar(100),
    add column if not exists identity_verified_at timestamp;

create index if not exists ix_moneybank_contract_identity_verification
    on moneybank_contract (identity_verification_status, identity_verified_at);
