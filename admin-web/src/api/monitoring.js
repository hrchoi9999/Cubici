const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export async function fetchErrorLogs(options = {}) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(options)) {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  }

  const query = params.toString();
  const response = await fetch(`${API_BASE_URL}/v1/api/monitoring/error-logs${query ? `?${query}` : ''}`);

  if (!response.ok) {
    throw new Error(`Error Log 조회 실패: ${response.status}`);
  }

  return response.json();
}

export async function fetchServerStatus(options = {}) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(options)) {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  }

  const query = params.toString();
  const response = await fetch(`${API_BASE_URL}/v1/api/monitoring/server-status${query ? `?${query}` : ''}`);

  if (!response.ok) {
    throw new Error(`서버 상태 조회 실패: ${response.status}`);
  }

  return response.json();
}
