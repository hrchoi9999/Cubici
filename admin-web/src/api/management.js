const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export async function fetchManagementOverview(options = {}) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(options)) {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  }

  const query = params.toString();
  const response = await fetch(`${API_BASE_URL}/v1/api/management/overview${query ? `?${query}` : ''}`);

  if (!response.ok) {
    throw new Error(`머니뱅크 통합 현황 조회 실패: ${response.status}`);
  }

  return response.json();
}

export async function fetchMemberSummary(options = {}) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(options)) {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  }

  const query = params.toString();
  const response = await fetch(`${API_BASE_URL}/v1/api/management/member-summary${query ? `?${query}` : ''}`);

  if (!response.ok) {
    throw new Error(`회원현황 조회 실패: ${response.status}`);
  }

  return response.json();
}

export async function fetchMemberInfo(options = {}) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(options)) {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  }

  const query = params.toString();
  const response = await fetch(`${API_BASE_URL}/v1/api/management/member-info${query ? `?${query}` : ''}`);

  if (!response.ok) {
    throw new Error(`회원 정보 조회 실패: ${response.status}`);
  }

  return response.json();
}

export async function fetchMemberWithdrawals(options = {}) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(options)) {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  }

  const query = params.toString();
  const response = await fetch(`${API_BASE_URL}/v1/api/management/member-withdrawals${query ? `?${query}` : ''}`);

  if (!response.ok) {
    throw new Error(`휴면/해지 조회 실패: ${response.status}`);
  }

  return response.json();
}

export async function fetchMemberPayments(options = {}) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(options)) {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  }

  const query = params.toString();
  const response = await fetch(`${API_BASE_URL}/v1/api/management/member-payments${query ? `?${query}` : ''}`);

  if (!response.ok) {
    throw new Error(`결제 현황 조회 실패: ${response.status}`);
  }

  return response.json();
}

export async function fetchMemberChargeChanges(options = {}) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(options)) {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  }

  const query = params.toString();
  const response = await fetch(`${API_BASE_URL}/v1/api/management/member-charge-changes${query ? `?${query}` : ''}`);

  if (!response.ok) {
    throw new Error(`요금변경 관리 조회 실패: ${response.status}`);
  }

  return response.json();
}

export async function fetchMemberChargeChangeRefund(newSeq) {
  const response = await fetch(`${API_BASE_URL}/v1/api/management/member-charge-changes/${encodeURIComponent(newSeq)}/refund`);

  if (!response.ok) {
    throw new Error(`환급 상세 조회 실패: ${response.status}`);
  }

  return response.json();
}

export async function finishMemberChargeChangeRefund(newSeq, seq) {
  const response = await fetch(`${API_BASE_URL}/v1/api/management/member-charge-changes/${encodeURIComponent(newSeq)}/refund-finish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ seq }),
  });

  if (!response.ok) {
    throw new Error(`환급완료 처리 실패: ${response.status}`);
  }

  return response.json();
}

export async function fetchMemberStatusDetail(userNo) {
  const response = await fetch(`${API_BASE_URL}/v1/api/management/member-status/${encodeURIComponent(userNo)}`);

  if (!response.ok) {
    throw new Error(`회원 상세 조회 실패: ${response.status}`);
  }

  return response.json();
}

export async function fetchManagementUsage(options = {}) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(options)) {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  }

  const query = params.toString();
  const response = await fetch(`${API_BASE_URL}/v1/api/management/usage${query ? `?${query}` : ''}`);

  if (!response.ok) {
    throw new Error(`머니뱅크 이용상세 조회 실패: ${response.status}`);
  }

  return response.json();
}

export async function fetchManagementUsageDetail(mbid) {
  const response = await fetch(`${API_BASE_URL}/v1/api/management/usage/${encodeURIComponent(mbid)}`);

  if (!response.ok) {
    throw new Error(`머니뱅크 이용상세 상세 조회 실패: ${response.status}`);
  }

  return response.json();
}
