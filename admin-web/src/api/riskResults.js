const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const RESERVED_QUERY_KEYS = new Set(['limit', 'offset']);

export async function fetchRiskResults(options = {}) {
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

  const response = await fetch(`${API_BASE_URL}/v1/api/risk-results?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`프리즘 지표 조회 실패: ${response.status}`);
  }

  return response.json();
}
