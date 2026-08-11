const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const ADMIN_AUTH_STORAGE_KEY = 'cubiciAdminAuth';
let activeAdminSession = null;
let fetchInterceptorInstalled = false;
let originalFetch = null;

function readAdminSession() {
  const raw = window.localStorage.getItem(ADMIN_AUTH_STORAGE_KEY);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw);
    return isMasterAdminSession(session) ? session : null;
  } catch {
    window.localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
    return null;
  }
}

function saveAdminSession(session) {
  window.localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, JSON.stringify(session));
}

function clearAdminSession() {
  activeAdminSession = null;
  window.localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
}

function setAdminFetchSession(session) {
  activeAdminSession = isMasterAdminSession(session) ? session : null;
}

function isMasterAdminSession(session) {
  const userType = String(session?.user?.user_type ?? '').trim().toUpperCase();
  return Boolean(session?.access_token) && userType === 'ADMIN_USER';
}

async function verifyMasterAdminSession(session) {
  if (!isMasterAdminSession(session)) {
    clearAdminSession();
    return null;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/v1/api/accounts/admin-me`, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        Authorization: `${session.token_type ?? 'Bearer'} ${session.access_token}`,
      },
    });
  } catch {
    clearAdminSession();
    return null;
  }

  if (!response.ok) {
    clearAdminSession();
    return null;
  }

  const user = await response.json().catch(() => null);
  const verifiedSession = { ...session, user };
  if (!isMasterAdminSession(verifiedSession)) {
    clearAdminSession();
    return null;
  }

  saveAdminSession(verifiedSession);
  return verifiedSession;
}

async function loginMasterAdmin({ email, password }) {
  const normalizedEmail = String(email ?? '').trim().toLowerCase();

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/v1/api/accounts/admin-login`, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: normalizedEmail, password }),
    });
  } catch {
    throw new Error('API 서버에 연결할 수 없습니다. 서버 점검 중일 수 있습니다.');
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.detail ?? `로그인 실패: ${response.status}`);
  }
  if (!isMasterAdminSession(body)) {
    throw new Error('마스터 관리자 권한이 없습니다.');
  }
  setAdminFetchSession(body);
  saveAdminSession(body);
  return body;
}

function installAdminFetchInterceptor() {
  if (fetchInterceptorInstalled || typeof window === 'undefined') return;
  originalFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    if (!shouldAttachAdminAuthorization(input)) {
      return originalFetch(input, init);
    }

    const headers = new Headers(init?.headers ?? getRequestHeaders(input));
    if (!headers.has('Authorization')) {
      headers.set('Authorization', `${activeAdminSession.token_type ?? 'Bearer'} ${activeAdminSession.access_token}`);
    }
    return originalFetch(input, { ...init, headers });
  };
  fetchInterceptorInstalled = true;
}

function shouldAttachAdminAuthorization(input) {
  if (!activeAdminSession?.access_token) return false;
  const url = getRequestUrl(input);
  if (!isCubiciApiUrl(url)) return false;
  const pathname = getRequestPathname(url);
  return !pathname.startsWith('/v1/api/accounts/admin-login') && !pathname.startsWith('/v1/api/accounts/signup');
}

function getRequestUrl(input) {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.toString();
  return input?.url ?? '';
}

function getRequestHeaders(input) {
  if (typeof Request !== 'undefined' && input instanceof Request) {
    return input.headers;
  }
  return undefined;
}

function isCubiciApiUrl(url) {
  if (url.startsWith('/v1/api/')) return true;
  if (API_BASE_URL && url.startsWith(`${API_BASE_URL}/v1/api/`)) return true;
  try {
    const parsedUrl = new URL(url, window.location.origin);
    const parsedBaseUrl = API_BASE_URL ? new URL(API_BASE_URL, window.location.origin) : null;
    return parsedUrl.pathname.startsWith('/v1/api/') && (!parsedBaseUrl || parsedUrl.origin === parsedBaseUrl.origin);
  } catch {
    return false;
  }
}

function getRequestPathname(url) {
  try {
    return new URL(url, window.location.origin).pathname;
  } catch {
    return url;
  }
}

export {
  ADMIN_AUTH_STORAGE_KEY,
  clearAdminSession,
  installAdminFetchInterceptor,
  isMasterAdminSession,
  loginMasterAdmin,
  readAdminSession,
  setAdminFetchSession,
  verifyMasterAdminSession,
};
