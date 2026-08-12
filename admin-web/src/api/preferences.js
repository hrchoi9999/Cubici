const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

function buildQuery(options = {}) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(options)) {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  }

  return params.toString();
}

export async function fetchCharges(options = {}) {
  const query = buildQuery(options);
  const response = await fetch(`${API_BASE_URL}/v1/api/preferences/charges${query ? `?${query}` : ''}`);

  if (!response.ok) {
    throw new Error(`요금제 조회 실패: ${response.status}`);
  }

  return response.json();
}

export async function fetchCharge(chargeCode) {
  const response = await fetch(`${API_BASE_URL}/v1/api/preferences/charges/${encodeURIComponent(chargeCode)}`);

  if (!response.ok) {
    throw new Error(`요금제 상세 조회 실패: ${response.status}`);
  }

  return response.json();
}

export async function createCharge(payload) {
  const response = await fetch(`${API_BASE_URL}/v1/api/preferences/charges`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`요금제 등록 실패: ${response.status}`);
  }

  return response.json();
}

export async function updateCharge(chargeCode, payload) {
  const response = await fetch(`${API_BASE_URL}/v1/api/preferences/charges/${encodeURIComponent(chargeCode)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`요금제 수정 실패: ${response.status}`);
  }

  return response.json();
}

export async function deleteCharge(chargeCode) {
  const response = await fetch(`${API_BASE_URL}/v1/api/preferences/charges/${encodeURIComponent(chargeCode)}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`요금제 삭제 실패: ${response.status}`);
  }

  return response.json();
}

export async function fetchAdminAccounts(options = {}) {
  const query = buildQuery(options);
  const response = await fetch(`${API_BASE_URL}/v1/api/preferences/admin-accounts${query ? `?${query}` : ''}`);

  if (!response.ok) {
    throw new Error(`관리자 목록 조회 실패: ${response.status}`);
  }

  return response.json();
}

export async function fetchAdminAccount(adminId) {
  const response = await fetch(`${API_BASE_URL}/v1/api/preferences/admin-accounts/${encodeURIComponent(adminId)}`);

  if (!response.ok) {
    throw new Error(`관리자 상세 조회 실패: ${response.status}`);
  }

  return response.json();
}

export async function checkAdminId(adminId) {
  const query = buildQuery({ admin_id: adminId });
  const response = await fetch(`${API_BASE_URL}/v1/api/preferences/admin-accounts/id-check?${query}`);

  if (!response.ok) {
    throw new Error(`관리자 ID 중복확인 실패: ${response.status}`);
  }

  return response.json();
}

export async function requestAdminAccount(payload) {
  const response = await fetch(`${API_BASE_URL}/v1/api/preferences/admin-accounts/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`관리자 신청 등록 실패: ${response.status}`);
  }

  return response.json();
}

export async function approveAdminAccount(adminId, payload) {
  const response = await fetch(`${API_BASE_URL}/v1/api/preferences/admin-accounts/${encodeURIComponent(adminId)}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`관리자 승인 실패: ${response.status}`);
  }

  return response.json();
}

export async function updateAdminAccount(adminId, payload) {
  const response = await fetch(`${API_BASE_URL}/v1/api/preferences/admin-accounts/${encodeURIComponent(adminId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`관리자 정보 수정 실패: ${response.status}`);
  }

  return response.json();
}

export async function deleteAdminAccount(adminId) {
  const response = await fetch(`${API_BASE_URL}/v1/api/preferences/admin-accounts/${encodeURIComponent(adminId)}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`관리자 삭제 실패: ${response.status}`);
  }

  return response.json();
}

export async function fetchPromotions(options = {}) {
  const query = buildQuery(options);
  const response = await fetch(`${API_BASE_URL}/v1/api/preferences/promotions${query ? `?${query}` : ''}`);

  if (!response.ok) {
    throw new Error(`연계코드 조회 실패: ${response.status}`);
  }

  return response.json();
}

export async function fetchPromotion(promoCode) {
  const response = await fetch(`${API_BASE_URL}/v1/api/preferences/promotions/${encodeURIComponent(promoCode)}`);

  if (!response.ok) {
    throw new Error(`연계코드 상세 조회 실패: ${response.status}`);
  }

  return response.json();
}

export async function fetchPromotionOptions(options = {}) {
  const query = buildQuery(options);
  const response = await fetch(`${API_BASE_URL}/v1/api/preferences/promotions/options${query ? `?${query}` : ''}`);

  if (!response.ok) {
    throw new Error(`연계코드 옵션 조회 실패: ${response.status}`);
  }

  return response.json();
}

export async function createPromotion(payload) {
  const response = await fetch(`${API_BASE_URL}/v1/api/preferences/promotions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`연계코드 등록 실패: ${response.status}`);
  }

  return response.json();
}

export async function updatePromotion(promoCode, payload) {
  const response = await fetch(`${API_BASE_URL}/v1/api/preferences/promotions/${encodeURIComponent(promoCode)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`연계코드 수정 실패: ${response.status}`);
  }

  return response.json();
}

export async function deletePromotion(promoCode) {
  const response = await fetch(`${API_BASE_URL}/v1/api/preferences/promotions/${encodeURIComponent(promoCode)}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`연계코드 삭제 실패: ${response.status}`);
  }

  return response.json();
}

export async function fetchPartners(options = {}) {
  const query = buildQuery(options);
  const response = await fetch(`${API_BASE_URL}/v1/api/preferences/partners${query ? `?${query}` : ''}`);

  if (!response.ok) {
    throw new Error(`협력사 조회 실패: ${response.status}`);
  }

  return response.json();
}

export async function fetchPartner(partnerId) {
  const response = await fetch(`${API_BASE_URL}/v1/api/preferences/partners/${encodeURIComponent(partnerId)}`);

  if (!response.ok) {
    throw new Error(`협력사 상세 조회 실패: ${response.status}`);
  }

  return response.json();
}

export async function checkPartnerId(partnerId) {
  const query = buildQuery({ partner_id: partnerId });
  const response = await fetch(`${API_BASE_URL}/v1/api/preferences/partners/id-check?${query}`);

  if (!response.ok) {
    throw new Error(`사업자번호 확인 실패: ${response.status}`);
  }

  return response.json();
}

export async function checkPartnerCode(partnerCode) {
  const query = buildQuery({ partner_code: partnerCode });
  const response = await fetch(`${API_BASE_URL}/v1/api/preferences/partners/code-check?${query}`);

  if (!response.ok) {
    throw new Error(`구분코드 확인 실패: ${response.status}`);
  }

  return response.json();
}

export async function createPartner(payload) {
  const response = await fetch(`${API_BASE_URL}/v1/api/preferences/partners`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`협력사 등록 실패: ${response.status}`);
  }

  return response.json();
}

export async function updatePartner(partnerId, payload) {
  const response = await fetch(`${API_BASE_URL}/v1/api/preferences/partners/${encodeURIComponent(partnerId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`협력사 수정 실패: ${response.status}`);
  }

  return response.json();
}

export async function deletePartner(partnerId) {
  const response = await fetch(`${API_BASE_URL}/v1/api/preferences/partners/${encodeURIComponent(partnerId)}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`협력사 삭제 실패: ${response.status}`);
  }

  return response.json();
}

export async function fetchMoneybankProducts(options = {}) {
  const query = buildQuery(options);
  const response = await fetch(`${API_BASE_URL}/v1/api/preferences/moneybank-products${query ? `?${query}` : ''}`);

  if (!response.ok) {
    throw new Error(`머니뱅크 상품 조회 실패: ${response.status}`);
  }

  return response.json();
}

export async function fetchMoneybankProduct(firmNo) {
  const response = await fetch(`${API_BASE_URL}/v1/api/preferences/moneybank-products/${encodeURIComponent(firmNo)}`);

  if (!response.ok) {
    throw new Error(`머니뱅크 상품 상세 조회 실패: ${response.status}`);
  }

  return response.json();
}

export async function createMoneybankProduct(payload) {
  const response = await fetch(`${API_BASE_URL}/v1/api/preferences/moneybank-products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`머니뱅크 상품 등록 실패: ${response.status}`);
  }

  return response.json();
}

export async function updateMoneybankProduct(firmNo, payload) {
  const response = await fetch(`${API_BASE_URL}/v1/api/preferences/moneybank-products/${encodeURIComponent(firmNo)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`머니뱅크 상품 수정 실패: ${response.status}`);
  }

  return response.json();
}

export async function fetchPrizmConfigItems(options = {}) {
  const query = buildQuery(options);
  const response = await fetch(`${API_BASE_URL}/v1/api/preferences/prizm-config/items${query ? `?${query}` : ''}`);

  if (!response.ok) {
    throw new Error(`Prism 설정 조회 실패: ${response.status}`);
  }

  return response.json();
}

export async function fetchPrizmConfigItem(division, subjectNo, itemNo) {
  const response = await fetch(
    `${API_BASE_URL}/v1/api/preferences/prizm-config/items/${encodeURIComponent(division)}/${encodeURIComponent(subjectNo)}/${encodeURIComponent(itemNo)}`,
  );

  if (!response.ok) {
    throw new Error(`Prism 설정 상세 조회 실패: ${response.status}`);
  }

  return response.json();
}

export async function updatePrizmConfigItem(division, subjectNo, itemNo, payload) {
  const response = await fetch(
    `${API_BASE_URL}/v1/api/preferences/prizm-config/items/${encodeURIComponent(division)}/${encodeURIComponent(subjectNo)}/${encodeURIComponent(itemNo)}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    throw new Error(`Prism 설정 수정 실패: ${response.status}`);
  }

  return response.json();
}

export async function fetchPrizmConfigUpdateRecords(options = {}) {
  const query = buildQuery(options);
  const response = await fetch(`${API_BASE_URL}/v1/api/preferences/prizm-config/update-records${query ? `?${query}` : ''}`);

  if (!response.ok) {
    throw new Error(`Prism 설정 변경이력 조회 실패: ${response.status}`);
  }

  return response.json();
}

export async function fetchRawDataTables() {
  const response = await fetch(`${API_BASE_URL}/v1/api/preferences/raw-data/tables`);

  if (!response.ok) {
    throw new Error(`RawData 테이블 조회 실패: ${response.status}`);
  }

  return response.json();
}

export async function fetchRawDataColumns(tableName) {
  const response = await fetch(`${API_BASE_URL}/v1/api/preferences/raw-data/tables/${encodeURIComponent(tableName)}/columns`);

  if (!response.ok) {
    throw new Error(`RawData 컬럼 조회 실패: ${response.status}`);
  }

  return response.json();
}

export async function fetchRawDataFormulas(options = {}) {
  const query = buildQuery(options);
  const response = await fetch(`${API_BASE_URL}/v1/api/preferences/raw-data/formulas${query ? `?${query}` : ''}`);

  if (!response.ok) {
    throw new Error(`RawData 계산식 조회 실패: ${response.status}`);
  }

  return response.json();
}

export async function createRawDataFormula(payload) {
  const response = await fetch(`${API_BASE_URL}/v1/api/preferences/raw-data/formulas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`RawData 계산식 등록 실패: ${response.status}`);
  }

  return response.json();
}

export async function updateRawDataFormula(rawDataNo, payload) {
  const response = await fetch(`${API_BASE_URL}/v1/api/preferences/raw-data/formulas/${encodeURIComponent(rawDataNo)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`RawData 계산식 수정 실패: ${response.status}`);
  }

  return response.json();
}

export async function deleteRawDataFormula(rawDataNo) {
  const response = await fetch(`${API_BASE_URL}/v1/api/preferences/raw-data/formulas/${encodeURIComponent(rawDataNo)}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`RawData 계산식 삭제 실패: ${response.status}`);
  }

  return response.json();
}

export async function previewRawData(payload) {
  const response = await fetch(`${API_BASE_URL}/v1/api/preferences/raw-data/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`RawData preview 실패: ${response.status}`);
  }

  return response.json();
}

export async function exportRawData(payload) {
  const response = await fetch(`${API_BASE_URL}/v1/api/preferences/raw-data/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`RawData 엑셀 다운로드 실패: ${response.status}`);
  }

  const disposition = response.headers.get('content-disposition') ?? '';
  const filenameMatch = disposition.match(/filename="?([^";]+)"?/i);
  return {
    blob: await response.blob(),
    filename: filenameMatch?.[1] ?? 'cubici_raw_data.xlsx',
  };
}
