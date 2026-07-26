export function formatContractStatus(value) {
  const labels = {
    JOIN: '대기',
    REQUEST: '신청접수',
    PENDING_REVIEW: '심사대기',
    PENDING_DOCUMENTS: '서류보완',
    DOCUMENTS_CONFIRMED: '서류확인',
    CONDITIONS_ACCEPT: '조건제시',
    USE_AGREE: '이용조건 동의',
    CONDITIONS_REFUSED: '조건거부',
    TERMS_REFUSED: '동의거부',
    ACCOUNT_STANDBY: '계좌대기',
    CONTRACT: '계약완료',
    REJECTED: '거절',
    TERMINATION_REQUEST: '해지신청',
    SELF_TERMINATION: '해지',
    FORCE_TERMINATION: '강제해지',
    ACCOUNT_CLOSED: '계좌해지',
    TERMINATION: '해지',
    EXPIRED: '만료',
    '00': '사전심사 완료',
    '01': '신청접수',
    '02': '서류확인',
    '03': '심사대기',
    '04': '조건제시',
    '05': '이용조건 동의',
    '06': '계약완료',
    '07': '계약만료',
    '41': '조건거부',
    '51': '동의거부',
    '71': '해지신청',
    '72': '본인해지',
    '73': '강제해지',
    '81': '계좌대기',
    '82': '계좌해지',
  };

  return labels[value] ?? value ?? '-';
}

export function statusKey(value) {
  return String(value ?? '').trim().toUpperCase();
}

export function hasContractStatus(value, candidates) {
  return candidates.includes(statusKey(value));
}

export function canMoveToReviewStatus(value) {
  return hasContractStatus(value, ['JOIN', 'REQUEST', 'PENDING_DOCUMENTS', 'DOCUMENTS_CONFIRMED', '00', '01', '02']);
}

export function canRequestDocumentSupplementStatus(value) {
  return hasContractStatus(value, ['JOIN', 'REQUEST', 'PENDING_REVIEW', 'DOCUMENTS_CONFIRMED', '01', '02', '03']);
}

export function canRejectContractStatus(value) {
  return hasContractStatus(value, ['JOIN', 'REQUEST', 'PENDING_REVIEW', 'PENDING_DOCUMENTS', 'DOCUMENTS_CONFIRMED', 'CONDITIONS_ACCEPT', '00', '01', '02', '03', '04']);
}

export function canPresentTermsStatus(value) {
  return hasContractStatus(value, ['JOIN', 'REQUEST', 'PENDING_REVIEW', '01', '02', '03']);
}

export function canMakeContractStatus(value) {
  return hasContractStatus(value, ['USE_AGREE', '05']);
}

export function canCancelContractStatus(value) {
  return hasContractStatus(value, ['ACCOUNT_STANDBY', 'CONTRACT', 'TERMINATION_REQUEST', '06', '71', '81']);
}
