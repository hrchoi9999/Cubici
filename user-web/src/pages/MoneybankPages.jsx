import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DashboardSummary,
  Layout,
  PageTitle,
  Tabs,
  LegacyIntroSection,
  DocumentNotice,
  ReadOnlyField,
  ContractStatusStrip,
  TermsDecisionPanel,
  REQUEST_DOCUMENT_ACCEPT,
  contractDetailPath,
  contractDocumentDownloadUrl,
  createInquiryForUser,
  fetchAuthJson,
  fetchChargePlans,
  fetchContractDetailForUser,
  fetchContractDocumentsForUser,
  fetchInquiryDetailForUser,
  fetchJson,
  formatAmount,
  formatBankAccount,
  formatChargeType,
  formatContractStatus,
  formatDate,
  formatPercent,
  formatPeriod,
  formatProductCode,
  latestContractFee,
  latestFeeDetail,
  moneybankTabs,
  plainText,
  postAuthJson,
  postJson,
  putJson,
  readAuthSession,
  saveAuthSession,
  shopOptions,
  statusKey,
  supportBoardConfig,
  updateContractDocumentStatus,
  uploadDocumentFile,
  useAuthenticatedShopPairs,
  useUserDashboardData,
  validateRequestDocuments,
} from '../shared/UserCore.jsx';
import { legacyMoneybankClauses } from '../shared/legacyMoneybankClauses.js';

const TERMINATION_REQUEST_ALLOWED_STATUS_KEYS = new Set(['ACCOUNT_STANDBY', 'CONTRACT', '06', '81']);
const TERMINATION_PENDING_STATUS_KEYS = new Set(['TERMINATION_REQUEST', '71']);
const TERMINATED_STATUS_KEYS = new Set(['SELF_TERMINATION', 'TERMINATION', 'EXPIRED', '72', '73', '82', '31', '07']);
const MONEYBANK_REQUEST_STATUS_KEYS = new Set(['ADVANCE_PASS', '00']);
const MONEYBANK_EVALUATE_STATUS_KEYS = new Set([
  'REQUEST',
  'PENDING_REVIEW',
  'PENDING_DOCUMENTS',
  'CONDITIONS_ACCEPT',
  'CONDITIONS_ACCEPT_ADJN',
  'CONDITIONS_ACCEPT_ADJY',
  '01',
  '02',
  '03',
  '04',
  '401',
  '402',
]);
const MONEYBANK_CONTRACT_STATUS_KEYS = new Set(['USE_AGREE', 'ACCOUNT_STANDBY', '05', '81']);
const MONEYBANK_ACTIVE_STATUS_KEYS = new Set(['CONTRACT', 'ATTENTION', 'WARNING', 'TERMINATION_REQUEST', '06', '62', '63', '71']);

function moneybankStatusKey(value) {
  return statusKey(value);
}

function formatMoneybankContractStatus(value) {
  const labels = {
    TERMINATION_REQUEST: '해지신청',
    FORCE_TERMINATION: '강제해지',
    ACCOUNT_TERMINATION: '계좌해지',
    '31': '중도해지',
    '71': '해지신청',
    '72': '본인해지',
    '73': '강제해지',
    '82': '계좌해지',
  };
  return labels[value] ?? formatContractStatus(value);
}

function formatRedemptionOperationType(value) {
  const labels = {
    PROVISION: '지급',
    REPAYMENT: '상환',
    PROVISION_CANCEL: '지급취소',
    REPAYMENT_CANCEL: '상환취소',
  };
  return labels[value] ?? value ?? '-';
}

function formatRedemptionOperationStatus(item) {
  if (item?.is_reversal) return '취소이력';
  if (item?.canceled_by_operation_history_id) return '취소됨';
  return '정상';
}

function getRedemptionOperationAmount(item) {
  const provisionDelta = Math.abs(
    Number(item?.new_cumulative_provision_amount ?? 0)
      - Number(item?.previous_cumulative_provision_amount ?? 0),
  );
  const repaymentDelta = Math.abs(
    Number(item?.new_cumulative_repayment_amount ?? 0)
      - Number(item?.previous_cumulative_repayment_amount ?? 0),
  );
  return Math.max(provisionDelta, repaymentDelta);
}

function getMoneybankLegacyProgress(status) {
  const key = moneybankStatusKey(status);
  if (['REQUEST', 'PENDING_DOCUMENTS', '01', '02'].includes(key)) return 2;
  if (['PENDING_REVIEW', '03'].includes(key)) return 3;
  if (['CONDITIONS_ACCEPT', 'CONDITIONS_ACCEPT_ADJN', 'CONDITIONS_ACCEPT_ADJY', '04', '401', '402'].includes(key)) return 4;
  if (MONEYBANK_CONTRACT_STATUS_KEYS.has(key) || MONEYBANK_ACTIVE_STATUS_KEYS.has(key)) return 4;
  return 1;
}

function MoneybankIntroPage({ kind }) {
  const content = {
    advpay: ['구매자금 선지급 서비스', '선지급 자금으로 상품을 구매하고 쇼핑몰 정산금으로 자동 상환합니다.', '/resources/rudicks/img/sub/moneybank-img01.png'],
    advcalc: ['매출 선정산 서비스', '정산 예정 매출을 기준으로 필요한 운영자금을 빠르게 이용합니다.', '/resources/rudicks/img/sub/moneybank-img06.png'],
    creditpay: ['신용대출', '사업 현황 분석 결과를 기반으로 금융 조건을 확인합니다.', '/resources/rudicks/img/sub/moneybank-img07.png'],
  }[kind];

  return (
    <Layout>
      <main className="sub-page">
        <PageTitle title="머니뱅크" text="온라인 셀러의 사업자금 마련을 위한 큐빅아이 금융 서비스" />
        <Tabs tabs={moneybankTabs} />
        <LegacyIntroSection
          eyebrow="머니뱅크"
          title={content[0]}
          imageSrc={content[2]}
          imageAlt={content[0]}
          ctaHref="/moneybank/request"
          ctaLabel="서비스 신청"
        >
          <ul className="description">
            <li>{content[1]}</li>
            <li>비대면 신청으로 쉽고 편리하게 한도 내에서 필요한 만큼 이용합니다.</li>
            <li>사용 기간 기준 수수료를 적용하고 신청, 심사, 계약, 이용 현황을 한 화면에서 확인할 수 있습니다.</li>
          </ul>
        </LegacyIntroSection>
        <DocumentNotice />
      </main>
    </Layout>
  );
}

const requestVariantConfig = {
  together: {
    title: '머니뱅크 신청',
    text: '운영 쇼핑몰과 신청서류를 확인해 선정산 신청을 접수합니다.',
    submitLabel: '서비스 신청',
    requestedBy: 'user-web',
    showB2b: false,
    showAccounts: false,
    requireAccountFiles: false,
  },
  advpay: {
    title: '구매자금 선지급 신청',
    text: 'legacy 구매자금 선지급 신청 흐름에 맞춰 B2B몰, 신청한도, 제출서류를 접수합니다.',
    submitLabel: '구매자금 선지급 신청',
    requestedBy: 'user-web-advpay',
    showB2b: true,
    showAccounts: true,
    requireAccountFiles: false,
  },
  advcalc: {
    title: '매출 선정산 신청',
    text: 'legacy 매출 선정산 신청 흐름에 맞춰 쇼핑몰, 계좌, 동의서류를 접수합니다.',
    submitLabel: '선정산 신청',
    requestedBy: 'user-web-advcalc',
    showB2b: false,
    showAccounts: true,
    requireAccountFiles: true,
  },
};

const bankOptions = [
  ['039', '경남은행'],
  ['004', '국민은행'],
  ['020', '우리은행'],
  ['088', '신한은행'],
  ['081', '하나은행'],
  ['011', '농협은행'],
];

function RequestPage({ kind = 'together' }) {
  const variant = requestVariantConfig[kind] ?? requestVariantConfig.together;
  const [auth] = useState(readAuthSession);
  const account = auth?.user;
  const [requestSummary, setRequestSummary] = useState({
    loading: Boolean(account?.user_no),
    error: '',
    contracts: { limit: 0, offset: 0, total: 0, items: [] },
  });
  const loadRequestSummary = useCallback(async () => {
    if (!account?.user_no) {
      const emptyState = { loading: false, error: '로그인 후 사용자 데이터를 조회합니다.', contracts: { limit: 0, offset: 0, total: 0, items: [] } };
      setRequestSummary(emptyState);
      return emptyState;
    }
    setRequestSummary((current) => ({ ...current, loading: true, error: '' }));
    try {
      const contracts = await fetchJson(`/v1/api/contracts?limit=5&offset=0&user_no=${encodeURIComponent(account.user_no)}`);
      const nextState = { loading: false, error: '', contracts };
      setRequestSummary(nextState);
      return nextState;
    } catch (error) {
      const nextState = { loading: false, error: `API 연결 대기: ${error.message}`, contracts: { limit: 0, offset: 0, total: 0, items: [] } };
      setRequestSummary(nextState);
      return nextState;
    }
  }, [account?.user_no]);
  useEffect(() => {
    loadRequestSummary();
  }, [loadRequestSummary]);
  const data = { ...requestSummary, refresh: loadRequestSummary };
  const latestContract = data.contracts?.items?.[0];
  const [connectedShops, setConnectedShops] = useState([]);
  const [shopState, setShopState] = useState({ loading: false, message: '' });
  const [selectedShops, setSelectedShops] = useState([]);
  const [files, setFiles] = useState({ regNo: null, CBInfo: null });
  const [extraFiles, setExtraFiles] = useState({ demandAccCopy: null, mainAccCopy: null, transferConsent: null });
  const [legacyInputs, setLegacyInputs] = useState({ b2bMall: '비밀특가', b2bId: '', totalLimitAmount: '' });
  const [accountInputs, setAccountInputs] = useState({
    demandAccBankCode: '039',
    demandAccHolder: '',
    demandAccNumber: '',
    mainAccBankCode: '039',
    mainAccHolder: '',
    mainAccNumber: '',
  });
  const [identityVerification, setIdentityVerification] = useState({
    method: 'id_card',
    birthDate: '',
    identitySerial: '',
    driverLicenseNo: '',
    status: '',
    reference: '',
    message: '',
  });
  const [policyChecks, setPolicyChecks] = useState({ identity: false, terms: false });
  const [submitState, setSubmitState] = useState({ submitting: false, message: '', mbid: '', uploaded: [] });
  const connectedShopTypes = useMemo(
    () => connectedShops.map((item) => item.shop_type).filter(Boolean),
    [connectedShops],
  );

  useEffect(() => {
    if (!auth?.access_token) return;
    let alive = true;
    setShopState({ loading: true, message: '' });
    fetchAuthJson('/v1/api/accounts/me/shops')
      .then((response) => {
        if (!alive) return;
        const items = response.items ?? [];
        const types = items.map((item) => item.shop_type).filter(Boolean);
        setConnectedShops(items);
        setSelectedShops(types);
        setShopState({ loading: false, message: '' });
      })
      .catch((error) => {
        if (!alive) return;
        setShopState({ loading: false, message: `쇼핑몰 조회 실패: ${error.message}` });
      });
    return () => {
      alive = false;
    };
  }, [auth?.access_token]);

  function updateIdentityVerification(field, value) {
    setIdentityVerification((current) => ({
      ...current,
      [field]: value,
      status: field === 'method' ? '' : current.status,
      reference: field === 'method' ? '' : current.reference,
      message: field === 'method' ? '' : current.message,
    }));
    if (field === 'method') {
      setPolicyChecks((current) => ({ ...current, identity: false }));
    }
  }

  function runIdentityMockVerification() {
    const method = identityVerification.method;
    const birthDate = identityVerification.birthDate.replace(/[^0-9]/g, '');
    const identitySerial = identityVerification.identitySerial.replace(/[^0-9]/g, '');
    const driverLicenseNo = identityVerification.driverLicenseNo.replace(/[^0-9A-Za-z]/g, '').toUpperCase();
    if (birthDate.length !== 6) {
      setIdentityVerification((current) => ({ ...current, status: '', reference: '', message: '생년월일 6자리를 입력해주세요.' }));
      setPolicyChecks((current) => ({ ...current, identity: false }));
      return;
    }
    if (method === 'id_card' && identitySerial.length < 4) {
      setIdentityVerification((current) => ({ ...current, status: '', reference: '', message: '주민등록증 발급정보 끝 4자리 이상을 입력해주세요.' }));
      setPolicyChecks((current) => ({ ...current, identity: false }));
      return;
    }
    if (method === 'driver_license' && driverLicenseNo.length < 8) {
      setIdentityVerification((current) => ({ ...current, status: '', reference: '', message: '운전면허번호를 8자리 이상 입력해주세요.' }));
      setPolicyChecks((current) => ({ ...current, identity: false }));
      return;
    }
    const suffix = method === 'id_card' ? identitySerial.slice(-4) : driverLicenseNo.slice(-4);
    const reference = `MOCK-${method === 'id_card' ? 'ID' : 'DL'}-${birthDate}-${suffix}`;
    setIdentityVerification((current) => ({
      ...current,
      status: 'mock_verified',
      reference,
      message: method === 'id_card' ? '주민등록증 진위확인 mock 완료' : '운전면허 진위확인 mock 완료',
    }));
    setPolicyChecks((current) => ({ ...current, identity: true }));
  }

  async function submitRequest() {
    if (!account?.user_no) {
      setSubmitState({ submitting: false, message: '신청 가능한 회원 정보가 없습니다.', mbid: '', uploaded: [] });
      return;
    }
    if (!selectedShops.length) {
      setSubmitState({ submitting: false, message: '운영 쇼핑몰을 선택해주세요.', mbid: '', uploaded: [] });
      return;
    }
    if (!policyChecks.identity || !policyChecks.terms) {
      setSubmitState({ submitting: false, message: '본인확인과 약관동의를 완료해주세요.', mbid: '', uploaded: [] });
      return;
    }
    if (variant.showB2b && (!legacyInputs.b2bMall || !legacyInputs.b2bId.trim())) {
      setSubmitState({ submitting: false, message: 'B2B몰과 B2B몰 ID를 입력해주세요.', mbid: '', uploaded: [] });
      return;
    }
    if (variant.showB2b) {
      const limitAmount = Number(legacyInputs.totalLimitAmount);
      if (!Number.isFinite(limitAmount) || limitAmount < 5 || limitAmount > 50) {
        setSubmitState({ submitting: false, message: '희망 선지급 한도는 5백만원부터 50백만원까지 입력해주세요.', mbid: '', uploaded: [] });
        return;
      }
    }
    if (variant.showAccounts) {
      const requiredAccountValues = [
        accountInputs.demandAccHolder,
        accountInputs.demandAccNumber,
        accountInputs.mainAccHolder,
        accountInputs.mainAccNumber,
      ];
      if (requiredAccountValues.some((value) => !value.trim())) {
        setSubmitState({ submitting: false, message: '정산계좌와 주거래계좌 정보를 입력해주세요.', mbid: '', uploaded: [] });
        return;
      }
    }
    const requiredFiles = [
      ['regNo', files.regNo],
      ['CBInfo', files.CBInfo],
      ...(variant.requireAccountFiles ? [
        ['demandAccCopy', extraFiles.demandAccCopy],
        ['mainAccCopy', extraFiles.mainAccCopy],
        ['transferConsent', extraFiles.transferConsent],
      ] : []),
    ];
    const missingFiles = requiredFiles.filter(([, file]) => !file).map(([documentType]) => documentType);
    if (missingFiles.length) {
      setSubmitState({ submitting: false, message: '필수 신청서류를 모두 선택해주세요.', mbid: '', uploaded: [] });
      return;
    }
    const fileValidationMessage = validateRequestDocuments([
      ['사업자등록증', files.regNo],
      ['대표자 신분증', files.CBInfo],
      ['정산계좌 통장사본', extraFiles.demandAccCopy],
      ['주거래 통장사본', extraFiles.mainAccCopy],
      ['출금이체 동의서', extraFiles.transferConsent],
    ]);
    if (fileValidationMessage) {
      setSubmitState({ submitting: false, message: fileValidationMessage, mbid: '', uploaded: [] });
      return;
    }
    setSubmitState({ submitting: true, message: '신청 저장 중', mbid: '', uploaded: [] });
    try {
      const result = await postJson(
        '/v1/api/contracts/requests',
        {
          user_no: account.user_no,
          request_shop_types: selectedShops,
          product_code: 'MP',
          sales_amount: variant.showB2b ? Number(legacyInputs.totalLimitAmount) * 1000000 : 0,
          demand_acc_bank_code: variant.showAccounts ? accountInputs.demandAccBankCode : null,
          demand_acc_holder: variant.showAccounts ? accountInputs.demandAccHolder : null,
          demand_acc_number: variant.showAccounts ? accountInputs.demandAccNumber : null,
          main_acc_bank_code: variant.showAccounts ? accountInputs.mainAccBankCode : null,
          main_acc_holder: variant.showAccounts ? accountInputs.mainAccHolder : null,
          main_acc_number: variant.showAccounts ? accountInputs.mainAccNumber : null,
          identity_confirmed: policyChecks.identity,
          identity_verification_method: identityVerification.method,
          identity_verification_status: identityVerification.status,
          identity_verification_reference: identityVerification.reference,
          terms_agreed: policyChecks.terms,
          submitted_document_types: requiredFiles.map(([documentType]) => documentType),
          requested_by: variant.requestedBy,
        },
        { timeoutMs: 45_000 },
      );
      const uploadTargets = [
        ...requiredFiles,
        ...(!variant.requireAccountFiles ? [
          ['demandAccCopy', extraFiles.demandAccCopy],
          ['mainAccCopy', extraFiles.mainAccCopy],
          ['transferConsent', extraFiles.transferConsent],
        ] : []),
      ].filter(([, file]) => Boolean(file));
      const uploaded = [];
      try {
        for (const [documentType, file] of uploadTargets) {
          const uploadResult = await uploadDocumentFile(result.mbid, {
            documentType,
            file,
            uploadedBy: 'user-web',
          });
          uploaded.push(uploadResult.item);
        }
      } catch (uploadError) {
        await updateContractDocumentStatus(result.mbid, 'document_pending', `document upload failed: ${uploadError.message}`).catch(() => null);
        await data.refresh();
        setSubmitState({
          submitting: false,
          message: `신청은 접수됐지만 서류 업로드가 완료되지 않았습니다. 서비스 현황에서 다시 업로드해주세요. ${uploadError.message}`,
          mbid: result.mbid,
          uploaded,
        });
        return;
      }
      const uploadText = uploaded.length ? ` 서류 ${uploaded.length}건 업로드 완료` : ' 업로드한 서류 없음';
      setSubmitState({ submitting: false, message: `${result.message}${uploadText}`, mbid: result.mbid, uploaded });
      data.refresh().catch(() => null);
    } catch (error) {
      setSubmitState({ submitting: false, message: `신청 실패: ${error.message}`, mbid: '', uploaded: [] });
    }
  }

  return (
    <Layout>
      <main className="sub-page">
        <PageTitle title={variant.title} text={variant.text} />
        <ContractStatusStrip data={data} contract={latestContract} onRefresh={data.refresh} />
        <section className="form-panel">
          <div className="field-grid">
            <ReadOnlyField label="회원번호" value={account?.user_no ?? '-'} />
            <ReadOnlyField label="회원유형" value={account?.user_type ?? '-'} />
            <ReadOnlyField label="회원ID" value={account?.email ?? '-'} />
            <ReadOnlyField label="상호" value={account?.biz_name ?? '-'} />
            <ReadOnlyField label="제휴코드" value={account?.partner_code ?? '-'} />
            <ReadOnlyField label="연결 쇼핑몰" value={`${connectedShops.length}개`} />
          </div>
          {!auth?.access_token ? <p className="auth-message error">로그인 후 머니뱅크를 신청할 수 있습니다.</p> : null}
          {shopState.message ? <p className="auth-message error">{shopState.message}</p> : null}
          {variant.showB2b ? (
            <>
              <h2>구매자금 선지급 조건</h2>
              <div className="field-grid">
                <label>
                  B2B 도매몰
                  <select
                    aria-label="B2B 도매몰"
                    onChange={(event) => setLegacyInputs((current) => ({ ...current, b2bMall: event.target.value }))}
                    value={legacyInputs.b2bMall}
                  >
                    <option value="비밀특가">비밀특가</option>
                  </select>
                </label>
                <label>
                  B2B몰 ID
                  <input
                    aria-label="B2B몰 ID"
                    onChange={(event) => setLegacyInputs((current) => ({ ...current, b2bId: event.target.value }))}
                    type="text"
                    value={legacyInputs.b2bId}
                  />
                </label>
                <label>
                  희망 선지급 한도
                  <input
                    aria-label="희망 선지급 한도"
                    onChange={(event) => setLegacyInputs((current) => ({ ...current, totalLimitAmount: event.target.value.replace(/[^0-9]/g, '') }))}
                    placeholder="백만원 단위"
                    type="text"
                    value={legacyInputs.totalLimitAmount}
                  />
                </label>
              </div>
              <p className="api-note">legacy 기준 희망한도는 최소 5백만원, 최대 50백만원입니다. B2B몰 ID는 현재 신청 메모성 화면 입력으로만 유지되며 별도 DB 컬럼은 후속 확장 대상입니다.</p>
            </>
          ) : null}
          <h2>운영 쇼핑몰</h2>
          <div className="shop-checks">
            {shopOptions.filter(([code]) => connectedShopTypes.includes(code)).map(([code, name, src]) => (
              <label key={code}>
                <input
                  aria-label={name}
                  checked={selectedShops.includes(code)}
                  onChange={(event) => {
                    setSelectedShops((current) => {
                      if (event.target.checked) {
                        return [...current, code];
                      }
                      return current.filter((item) => item !== code);
                    });
                  }}
                  type="checkbox"
                />
                <img src={src} alt="" />
                <span>{name}</span>
              </label>
            ))}
            {auth?.access_token && !shopState.loading && !connectedShops.length ? (
              <p className="auth-message error">연결된 쇼핑몰 계정이 없습니다. 마이페이지에서 쇼핑몰 계정을 먼저 연결해주세요.</p>
            ) : null}
          </div>
          {variant.showAccounts ? (
            <>
              <h2>계좌 정보</h2>
              <div className="field-grid">
                <label>
                  정산계좌 은행
                  <select
                    aria-label="정산계좌 은행"
                    onChange={(event) => setAccountInputs((current) => ({ ...current, demandAccBankCode: event.target.value }))}
                    value={accountInputs.demandAccBankCode}
                  >
                    {bankOptions.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
                  </select>
                </label>
                <label>
                  정산계좌 예금주
                  <input
                    aria-label="정산계좌 예금주"
                    onChange={(event) => setAccountInputs((current) => ({ ...current, demandAccHolder: event.target.value }))}
                    type="text"
                    value={accountInputs.demandAccHolder}
                  />
                </label>
                <label>
                  정산계좌 번호
                  <input
                    aria-label="정산계좌 번호"
                    onChange={(event) => setAccountInputs((current) => ({ ...current, demandAccNumber: event.target.value.replace(/[^0-9]/g, '') }))}
                    type="text"
                    value={accountInputs.demandAccNumber}
                  />
                </label>
                <label>
                  주거래계좌 은행
                  <select
                    aria-label="주거래계좌 은행"
                    onChange={(event) => setAccountInputs((current) => ({ ...current, mainAccBankCode: event.target.value }))}
                    value={accountInputs.mainAccBankCode}
                  >
                    {bankOptions.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
                  </select>
                </label>
                <label>
                  주거래계좌 예금주
                  <input
                    aria-label="주거래계좌 예금주"
                    onChange={(event) => setAccountInputs((current) => ({ ...current, mainAccHolder: event.target.value }))}
                    type="text"
                    value={accountInputs.mainAccHolder}
                  />
                </label>
                <label>
                  주거래계좌 번호
                  <input
                    aria-label="주거래계좌 번호"
                    onChange={(event) => setAccountInputs((current) => ({ ...current, mainAccNumber: event.target.value.replace(/[^0-9]/g, '') }))}
                    type="text"
                    value={accountInputs.mainAccNumber}
                  />
                </label>
              </div>
            </>
          ) : null}
          <h2>신청서류 제출</h2>
          <div className="file-grid">
            <label>
              사업자등록증
              <input
                accept={REQUEST_DOCUMENT_ACCEPT}
                onChange={(event) => setFiles((current) => ({ ...current, regNo: event.target.files?.[0] ?? null }))}
                type="file"
              />
            </label>
            <label>
              대표자 신분증
              <input
                accept={REQUEST_DOCUMENT_ACCEPT}
                onChange={(event) => setFiles((current) => ({ ...current, CBInfo: event.target.files?.[0] ?? null }))}
                type="file"
              />
            </label>
            {variant.showAccounts ? (
              <>
                <label>
                  정산계좌 통장사본
                  <input
                    accept={REQUEST_DOCUMENT_ACCEPT}
                    onChange={(event) => setExtraFiles((current) => ({ ...current, demandAccCopy: event.target.files?.[0] ?? null }))}
                    type="file"
                  />
                </label>
                <label>
                  주거래 통장사본
                  <input
                    accept={REQUEST_DOCUMENT_ACCEPT}
                    onChange={(event) => setExtraFiles((current) => ({ ...current, mainAccCopy: event.target.files?.[0] ?? null }))}
                    type="file"
                  />
                </label>
                <label>
                  출금이체 동의서
                  <input
                    accept={REQUEST_DOCUMENT_ACCEPT}
                    onChange={(event) => setExtraFiles((current) => ({ ...current, transferConsent: event.target.files?.[0] ?? null }))}
                    type="file"
                  />
                </label>
              </>
            ) : null}
          </div>
          <p className="file-guide">* 신청서류는 3MB 이하의 jpg, jpeg, png, pdf 파일만 업로드합니다.</p>
          <h2>본인확인</h2>
          <div className="identity-verification-panel">
            <div className="field-grid">
              <label>
                확인 방식
                <select
                  aria-label="본인확인 방식"
                  onChange={(event) => updateIdentityVerification('method', event.target.value)}
                  value={identityVerification.method}
                >
                  <option value="id_card">주민등록증</option>
                  <option value="driver_license">운전면허증</option>
                </select>
              </label>
              <label>
                생년월일
                <input
                  aria-label="본인확인 생년월일"
                  maxLength="6"
                  onChange={(event) => updateIdentityVerification('birthDate', event.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="YYMMDD"
                  type="text"
                  value={identityVerification.birthDate}
                />
              </label>
              {identityVerification.method === 'id_card' ? (
                <label>
                  주민등록증 발급정보
                  <input
                    aria-label="주민등록증 발급정보"
                    maxLength="12"
                    onChange={(event) => updateIdentityVerification('identitySerial', event.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="끝 4자리 이상"
                    type="text"
                    value={identityVerification.identitySerial}
                  />
                </label>
              ) : (
                <label>
                  운전면허번호
                  <input
                    aria-label="운전면허번호"
                    maxLength="20"
                    onChange={(event) => updateIdentityVerification('driverLicenseNo', event.target.value.toUpperCase())}
                    placeholder="면허번호"
                    type="text"
                    value={identityVerification.driverLicenseNo}
                  />
                </label>
              )}
            </div>
            <button className="secondary-action" onClick={runIdentityMockVerification} type="button">본인확인 mock 실행</button>
            {identityVerification.message ? (
              <p className={identityVerification.status ? 'submit-message success' : 'submit-message'}>
                {identityVerification.message}{identityVerification.reference ? ` (${identityVerification.reference})` : ''}
              </p>
            ) : null}
            <p className="api-note">현재는 내부 테스트용 mock 확인입니다. 실제 Hyphen 본인확인 API 호출은 운영 실연동 단계에서 별도 모드로 분리합니다.</p>
          </div>
          <div className="policy-checks">
            <label>
              <input
                checked={policyChecks.identity}
                readOnly
                type="checkbox"
              />
              <span>본인확인을 완료했습니다.</span>
            </label>
            <label>
              <input
                checked={policyChecks.terms}
                onChange={(event) => setPolicyChecks((current) => ({ ...current, terms: event.target.checked }))}
                type="checkbox"
              />
              <span>머니뱅크 신청 약관에 동의합니다.</span>
            </label>
          </div>
          {kind === 'advcalc' ? (
            <div className="clause-links">
              {[1, 2, 3, 4].map((clauseNo) => (
                <a href={`/moneybank/advcalc/request/clause-details/${clauseNo}`} key={clauseNo}>약관보기 {clauseNo}</a>
              ))}
            </div>
          ) : null}
          <button className="primary-action" disabled={submitState.submitting || !auth?.access_token || !connectedShops.length} onClick={submitRequest} type="button">
            {submitState.submitting ? '신청 저장 중' : variant.submitLabel}
          </button>
          {submitState.message ? (
            <p className={submitState.mbid ? 'submit-message success' : 'submit-message'}>
              {submitState.message}{submitState.mbid ? ` (${submitState.mbid})` : ''}
              {submitState.mbid ? <a className="status-link" href="/moneybank/current">서비스 현황 보기</a> : null}
            </p>
          ) : null}
          {submitState.uploaded.length ? (
            <ul className="uploaded-list">
              {submitState.uploaded.map((item) => (
                <li key={item.uuid}>{item.file_division}: {item.origin_file_name}.{item.file_ext}</li>
              ))}
            </ul>
          ) : null}
        </section>
      </main>
    </Layout>
  );
}

function resolveMoneybankProcessTarget(contract) {
  if (!contract?.mbid) {
    return {
      href: '/moneybank/advcalc/request',
      label: '신청 화면',
      legacyRole: 'ROLE_MB_REQUEST',
      reason: '진행 중인 신청건이 없어 신규 신청 화면으로 이동합니다.',
    };
  }
  const key = moneybankStatusKey(contract.status);
  if (MONEYBANK_REQUEST_STATUS_KEYS.has(key)) {
    return {
      href: '/moneybank/advcalc/request',
      label: '신청 화면',
      legacyRole: 'ROLE_MB_REQUEST',
      reason: '사전심사 완료 상태이므로 legacy 신청 화면으로 이동합니다.',
    };
  }
  if (MONEYBANK_EVALUATE_STATUS_KEYS.has(key)) {
    return {
      href: '/moneybank/advcalc/evaluate',
      label: '검토 및 심사',
      legacyRole: 'ROLE_MB_EVALUATE',
      reason: '신청 또는 심사 단계 신청건이 있어 legacy evaluate 화면으로 이동합니다.',
    };
  }
  if (MONEYBANK_CONTRACT_STATUS_KEYS.has(key)) {
    return {
      href: '/moneybank/advcalc/contract',
      label: '계약 체결',
      legacyRole: 'ROLE_MB_CONTRACT',
      reason: '이용조건 동의 또는 계좌대기 상태이므로 legacy 계약 체결 화면으로 이동합니다.',
    };
  }
  return {
    href: '/moneybank/current',
    label: '서비스 현황',
    legacyRole: MONEYBANK_ACTIVE_STATUS_KEYS.has(key) ? 'ROLE_USER_MB' : 'ROLE_MB_ADVANCE',
    reason: '계약 완료 또는 종료 상태이므로 서비스 현황 화면으로 이동합니다.',
  };
}

function MoneybankProcessRoutePage({ mode = 'continue' }) {
  const [auth] = useState(readAuthSession);
  const data = useUserDashboardData({
    userNo: auth?.user?.user_no,
    shopPairs: '__none__',
    enabled: Boolean(auth?.access_token && auth?.user?.user_no),
  });
  const latestContract = data.contracts?.items?.[0];
  const target = mode === 'end'
    ? { href: '/moneybank/current', label: '서비스 현황', legacyRole: 'PROCESS_END', reason: '머니뱅크 처리 완료 후 현황 화면으로 이동합니다.' }
    : resolveMoneybankProcessTarget(latestContract);

  useEffect(() => {
    if (!auth?.access_token || data.loading) return;
    const timer = window.setTimeout(() => {
      window.location.replace(target.href);
    }, 150);
    return () => window.clearTimeout(timer);
  }, [auth?.access_token, data.loading, target.href]);

  return (
    <Layout>
      <main className="sub-page">
        <PageTitle title="머니뱅크 진행상태 확인" text="legacy 중간 route를 최신 신청 상태 기준으로 React 화면에 연결합니다." />
        <section className="form-panel">
          <h2>이동 경로</h2>
          {!auth?.access_token ? <p className="auth-message error">로그인 후 진행상태를 확인할 수 있습니다.</p> : null}
          <div className="field-grid">
            <ReadOnlyField label="legacy role" value={target.legacyRole} />
            <ReadOnlyField label="이동 화면" value={target.label} />
            <ReadOnlyField label="최근 계약" value={latestContract?.mbid ?? '-'} />
            <ReadOnlyField label="계약상태" value={formatContractStatus(latestContract?.status)} />
          </div>
          <p className="api-note">{data.loading ? '진행상태를 조회 중입니다.' : target.reason}</p>
          <a className="primary-action" href={target.href}>{target.label} 바로가기</a>
        </section>
      </main>
    </Layout>
  );
}

function EvaluatePage({ kind = 'advcalc' }) {
  const [auth] = useState(readAuthSession);
  const data = useUserDashboardData({
    userNo: auth?.user?.user_no,
    shopPairs: '__none__',
    enabled: Boolean(auth?.access_token && auth?.user?.user_no),
  });
  const latestContract = data.contracts?.items?.[0];
  const currentStatus = moneybankStatusKey(latestContract?.status);
  const latestFee = latestFeeDetail(latestContract?.fees);
  const progress = getMoneybankLegacyProgress(currentStatus);
  const heading = kind === 'advpay' ? '구매자금 선지급 검토 및 심사' : '매출 선정산 검토 및 심사';
  const hasTerms = ['CONDITIONS_ACCEPT', 'CONDITIONS_ACCEPT_ADJN', 'CONDITIONS_ACCEPT_ADJY', '04', '401', '402'].includes(currentStatus);
  const needsDocuments = currentStatus === 'PENDING_DOCUMENTS';
  const readyForContract = MONEYBANK_CONTRACT_STATUS_KEYS.has(currentStatus);

  return (
    <Layout>
      <main className="sub-page">
        <PageTitle title={heading} text="신청서류 검토, 심사 결과, 이용조건 동의 상태를 확인합니다." />
        <ContractStatusStrip data={data} contract={latestContract} onRefresh={data.refresh} />
        <section className="form-panel">
          <h2>심사진행상태</h2>
          {!auth?.access_token ? <p className="auth-message error">로그인 후 심사 상태를 확인할 수 있습니다.</p> : null}
          <div className="field-grid">
            <ReadOnlyField label="최근 계약" value={latestContract?.mbid ?? '-'} />
            <ReadOnlyField label="현재상태" value={formatMoneybankContractStatus(latestContract?.status)} />
            <ReadOnlyField label="신청일" value={formatDate(latestContract?.request_date)} />
            <ReadOnlyField label="평가등급" value={latestContract?.prizm_score ?? '-'} />
          </div>
          <ol className="uploaded-list">
            {['신청 자격 확인', '신청정보 취합', '프리즘평가', '종합심사'].map((label, index) => (
              <li key={label}>{index < progress ? '완료' : '대기'}: {label}</li>
            ))}
          </ol>
          <p className="api-note">
            제출하신 사업정보와 신청서류를 기준으로 심사를 진행합니다. 조건이 제시되면 이용조건 동의 후 계약 체결 단계로 이동합니다.
          </p>
        </section>
        {needsDocuments ? (
          <section className="form-panel">
            <h2>다음 액션</h2>
            <p className="submit-message">서류 보완이 필요한 신청건입니다. 서비스 현황에서 보완서류를 제출해주세요.</p>
            <a className="primary-action" href="/moneybank/current">보완서류 제출</a>
          </section>
        ) : null}
        {hasTerms ? (
          <section className="form-panel">
            <h2>심사결과</h2>
            <div className="field-grid">
              <ReadOnlyField label="이용 수수료율" value={formatPercent(latestContract?.latest_fee_rate ?? latestFee?.fee_rate)} />
              <ReadOnlyField label="머니뱅크 지급율" value={formatPercent(latestContract?.latest_payment_rate ?? latestFee?.payment_rate)} />
              <ReadOnlyField label="주문건당 매출인정 한도" value={formatAmount(latestFee?.sales_limit_per_order)} />
              <ReadOnlyField label="계약기간" value="1년" />
            </div>
            <p className="api-note">조건에 동의하면 계약 체결 단계로 이동합니다. 동의 후 3일 이내 계약이 진행되지 않으면 운영 정책에 따라 신청이 취소될 수 있습니다.</p>
          </section>
        ) : null}
        <TermsDecisionPanel contract={latestContract} fees={latestContract?.fees ?? []} onDone={data.refresh} />
        {readyForContract ? (
          <section className="form-panel">
            <h2>다음 액션</h2>
            <p className="submit-message success">이용조건 동의가 완료되었습니다. 계약 체결 화면에서 전자서명과 계약 진행 상태를 확인해주세요.</p>
            <a className="primary-action" href="/moneybank/advcalc/contract">계약 체결</a>
          </section>
        ) : null}
        {!latestContract && !data.loading ? (
          <section className="form-panel">
            <h2>다음 액션</h2>
            <p className="api-note">진행 중인 신청건이 없습니다. 신청 화면에서 서비스를 신청해주세요.</p>
            <a className="primary-action" href="/moneybank/advcalc/request">서비스 신청</a>
          </section>
        ) : null}
      </main>
    </Layout>
  );
}

function CurrentPage() {
  const [auth] = useState(readAuthSession);
  const shopFilter = useAuthenticatedShopPairs(auth);
  const data = useUserDashboardData({
    userNo: auth?.user?.user_no,
    shopPairs: shopFilter.shopPairs,
    enabled: Boolean(auth?.access_token && auth?.user?.user_no),
  });
  const latestContract = data.contracts?.items?.[0];
  const [supplementFiles, setSupplementFiles] = useState({ regNo: null, CBInfo: null });
  const [supplementState, setSupplementState] = useState({ submitting: false, message: '', uploaded: [] });
  const needsDocumentSupplement = latestContract?.status === 'PENDING_DOCUMENTS';

  async function submitSupplementDocuments() {
    if (!latestContract?.mbid) {
      setSupplementState({ submitting: false, message: '보완할 신청건이 없습니다.', uploaded: [] });
      return;
    }
    const uploadTargets = [
      ['regNo', supplementFiles.regNo],
      ['CBInfo', supplementFiles.CBInfo],
    ];
    if (uploadTargets.some(([, file]) => !file)) {
      setSupplementState({ submitting: false, message: '사업자등록증과 대표자 신분증을 모두 선택해주세요.', uploaded: [] });
      return;
    }
    const fileValidationMessage = validateRequestDocuments([
      ['사업자등록증', supplementFiles.regNo],
      ['대표자 신분증', supplementFiles.CBInfo],
    ]);
    if (fileValidationMessage) {
      setSupplementState({ submitting: false, message: fileValidationMessage, uploaded: [] });
      return;
    }

    setSupplementState({ submitting: true, message: '보완서류 업로드 중', uploaded: [] });
    try {
      const uploaded = [];
      for (const [documentType, file] of uploadTargets) {
        const uploadResult = await uploadDocumentFile(latestContract.mbid, {
          documentType,
          file,
          uploadedBy: 'user-web',
        });
        uploaded.push(uploadResult.item);
      }
      setSupplementState({ submitting: false, message: '보완서류 업로드가 완료되었습니다.', uploaded });
      data.refresh().catch(() => null);
      setSupplementFiles({ regNo: null, CBInfo: null });
    } catch (error) {
      await updateContractDocumentStatus(latestContract.mbid, 'document_pending', `document supplement failed: ${error.message}`).catch(() => null);
      setSupplementState({ submitting: false, message: `보완서류 업로드 실패: ${error.message}`, uploaded: [] });
    }
  }

  return (
    <Layout>
      <main className="sub-page">
        <PageTitle title="머니뱅크 현황" text="계약, 지급, 상환 현황을 로컬 DB API 기준으로 확인합니다." />
        <ContractStatusStrip data={data} contract={latestContract} onRefresh={data.refresh} />
        <TermsDecisionPanel contract={latestContract} onDone={data.refresh} />
        <DashboardSummary data={data} />
        <section className="data-table-wrap">
          <h2>계약/신청 현황</h2>
          <table>
            <thead>
              <tr><th>계약번호</th><th>회원</th><th>상품</th><th>상태</th><th>지급율</th><th>평균 수수료</th><th>신청일</th><th>매출액</th></tr>
            </thead>
            <tbody>
              {(data.contracts?.items ?? []).map((item) => (
                <tr key={item.mbid}>
                  <td><a className="status-link" href={contractDetailPath(item.mbid)}>{item.mbid}</a></td>
                  <td>{item.user_email ?? item.user_no ?? '-'}</td>
                  <td>{formatProductCode(item.product_code)}</td>
                  <td>{formatContractStatus(item.status)}</td>
                  <td>{formatPercent(item.latest_payment_rate)}</td>
                  <td>{formatPercent(item.latest_fee_rate)}</td>
                  <td>{formatDate(item.request_date)}</td>
                  <td>{formatAmount(item.sales_amount)}</td>
                </tr>
              ))}
              {!(data.contracts?.items ?? []).length ? (
                <tr><td colSpan="8">{data.loading ? '조회 중입니다.' : '계약/신청 내역이 없습니다.'}</td></tr>
              ) : null}
            </tbody>
          </table>
        </section>
        <section className="finance-summary-grid">
          {(data.contracts?.items ?? []).slice(0, 3).map((item) => {
            const matchingRedemption = (data.redemptions?.items ?? []).find((redemption) => redemption.mbid === item.mbid);
            return (
              <article key={`finance-${item.mbid}`}>
                <div>
                  <span>{item.mbid}</span>
                  <strong>{formatContractStatus(item.status)}</strong>
                </div>
                <dl>
                  <div><dt>상품</dt><dd>{formatProductCode(item.product_code)}</dd></div>
                  <div><dt>지급율</dt><dd>{formatPercent(item.latest_payment_rate)}</dd></div>
                  <div><dt>평균 수수료</dt><dd>{formatPercent(item.latest_fee_rate)}</dd></div>
                  <div><dt>총 지급</dt><dd>{formatAmount(matchingRedemption?.latest_cumulative_provision_amount)}</dd></div>
                  <div><dt>총 상환</dt><dd>{formatAmount(matchingRedemption?.latest_cumulative_repayment_amount)}</dd></div>
                  <div><dt>미상환잔액</dt><dd>{formatAmount(matchingRedemption?.latest_outstanding_balance)}</dd></div>
                </dl>
                <a className="status-link" href={contractDetailPath(item.mbid)}>상세보기</a>
              </article>
            );
          })}
          {!(data.contracts?.items ?? []).length ? (
            <p className="api-note">{data.loading ? '계약별 금융조건을 조회 중입니다.' : '표시할 계약별 금융조건이 없습니다.'}</p>
          ) : null}
        </section>
        <section className="data-table-wrap">
          <h2>상환 현황</h2>
          <table>
            <thead>
              <tr><th>계약번호</th><th>총 지급</th><th>이용수수료</th><th>총 상환</th><th>상환수수료</th><th>미상환잔액</th><th>최근 이력일</th></tr>
            </thead>
            <tbody>
              {(data.redemptions?.items ?? []).map((item) => (
                <tr key={item.mbid}>
                  <td>{item.mbid}</td>
                  <td>{formatAmount(item.latest_cumulative_provision_amount)}</td>
                  <td>{formatAmount(item.total_usage_fee)}</td>
                  <td>{formatAmount(item.latest_cumulative_repayment_amount)}</td>
                  <td>{formatAmount(item.total_repayment_usage_fee)}</td>
                  <td>{formatAmount(item.latest_outstanding_balance)}</td>
                  <td>{formatDate(item.latest_history_date)}</td>
                </tr>
              ))}
              {!(data.redemptions?.items ?? []).length ? (
                <tr><td colSpan="7">{data.loading ? '조회 중입니다.' : '상환 현황이 없습니다.'}</td></tr>
              ) : null}
            </tbody>
          </table>
        </section>
        {needsDocumentSupplement ? (
          <section className="form-panel">
            <h2>보완서류 제출</h2>
            <p className="api-note">서류 업로드가 완료되지 않은 신청건입니다. 기존 신청번호에 보완서류를 다시 업로드합니다.</p>
            <div className="file-grid">
              <label>
                사업자등록증
                <input
                  accept={REQUEST_DOCUMENT_ACCEPT}
                  onChange={(event) => setSupplementFiles((current) => ({ ...current, regNo: event.target.files?.[0] ?? null }))}
                  type="file"
                />
              </label>
              <label>
                대표자 신분증
                <input
                  accept={REQUEST_DOCUMENT_ACCEPT}
                  onChange={(event) => setSupplementFiles((current) => ({ ...current, CBInfo: event.target.files?.[0] ?? null }))}
                  type="file"
                />
              </label>
            </div>
            <p className="file-guide">* 보완서류는 3MB 이하의 jpg, jpeg, png, pdf 파일만 업로드합니다.</p>
            <button className="primary-action" disabled={supplementState.submitting} onClick={submitSupplementDocuments} type="button">
              {supplementState.submitting ? '보완서류 업로드 중' : '보완서류 제출'}
            </button>
            {supplementState.message ? <p className={supplementState.uploaded.length ? 'submit-message success' : 'submit-message'}>{supplementState.message}</p> : null}
            {supplementState.uploaded.length ? (
              <ul className="uploaded-list">
                {supplementState.uploaded.map((item) => (
                  <li key={item.uuid}>{item.file_division}: {item.origin_file_name}.{item.file_ext}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ) : null}
        {!needsDocumentSupplement && supplementState.message ? (
          <section className="form-panel">
            <p className={supplementState.uploaded.length ? 'submit-message success' : 'submit-message'}>
              {supplementState.message}
            </p>
            {supplementState.uploaded.length ? (
              <ul className="uploaded-list">
                {supplementState.uploaded.map((item) => (
                  <li key={item.uuid}>{item.file_division}: {item.origin_file_name}.{item.file_ext}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ) : null}
      </main>
    </Layout>
  );
}

function ElectronicSignaturePanel({ contract, onDone, onLocalChange }) {
  const [auth] = useState(readAuthSession);
  const [state, setState] = useState({ submitting: false, message: '' });
  const currentStatus = moneybankStatusKey(contract?.status);
  const signed = Boolean(contract?.electronic_signature_status);
  const canSign = ['USE_AGREE', '05'].includes(currentStatus) && !signed;
  const shouldShow = canSign || signed || ['ACCOUNT_STANDBY', 'CONTRACT', '06', '81'].includes(currentStatus);

  if (!contract?.mbid || !shouldShow) return null;

  async function submitSignature() {
    setState({ submitting: true, message: '전자서명 mock 저장 중입니다.' });
    try {
      const reference = `MOCK-SIGN-${contract.mbid}-${Date.now()}`;
      const response = await fetchAuthJson(`/v1/api/contracts/${encodeURIComponent(contract.mbid)}/electronic-signature`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signed_by: auth?.user?.email ?? 'user-web',
          signature_method: 'mock_certificate',
          signature_reference: reference,
          reason: 'electronic signature mock by user-web',
        }),
      });
      onLocalChange?.({
        status: response.new_status,
        electronic_signature_method: response.signature_method,
        electronic_signature_status: response.signature_status,
        electronic_signature_reference: response.signature_reference,
        electronic_signed_at: response.electronic_signed_at,
        contract_date: response.contract_date,
        modified_date: response.modified_date,
      });
      setState({ submitting: false, message: `전자서명 mock이 저장되었습니다. (${response.signature_reference})` });
      onDone?.();
    } catch (error) {
      setState({ submitting: false, message: `전자서명 저장 실패: ${error.message}` });
    }
  }

  return (
    <section className="form-panel electronic-signature-panel">
      <h2>공동인증 전자서명</h2>
      <div className="field-grid">
        <ReadOnlyField label="진행상태" value={formatMoneybankContractStatus(contract.status)} />
        <ReadOnlyField label="서명상태" value={contract.electronic_signature_status ?? (canSign ? '서명 가능' : '대기')} />
        <ReadOnlyField label="서명방식" value={contract.electronic_signature_method ?? 'mock_certificate'} />
        <ReadOnlyField label="서명참조" value={contract.electronic_signature_reference ?? '-'} />
      </div>
      {canSign ? (
        <>
          <p className="api-note">
            legacy 공동인증 전자서명 단계의 내부 테스트 모드입니다. 실제 인증서, 개인키, 비밀번호 원문은 저장하지 않습니다.
          </p>
          <button className="primary-action" disabled={state.submitting} onClick={submitSignature} type="button">
            {state.submitting ? '전자서명 저장 중' : '공동인증 전자서명 mock'}
          </button>
        </>
      ) : (
        <p className={signed ? 'submit-message success' : 'api-note'}>
          {signed ? '전자서명 mock 저장이 완료된 계약입니다.' : '이용조건 동의 후 전자서명을 진행할 수 있습니다.'}
        </p>
      )}
      {state.message ? <p className={state.message.includes('실패') ? 'submit-message' : 'submit-message success'}>{state.message}</p> : null}
    </section>
  );
}

function ContractDetailPage({ mbid }) {
  const [auth] = useState(readAuthSession);
  const userNo = auth?.user?.user_no;
  const [state, setState] = useState({ loading: true, message: '', detail: null, documents: null, operations: null });
  const [terminationState, setTerminationState] = useState({ submitting: false, message: '' });

  const load = useCallback(async () => {
    if (!auth?.access_token || !userNo) {
      setState({ loading: false, message: '로그인 후 계약 상세를 확인할 수 있습니다.', detail: null, documents: null, operations: null });
      return;
    }
    setState((current) => ({ ...current, loading: true, message: '' }));
    try {
      const detail = await fetchContractDetailForUser(mbid, userNo);
      const [documentsResult, operationsResult] = await Promise.allSettled([
        fetchContractDocumentsForUser(mbid, userNo),
        fetchJson(`/v1/api/redemptions/${encodeURIComponent(mbid)}/operation-history?limit=20&offset=0`),
      ]);
      const documents = documentsResult.status === 'fulfilled'
        ? documentsResult.value
        : { mbid, user_no: userNo, total: 0, items: [], message: documentsResult.reason?.message };
      const operations = operationsResult.status === 'fulfilled'
        ? operationsResult.value
        : { mbid, limit: 20, offset: 0, total: 0, items: [], message: operationsResult.reason?.message };
      setState({ loading: false, message: '', detail, documents, operations });
    } catch (error) {
      setState({ loading: false, message: `계약 상세 조회 실패: ${error.message}`, detail: null, documents: null, operations: null });
    }
  }, [auth?.access_token, mbid, userNo]);

  useEffect(() => {
    load();
  }, [load]);

  const contract = state.detail?.contract;
  const redemption = state.detail?.redemption;
  const latestFee = latestFeeDetail(state.detail?.fees);
  const currentStatus = moneybankStatusKey(contract?.status);
  const outstandingBalance = Number(redemption?.latest_outstanding_balance ?? 0);
  const canRequestTermination = TERMINATION_REQUEST_ALLOWED_STATUS_KEYS.has(currentStatus);
  const terminationPending = TERMINATION_PENDING_STATUS_KEYS.has(currentStatus);
  const terminated = TERMINATED_STATUS_KEYS.has(currentStatus);

  function patchContract(patch) {
    setState((current) => {
      if (!current.detail?.contract) return current;
      return {
        ...current,
        detail: {
          ...current.detail,
          contract: {
            ...current.detail.contract,
            ...patch,
          },
        },
      };
    });
  }

  async function requestTermination() {
    if (!contract?.mbid) return;
    setTerminationState({ submitting: true, message: '해지신청 저장 중입니다.' });
    try {
      const response = await fetchAuthJson(`/v1/api/contracts/${encodeURIComponent(contract.mbid)}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'request_termination',
          changed_by: 'user-web',
          reason: outstandingBalance > 0
            ? 'user requested termination with outstanding balance warning'
            : 'user requested termination',
        }),
      });
      patchContract({
        status: response.new_status,
        cancel_request_date: response.cancel_request_date,
        modified_date: response.modified_date,
      });
      setTerminationState({ submitting: false, message: '해지신청이 접수되었습니다. 관리자 확인 후 최종 해지 처리됩니다.' });
      load();
    } catch (error) {
      setTerminationState({ submitting: false, message: `해지신청 실패: ${error.message}` });
    }
  }

  return (
    <Layout>
      <main className="sub-page">
        <PageTitle title="머니뱅크 계약 상세" text="계약, 쇼핑몰, 수수료, 제출서류, 상환 정보를 확인합니다." />
        <p className="api-note"><a className="status-link" href="/moneybank/current">서비스 현황으로 돌아가기</a></p>
        {state.message ? <p className="auth-message error">{state.message}</p> : null}
        <section className="form-panel">
          <h2>계약 기본정보</h2>
          <div className="field-grid">
            <ReadOnlyField label="계약번호" value={contract?.mbid ?? mbid} />
            <ReadOnlyField label="상태" value={contract ? formatMoneybankContractStatus(contract.status) : state.loading ? '조회 중' : '-'} />
            <ReadOnlyField label="상품" value={formatProductCode(contract?.product_code)} />
            <ReadOnlyField label="지급율" value={formatPercent(latestFee?.payment_rate ?? contract?.latest_payment_rate)} />
            <ReadOnlyField label="평균 수수료" value={formatPercent(contract?.latest_fee_rate)} />
            <ReadOnlyField label="신청일" value={formatDate(contract?.request_date)} />
            <ReadOnlyField label="승인일" value={formatDate(contract?.approval_date)} />
            <ReadOnlyField label="이용조건 동의일" value={formatDate(contract?.agree_date)} />
            <ReadOnlyField label="계약일" value={formatDate(contract?.contract_date)} />
            <ReadOnlyField label="매출액" value={formatAmount(contract?.sales_amount)} />
            <ReadOnlyField label="정산계좌" value={formatBankAccount(contract?.demand_acc_bank_code, contract?.demand_acc_number, contract?.demand_acc_holder)} />
            <ReadOnlyField label="주거래계좌" value={formatBankAccount(contract?.main_acc_bank_code, contract?.main_acc_number, contract?.main_acc_holder)} />
            <ReadOnlyField label="서류 파일 수" value={`${contract?.document_file_count ?? 0}건`} />
            <ReadOnlyField label="최근 평가등급" value={contract?.prizm_score ?? '-'} />
            <ReadOnlyField label="전자서명" value={contract?.electronic_signature_status ?? '-'} />
            <ReadOnlyField label="전자서명일" value={formatDate(contract?.electronic_signed_at)} />
          </div>
        </section>
        <TermsDecisionPanel
          contract={contract}
          fees={state.detail?.fees ?? []}
          onDone={load}
          onLocalChange={patchContract}
        />
        <ElectronicSignaturePanel contract={contract} onDone={load} onLocalChange={patchContract} />
        <section className="form-panel">
          <h2>해지신청</h2>
          <div className="field-grid">
            <ReadOnlyField label="현재상태" value={formatMoneybankContractStatus(contract?.status)} />
            <ReadOnlyField label="해지신청일" value={formatDate(contract?.cancel_request_date)} />
            <ReadOnlyField label="미상환잔액" value={formatAmount(outstandingBalance)} />
            <ReadOnlyField label="처리기준" value={terminationPending ? '관리자 확인 대기' : terminated ? '해지 처리 완료' : canRequestTermination ? '사용자 해지신청 가능' : '현재 단계에서는 해지신청 불가'} />
          </div>
          {outstandingBalance > 0 && canRequestTermination ? (
            <p className="submit-message">
              미상환잔액이 남아 있습니다. 해지신청은 접수할 수 있지만 최종 해지와 잔액 처리는 관리자 검토가 필요합니다.
            </p>
          ) : null}
          {terminationPending ? <p className="submit-message success">해지신청이 접수되어 관리자 확인을 기다리고 있습니다.</p> : null}
          {terminated ? <p className="submit-message success">해지 처리된 계약입니다.</p> : null}
          {canRequestTermination ? (
            <button className="secondary-action" disabled={terminationState.submitting} onClick={requestTermination} type="button">
              {terminationState.submitting ? '해지신청 중' : '해지신청'}
            </button>
          ) : null}
          {terminationState.message ? <p className={terminationState.message.includes('접수') ? 'submit-message success' : 'submit-message'}>{terminationState.message}</p> : null}
          <p className="api-note">본인해지, 강제해지, 계좌해지는 legacy 상태 기준 표시만 우선 반영했습니다. 최종 처리 정책은 관리자 검토 흐름에서 확정합니다.</p>
        </section>
        <section className="data-table-wrap">
          <h2>연결 쇼핑몰</h2>
          <table>
            <thead>
              <tr><th>쇼핑몰</th><th>상점 ID</th><th>등록일</th></tr>
            </thead>
            <tbody>
              {(state.detail?.shops ?? []).length ? state.detail.shops.map((item) => (
                <tr key={item.id}>
                  <td>{item.contract_shop_type ?? '-'}</td>
                  <td>{item.contract_shop_id ?? '-'}</td>
                  <td>{formatDate(item.reg_date)}</td>
                </tr>
              )) : (
                <tr><td colSpan="3">연결 쇼핑몰 정보가 없습니다.</td></tr>
              )}
            </tbody>
          </table>
        </section>
        <section className="data-table-wrap">
          <h2>수수료 조건</h2>
          <table>
            <thead>
              <tr><th>지급률</th><th>주문한도</th><th>최대잔액</th><th>쇼핑몰별 수수료율</th><th>등록일</th></tr>
            </thead>
            <tbody>
              {(state.detail?.fees ?? []).length ? state.detail.fees.map((item) => (
                <tr key={item.id}>
                  <td>{formatPercent(item.payment_rate)}</td>
                  <td>{formatAmount(item.sales_limit_per_order)}</td>
                  <td>{formatAmount(item.max_outstanding_balance)}</td>
                  <td>
                    <div className="fee-rate-list">
                      {(item.rates ?? []).length ? item.rates.map((rate) => (
                        <span key={rate.id}>{rate.fee_type ?? '-'} {formatPercent(rate.fee_rate)}</span>
                      )) : <span>-</span>}
                    </div>
                  </td>
                  <td>{formatDate(item.reg_date)}</td>
                </tr>
              )) : (
                <tr><td colSpan="5">수수료 조건 정보가 없습니다.</td></tr>
              )}
            </tbody>
          </table>
        </section>
        <section className="data-table-wrap">
          <h2>제출서류</h2>
          <table>
            <thead>
              <tr><th>구분</th><th>파일명</th><th>크기</th><th>등록일</th><th>다운로드</th></tr>
            </thead>
            <tbody>
              {(state.documents?.items ?? []).length ? state.documents.items.map((item) => (
                <tr key={item.uuid}>
                  <td>{item.file_division ?? '-'}</td>
                  <td>{item.origin_file_name}.{item.file_ext}</td>
                  <td>{Number(item.file_size ?? 0).toLocaleString('ko-KR')} byte</td>
                  <td>{formatDate(item.input_date)}</td>
                  <td><a className="status-link" href={contractDocumentDownloadUrl(mbid, item.uuid, userNo)}>다운로드</a></td>
                </tr>
              )) : (
                <tr><td colSpan="5">제출된 서류가 없습니다.</td></tr>
              )}
            </tbody>
          </table>
        </section>
        <section className="form-panel">
          <h2>상환 요약</h2>
          <div className="field-grid">
            <ReadOnlyField label="총 지급" value={formatAmount(redemption?.latest_cumulative_provision_amount)} />
            <ReadOnlyField label="총 상환" value={formatAmount(redemption?.latest_cumulative_repayment_amount)} />
            <ReadOnlyField label="미상환잔액" value={formatAmount(redemption?.latest_outstanding_balance)} />
            <ReadOnlyField label="최근 이력일" value={formatDate(redemption?.latest_history_date)} />
          </div>
        </section>
        <section className="data-table-wrap">
          <h2>지급/상환 이력</h2>
          <table>
            <thead>
              <tr><th>일자</th><th>구분</th><th>처리번호</th><th>금액</th><th>지급누계</th><th>상환누계</th><th>미상환잔액</th><th>상태</th></tr>
            </thead>
            <tbody>
              {(state.operations?.items ?? []).length ? state.operations.items.map((item) => (
                <tr key={item.id}>
                  <td>{formatDate(item.reg_date)}</td>
                  <td>{formatRedemptionOperationType(item.operation_type)}</td>
                  <td>{item.operation_code ?? '-'}</td>
                  <td>{formatAmount(getRedemptionOperationAmount(item))}</td>
                  <td>{formatAmount(item.new_cumulative_provision_amount)}</td>
                  <td>{formatAmount(item.new_cumulative_repayment_amount)}</td>
                  <td>{formatAmount(item.new_outstanding_balance)}</td>
                  <td>{formatRedemptionOperationStatus(item)}</td>
                </tr>
              )) : (
                <tr><td colSpan="8">{state.loading ? '조회 중입니다.' : '지급/상환 이력이 없습니다.'}</td></tr>
              )}
            </tbody>
          </table>
          {state.operations?.message ? <p className="api-note">이력 API 확인 필요: {state.operations.message}</p> : null}
        </section>
      </main>
    </Layout>
  );
}

function ClauseDetailsPage({ clauseNo }) {
  const detail = legacyMoneybankClauses[Number(clauseNo)] ?? legacyMoneybankClauses[1];
  return (
    <Layout>
      <main className="sub-page clause-page">
        <PageTitle title={detail.title} text="legacy 머니뱅크 신청 약관 전문을 React 화면으로 전환한 페이지입니다." />
        <section className="form-panel legal-clause-panel">
          <div className="clause-meta">
            <span>{detail.source}</span>
            <span>전문 이관본</span>
          </div>
          <h2>{detail.title}</h2>
          {detail.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <a className="secondary-link" href="/moneybank/advcalc/request">신청 화면으로 돌아가기</a>
        </section>
      </main>
    </Layout>
  );
}

function DepositTestPage() {
  return (
    <Layout>
      <main className="sub-page">
        <PageTitle title="투게더펀딩 입금 테스트" text="legacy depositTest 화면의 사용자 route를 운영 재현 대상으로 분류한 화면입니다." />
        <section className="form-panel">
          <h2>운영 분류</h2>
          <p className="api-note">
            legacy `depositTest.jsp`는 `/admin/together/operation/insertRepay`, `/admin/together/operation/extendReq`를 호출하는 상환입금/연장 테스트 화면입니다.
            사용자 일반 신청 화면이 아니라 관리자 상환 운영 기능에 가깝기 때문에, 실제 처리는 관리자 상환/지급 화면과 API E2E로 고정합니다.
          </p>
          <div className="field-grid">
            <ReadOnlyField label="입금 테스트 처리" value="관리자 상환 API로 이관" />
            <ReadOnlyField label="연장신청 처리" value="후속 정책 확정 필요" />
          </div>
        </section>
      </main>
    </Layout>
  );
}

function ContractFormPage({ kind = 'advcalc' }) {
  const label = kind === 'advpay' ? '구매자금 선지급 계약 체결' : '매출 선정산 계약 체결';
  return (
    <Layout>
      <main className="sub-page">
        <PageTitle title={label} text="legacy contractForm 화면을 React 계약 확인 흐름으로 전환한 페이지입니다." />
        <section className="form-panel">
          <h2>계약 체결 흐름</h2>
          <p className="api-note">
            legacy contractForm은 외부 본인확인/계약 callback 이후 계약 체결 단계로 이동하는 중간 화면입니다.
            신규 React에서는 실제 계약 조건 확인과 이용조건 동의, 관리자 체결 상태를 `/moneybank/current`와 계약 상세 화면에서 처리합니다.
          </p>
          <div className="field-grid">
            <ReadOnlyField label="신청/계약 현황" value="/moneybank/current" />
            <ReadOnlyField label="이용조건 동의" value="계약 상세 화면에서 처리" />
          </div>
          <a className="primary-action" href="/moneybank/current">서비스 현황 확인</a>
        </section>
      </main>
    </Layout>
  );
}


export { MoneybankIntroPage, RequestPage, CurrentPage, ContractDetailPage, ClauseDetailsPage, DepositTestPage, EvaluatePage, ContractFormPage, MoneybankProcessRoutePage };
