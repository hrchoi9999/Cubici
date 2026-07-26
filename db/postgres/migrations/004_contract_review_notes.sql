CREATE TABLE IF NOT EXISTS contract_review_note (
    id bigserial PRIMARY KEY,
    mbid char(10) NOT NULL,
    eval_subject varchar(20) NOT NULL DEFAULT '신청',
    reviewer varchar(50) NOT NULL,
    title varchar(100) NOT NULL,
    detail text NOT NULL,
    reg_date timestamp NOT NULL DEFAULT now(),
    modified_date timestamp
);

CREATE INDEX IF NOT EXISTS idx_contract_review_note_mbid_reg_date
    ON contract_review_note (mbid, reg_date DESC, id DESC);
