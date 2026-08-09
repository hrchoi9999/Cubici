import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DashboardSummary,
  Layout,
  PageTitle,
  DocumentNotice,
  ReadOnlyField,
  ContractStatusStrip,
  TermsDecisionPanel,
  REQUEST_DOCUMENT_ACCEPT,
  canDecideTerms,
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
    advpay: {
      title: '구매자금',
      accent: '선지급 서비스',
      lead: 'B2B 도매몰을 통해 온라인 쇼핑몰에서 판매를 하시는 셀러를 위한 성공 솔루션!',
      desc: '먼저 선지급 자금으로 상품을 구매하시고, 쇼핑몰 정산금으로 자동 상환하세요.',
      icon: '/final-ui/static/img/icon/tab-icon1.png',
      headline: '5백만원에서 5천만원까지 필요한 만큼',
      listStyle: 'style-1',
      points: ['비대면 신청으로 쉽고 편리하게', '선지불 한도내에서 사용은 자유롭게', '이자와 수수료는 사용하신 기간동안만', '1년 단위로 계약되는 넉넉한 사용기간'],
      targetIcon: '/final-ui/static/img/icon/tab-icon2.png',
      targets: ['개인온라인 사업 대표(미성년 및 법인 제외)', '사업경력 1년이상, 온라인 판매 6개월 이상', '월 평균 매출액 5백만원 이상', 'B2B 도매몰 위탁배송 이용 셀러', '타 선지급 및 선정산 서비스 중복이용 불가'],
      documents: ['대표자 신분증 (사본)', '사업자등록증', '지정은행통장사본', '주거래 통장사본'],
      requestHref: '/moneybank/advPay/request',
    },
    advcalc: {
      title: '쇼핑몰매출',
      accent: '선정산 서비스',
      lead: '운영하고 계시는 온라인 쇼핑몰의 판매대금을 한번에 한곳에서 편리하게!',
      desc: '판매상품이 고객에게 배송되면 바로 입금되는 쉽고 빠른 서비스',
      icon: '/final-ui/static/img/icon/tab-icon4.png',
      headline: '운영하고 있는 쇼핑몰만 등록하면 끝',
      listStyle: 'style-3',
      points: ['비대면 신청으로 쉽고 편리하게', '정산까지 기다릴 필요없이 판매금액이 미리 입금', '선정산 총액 제한 없이 주문 금액당 최대 한도로만 관리', '사용 실적에 따라 자동으로 연장되는 계약 기간'],
      targetIcon: '/final-ui/static/img/icon/tab-icon5.png',
      targets: ['개인온라인 사업 대표(미성년 및 법인 제외)', '사업경력 1년이상, 온라인 판매 6개월 이상', '월 평균 매출액 1,000만원 이상', 'B2B 도매몰 위탁배송 이용 셀러'],
      documents: ['대표자 신분증 (사본)', '사업자등록증', '지정은행통장사본', '주거래 통장사본'],
      shops: true,
      requestHref: '/moneybank/advcalc/request',
    },
    creditpay: {
      title: '소상공인',
      accent: '신용대출',
      lead: '자체 신용평가시스템, 프리즘 기반 온라인 셀러 신용대출 서비스!',
      desc: '서비스 신청만으로 셀러의 경영상태를 진단하고 바로 운영자금을 입금',
      icon: '/final-ui/static/img/icon/tab-icon7.png',
      headline: '100% 비대면기반 완벽 신용대출!',
      listStyle: 'style-3',
      points: ['신용평가시스템, 프리즘에 기반한 신용대출서비스', '비대면 신청만으로 신용대출이 진행됩니다.', '5백만원의 사업자금을 한달간 자유롭게', '사용 실적에 따라 이용기간 연장이 가능'],
      targetIcon: '/final-ui/static/img/icon/tab-icon5.png',
      targets: ['개인온라인 사업 대표(미성년 및 법인 제외)', '사업경력 1년이상, 온라인 판매 6개월 이상', '월 평균 매출액 20백만원 이상', '타 선지급 및 선정산 서비스 중복이용 불가'],
      documents: ['대표자 신분증 (사본)', '사업자등록증', '주거래 통장사본'],
      requestHref: '/moneybank/request',
    },
  }[kind];

  return (
    <Layout variant="moneybank">
      <PageTitle title="머니뱅크" />
      <MoneybankSectionNav active="intro" />
      <main className="content-wrap c4p1-1 final-core-page final-moneybank-page final-moneybank-intro-page" id="Main">
        <section className="section sec-1">
          <h3 className="hidden">서비스 소개</h3>
          <div className="full-box bg-gray">
            <article className="col-card">
              <div className="txt-box">
                <div className="tit-wrap">
                  <h3 className="tit">
                    온라인 셀러의<br />
                    <strong className="icon">사업자금 마련을 위한</strong><br />
                    새로운 방식
                  </h3>
                </div>
                <p className="desc">
                  머니뱅크 서비스는 독자 신용평가시스템 프리즘을 통해 사업현황을 분석하고 사업에 필요한 금융서비스를 제공합니다.
                  구매자금 선지급, 쇼핑몰 선정산 등 사업현황에 맞는 서비스를 검토하고 필요한 서비스를 이용할 수 있습니다.
                </p>
              </div>
              <div className="img-box">
                <figure className="figure">
                  <img src="/final-ui/static/img/sub/c4/full-card.png" alt="머니뱅크 서비스" />
                </figure>
              </div>
            </article>
          </div>
        </section>
        <section className="section sec-2">
          <h3 className="hidden">머니뱅크 이용방법 소개</h3>
          <div className="inner">
            <article className="col-card bank-info">
              <div className="txt-box">
                <div className="line-tit-wrap">
                  <h4 className="tit">머니뱅크 이용방법</h4>
                </div>
                <p className="desc">필요한 사업 자금을 쉽고 편리하게<br />큐빅아이 머니뱅크 서비스와 함께 하십시오.</p>
              </div>
              <div className="img-box">
                <ul>
                  {[
                    ['item-1', '01', '/final-ui/static/img/icon/info-icon-1.png', '머니뱅크 신청'],
                    ['item-2', '02', '/final-ui/static/img/icon/info-icon-2.png', '평가 및 심사'],
                    ['item-3', '03', '/final-ui/static/img/icon/info-icon-3.png', '계약 체결'],
                    ['item-4', '04', '/final-ui/static/img/icon/info-icon-4.png', '서비스 이용'],
                  ].map(([className, no, src, label]) => (
                    <li className={className} key={className}>
                      <span>{no}</span>
                      <figure className="figure"><img src={src} alt="" /></figure>
                      <p>{label}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </div>
        </section>
        <section className="section sec-3">
          <h3 className="hidden">서비스 상품</h3>
          <div className="inner">
            <div className="tab-wrap">
              <ul className="tab">
                {moneybankTabs.map(([label, href]) => (
                  <li className={href.endsWith(kind) ? 'active' : ''} key={href}>
                    <a href={href}>{label}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="panel-wrap">
              <article className="panel">
                <div className="wrap-type-1">
                  <div className="item">
                    <div className="tit-card">
                      <h4 className="tit">{content.title} <b>{content.accent}</b></h4>
                      <p className="desc"><b>{content.lead}</b><br /><span>{content.desc}</span></p>
                    </div>
                  </div>
                  <MoneybankIconCard icon={content.icon} title={content.headline} listStyle={content.listStyle} items={content.points} />
                  <MoneybankIconCard icon={content.targetIcon} title="신청대상" listStyle={content.listStyle} items={content.targets} />
                  {content.shops ? <MoneybankShopCard /> : null}
                  <MoneybankIconCard icon="/final-ui/static/img/icon/tab-icon3.png" title="신청 준비서류" listStyle="style-2" items={content.documents} description="선지급 서비스 신청시, 미리 아래 서류 사본 파일(PDF 또는 JPG등)을 준비하시면 더욱 쉽게 준비하실 수 있습니다." />
                </div>
                <div className="btn-box txt-center">
                  <a className="btn wide-btn btn-color4" href={content.requestHref}>신청하기</a>
                </div>
              </article>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

function MoneybankSectionNav({ active }) {
  const items = [
    ['intro', '서비스 소개', '/moneybank/intro/advpay'],
    ['request', '서비스 신청', '/moneybank/request'],
    ['current', '서비스 현황', '/moneybank/current'],
  ];
  return (
    <nav className="sub-nav-wrap react-final-tabs">
      <ul className="sub-nav">
        {items.map(([key, label, href]) => (
          <li className={active === key ? 'active' : ''} key={key}>
            <a href={href}><span>{label}</span></a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function MoneybankIconCard({ icon, title, items, listStyle, description = '' }) {
  return (
    <div className="item">
      <div className="icon-card">
        <div className="icon"><img src={icon} alt="" /></div>
        <div className="txt-box">
          <div className="item-tit-wrap">
            <h5 className="item-tit">{title}</h5>
            {description ? <p className="desc">{description}</p> : null}
          </div>
          <ul className={`num-list ${listStyle}`}>
            {items.map((item, index) => (
              <li key={item}><span className="c-num">{index + 1}</span>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function MoneybankShopCard() {
  return (
    <div className="item">
      <div className="icon-card">
        <div className="icon"><img src="/final-ui/static/img/icon/tab-icon6.png" alt="" /></div>
        <div className="txt-box pb-0">
          <div className="item-tit-wrap mb-10"><h5 className="item-tit">선정산 가능 쇼핑몰</h5></div>
          <dl className="desc-box">
            <dt>큐빅아이 가입 시, 등록하신 쇼핑몰 중 선정산 대상 쇼핑몰 클릭만으로 모든 계산이 자동으로 진행됩니다.<br />현재 대상 쇼핑몰은 다음과 같습니다.</dt>
            <dd className="u14-shop-logos">
              <img src="/final-ui/static/img/logo/11st.jpg" alt="11번가" />
              <img src="/final-ui/static/img/logo/smartstore.jpg" alt="스마트스토어" />
              <img src="/final-ui/static/img/logo/coupang.jpg" alt="쿠팡" />
            </dd>
          </dl>
        </div>
      </div>
    </div>
  );
}

function MoneybankStep({ active }) {
  return (
    <div className="app-step">
      <ul className="step">
        {['01 서비스 신청', '02 검토 및 심사', '03 계약 체결'].map((label, index) => (
          <li className={active === index + 1 ? 'active' : ''} key={label}>{label}</li>
        ))}
      </ul>
    </div>
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

  const isAdvancePayment = kind === 'advpay';
  const serviceName = isAdvancePayment ? '구매자금 선지급' : '매출 선정산';
  const serviceDescription = isAdvancePayment
    ? 'B2B 도매몰 구매자금과 쇼핑몰 정산 정보를 기준으로 한도를 신청합니다.'
    : '등록한 쇼핑몰의 판매 대금을 정산일 전에 미리 지급받는 서비스입니다.';

  return (
    <Layout variant="moneybank">
      <PageTitle title="머니뱅크" />
      <MoneybankSectionNav active="request" />
      <main className="content-wrap c4p2-1 final-core-page final-moneybank-page final-moneybank-request-page" data-product={kind} id="Main">
        <section className="section sec-1">
          <h2 className="hidden">서비스 신청</h2>
          <div className="full-box py-80 bg-gray">
            <div className="inner">
              <MoneybankStep active={1} />
              <article className="u15-request-block u15-member-block">
                <div className="sub-tit-wrap"><h3 className="sub-tit sm">유지 정보</h3></div>
                <div className="u15-member-table">
                  <ReadOnlyField label="아이디" value={account?.email ?? '-'} />
                  <ReadOnlyField label="회사명" value={account?.biz_name ?? '-'} />
                  <ReadOnlyField label="회원명" value={account?.name ?? account?.biz_name ?? '-'} />
                  <ReadOnlyField label="사업자등록번호" value={account?.biz_num ?? '-'} />
                </div>
                {!auth?.access_token ? <p className="auth-message error">로그인 후 머니뱅크를 신청할 수 있습니다.</p> : null}
              </article>
              {latestContract || data.error ? (
                <div className="u15-contract-status">
                  <ContractStatusStrip data={data} contract={latestContract} onRefresh={data.refresh} />
                </div>
              ) : null}
              <article className="u15-request-block u15-service-block">
                <div className="sub-tit-wrap"><h3 className="sub-tit sm">서비스 소개</h3></div>
                <div className="u15-icon-copy">
                  <img src="/final-ui/static/img/icon/bank-icon2.png" alt="" />
                  <div>
                    <h4>{serviceName} 서비스 신청</h4>
                    <p>{serviceDescription}</p>
                    <ul>
                      <li>개인 온라인 사업 대표 대상</li>
                      <li>온라인 판매 및 쇼핑몰 정산 정보 연결 필요</li>
                      <li>신청 후 심사 결과에 따라 한도와 수수료 확정</li>
                    </ul>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="section sec-2 u15-form-section">
          <div className="inner">
            <div className="sub-tit-wrap"><h3 className="sub-tit sm">{isAdvancePayment ? '선지급' : '선정산'} 대상 쇼핑몰</h3></div>
            <div className="u15-section-body">
              <h4>{isAdvancePayment ? '구매자금 선지급을 적용할 쇼핑몰을 선택해 주십시오.' : '선정산 서비스를 적용할 쇼핑몰을 선택해 주십시오.'}</h4>
              {shopState.message ? <p className="auth-message error">{shopState.message}</p> : null}
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
              {variant.showB2b ? (
                <div className="field-grid u15-b2b-grid">
                  <label>
                    B2B 도매몰
                    <select aria-label="B2B 도매몰" onChange={(event) => setLegacyInputs((current) => ({ ...current, b2bMall: event.target.value }))} value={legacyInputs.b2bMall}>
                      <option value="비밀특가">비밀특가</option>
                    </select>
                  </label>
                  <label>
                    B2B몰 ID
                    <input aria-label="B2B몰 ID" onChange={(event) => setLegacyInputs((current) => ({ ...current, b2bId: event.target.value }))} type="text" value={legacyInputs.b2bId} />
                  </label>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="section sec-3 u15-form-section">
          <div className="inner">
            <div className="sub-tit-wrap"><h3 className="sub-tit sm">{isAdvancePayment ? '희망 선지급 최대총액' : '서비스 계좌 정보'}</h3></div>
            <div className="u15-section-body u15-icon-section">
              <img src="/final-ui/static/img/icon/bank-icon3.png" alt="" />
              <div className="u15-icon-section-content">
                {variant.showB2b ? (
                  <>
                    <h4>희망하는 구매자금 선지급 총액을 백만원 단위로 입력해 주십시오.</h4>
                    <label className="u15-limit-field">
                      <span>희망 선지급 이용한도</span>
                      <span className="u15-input-with-unit">
                        <input aria-label="희망 선지급 한도" onChange={(event) => setLegacyInputs((current) => ({ ...current, totalLimitAmount: event.target.value.replace(/[^0-9]/g, '') }))} placeholder="희망 금액" type="text" value={legacyInputs.totalLimitAmount} />
                        <b>백만원</b>
                      </span>
                    </label>
                    <p className="api-note">최소 5백만원에서 최대 50백만원까지 입력할 수 있으며, 심사 결과에 따라 이용가능 금액이 달라질 수 있습니다.</p>
                  </>
                ) : (
                  <h4>선정산 입금 계좌와 주거래 계좌를 확인해 주십시오.</h4>
                )}
              </div>
            </div>
            {variant.showAccounts ? (
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
            ) : null}
          </div>
        </section>

        <section className="section sec-4 u15-form-section">
          <div className="inner">
            <div className="sub-tit-wrap"><h3 className="sub-tit sm">동의서 확인</h3></div>
            <div className="u15-section-body">
              <p className="u15-section-lead">{serviceName} 신청을 위해 본인확인과 필수 동의 항목을 확인해 주십시오.</p>
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
            <p className="api-note">현재는 내부 테스트용 mock 확인입니다. 실제 본인확인 API는 운영 실연동 단계에서 분리합니다.</p>
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
            </div>
          </div>
        </section>

        <section className="section sec-5 u15-form-section">
          <div className="inner">
            <div className="sub-tit-wrap"><h3 className="sub-tit sm">신청서류 업로드</h3></div>
            <div className="u15-section-body u15-document-section">
              <div className="u15-document-heading">
                <img src="/final-ui/static/img/icon/bank-icon4.png" alt="" />
                <div>
                  <h4>{serviceName} 신청서류를 업로드해 주십시오.</h4>
                  <p>선택한 파일은 신청 저장 후 계약 문서로 등록됩니다.</p>
                </div>
              </div>
              <div className="file-grid">
                <label>사업자등록증<input accept={REQUEST_DOCUMENT_ACCEPT} onChange={(event) => setFiles((current) => ({ ...current, regNo: event.target.files?.[0] ?? null }))} type="file" /></label>
                <label>대표자 신분증<input accept={REQUEST_DOCUMENT_ACCEPT} onChange={(event) => setFiles((current) => ({ ...current, CBInfo: event.target.files?.[0] ?? null }))} type="file" /></label>
                {variant.showAccounts ? (
                  <>
                    <label>정산계좌 통장사본<input accept={REQUEST_DOCUMENT_ACCEPT} onChange={(event) => setExtraFiles((current) => ({ ...current, demandAccCopy: event.target.files?.[0] ?? null }))} type="file" /></label>
                    <label>주거래 통장사본<input accept={REQUEST_DOCUMENT_ACCEPT} onChange={(event) => setExtraFiles((current) => ({ ...current, mainAccCopy: event.target.files?.[0] ?? null }))} type="file" /></label>
                    <label>출금이체 동의서<input accept={REQUEST_DOCUMENT_ACCEPT} onChange={(event) => setExtraFiles((current) => ({ ...current, transferConsent: event.target.files?.[0] ?? null }))} type="file" /></label>
                  </>
                ) : null}
              </div>
              <p className="file-guide">* 신청서류는 3MB 이하의 jpg, jpeg, png, pdf 파일만 업로드합니다.</p>
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
            </div>
          </div>
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
      <PageTitle title="머니뱅크" text="진행상태를 확인합니다." />
      <MoneybankSectionNav active="request" />
      <main className="content-wrap c4p2-2 final-core-page final-moneybank-page final-moneybank-derived-page" id="Main">
        <section className="section sec-1">
          <h2 className="hidden">진행상태 확인</h2>
          <div className="inner">
            <section className="form-panel final-moneybank-form-panel">
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
          </div>
        </section>
      </main>
    </Layout>
  );
}

function EvaluatePage({ kind = 'advcalc' }) {
  const [auth] = useState(readAuthSession);
  const userNo = auth?.user?.user_no;
  const data = useUserDashboardData({
    userNo,
    shopPairs: '__none__',
    enabled: Boolean(auth?.access_token && userNo),
  });
  const latestContract = data.contracts?.items?.[0];
  const [detailState, setDetailState] = useState({ loading: false, message: '', detail: null });

  const loadEvaluationDetail = useCallback(async (mbid = latestContract?.mbid) => {
    if (!auth?.access_token || !userNo || !mbid) {
      setDetailState({ loading: false, message: '', detail: null });
      return null;
    }
    setDetailState((current) => ({ ...current, loading: true, message: '' }));
    try {
      const detail = await fetchContractDetailForUser(mbid, userNo);
      setDetailState({ loading: false, message: '', detail });
      return detail;
    } catch (error) {
      setDetailState({ loading: false, message: `계약 상세 조회 대기: ${error.message}`, detail: null });
      return null;
    }
  }, [auth?.access_token, latestContract?.mbid, userNo]);

  useEffect(() => {
    loadEvaluationDetail();
  }, [loadEvaluationDetail]);

  const contract = detailState.detail?.contract ?? latestContract;
  const fees = detailState.detail?.fees ?? latestContract?.fees ?? [];
  const contractShops = detailState.detail?.shops ?? [];
  const currentStatus = moneybankStatusKey(contract?.status);
  const latestFee = latestFeeDetail(fees);
  const progress = getMoneybankLegacyProgress(currentStatus);
  const serviceName = kind === 'advpay' ? '구매자금 선지급' : '매출 선정산';
  const hasTerms = ['CONDITIONS_ACCEPT', 'CONDITIONS_ACCEPT_ADJN', 'CONDITIONS_ACCEPT_ADJY', '04', '401', '402'].includes(currentStatus);
  const needsDocuments = currentStatus === 'PENDING_DOCUMENTS';
  const readyForContract = MONEYBANK_CONTRACT_STATUS_KEYS.has(currentStatus);

  function patchLocalContract(patch) {
    setDetailState((current) => {
      if (!current.detail?.contract) return current;
      return {
        ...current,
        detail: {
          ...current.detail,
          contract: { ...current.detail.contract, ...patch },
        },
      };
    });
  }

  async function refreshEvaluation() {
    const refreshed = await data.refresh();
    const mbid = refreshed.contracts?.items?.[0]?.mbid ?? contract?.mbid;
    await loadEvaluationDetail(mbid);
  }

  const resultValue = (value, formatter = (item) => item) => (
    hasTerms || readyForContract ? formatter(value) : '심사중'
  );

  return (
    <Layout variant="moneybank">
      <PageTitle title="머니뱅크" />
      <MoneybankSectionNav active="request" />
      <main className="content-wrap c4p2-2 final-core-page final-moneybank-page final-moneybank-evaluate-page" id="Main">
        <section className="section sec-1">
          <h2 className="hidden">서비스 신청</h2>
          <div className="full-box py-80 bg-gray">
            <div className="inner">
              <MoneybankStep active={2} />
              <article className="u16-review-progress step-wrap">
                <p className="desc">
                  제출하신 사업정보 및 신청서류를 기반으로 자료를 취합하고 쇼핑몰 계좌 정보를 확인하고 있습니다.<br />
                  심사 완료 후 이용 가능한 {serviceName} 한도와 조건을 알려드립니다.
                </p>
                <div className="u16-title-row">
                  <div className="sub-tit-wrap"><h3 className="sub-tit sm">심사진행상태</h3></div>
                  <button className="secondary-action" disabled={data.loading || detailState.loading} onClick={refreshEvaluation} type="button">새로고침</button>
                </div>
                {!auth?.access_token ? <p className="auth-message error">로그인 후 심사 상태를 확인할 수 있습니다.</p> : null}
                {detailState.message ? <p className="auth-message error">{detailState.message}</p> : null}
                <ul className="step-list">
                  {[
                    ['item-1', '/final-ui/static/img/icon/step1.png', '신청 자격 확인 완료'],
                    ['item-2', '/final-ui/static/img/icon/step2.png', '신청정보 취합 완료'],
                    ['item-4', '/final-ui/static/img/icon/step4.png', '신용평가 완료'],
                    ['item-5', '/final-ui/static/img/icon/step5.png', '종합심사 완료'],
                  ].map(([className, src, label], index) => (
                    <li className={`${className}${index < progress ? ' active' : ''}`} key={className}>
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      <figure className="figure"><img src={src} alt="" /></figure>
                      <p>{label}</p>
                    </li>
                  ))}
                </ul>
              </article>

              <article className="u16-info-block">
                <div className="sub-tit-wrap"><h3 className="sub-tit sm">기본정보</h3></div>
                <div className="u16-info-table">
                  <ReadOnlyField label="회사정보" value={contract?.firm_name ?? auth?.user?.biz_name ?? '-'} />
                  <ReadOnlyField label="대표자" value={contract?.user_name ?? auth?.user?.name ?? '-'} />
                  <ReadOnlyField label="사업자번호" value={auth?.user?.biz_num ?? '-'} />
                  <ReadOnlyField label="큐빅아이 ID" value={contract?.user_email ?? auth?.user?.email ?? '-'} />
                  <ReadOnlyField label="가입일자" value={formatDate(auth?.user?.reg_date)} />
                  <ReadOnlyField label="서비스 신청일" value={formatDate(contract?.request_date)} />
                  <ReadOnlyField label="선정산 상환 계좌" value={formatBankAccount(contract?.demand_acc_bank_code, contract?.demand_acc_number, contract?.demand_acc_holder)} />
                  <ReadOnlyField label="선정산 입금 계좌" value={formatBankAccount(contract?.main_acc_bank_code, contract?.main_acc_number, contract?.main_acc_holder)} />
                </div>
                <div className="u16-shop-table">
                  <h4>{kind === 'advpay' ? '선지급' : '선정산'} 대상 쇼핑몰</h4>
                  <div>
                    {contractShops.length ? contractShops.map((shop) => {
                      const option = shopOptions.find(([code]) => code === shop.contract_shop_type);
                      return (
                        <span className="u16-shop" key={shop.id ?? `${shop.contract_shop_type}-${shop.contract_shop_id}`}>
                          {option ? <img src={option[2]} alt={option[1]} /> : null}
                          <b>{option?.[1] ?? shop.contract_shop_type ?? '-'}</b>
                        </span>
                      );
                    }) : <span>{contract?.request_shop ? `연결 쇼핑몰 ${contract.request_shop}개` : '대상 쇼핑몰 정보를 조회 중입니다.'}</span>}
                  </div>
                </div>
              </article>

              <article className="u16-result-block">
                <div className="u16-title-row">
                  <div className="sub-tit-wrap"><h3 className="sub-tit sm">심사결과</h3></div>
                  <div className="u16-result-date"><strong>기준</strong><span>{formatDate(contract?.modified_date ?? contract?.approval_date ?? contract?.request_date)}</span></div>
                </div>
                <div className="u16-result-table">
                  <ReadOnlyField label="지급율" value={resultValue(contract?.latest_payment_rate ?? latestFee?.payment_rate, formatPercent)} />
                  <ReadOnlyField label="주문 건당 한도" value={resultValue(latestFee?.sales_limit_per_order, formatAmount)} />
                  <ReadOnlyField label="계약기간" value={resultValue(contract?.expire_date, (value) => (value ? `${formatDate(contract?.contract_date)} ~ ${formatDate(value)}` : '1년'))} />
                  <ReadOnlyField label="최대 미상환 금액" value={resultValue(latestFee?.max_outstanding_balance, formatAmount)} />
                  <ReadOnlyField label="이용 수수료율" value={resultValue(contract?.latest_fee_rate, formatPercent)} />
                  <ReadOnlyField label="평가등급" value={resultValue(contract?.prizm_score)} />
                </div>
              </article>

              {needsDocuments ? (
                <div className="u16-next-action">
                  <p className="submit-message">서류 보완이 필요한 신청건입니다.</p>
                  <a className="primary-action" href="/moneybank/current">보완서류 제출</a>
                </div>
              ) : null}
              {!contract && !data.loading ? (
                <div className="u16-next-action">
                  <p className="api-note">진행 중인 신청건이 없습니다.</p>
                  <a className="primary-action" href={kind === 'advpay' ? '/moneybank/advPay/request' : '/moneybank/advcalc/request'}>서비스 신청</a>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        {contract ? (
          <section className="section sec-2 u16-terms-section">
            <div className="inner">
              <div className="sub-tit-wrap"><h3 className="sub-tit sm">심사결과 및 이용조건 확인</h3></div>
              <div className="u16-terms-copy">
                <img src="/final-ui/static/img/icon/bank-icon4.png" alt="" />
                <div>
                  <p>{serviceName} 서비스는 1년 계약으로 운영됩니다.</p>
                  <p>심사 결과의 한도와 지급율, 수수료를 확인한 후 이용조건에 동의해 주십시오.</p>
                  <p>이용조건 동의 후 계약 체결 단계로 진행됩니다.</p>
                </div>
              </div>
              <div className="u16-terms-decision">
                <TermsDecisionPanel
                  contract={contract}
                  fees={fees}
                  onDone={refreshEvaluation}
                  onLocalChange={patchLocalContract}
                />
              </div>
              {hasTerms ? <p className="u16-decision-guide">위의 심사결과를 확인하고 이용조건에 동의하면 계약체결 단계로 진행됩니다.</p> : null}
              {readyForContract ? (
                <div className="u16-next-action">
                  <p className="submit-message success">이용조건 동의가 완료되었습니다.</p>
                  <a className="primary-action" href={kind === 'advpay' ? '/moneybank/advPay/contractForm' : '/moneybank/advcalc/contract'}>계약 체결</a>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}
      </main>
    </Layout>
  );
}

function CurrentPage() {
  const [auth] = useState(readAuthSession);
  const userNo = auth?.user?.user_no;
  const shopFilter = useAuthenticatedShopPairs(auth);
  const data = useUserDashboardData({
    userNo,
    shopPairs: shopFilter.shopPairs,
    enabled: Boolean(auth?.access_token && userNo),
  });
  const latestContract = data.contracts?.items?.[0];
  const [detailState, setDetailState] = useState({ loading: false, message: '', detail: null });
  const [payoutFilters, setPayoutFilters] = useState({ shopType: '', fromDate: '', toDate: '' });
  const [repaymentFilters, setRepaymentFilters] = useState({ fromDate: '', toDate: '' });
  const [supplementFiles, setSupplementFiles] = useState({ regNo: null, CBInfo: null });
  const [supplementState, setSupplementState] = useState({ submitting: false, message: '', uploaded: [] });

  const loadCurrentDetail = useCallback(async (mbid = latestContract?.mbid) => {
    if (!auth?.access_token || !userNo || !mbid) {
      setDetailState({ loading: false, message: '', detail: null });
      return null;
    }
    setDetailState((current) => ({ ...current, loading: true, message: '' }));
    try {
      const detail = await fetchContractDetailForUser(mbid, userNo);
      setDetailState({ loading: false, message: '', detail });
      return detail;
    } catch (error) {
      setDetailState({ loading: false, message: `계약 상세 조회 대기: ${error.message}`, detail: null });
      return null;
    }
  }, [auth?.access_token, latestContract?.mbid, userNo]);

  useEffect(() => {
    loadCurrentDetail();
  }, [loadCurrentDetail]);

  const contract = detailState.detail?.contract ?? latestContract;
  const latestFee = latestFeeDetail(detailState.detail?.fees ?? latestContract?.fees ?? []);
  const contractShops = detailState.detail?.shops ?? [];
  const redemption = (data.redemptions?.items ?? []).find((item) => item.mbid === contract?.mbid)
    ?? data.redemptions?.items?.[0];
  const needsDocumentSupplement = contract?.status === 'PENDING_DOCUMENTS';

  function inDateRange(value, fromDate, toDate) {
    if (!value) return !fromDate && !toDate;
    const date = String(value).slice(0, 10);
    if (fromDate && date < fromDate) return false;
    if (toDate && date > toDate) return false;
    return true;
  }

  const payoutRows = useMemo(() => (data.settlements?.items ?? []).filter((item) => (
    (!payoutFilters.shopType || item.shop_type === payoutFilters.shopType)
    && inDateRange(item.settlement_date, payoutFilters.fromDate, payoutFilters.toDate)
  )), [data.settlements?.items, payoutFilters]);

  const repaymentRows = useMemo(() => (data.redemptions?.items ?? []).filter((item) => (
    inDateRange(item.latest_history_date, repaymentFilters.fromDate, repaymentFilters.toDate)
  )), [data.redemptions?.items, repaymentFilters]);

  const feeRateItems = (latestFee?.rates ?? []).slice(0, 3).map((rate) => {
    const option = shopOptions.find(([code]) => code === rate.fee_type);
    return {
      label: `${option?.[1] ?? rate.fee_type ?? '서비스'} 수수료율`,
      value: formatPercent(rate.fee_rate),
    };
  });

  const conditionItems = [
    ...feeRateItems,
    { label: '지급율', value: formatPercent(contract?.latest_payment_rate ?? latestFee?.payment_rate) },
    { label: '주문 건당 한도', value: formatAmount(latestFee?.sales_limit_per_order) },
    { label: '최대 미상환금', value: formatAmount(latestFee?.max_outstanding_balance) },
    { label: '상환계좌', value: formatBankAccount(contract?.demand_acc_bank_code, contract?.demand_acc_number, contract?.demand_acc_holder) },
    { label: '지급계좌', value: formatBankAccount(contract?.main_acc_bank_code, contract?.main_acc_number, contract?.main_acc_holder) },
    { label: '계약기간', value: contract?.expire_date ? `${formatDate(contract?.contract_date)} ~ ${formatDate(contract.expire_date)}` : '-' },
    { label: '총 지급금', value: formatAmount(redemption?.latest_cumulative_provision_amount ?? redemption?.total_provision_amount) },
    { label: '총 상환금', value: formatAmount(redemption?.latest_cumulative_repayment_amount ?? redemption?.total_repayment_amount) },
    { label: '미상환금', value: formatAmount(redemption?.latest_outstanding_balance) },
    { label: '서비스 수수료', value: formatAmount(redemption?.total_usage_fee) },
    { label: '지급 수수료', value: formatAmount(redemption?.total_repayment_usage_fee) },
    { label: '반환금', value: formatAmount(redemption?.total_balance_provision_amount) },
  ];

  async function submitSupplementDocuments() {
    if (!contract?.mbid) {
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
        const uploadResult = await uploadDocumentFile(contract.mbid, {
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
      await updateContractDocumentStatus(contract.mbid, 'document_pending', `document supplement failed: ${error.message}`).catch(() => null);
      setSupplementState({ submitting: false, message: `보완서류 업로드 실패: ${error.message}`, uploaded: [] });
    }
  }

  return (
    <Layout variant="moneybank">
      <PageTitle title="머니뱅크" />
      <MoneybankSectionNav active="current" />
      <main className="content-wrap c4p3 final-core-page final-moneybank-page final-moneybank-current-page" id="Main">
        <section className="section sec-1">
          <h2 className="hidden">서비스 현황</h2>
          <div className="full-box bg-gray">
            <div className="inner">
              <article className="u17-condition-block">
                <div className="u17-title-row">
                  <div className="sub-tit-wrap"><h3 className="sub-tit sm mb-0">이용조건</h3></div>
                  <div className="u17-title-actions">
                    <button className="secondary-action" disabled={data.loading || detailState.loading} onClick={() => loadCurrentDetail()} type="button">새로고침</button>
                    {contract?.mbid ? <a className="primary-action" href={contractDetailPath(contract.mbid)}>인증서/계약 관리</a> : null}
                  </div>
                </div>
                {detailState.message ? <p className="auth-message error">{detailState.message}</p> : null}
                <div className="u17-condition-grid">
                  {conditionItems.map((item) => <ReadOnlyField key={item.label} label={item.label} value={item.value} />)}
                </div>
                <div className="u17-shop-row">
                  <strong>신청 쇼핑몰</strong>
                  <div>
                    {contractShops.length ? contractShops.map((shop) => {
                      const option = shopOptions.find(([code]) => code === shop.contract_shop_type);
                      return (
                        <span key={shop.id ?? `${shop.contract_shop_type}-${shop.contract_shop_id}`}>
                          {option ? <img src={option[2]} alt={option[1]} /> : null}
                          <b>{option?.[1] ?? shop.contract_shop_type ?? '-'}</b>
                        </span>
                      );
                    }) : <span>{contract?.request_shop ? `${contract.request_shop}개 쇼핑몰` : '-'}</span>}
                  </div>
                </div>
                <p className="u17-condition-note">미상환금이 최대 미상환금에 도달하면 지급이 일시 중단될 수 있습니다.</p>
                <div className="u17-contract-links">
                  {(data.contracts?.items ?? []).map((item) => <a href={contractDetailPath(item.mbid)} key={item.mbid}>{item.mbid} · {formatContractStatus(item.status)}</a>)}
                </div>
              </article>
              {canDecideTerms(contract) ? (
                <div className="u17-terms-panel"><TermsDecisionPanel contract={contract} fees={detailState.detail?.fees ?? []} onDone={data.refresh} /></div>
              ) : null}
            </div>
          </div>
        </section>
        <section className="section sec-2 select-z-index">
          <h2 className="hidden">지급현황</h2>
          <div className="inner">
            <article className="u17-status-block">
              <div className="sub-tit-wrap"><h3 className="sub-tit sm pb-0">지급현황</h3></div>
              <div className="u17-filter-bar">
                <label>쇼핑몰
                  <select aria-label="지급현황 쇼핑몰" onChange={(event) => setPayoutFilters((current) => ({ ...current, shopType: event.target.value }))} value={payoutFilters.shopType}>
                    <option value="">전체 쇼핑몰</option>
                    {shopOptions.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
                  </select>
                </label>
                <label>지급 시작일<input aria-label="지급 시작일" onChange={(event) => setPayoutFilters((current) => ({ ...current, fromDate: event.target.value }))} type="date" value={payoutFilters.fromDate} /></label>
                <label>지급 종료일<input aria-label="지급 종료일" onChange={(event) => setPayoutFilters((current) => ({ ...current, toDate: event.target.value }))} type="date" value={payoutFilters.toDate} /></label>
              </div>
              <div className="table basic-table table-r-border auto-xy-scroll u17-data-table u17-payout-table">
                <table>
                  <thead><tr><th>No.</th><th>쇼핑몰</th><th>지급일자</th><th>지급금</th><th>서비스 수수료</th></tr></thead>
                  <tbody>
                    {payoutRows.map((item, index) => (
                      <tr key={item.settlements_id ?? item.settlement_id ?? `${item.shop_type}-${item.settlement_date}-${index}`}>
                        <td>{index + 1}</td><td>{shopOptions.find(([code]) => code === item.shop_type)?.[1] ?? item.shop_type ?? '-'}</td><td>{formatDate(item.settlement_date)}</td><td>{formatAmount(item.settlement_amount ?? item.settlement_target_amount)}</td><td>{formatAmount(item.service_fee)}</td>
                      </tr>
                    ))}
                    {!payoutRows.length ? <tr><td colSpan="5">{data.loading ? '조회 중입니다.' : '지급 현황이 없습니다.'}</td></tr> : null}
                  </tbody>
                </table>
              </div>
            </article>
          </div>
        </section>
        <section className="section sec-3 select-z-index">
          <h2 className="hidden">상환현황</h2>
          <div className="inner">
            <article className="u17-status-block">
              <div className="sub-tit-wrap"><h3 className="sub-tit sm pb-0">상환현황</h3></div>
              <div className="u17-filter-bar u17-repayment-filter">
                <label>상환 시작일<input aria-label="상환 시작일" onChange={(event) => setRepaymentFilters((current) => ({ ...current, fromDate: event.target.value }))} type="date" value={repaymentFilters.fromDate} /></label>
                <label>상환 종료일<input aria-label="상환 종료일" onChange={(event) => setRepaymentFilters((current) => ({ ...current, toDate: event.target.value }))} type="date" value={repaymentFilters.toDate} /></label>
              </div>
              <div className="table basic-table type-2 table-r-border auto-xy-scroll u17-data-table u17-repayment-table">
                <table>
                  <thead><tr><th>No.</th><th>상환일자</th><th>출금액</th><th>상환금</th><th>서비스 수수료</th><th>지급 수수료</th><th>반환금</th></tr></thead>
                  <tbody>
                    {repaymentRows.map((item, index) => (
                      <tr key={item.mbid}>
                        <td>{index + 1}</td><td>{formatDate(item.latest_history_date)}</td><td>{formatAmount(item.total_deposit_amount)}</td><td>{formatAmount(item.latest_cumulative_repayment_amount ?? item.total_repayment_amount)}</td><td>{formatAmount(item.total_usage_fee)}</td><td>{formatAmount(item.total_repayment_usage_fee)}</td><td>{formatAmount(item.total_balance_provision_amount)}</td>
                      </tr>
                    ))}
                    {!repaymentRows.length ? <tr><td colSpan="7">{data.loading ? '조회 중입니다.' : '상환 현황이 없습니다.'}</td></tr> : null}
                  </tbody>
                </table>
              </div>
            </article>
          </div>
        </section>
        {needsDocumentSupplement ? (
          <section className="section sec-4 u17-supplement-section">
            <div className="inner"><section className="form-panel final-moneybank-form-panel">
              <h2>보완서류 제출</h2>
              <p className="api-note">서류 업로드가 완료되지 않은 신청건입니다. 기존 신청번호에 보완서류를 다시 업로드합니다.</p>
              <div className="file-grid">
                <label>사업자등록증<input accept={REQUEST_DOCUMENT_ACCEPT} onChange={(event) => setSupplementFiles((current) => ({ ...current, regNo: event.target.files?.[0] ?? null }))} type="file" /></label>
                <label>대표자 신분증<input accept={REQUEST_DOCUMENT_ACCEPT} onChange={(event) => setSupplementFiles((current) => ({ ...current, CBInfo: event.target.files?.[0] ?? null }))} type="file" /></label>
              </div>
              <p className="file-guide">* 보완서류는 3MB 이하의 jpg, jpeg, png, pdf 파일만 업로드합니다.</p>
              <button className="primary-action" disabled={supplementState.submitting} onClick={submitSupplementDocuments} type="button">{supplementState.submitting ? '보완서류 업로드 중' : '보완서류 제출'}</button>
              {supplementState.message ? <p className={supplementState.uploaded.length ? 'submit-message success' : 'submit-message'}>{supplementState.message}</p> : null}
              {supplementState.uploaded.length ? <ul className="uploaded-list">{supplementState.uploaded.map((item) => <li key={item.uuid}>{item.file_division}: {item.origin_file_name}.{item.file_ext}</li>)}</ul> : null}
            </section></div>
          </section>
        ) : null}
        {!needsDocumentSupplement && supplementState.message ? (
          <section className="section sec-4 u17-supplement-section">
            <div className="inner"><section className="form-panel final-moneybank-form-panel">
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
            </section></div>
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
  const shopSummary = (state.detail?.shops ?? [])
    .map((item) => `${item.contract_shop_type ?? '-'} ${item.contract_shop_id ?? ''}`.trim())
    .join(', ') || '-';
  const feeRateSummary = (latestFee?.rates ?? [])
    .map((item) => `${item.fee_type ?? '수수료'} ${formatPercent(item.fee_rate)}`)
    .join(', ') || formatPercent(contract?.latest_fee_rate);
  const contractPeriod = contract?.expire_date
    ? `${formatDate(contract?.contract_date)} ~ ${formatDate(contract.expire_date)}`
    : formatDate(contract?.contract_date);
  const conditionItems = [
    ['계약번호', contract?.mbid ?? mbid],
    ['상품', formatProductCode(contract?.product_code)],
    ['상태', contract ? formatMoneybankContractStatus(contract.status) : state.loading ? '조회 중' : '-'],
    ['지급율', formatPercent(latestFee?.payment_rate ?? contract?.latest_payment_rate)],
    ['수수료율', feeRateSummary],
    ['주문 건당 한도', formatAmount(latestFee?.sales_limit_per_order)],
    ['최대 미상환금', formatAmount(latestFee?.max_outstanding_balance)],
    ['정산계좌', formatBankAccount(contract?.demand_acc_bank_code, contract?.demand_acc_number, contract?.demand_acc_holder)],
    ['주거래계좌', formatBankAccount(contract?.main_acc_bank_code, contract?.main_acc_number, contract?.main_acc_holder)],
    ['계약기간', contractPeriod],
    ['총 지급', formatAmount(redemption?.latest_cumulative_provision_amount)],
    ['총 상환', formatAmount(redemption?.latest_cumulative_repayment_amount)],
    ['미상환금', formatAmount(redemption?.latest_outstanding_balance)],
  ];

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
      <PageTitle title="머니뱅크" />
      <MoneybankSectionNav active="current" />
      <main className="content-wrap c4p3 final-core-page final-moneybank-page final-moneybank-derived-page final-moneybank-contract-detail-page u24-contract-detail-page" id="Main">
        <section className="section sec-1">
          <h2 className="hidden">계약 상세</h2>
          <div className="inner">
            <p className="u24-back-link"><a href="/moneybank/current">서비스 현황으로 돌아가기</a></p>
            {state.message ? <p className="auth-message error">{state.message}</p> : null}
            <section className="u24-contract-conditions">
              <div className="u24-detail-heading">
                <h2>이용조건</h2>
                <span>{contract?.electronic_signature_status === 'SIGNED' ? '전자서명 완료' : '계약 확인 중'}</span>
              </div>
              <div className="u24-condition-grid">
                {conditionItems.map(([label, value]) => (
                  <dl key={label}><dt>{label}</dt><dd>{value ?? '-'}</dd></dl>
                ))}
                <dl className="u24-condition-wide"><dt>신청 쇼핑몰</dt><dd>{shopSummary}</dd></dl>
              </div>
              <p>미상환금이 최대 미상환금에 도달할 경우 지급이 중단될 수 있습니다.</p>
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
          </div>
        </section>
      </main>
    </Layout>
  );
}

function ClauseDetailsPage({ clauseNo }) {
  const detail = legacyMoneybankClauses[Number(clauseNo)] ?? legacyMoneybankClauses[1];
  return (
    <Layout>
      <PageTitle title="머니뱅크 약관" text={detail.title} />
      <MoneybankSectionNav active="request" />
      <main className="content-wrap view final-core-page clause-page final-moneybank-page final-moneybank-derived-page" id="Main">
        <section className="section sec-1">
          <h2 className="hidden">약관 상세</h2>
          <div className="inner">
            <section className="form-panel legal-clause-panel final-moneybank-form-panel">
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
          </div>
        </section>
      </main>
    </Layout>
  );
}

function DepositTestPage() {
  return (
    <Layout>
      <PageTitle title="머니뱅크" text="상환입금 테스트 화면의 운영 분류를 확인합니다." />
      <MoneybankSectionNav active="current" />
      <main className="content-wrap view final-core-page final-moneybank-page final-moneybank-derived-page" id="Main">
        <section className="section sec-1">
          <h2 className="hidden">입금 테스트</h2>
          <div className="inner">
            <section className="form-panel final-moneybank-form-panel">
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
      <PageTitle title="머니뱅크" text={label} />
      <MoneybankSectionNav active="current" />
      <main className="content-wrap c4p2-2 final-core-page final-moneybank-page final-moneybank-derived-page" id="Main">
        <section className="section sec-1">
          <h2 className="hidden">계약 체결 흐름</h2>
          <div className="inner">
            <section className="form-panel final-moneybank-form-panel">
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
          </div>
        </section>
      </main>
    </Layout>
  );
}


export { MoneybankIntroPage, RequestPage, CurrentPage, ContractDetailPage, ClauseDetailsPage, DepositTestPage, EvaluatePage, ContractFormPage, MoneybankProcessRoutePage };
