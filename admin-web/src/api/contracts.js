const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const RESERVED_QUERY_KEYS = new Set(['limit', 'offset']);

export async function fetchContracts(options = {}) {
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

  const response = await fetch(`${API_BASE_URL}/v1/api/contracts?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`계약 목록 조회 실패: ${response.status}`);
  }

  return response.json();
}

export async function fetchContractDetail(mbid) {
  const response = await fetch(`${API_BASE_URL}/v1/api/contracts/${encodeURIComponent(mbid)}`);

  if (!response.ok) {
    throw new Error(`계약 상세 조회 실패: ${response.status}`);
  }

  return response.json();
}

export async function updateContractStatus(mbid, payload) {
  const response = await fetch(`${API_BASE_URL}/v1/api/contracts/${encodeURIComponent(mbid)}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail ?? `계약 상태 변경 실패: ${response.status}`);
  }

  return response.json();
}

export async function adjustContractFee(mbid, payload) {
  const response = await fetch(`${API_BASE_URL}/v1/api/contracts/${encodeURIComponent(mbid)}/fees/adjust`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail ?? `계약 조건 변경 실패: ${response.status}`);
  }

  return response.json();
}

export async function fetchContractDocumentFiles(mbid) {
  const response = await fetch(`${API_BASE_URL}/v1/api/contracts/${encodeURIComponent(mbid)}/documents/files`);

  if (!response.ok) {
    throw new Error(`제출서류 목록 조회 실패: ${response.status}`);
  }

  return response.json();
}

export async function uploadContractDocumentFile(mbid, { documentType, uploadedBy, file }) {
  const formData = new FormData();
  formData.append('document_type', documentType);
  if (uploadedBy) {
    formData.append('uploaded_by', uploadedBy);
  }
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/v1/api/contracts/${encodeURIComponent(mbid)}/documents/files`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail ?? `제출서류 업로드 실패: ${response.status}`);
  }

  return response.json();
}

export async function confirmContractDocuments(mbid, { confirmedBy }) {
  const response = await fetch(`${API_BASE_URL}/v1/api/contracts/${encodeURIComponent(mbid)}/documents/confirm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      confirmed_by: confirmedBy,
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail ?? `제출서류 확인 실패: ${response.status}`);
  }

  return response.json();
}

export async function updateContractDocumentChecks(mbid, payload) {
  const response = await fetch(`${API_BASE_URL}/v1/api/contracts/${encodeURIComponent(mbid)}/documents/checks`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail ?? `서류 확인값 저장 실패: ${response.status}`);
  }

  return response.json();
}

export async function fetchContractReviewNotes(mbid) {
  const response = await fetch(`${API_BASE_URL}/v1/api/contracts/${encodeURIComponent(mbid)}/review-notes`);

  if (!response.ok) {
    throw new Error(`심사 메모 조회 실패: ${response.status}`);
  }

  return response.json();
}

export async function createContractReviewNote(mbid, payload) {
  const response = await fetch(`${API_BASE_URL}/v1/api/contracts/${encodeURIComponent(mbid)}/review-notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail ?? `심사 메모 등록 실패: ${response.status}`);
  }

  return response.json();
}

export function getContractDocumentDownloadUrl(mbid, uuid) {
  return `${API_BASE_URL}/v1/api/contracts/${encodeURIComponent(mbid)}/documents/files/${encodeURIComponent(uuid)}/download`;
}
