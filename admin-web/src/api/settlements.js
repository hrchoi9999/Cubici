const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const RESERVED_QUERY_KEYS = new Set(['limit', 'offset']);

export async function fetchSettlements(options = {}) {
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

  const response = await fetch(`${API_BASE_URL}/v1/api/settlements?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`정산 목록 조회 실패: ${response.status}`);
  }

  return response.json();
}

export async function fetchSettlementDetail(settlementsId) {
  const response = await fetch(`${API_BASE_URL}/v1/api/settlements/${encodeURIComponent(settlementsId)}`);

  if (!response.ok) {
    throw new Error(`정산 상세 조회 실패: ${response.status}`);
  }

  return response.json();
}
