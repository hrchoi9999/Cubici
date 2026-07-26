const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const RESERVED_QUERY_KEYS = new Set(['limit', 'offset']);

export async function fetchRedemptions(options = {}) {
  const { limit = 20, offset = 0 } = options;
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });

  for (const [key, value] of Object.entries(options)) {
    if (value !== undefined && value !== null && value !== '' && !RESERVED_QUERY_KEYS.has(key)) {
      params.set(key, String(value));
    }
  }

  const response = await fetch(`${API_BASE_URL}/v1/api/redemptions?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`상환 목록 조회 실패: ${response.status}`);
  }

  return response.json();
}

export async function fetchRedemptionDetail(mbid) {
  const response = await fetch(`${API_BASE_URL}/v1/api/redemptions/${encodeURIComponent(mbid)}`);

  if (!response.ok) {
    throw new Error(`상환 상세 조회 실패: ${response.status}`);
  }

  return response.json();
}

export async function fetchRedemptionOperationHistory(mbid, options = {}) {
  const { limit = 20, offset = 0 } = options;
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  const response = await fetch(
    `${API_BASE_URL}/v1/api/redemptions/${encodeURIComponent(mbid)}/operation-history?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error(`상환 작업 이력 조회 실패: ${response.status}`);
  }

  return response.json();
}

async function postRedemptionOperation(mbid, path, payload, failureMessage) {
  const response = await fetch(`${API_BASE_URL}/v1/api/redemptions/${encodeURIComponent(mbid)}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let detail = '';
    try {
      const body = await response.json();
      detail = body.detail ? `: ${body.detail}` : '';
    } catch {
      detail = '';
    }
    throw new Error(`${failureMessage}: ${response.status}${detail}`);
  }

  return response.json();
}

export async function createRedemptionProvision(mbid, payload) {
  return postRedemptionOperation(mbid, '/provisions', payload, '지급 등록 실패');
}

export async function createRedemptionRepayment(mbid, payload) {
  return postRedemptionOperation(mbid, '/repayments', payload, '상환 등록 실패');
}
