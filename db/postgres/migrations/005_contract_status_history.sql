CREATE TABLE IF NOT EXISTS contract_status_history (
    id bigserial PRIMARY KEY,
    mbid char(10) NOT NULL,
    previous_status varchar(20),
    new_status varchar(20) NOT NULL,
    action varchar(20) NOT NULL,
    changed_by varchar(50) NOT NULL,
    reason text,
    reg_date timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contract_status_history_mbid_reg_date
    ON contract_status_history (mbid, reg_date DESC, id DESC);
