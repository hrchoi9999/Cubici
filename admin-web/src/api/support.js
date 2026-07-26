const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export async function fetchInquiries(options = {}) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(options)) {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  }

  const query = params.toString();
  const response = await fetch(`${API_BASE_URL}/v1/api/support/inquiries${query ? `?${query}` : ''}`);

  if (!response.ok) {
    throw new Error(`고객문의 조회 실패: ${response.status}`);
  }

  return response.json();
}

export async function fetchInquiryDetail(qnaId) {
  const response = await fetch(`${API_BASE_URL}/v1/api/support/inquiries/${encodeURIComponent(qnaId)}`);

  if (!response.ok) {
    throw new Error(`고객문의 상세 조회 실패: ${response.status}`);
  }

  return response.json();
}

export async function createInquiryReply(qnaId, payload) {
  const response = await fetch(`${API_BASE_URL}/v1/api/support/inquiries/${encodeURIComponent(qnaId)}/replies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`고객문의 답변 등록 실패: ${response.status}`);
  }

  return response.json();
}

export async function updateInquiryReply(qnaId, replyId, payload) {
  const response = await fetch(`${API_BASE_URL}/v1/api/support/inquiries/${encodeURIComponent(qnaId)}/replies/${encodeURIComponent(replyId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`고객문의 답변 수정 실패: ${response.status}`);
  }

  return response.json();
}

export async function fetchMessageTemplates(options = {}) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(options)) {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  }

  const query = params.toString();
  const response = await fetch(`${API_BASE_URL}/v1/api/support/message-templates${query ? `?${query}` : ''}`);

  if (!response.ok) {
    throw new Error(`문자/이메일 템플릿 조회 실패: ${response.status}`);
  }

  return response.json();
}

export async function fetchMessageTemplate(messageNo) {
  const response = await fetch(`${API_BASE_URL}/v1/api/support/message-templates/${encodeURIComponent(messageNo)}`);

  if (!response.ok) {
    throw new Error(`문자/이메일 템플릿 상세 조회 실패: ${response.status}`);
  }

  return response.json();
}

export async function createMessageTemplate(payload) {
  const response = await fetch(`${API_BASE_URL}/v1/api/support/message-templates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`문자/이메일 템플릿 등록 실패: ${response.status}`);
  }

  return response.json();
}

export async function updateMessageTemplate(messageNo, payload) {
  const response = await fetch(`${API_BASE_URL}/v1/api/support/message-templates/${encodeURIComponent(messageNo)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`문자/이메일 템플릿 수정 실패: ${response.status}`);
  }

  return response.json();
}

export async function deleteMessageTemplate(messageNo) {
  const response = await fetch(`${API_BASE_URL}/v1/api/support/message-templates/${encodeURIComponent(messageNo)}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`문자/이메일 템플릿 삭제 실패: ${response.status}`);
  }

  return response.json();
}

export async function fetchBoardPosts(boardKind, options = {}) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(options)) {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  }

  const query = params.toString();
  const response = await fetch(`${API_BASE_URL}/v1/api/support/boards/${encodeURIComponent(boardKind)}${query ? `?${query}` : ''}`);

  if (!response.ok) {
    throw new Error(`고객 공지 조회 실패: ${response.status}`);
  }

  return response.json();
}

export async function fetchBoardPost(boardKind, postId) {
  const response = await fetch(`${API_BASE_URL}/v1/api/support/boards/${encodeURIComponent(boardKind)}/${encodeURIComponent(postId)}`);

  if (!response.ok) {
    throw new Error(`고객 공지 상세 조회 실패: ${response.status}`);
  }

  return response.json();
}

export async function createBoardPost(boardKind, payload) {
  const response = await fetch(`${API_BASE_URL}/v1/api/support/boards/${encodeURIComponent(boardKind)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`고객 공지 등록 실패: ${response.status}`);
  }

  return response.json();
}

export async function updateBoardPost(boardKind, postId, payload) {
  const response = await fetch(`${API_BASE_URL}/v1/api/support/boards/${encodeURIComponent(boardKind)}/${encodeURIComponent(postId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`고객 공지 수정 실패: ${response.status}`);
  }

  return response.json();
}

export async function deleteBoardPost(boardKind, postId) {
  const response = await fetch(`${API_BASE_URL}/v1/api/support/boards/${encodeURIComponent(boardKind)}/${encodeURIComponent(postId)}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`고객 공지 삭제 실패: ${response.status}`);
  }

  return response.json();
}
