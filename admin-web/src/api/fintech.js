const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

function buildQuery(options = {}) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(options)) {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  }

  const query = params.toString();
  return query ? `?${query}` : '';
}

export async function fetchFintechStatus() {
  const response = await fetch(`${API_BASE_URL}/v1/api/fintech/status`);

  if (!response.ok) {
    throw new Error(`펌뱅킹 상태 조회 실패: ${response.status}`);
  }

  return response.json();
}

export async function fetchFundingSummary(options = {}) {
  const response = await fetch(`${API_BASE_URL}/v1/api/fintech/funding-summary${buildQuery(options)}`);

  if (!response.ok) {
    throw new Error(`자금조달 현황 조회 실패: ${response.status}`);
  }

  return response.json();
}

export async function createFundingProvider(payload) {
  const response = await fetch(`${API_BASE_URL}/v1/api/fintech/funding-providers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.detail ?? `자금조달사 등록 실패: ${response.status}`);
  }

  return body;
}

export async function fetchFintechTradeRequests(options = {}) {
  const response = await fetch(`${API_BASE_URL}/v1/api/fintech/trade-requests${buildQuery(options)}`);

  if (!response.ok) {
    throw new Error(`펌뱅킹 전문 목록 조회 실패: ${response.status}`);
  }

  return response.json();
}

export async function fetchFintechTradeRequestDetail(row, options = {}) {
  const path = [
    row.req_date,
    row.bank_code,
    row.comp_code,
    row.seq_no,
  ].map((value) => encodeURIComponent(value)).join('/');

  const response = await fetch(`${API_BASE_URL}/v1/api/fintech/trade-requests/${path}${buildQuery(options)}`);

  if (!response.ok) {
    throw new Error(`펌뱅킹 전문 상세 조회 실패: ${response.status}`);
  }

  return response.json();
}

export async function createFintechMockTransferRequest(payload) {
  const response = await fetch(`${API_BASE_URL}/v1/api/fintech/mock/transfer-request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`mock 송금요청 저장 실패: ${response.status}`);
  }

  return response.json();
}
