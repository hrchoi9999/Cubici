import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const AUTH_STORAGE_KEY = 'cubiciUserAuth';
const MAX_REQUEST_DOCUMENT_SIZE = 3 * 1024 * 1024;
const REQUEST_DOCUMENT_ACCEPT = '.jpg,.jpeg,.png,.pdf';
const REQUEST_DOCUMENT_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'pdf']);

const nav = [
  {
    title: '통합정보',
    items: [
      ['당월현황', '/cubici/integratedInfo/tab1'],
      ['매출분석', '/cubici/integratedInfo/tab2'],
      ['상품분석', '/cubici/integratedInfo/tab3'],
    ],
  },
  {
    title: '매출정보',
    items: [
      ['판매현황', '/cubici/salesInfo/sales'],
      ['반품/교환', '/cubici/salesInfo/return'],
    ],
  },
  {
    title: '정산정보',
    items: [
      ['정산 캘린더', '/cubici/calculateInfo/calendar'],
      ['정산 상세', '/cubici/calculateInfo/details'],
    ],
  },
  {
    title: '머니뱅크',
    items: [
      ['서비스 소개', '/moneybank/intro/advpay'],
      ['서비스 신청', '/moneybank/request'],
      ['서비스 현황', '/moneybank/current'],
    ],
  },
  {
    title: '고객지원',
    items: [
      ['요금안내', '/chargeInfo'],
      ['서비스 공지', '/board/notice/index'],
      ['Q&A', '/board/qa/index'],
      ['FAQ', '/board/faq/index'],
      ['블로그', 'https://blog.naver.com/cubici2020', true],
    ],
  },
];

function navGroupIndexForPath(path) {
  const normalizedPath = path.startsWith('/m/') ? path.slice(2) : path;
  const groupPatterns = [
    /^\/cubici\/(?:integratedInfo|infoIntegrated)(?:\/|$)/,
    /^\/cubici\/salesInfo(?:\/|$)/,
    /^\/cubici\/calculateInfo(?:\/|$)/,
    /^\/(?:moneybank|cubici\/moneybank)(?:\/|$)/,
    /^\/(?:board(?:\/|$)|chargeInfo(?:\/|$))/,
  ];
  return groupPatterns.findIndex((pattern) => pattern.test(normalizedPath));
}

function mobileGnbIndexForPath(path) {
  const normalizedPath = path.startsWith('/m/') ? path.slice(2) : path;
  if (normalizedPath === '/' || normalizedPath === '/main') return 0;

  const groupIndex = navGroupIndexForPath(normalizedPath);
  return groupIndex === -1 ? -1 : groupIndex + 1;
}

const moneybankTabs = [
  ['구매자금 선지급', '/moneybank/intro/advpay'],
  ['매출 선정산', '/moneybank/intro/advcalc'],
  ['신용대출', '/moneybank/intro/creditpay'],
];

const shopOptions = [
  ['NAVER', '네이버', '/final-ui/static/img/logo/naver.png'],
  ['COUPANG', '쿠팡', '/final-ui/static/img/logo/coupang-s.jpg'],
  ['GMARKET', '지마켓', '/final-ui/static/img/logo/gmarket.png'],
  ['STREET11', '11번가', '/final-ui/static/img/logo/11st-s.png'],
  ['AUCTION', '옥션', '/final-ui/static/img/logo/auction.png'],
  ['INTERPARK', '인터파크', '/final-ui/static/img/logo/interpark.jpg'],
];

function formatAmount(value) {
  const number = Number(value ?? 0);
  return `${number.toLocaleString('ko-KR')}원`;
}

function formatDate(value) {
  if (!value) return '-';
  return String(value).slice(0, 10);
}

function formatContractStatus(value) {
  const labels = {
    REQUEST: '신청접수',
    PENDING_REVIEW: '심사대기',
    PENDING_DOCUMENTS: '서류보완',
    CONDITIONS_ACCEPT: '조건제시',
    USE_AGREE: '이용조건 동의',
    TERMS_REFUSED: '동의거부',
    ACCOUNT_STANDBY: '계좌대기',
    CONTRACT: '계약완료',
    REJECTED: '거절',
    TERMINATION_REQUEST: '해지신청',
    SELF_TERMINATION: '해지',
    '00': '사전심사 완료',
    '01': '신청',
    '02': '서류확인',
    '03': '심사대기',
    '04': '조건제시',
    '05': '이용조건 동의',
    '06': '계약완료',
    '07': '계약만료',
    '41': '조건거부',
    '51': '동의거부',
    '71': '해지신청',
    '72': '본인해지',
    '73': '강제해지',
    '81': '계좌대기',
    '82': '계좌해지',
  };
  return labels[value] ?? value ?? '-';
}

function statusKey(value) {
  return String(value ?? '').trim().toUpperCase();
}

function canDecideTerms(contract) {
  return ['CONDITIONS_ACCEPT', '04'].includes(statusKey(contract?.status));
}

function formatBankAccount(bankCode, accountNumber, holder) {
  const parts = [bankCode, accountNumber].filter(Boolean);
  const base = parts.length ? parts.join(' ') : '-';
  return holder ? `${base} (${holder})` : base;
}

function validateRequestDocuments(entries) {
  for (const [label, file] of entries) {
    if (!file) continue;
    const extension = String(file.name ?? '').split('.').pop()?.toLowerCase() ?? '';
    if (!REQUEST_DOCUMENT_EXTENSIONS.has(extension)) {
      return `${label}은 jpg, jpeg, png, pdf 파일만 업로드할 수 있습니다.`;
    }
    if (file.size > MAX_REQUEST_DOCUMENT_SIZE) {
      return `${label}은 3MB 이하 파일만 업로드할 수 있습니다.`;
    }
  }
  return '';
}

function formatProductCode(value) {
  const labels = {
    MP: '머니뱅크 선정산/구매자금',
  };
  return labels[value] ?? value ?? '-';
}

function formatPercent(value) {
  if (value === null || value === undefined || value === '') return '-';
  return `${Number(value).toLocaleString('ko-KR', { maximumFractionDigits: 2 })}%`;
}

function latestContractFee(contract) {
  return {
    paymentRate: contract?.latest_payment_rate ?? null,
    feeRate: contract?.latest_fee_rate ?? null,
  };
}

function latestFeeDetail(fees) {
  const items = fees ?? [];
  return items.length ? items[items.length - 1] : null;
}

async function fetchJson(path) {
  const authHeaders = buildAuthHeaders();
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 12_000);
    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        cache: 'no-store',
        signal: controller.signal,
        headers: authHeaders,
      });
      if (!response.ok) {
        throw new Error(`${response.status}`);
      }
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    } catch (error) {
      lastError = error;
      if (/^\d+$/.test(String(error.message)) || attempt === 2) {
        throw normalizeApiError(error);
      }
      await new Promise((resolve) => {
        setTimeout(resolve, 200 * (attempt + 1));
      });
    } finally {
      clearTimeout(timeoutId);
    }
  }
  throw lastError;
}

function normalizeApiError(error) {
  if (error?.name === 'AbortError') {
    return new Error('API 서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.');
  }
  if (String(error?.message ?? '').includes('Failed to fetch')) {
    return new Error('API 서버에 연결할 수 없습니다. 서버 점검 중일 수 있습니다.');
  }
  return error;
}

async function requestJson(path, options = {}) {
  const { timeoutMs = 12_000, ...fetchOptions } = options;
  const authHeaders = buildAuthHeaders();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...fetchOptions,
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        ...authHeaders,
        ...(fetchOptions.headers ?? {}),
      },
    });
    const text = await response.text();
    const body = text ? JSON.parse(text) : {};
    if (!response.ok) {
      const detail = typeof body.detail === 'string' ? body.detail : JSON.stringify(body.detail ?? {});
      throw new Error(detail || `${response.status}`);
    }
    return body;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('요청 시간이 초과되었습니다.');
    }
    throw normalizeApiError(error);
  } finally {
    clearTimeout(timeoutId);
  }
}

async function postJson(path, payload, options = {}) {
  return requestJson(path, {
    ...options,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    body: JSON.stringify(payload),
  });
}

async function putJson(path, payload, options = {}) {
  return requestJson(path, {
    ...options,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    body: JSON.stringify(payload),
  });
}

async function deleteJson(path) {
  return requestJson(path, {
    method: 'DELETE',
  });
}

function readAuthSession() {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw);
    if (String(session?.user?.user_type ?? '').trim().toUpperCase() !== 'USER') {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
    return session;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

function saveAuthSession(session) {
  if (String(session?.user?.user_type ?? '').trim().toUpperCase() !== 'USER') {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    throw new Error('사용자 계정만 사용자 서비스에 접속할 수 있습니다.');
  }
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

function clearAuthSession() {
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

function buildAuthHeaders() {
  const auth = readAuthSession();
  return auth?.access_token ? { Authorization: `Bearer ${auth.access_token}` } : {};
}

function buildShopPairs(items) {
  const pairs = (items ?? [])
    .filter((item) => item.shop_type && item.shop_id)
    .map((item) => `${item.shop_type}:${item.shop_id}`);
  return pairs.length ? pairs.join(',') : '__none__';
}

async function fetchAuthJson(path, options = {}) {
  const auth = readAuthSession();
  if (!auth?.access_token) {
    throw new Error('로그인이 필요합니다.');
  }
  const method = String(options.method ?? 'GET').toUpperCase();
  let lastError;
  const maxAttempts = method === 'GET' ? 3 : 1;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, options.timeoutMs ?? 15_000);
    try {
      const { timeoutMs: _timeoutMs, ...fetchOptions } = options;
      const response = await fetch(`${API_BASE_URL}${path}`, {
        ...fetchOptions,
        cache: 'no-store',
        signal: controller.signal,
        headers: {
          ...(fetchOptions.headers ?? {}),
          Authorization: `Bearer ${auth.access_token}`,
        },
      });
      const text = await response.text();
      const body = text ? JSON.parse(text) : {};
      if (!response.ok) {
        const detail = typeof body.detail === 'string' ? body.detail : JSON.stringify(body.detail ?? {});
        throw new Error(detail || `${response.status}`);
      }
      return body;
    } catch (error) {
      lastError = error;
      if (/^\d+$/.test(String(error.message)) || attempt === maxAttempts - 1) {
        throw error;
      }
      await new Promise((resolve) => {
        setTimeout(resolve, 200 * (attempt + 1));
      });
    } finally {
      clearTimeout(timeoutId);
    }
  }
  throw lastError;
}

function useAuthenticatedShopPairs(auth) {
  const [state, setState] = useState({
    loading: Boolean(auth?.access_token),
    message: '',
    shops: [],
    shopPairs: auth?.access_token ? '__none__' : undefined,
  });

  const load = useCallback(async () => {
    if (!auth?.access_token) {
      setState({ loading: false, message: '', shops: [], shopPairs: undefined });
      return { shops: [], shopPairs: undefined };
    }
    setState((current) => ({ ...current, loading: true, message: '' }));
    try {
      const response = await fetchAuthJson('/v1/api/accounts/me/shops');
      const shops = response.items ?? [];
      const shopPairs = buildShopPairs(shops);
      setState({ loading: false, message: '', shops, shopPairs });
      return { shops, shopPairs };
    } catch (error) {
      setState({ loading: false, message: `쇼핑몰 조회 실패: ${error.message}`, shops: [], shopPairs: '__none__' });
      return { shops: [], shopPairs: '__none__' };
    }
  }, [auth?.access_token]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, refresh: load };
}

async function postAuthJson(path, payload) {
  return fetchAuthJson(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

async function putAuthJson(path, payload) {
  return fetchAuthJson(path, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

async function deleteAuthJson(path) {
  return fetchAuthJson(path, {
    method: 'DELETE',
  });
}

async function uploadDocumentFile(mbid, { documentType, file, uploadedBy }) {
  const authHeaders = buildAuthHeaders();
  const formData = new FormData();
  formData.append('document_type', documentType);
  formData.append('uploaded_by', uploadedBy);
  formData.append('file', file);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 45_000);
  try {
    const response = await fetch(`${API_BASE_URL}/v1/api/contracts/${encodeURIComponent(mbid)}/documents/files`, {
      method: 'POST',
      cache: 'no-store',
      signal: controller.signal,
      headers: authHeaders,
      body: formData,
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(body.detail ?? `${response.status}`);
    }
    return body;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('서류 업로드 요청 시간이 초과되었습니다.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function updateContractDocumentStatus(mbid, action, reason) {
  return putJson(`/v1/api/contracts/${encodeURIComponent(mbid)}/status`, {
    action,
    changed_by: 'user-web',
    reason,
  });
}

function contractDetailPath(mbid) {
  return `/moneybank/current/${encodeURIComponent(mbid)}`;
}

function contractDocumentDownloadUrl(mbid, uuid, userNo) {
  return `${API_BASE_URL}/v1/api/contracts/${encodeURIComponent(mbid)}/documents/files/${encodeURIComponent(uuid)}/download?user_no=${encodeURIComponent(userNo)}`;
}

async function fetchContractDetailForUser(mbid, userNo) {
  return fetchJson(`/v1/api/contracts/${encodeURIComponent(mbid)}?user_no=${encodeURIComponent(userNo)}`);
}

async function fetchContractDocumentsForUser(mbid, userNo) {
  return fetchJson(`/v1/api/contracts/${encodeURIComponent(mbid)}/documents/files?user_no=${encodeURIComponent(userNo)}`);
}

async function fetchInquiryDetailForUser(qnaId, userNo) {
  return fetchJson(`/v1/api/support/inquiries/${encodeURIComponent(qnaId)}?user_no=${encodeURIComponent(userNo)}`);
}

async function createInquiryForUser(payload) {
  return postJson('/v1/api/support/inquiries', payload);
}

async function fetchChargePlans() {
  return fetchJson('/v1/api/preferences/charges?limit=50&offset=0&status=all&order_by=charge_code_asc');
}

function formatChargeType(value) {
  const labels = {
    B: '기본요금',
    A: '부가요금',
    M: '조건부요금',
    O: '기타요금',
    F: '무료요금',
  };
  return labels[value] ?? value ?? '-';
}

function formatPeriod(period, unit) {
  if (!period) return '-';
  const labels = { D: '일', M: '개월', Y: '년' };
  return `${period}${labels[unit] ?? unit ?? ''}`;
}

function supportBoardConfig(kind) {
  if (kind === 'notice') {
    return {
      title: '서비스 공지',
      text: '큐빅아이와 머니뱅크 서비스 운영 공지를 확인합니다.',
      endpoint: '/v1/api/support/boards/notice?limit=30&offset=0',
      empty: '등록된 공지가 없습니다.',
    };
  }
  if (kind === 'faq') {
    return {
      title: 'FAQ',
      text: '서비스 이용 중 자주 묻는 질문을 확인합니다.',
      endpoint: '/v1/api/support/boards/faq?limit=30&offset=0',
      empty: '등록된 FAQ가 없습니다.',
    };
  }
  return {
    title: 'Q&A',
    text: '내 문의와 답변 처리 상태를 확인합니다.',
    endpoint: null,
    empty: '등록된 문의가 없습니다.',
  };
}

function plainText(value) {
  return String(value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim() || '-';
}

function useUserDashboardData({ userNo, shopPairs, enabled = true } = {}) {
  const [state, setState] = useState({
    loading: enabled,
    error: '',
    accounts: null,
    contracts: null,
    returns: null,
    sales: null,
    settlements: null,
    redemptions: null,
  });

  const load = useCallback(async () => {
    if (!enabled || !userNo) {
      const emptyState = {
        loading: false,
        error: '로그인 후 사용자 데이터를 조회합니다.',
        accounts: null,
        contracts: { limit: 0, offset: 0, total: 0, items: [] },
        returns: { limit: 0, offset: 0, total: 0, items: [] },
        sales: { limit: 0, offset: 0, total: 0, items: [] },
        settlements: { limit: 0, offset: 0, total: 0, items: [] },
        redemptions: { limit: 0, offset: 0, total: 0, items: [] },
      };
      setState(emptyState);
      return emptyState;
    }
    setState((current) => ({ ...current, loading: true, error: '' }));
    const contractPath = `/v1/api/contracts?limit=5&offset=0&user_no=${encodeURIComponent(userNo)}`;
    const shopPairQuery = shopPairs === undefined ? '' : `&shop_pairs=${encodeURIComponent(shopPairs)}`;
    const results = await Promise.allSettled([
      Promise.resolve(null),
      fetchJson(contractPath),
      fetchJson(`/v1/api/sales/orders?limit=5&offset=0${shopPairQuery}`),
      fetchJson(`/v1/api/sales/returns?limit=5&offset=0${shopPairQuery}`),
      fetchJson(`/v1/api/settlements?limit=5&offset=0${shopPairQuery}`),
      fetchJson(`/v1/api/redemptions?limit=5&offset=0&user_no=${encodeURIComponent(userNo)}`),
    ]);
    const [accounts, contracts, sales, returns, settlements, redemptions] = results;
    const rejected = results.find((result) => result.status === 'rejected');
    const nextState = {
      loading: false,
      error: rejected ? `API 연결 대기: ${rejected.reason.message}` : '',
      accounts: accounts.status === 'fulfilled' ? accounts.value : null,
      contracts: contracts.status === 'fulfilled' ? contracts.value : null,
      sales: sales.status === 'fulfilled' ? sales.value : null,
      returns: returns.status === 'fulfilled' ? returns.value : null,
      settlements: settlements.status === 'fulfilled' ? settlements.value : null,
      redemptions: redemptions.status === 'fulfilled' ? redemptions.value : null,
    };
    setState(nextState);
    return nextState;
  }, [enabled, shopPairs, userNo]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, refresh: load };
}

function Header({ variant }) {
  const [auth, setAuth] = useState(readAuthSession);
  const [pcOpen, setPcOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentPath = typeof window === 'undefined' ? '/' : window.location.pathname;
  const activeGroupIndex = navGroupIndexForPath(currentPath);
  const [mobileGroupIndex, setMobileGroupIndex] = useState(activeGroupIndex >= 0 ? activeGroupIndex : 0);
  const userName = auth?.user?.name ?? auth?.user?.biz_name ?? auth?.user?.email ?? '큐빅아이';

  useEffect(() => {
    document.body.classList.toggle('fixed', mobileOpen);
    return () => document.body.classList.remove('fixed');
  }, [mobileOpen]);

  useEffect(() => {
    function closeMobileMenuOnDesktop() {
      if (window.innerWidth > 1023) setMobileOpen(false);
    }
    window.addEventListener('resize', closeMobileMenuOnDesktop);
    return () => window.removeEventListener('resize', closeMobileMenuOnDesktop);
  }, []);

  function logout() {
    clearAuthSession();
    setAuth(null);
    setMobileOpen(false);
    window.location.assign('/main');
  }

  function renderPcNav() {
    return nav.map((group, index) => (
      <li className={index === activeGroupIndex ? 'active' : ''} key={group.title}>
        <a className="dep-01" href="#n" onClick={(event) => event.preventDefault()}>
          <span>{group.title}</span>
        </a>
        <div className="lnb">
          <ul className="dep-02">
            {group.items.map(([label, href, external]) => (
              <li key={href}><a href={href} rel={external ? 'noreferrer' : undefined} target={external ? '_blank' : undefined}><span>{label}</span></a></li>
            ))}
          </ul>
        </div>
      </li>
    ));
  }

  function renderMobileNav() {
    return nav.map((group, index) => (
      <li className={mobileGroupIndex === index ? 'active' : ''} key={group.title}>
        <a
          className="dep-01"
          href="#n"
          onClick={(event) => {
            event.preventDefault();
            setMobileGroupIndex(index);
          }}
        >
          <span>{group.title}</span>
        </a>
        <div className="lnb">
          <ul className="dep-02">
            {group.items.map(([label, href, external]) => (
              <li key={href}><a href={href} rel={external ? 'noreferrer' : undefined} target={external ? '_blank' : undefined}><span>{label}</span></a></li>
            ))}
          </ul>
        </div>
      </li>
    ));
  }

  const isAuthMain = variant === 'auth-main';
  const isPublicMain = variant === 'public-main';
  const isLogin = variant === 'login';
  const isMain = isAuthMain || isPublicMain;

  return (
    <div id="Header" className={`header-wrap react-final-header${isMain ? ' main-header' : ''}${isAuthMain ? ' auth-main-header' : ''}${mobileOpen ? ' mo-open' : ''}`}>
      <div className={`header-bg${pcOpen ? ' active' : ''}`} />
      <div className="skip-menu">
        <a href="#Gnb">메뉴 바로가기</a>
        <a href="#Main">본문 바로가기</a>
      </div>
      <header className={`header pc-header${pcOpen ? ' active' : ''}`}>
        <div className="header-inner">
          <h1 className="logo">
            <a href="/"><img src={isMain ? '/final-ui/static/img/common/main-logo.svg' : '/final-ui/static/img/common/sub-logo.svg'} alt="cubici" /></a>
          </h1>
          <nav
            className="nav"
            aria-label="Cubici user navigation"
            onMouseEnter={() => setPcOpen(true)}
            onMouseLeave={() => setPcOpen(false)}
            onFocus={() => setPcOpen(true)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setPcOpen(false);
            }}
          >
            <ul className="gnb" id="Gnb">
              {renderPcNav()}
            </ul>
          </nav>
          <ul className="login-info">
            {auth?.user ? (
              <>
                <li className="next-el">
                  <i className="icon"><img src="/final-ui/static/img/icon/header-user.png" alt="user" /></i>
                  <span className="user-name">{userName}</span>님
                </li>
                <li className="next-el">
                  <button className="btn logout-btn" onClick={logout} type="button">로그아웃</button>
                </li>
                <li className="next-el"><a href="/cubici/mypage/companyInfo">마이페이지</a></li>
              </>
            ) : isLogin ? (
              <li className="login-user-icon">
                <a href="/login" aria-label="로그인">
                  <i className="icon"><img src="/final-ui/static/img/icon/header-user.png" alt="" /></i>
                </a>
              </li>
            ) : (
              <>
                <li className="first-el">
                  <a className="btn login-btn" href="/login">로그인</a>
                </li>
                <li className="next-el">
                  <a className="btn signup-btn" href="/mainSignUp">회원가입</a>
                </li>
              </>
            )}
          </ul>
        </div>
      </header>
      <header className="header mobile-header">
        <div className="logo-wrap">
          <h1 className="logo">
            <a href="/"><img src="/final-ui/static/img/common/sub-logo.svg" alt="cubici" /></a>
          </h1>
          <ul className="login-info">
            <li>
              <a href={auth?.user ? '/cubici/mypage/companyInfo' : '/login'}>
                <i className="icon"><img src="/final-ui/static/img/icon/header-user.png" alt="user" /></i>
              </a>
            </li>
          </ul>
          <button aria-controls="CubiciMobileNav" aria-expanded={mobileOpen} aria-label="전체 메뉴 열기" className="mobile-btn" onClick={() => setMobileOpen(true)} type="button">
            <i className="icon"><img src="/final-ui/static/img/icon/menu.png" alt="메뉴열" /></i>
          </button>
        </div>
        <div className="m-nav-wrap">
          <div className="login-info-wrap">
            <div className="menu-btn">
              <a href="/">
                <i className="icon"><img src="/final-ui/static/img/icon/home.svg" alt="메인으로" /></i>
              </a>
              <button aria-label="전체 메뉴 닫기" className="nav-close" onClick={() => setMobileOpen(false)} type="button">
                <i className="icon"><img src="/final-ui/static/img/icon/close.svg" alt="메뉴닫기" /></i>
              </button>
            </div>
            <ul className="m-login-info">
              <li>
                <div className="next-el"><b><span className="user-name">{auth?.user ? userName : '큐빅아이'}</span></b>님</div>
              </li>
              <li>
                {auth?.user ? (
                  <div className="next-el">
                    <button className="btn logout-btn line-btn1" onClick={logout} type="button">로그아웃</button>
                  </div>
                ) : (
                  <div className="first-el"><a className="btn login-btn line-btn1" href="/login">로그인</a></div>
                )}
              </li>
            </ul>
          </div>
          <nav className={`m-nav${mobileOpen ? ' open' : ''}`} id="CubiciMobileNav" aria-label="Cubici mobile navigation">
            <ul className="gnb">
              {renderMobileNav()}
              <li className={currentPath.includes('/mypage') ? 'active' : ''}>
                <a className="dep-01" href="/cubici/mypage/companyInfo"><span>마이페이지</span></a>
                <div className="lnb">
                  <ul className="dep-02">
                    <li><a href="/cubici/mypage/companyInfo"><span>마이페이지</span></a></li>
                  </ul>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </header>
    </div>
  );
}

function Footer() {
  return (
    <div id="Footer" className="footer-wrap">
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-logo">
            <img src="/final-ui/static/img/common/main-logo.svg" alt="cubici" />
          </div>
          <div className="footer-txt">
            <p className="desc">
              <span>AI 기반의 공급망 금융 서비스 큐빅아이</span>
            </p>
            <address className="address">
              <ul>
                <li><b>회사명</b><span>(주)한국공급망데이터</span></li>
                <li><b>대표전화</b><span>02-6925-6373</span></li>
                <li><b>이메일</b><span><a href="mailto:admin@koreascf.com">admin@koreascf.com</a></span></li>
                <li><b>사업자 등록번호</b><span>412-87-03180</span></li>
                <li><b>본사 주소</b><span>서울시 강동구 올림픽로 752, 5층</span></li>
              </ul>
            </address>
          </div>
        </div>
      </footer>
    </div>
  );
}

function MobileGnb() {
  const currentPath = typeof window === 'undefined' ? '/' : window.location.pathname;
  const activeIndex = mobileGnbIndexForPath(currentPath);
  const items = [
    ['홈', '/', '/final-ui/static/img/icon/m-home.svg'],
    ['통합정보', '/cubici/integratedInfo/tab1', '/final-ui/static/img/icon/chart-histogram.svg'],
    ['매출정보', '/cubici/salesInfo/sales', '/final-ui/static/img/icon/box-alt.svg'],
    ['정산정보', '/cubici/calculateInfo/calendar', '/final-ui/static/img/icon/calendar.svg'],
    ['머니뱅크', '/moneybank/intro/advpay', '/final-ui/static/img/icon/bank.svg'],
    ['고객정보', '/board/notice/index', '/final-ui/static/img/icon/phone-call.svg'],
  ];

  return (
    <div id="mobileGnb" className="mobile-gnb-wrap">
      <nav className="mobile-gnb" aria-label="Cubici mobile quick navigation">
        <ul>
          {items.map(([label, href, icon], index) => (
            <li className={activeIndex === index ? 'active' : ''} key={label}>
              <a href={href}>
                <i className="icon">
                  <img src={icon} alt={label} />
                </i>
                <b>{label}</b>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

function Layout({ children, variant }) {
  const shellVariantClass = variant === 'auth-main'
    ? ' auth-main-shell'
    : variant === 'public-main'
      ? ' public-main-shell'
      : variant === 'login'
        ? ' login-shell'
        : variant === 'signup'
          ? ' signup-shell'
          : variant === 'integrated'
            ? ' integrated-shell'
          : variant === 'commerce'
            ? ' commerce-shell'
          : variant === 'moneybank'
            ? ' moneybank-shell'
      : '';

  return (
    <div id="wrap" className={`user-web-wrap final-ui-shell${shellVariantClass}`}>
      <Header variant={variant} />
      <div id="Main" className="container">
        {children}
      </div>
      <a className="page-top" href="#wrap" aria-label="맨 위로" />
      <Footer />
      <MobileGnb />
    </div>
  );
}


function DashboardSummary({ data }) {
  const settlementTotal = useMemo(
    () => data.settlements?.items?.reduce((sum, item) => sum + Number(item.settlement_amount ?? 0), 0) ?? 0,
    [data.settlements],
  );
  const redemptionBalance = useMemo(
    () => data.redemptions?.items?.reduce((sum, item) => sum + Number(item.latest_outstanding_balance ?? 0), 0) ?? 0,
    [data.redemptions],
  );
  const latestContract = data.contracts?.items?.[0];

  return (
    <section className="dashboard-summary" aria-label="사용자 데이터 요약">
      <div>
        <span>판매 조회</span>
        <strong>{data.loading ? '-' : `${data.sales?.total ?? 0}건`}</strong>
      </div>
      <div>
        <span>최근 정산액</span>
        <strong>{data.loading ? '-' : formatAmount(settlementTotal)}</strong>
      </div>
      <div>
        <span>미상환 잔액</span>
        <strong>{data.loading ? '-' : formatAmount(redemptionBalance)}</strong>
      </div>
      <div>
        <span>머니뱅크 신청/계약</span>
        <strong>{data.loading ? '-' : `${data.contracts?.total ?? 0}건`}</strong>
      </div>
      <div>
        <span>최근 계약상태</span>
        <strong>{data.loading ? '-' : formatContractStatus(latestContract?.status)}</strong>
      </div>
      <div>
        <span>반품/교환 조회</span>
        <strong>{data.loading ? '-' : `${data.returns?.total ?? 0}건`}</strong>
      </div>
      <p>{data.loading ? 'DB API 조회 중' : data.error || '로컬 DB API 연결 완료'}</p>
    </section>
  );
}


function PageTitle({ title, text }) {
  return (
    <div className="visual-wrap react-final-sub-visual">
      <div className="inner">
        <div className="visual">
          <h2 className="visual-tit">{title}</h2>
          {text ? <p className="visual-desc">{text}</p> : null}
        </div>
      </div>
    </div>
  );
}

function Tabs({ tabs, activeHref = null, centerActiveOnMobile = true, className = '' }) {
  const path = window.location.pathname;
  const activePath = activeHref ?? path;
  const activeTabRef = useRef(null);

  useEffect(() => {
    if (centerActiveOnMobile && window.matchMedia('(max-width: 1023px)').matches) {
      activeTabRef.current?.scrollIntoView({ block: 'nearest', inline: 'center' });
    }
  }, [activePath, centerActiveOnMobile]);

  return (
    <nav className={`sub-nav-wrap react-final-tabs ${className}`.trim()}>
      <ul className="sub-nav">
        {tabs.map(([label, href]) => (
          <li className={activePath === href ? 'active' : ''} key={href} ref={activePath === href ? activeTabRef : null}>
            <a href={href}><span>{label}</span></a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function LegacyPanel({ title, children, className = '', actions = null }) {
  return (
    <section className={`subBox react-legacy-panel ${className}`.trim()}>
      <header>
        <h4>{title}</h4>
        {actions ? <div className="btns">{actions}</div> : null}
      </header>
      <div className="contentArea">
        {children}
      </div>
    </section>
  );
}

function LegacySearchPanel({ title = '검색조건', children, actions = null, onSubmit }) {
  return (
    <LegacyPanel title={title} className="react-legacy-search-panel">
      <form className="m-search react-legacy-search" onSubmit={onSubmit ?? ((event) => event.preventDefault())}>
        <div className="react-legacy-search-fields">
          {children}
        </div>
        {actions ? <div className="btns react-legacy-search-actions">{actions}</div> : null}
      </form>
    </LegacyPanel>
  );
}

function LegacyDataTable({
  title,
  columns,
  items,
  renderRow,
  emptyMessage = '조회 결과가 없습니다.',
  loading = false,
  className = '',
  footer = null,
}) {
  return (
    <LegacyPanel title={title} className={`react-legacy-table-panel ${className}`.trim()}>
      <div className="tableSet">
        <div className="fixTable">
          <table className="m-shadowTable">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.key ?? column.label}>{column.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.length ? items.map(renderRow) : (
                <tr>
                  <td colSpan={columns.length}>{loading ? '조회 중입니다.' : emptyMessage}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {footer}
    </LegacyPanel>
  );
}

function LegacyBoardList({
  title,
  items,
  kind = 'notice',
  loading = false,
  emptyMessage = '등록된 게시글이 없습니다.',
}) {
  const isQa = kind === 'qa';
  return (
    <section className="m-baordSet react-legacy-board final-support-board-list">
      <div className="boardTop">
        <h3>{title}</h3>
        <span>총 {items.length.toLocaleString('ko-KR')}건</span>
      </div>
      <div className="boardList board-table auto-xy-scroll">
        <table className="list">
          <thead>
            <tr>
              <th>번호</th>
              <th>구분</th>
              <th>제목</th>
              {isQa ? <th>상태</th> : null}
              <th>작성자</th>
              <th>등록일</th>
            </tr>
          </thead>
          <tbody>
            {items.length ? items.map((item) => {
              const id = item.post_id ?? item.qna_id;
              const href = isQa ? `/board/qa/${encodeURIComponent(item.qna_id)}` : `/board/${kind}/${encodeURIComponent(item.post_id)}`;
              return (
                <tr key={`${kind}-${id}`}>
                  <td>{id}</td>
                  <td>{item.type_label ?? item.type ?? '-'}</td>
                  <td>
                    <a className="support-title support-title-link" href={href}>{item.title ?? '-'}</a>
                    <span className="support-snippet">{plainText(item.content)}</span>
                  </td>
                  {isQa ? <td>{item.answer_status ?? '-'}</td> : null}
                  <td>{item.created_by ?? '-'}</td>
                  <td>{formatDate(item.reg_date)}</td>
                </tr>
              );
            }) : (
              <tr><td colSpan={isQa ? 6 : 5}>{loading ? '조회 중입니다.' : emptyMessage}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function LegacyFormPanel({ title, children, className = '', actions = null }) {
  return (
    <LegacyPanel title={title} className={`react-legacy-form-panel ${className}`.trim()} actions={actions}>
      {children}
    </LegacyPanel>
  );
}

function LegacyIntroSection({ eyebrow, title, children, imageSrc, imageAlt, ctaHref, ctaLabel }) {
  return (
    <section className="contentGrid box-border react-legacy-intro">
      <div className="inner">
        <header>
          {eyebrow ? <h4>{eyebrow}</h4> : null}
          <h3>{title}</h3>
        </header>
        <article className="conArticle">
          <div className="conArticle-inner react-legacy-intro-inner">
            <div className="descriptionBox">
              {children}
              {ctaHref && ctaLabel ? (
                <div className="btnBox">
                  <a className="mBtn sColorS" href={ctaHref}>{ctaLabel}</a>
                </div>
              ) : null}
            </div>
            {imageSrc ? <img className="halfImg" src={imageSrc} alt={imageAlt ?? title} /> : null}
          </div>
        </article>
      </div>
    </section>
  );
}

function DocumentNotice() {
  return (
    <section className="document-notice">
      <h2>신청 준비서류</h2>
      {[
        ['대표자 신분증', '/final-ui/static/img/sub/c4/circle-1.png'],
        ['사업자 등록증', '/final-ui/static/img/sub/c4/circle-2.png'],
        ['지정은행 통장사본', '/final-ui/static/img/sub/c4/circle-3.png'],
        ['주거래 통장사본', '/final-ui/static/img/sub/c4/circle-4.png'],
      ].map(([label, src]) => (
        <div key={label}>
          <img src={src} alt="" />
          <span>{label}</span>
        </div>
      ))}
    </section>
  );
}

function ReadOnlyField({ label, value }) {
  return (
    <label>
      {label}
      <input type="text" readOnly value={value} />
    </label>
  );
}

function ContractProgress({ status }) {
  const key = statusKey(status);
  const steps = [
    ['신청', ['REQUEST', 'PENDING_REVIEW', 'PENDING_DOCUMENTS', 'CONDITIONS_ACCEPT', 'USE_AGREE', 'ACCOUNT_STANDBY', 'CONTRACT', '01', '02', '03', '04', '05', '06', '81']],
    ['심사', ['PENDING_REVIEW', 'CONDITIONS_ACCEPT', 'USE_AGREE', 'ACCOUNT_STANDBY', 'CONTRACT', '03', '04', '05', '06', '81']],
    ['조건확인', ['CONDITIONS_ACCEPT', 'USE_AGREE', 'ACCOUNT_STANDBY', 'CONTRACT', '04', '05', '06', '81']],
    ['이용조건 동의', ['USE_AGREE', 'ACCOUNT_STANDBY', 'CONTRACT', '05', '06', '81']],
    ['계약/계좌', ['ACCOUNT_STANDBY', 'CONTRACT', '06', '81']],
  ];
  return (
    <ol className="contract-progress">
      {steps.map(([label, doneKeys]) => (
        <li className={doneKeys.includes(key) ? 'done' : ''} key={label}>
          <span>{label}</span>
        </li>
      ))}
    </ol>
  );
}

function TermsDecisionPanel({ contract, fees = [], onDone, onLocalChange }) {
  const [state, setState] = useState({ submitting: false, message: '' });
  const fee = latestFeeDetail(fees);
  const decisionAllowed = canDecideTerms(contract);
  const status = statusKey(contract?.status);
  const shouldShow = decisionAllowed || ['USE_AGREE', '05', 'TERMS_REFUSED', '41', '51', 'ACCOUNT_STANDBY', '81', 'CONTRACT', '06'].includes(status);

  if (!contract?.mbid || !shouldShow) return null;

  async function decide(action) {
    setState({ submitting: true, message: action === 'agree_terms' ? '이용조건 동의 저장 중' : '이용조건 거절 저장 중' });
    try {
      await updateContractDocumentStatus(
        contract.mbid,
        action,
        action === 'agree_terms' ? 'terms agreed by user-web' : 'terms refused by user-web',
      );
      onLocalChange?.({
        status: action === 'agree_terms' ? 'USE_AGREE' : 'TERMS_REFUSED',
        agree_date: action === 'agree_terms' ? new Date().toISOString() : contract.agree_date,
      });
      setState({ submitting: false, message: action === 'agree_terms' ? '이용조건 동의가 저장되었습니다.' : '이용조건 거절이 저장되었습니다.' });
      onDone?.();
    } catch (error) {
      setState({ submitting: false, message: `이용조건 처리 실패: ${error.message}` });
    }
  }

  return (
    <section className="terms-panel">
      <h2>이용조건 확인</h2>
      <div className="field-grid">
        <ReadOnlyField label="계약번호" value={contract.mbid} />
        <ReadOnlyField label="진행상태" value={formatContractStatus(contract.status)} />
        <ReadOnlyField label="머니뱅크 지급율" value={formatPercent(fee?.payment_rate ?? contract.latest_payment_rate)} />
        <ReadOnlyField label="이용 수수료율" value={formatPercent(contract.latest_fee_rate)} />
        <ReadOnlyField label="주문건당 매출인정 한도" value={formatAmount(fee?.sales_limit_per_order)} />
        <ReadOnlyField label="계약기간" value={contract.expire_date ? `${formatDate(contract.contract_date)} ~ ${formatDate(contract.expire_date)}` : '1년'} />
      </div>
      <p className="api-note">심사결과 및 이용조건 확인 후 동의하면 관리자 계약 체결 단계로 진행됩니다.</p>
      {decisionAllowed ? (
        <div className="terms-actions">
          <button className="secondary-action" disabled={state.submitting} onClick={() => decide('refuse_terms')} type="button">동의하지 않습니다</button>
          <button className="primary-action" disabled={state.submitting} onClick={() => decide('agree_terms')} type="button">이용조건 동의</button>
        </div>
      ) : (
        <p className="submit-message success">현재 상태: {formatContractStatus(contract.status)}</p>
      )}
      {state.message ? <p className={state.message.includes('실패') ? 'submit-message' : 'submit-message success'}>{state.message}</p> : null}
    </section>
  );
}

function ContractStatusStrip({ data, contract, onRefresh }) {
  return (
    <section className="contract-strip">
      <div>
        <span>API 상태</span>
        <strong>{data.loading ? '조회 중' : data.error || '연결 완료'}</strong>
      </div>
      <div>
        <span>최근 신청번호</span>
        <strong>{contract?.mbid ?? '-'}</strong>
      </div>
      <div>
        <span>최근 상태</span>
        <strong>{formatContractStatus(contract?.status)}</strong>
      </div>
      <div>
        <span>신청일</span>
        <strong>{formatDate(contract?.request_date)}</strong>
      </div>
      <ContractProgress status={contract?.status} />
      {onRefresh ? (
        <button className="secondary-action" disabled={data.loading} onClick={onRefresh} type="button">
          새로고침
        </button>
      ) : null}
    </section>
  );
}

function NotReadyPage() {
  return (
    <Layout>
      <main className="content-wrap notfound final-core-page final-notfound-page u26-notfound-page" id="Main">
        <section className="section sec-1">
          <div className="notfound-box">
            <h2>PAGE NOT FOUND</h2>
            <p>죄송합니다. 요청하신 페이지를 찾을 수 없습니다.</p>
            <p>
              방문하시려는 페이지의 주소가 잘못 입력되었거나, 페이지의 주소가 변경 혹은 삭제되어 요청하신 페이지를 찾을 수 없습니다.<br />
              입력하신 주소가 정확한지 다시 한번 확인해 주시기 바랍니다.<br />
              관련 문의사항은 큐빅아이 고객센터에 알려주시면 친절하게 안내해 드리겠습니다.<br />
              감사합니다.
            </p>
            <div className="btn-box">
              <a className="big-btn" href="/board/notice/index">고객센터</a>
              <a className="big-btn" href="/main">메인으로</a>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}



export {
  API_BASE_URL,
  AUTH_STORAGE_KEY,
  MAX_REQUEST_DOCUMENT_SIZE,
  REQUEST_DOCUMENT_ACCEPT,
  REQUEST_DOCUMENT_EXTENSIONS,
  nav,
  moneybankTabs,
  shopOptions,
  formatAmount,
  formatDate,
  formatContractStatus,
  statusKey,
  canDecideTerms,
  formatBankAccount,
  validateRequestDocuments,
  formatProductCode,
  formatPercent,
  latestContractFee,
  latestFeeDetail,
  fetchJson,
  postJson,
  putJson,
  deleteJson,
  readAuthSession,
  saveAuthSession,
  clearAuthSession,
  buildShopPairs,
  fetchAuthJson,
  useAuthenticatedShopPairs,
  postAuthJson,
  putAuthJson,
  deleteAuthJson,
  uploadDocumentFile,
  updateContractDocumentStatus,
  contractDetailPath,
  contractDocumentDownloadUrl,
  fetchContractDetailForUser,
  fetchContractDocumentsForUser,
  fetchInquiryDetailForUser,
  createInquiryForUser,
  fetchChargePlans,
  formatChargeType,
  formatPeriod,
  supportBoardConfig,
  plainText,
  useUserDashboardData,
  Header,
  Layout,
  DashboardSummary,
  PageTitle,
  Tabs,
  LegacyPanel,
  LegacySearchPanel,
  LegacyDataTable,
  LegacyBoardList,
  LegacyFormPanel,
  LegacyIntroSection,
  DocumentNotice,
  ReadOnlyField,
  ContractProgress,
  TermsDecisionPanel,
  ContractStatusStrip,
  NotReadyPage
};
