import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DashboardSummary,
  Layout,
  PageTitle,
  Tabs,
  LegacyPanel,
  LegacyFormPanel,
  DocumentNotice,
  ReadOnlyField,
  ContractStatusStrip,
  TermsDecisionPanel,
  REQUEST_DOCUMENT_ACCEPT,
  contractDetailPath,
  contractDocumentDownloadUrl,
  createInquiryForUser,
  deleteAuthJson,
  fetchAuthJson,
  fetchChargePlans,
  fetchContractDetailForUser,
  fetchContractDocumentsForUser,
  fetchInquiryDetailForUser,
  fetchJson,
  formatAmount,
  formatBankAccount,
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
  putAuthJson,
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

const mypageTabs = [
  ['가입 정보', '/cubici/mypage/profile'],
  ['나의 요금', '/cubici/mypage/myCharge'],
  ['가입 해지', '/cubici/mypage/withdraw'],
];

const signupTerms = [
  ['agree1', '큐빅아이 서비스 이용약관', '/legacy-terms/agree1.html'],
  ['agree2', '개인정보 처리방침', '/legacy-terms/agree2.html'],
  ['agree3', '제3자 개인(신용)정보 제공 동의서', '/legacy-terms/agree3.html'],
];

const SAVED_LOGIN_ID_KEY = 'cubiciSavedLoginId';

function readSavedLoginId() {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(SAVED_LOGIN_ID_KEY) ?? '';
}

function resolveMypageSection(path) {
  if (path?.includes('/businessInfo')) return 'businessInfo';
  if (path?.includes('/myAuth')) return 'myAuth';
  if (path?.includes('/myCharge')) return 'myCharge';
  if (path?.includes('/withdraw')) return 'withdraw';
  if (path?.includes('/companyInfo')) return 'companyInfo';
  return 'profile';
}

function LoginPage() {
  const savedLoginId = useMemo(readSavedLoginId, []);
  const [form, setForm] = useState({ email: savedLoginId, password: '' });
  const [saveLoginId, setSaveLoginId] = useState(Boolean(savedLoginId));
  const [state, setState] = useState({ submitting: false, message: '' });

  async function submitLogin() {
    setState({ submitting: true, message: '로그인 확인 중' });
    try {
      const session = await postJson('/v1/api/accounts/login', form);
      saveAuthSession(session);
      if (saveLoginId) {
        window.localStorage.setItem(SAVED_LOGIN_ID_KEY, form.email.trim());
      } else {
        window.localStorage.removeItem(SAVED_LOGIN_ID_KEY);
      }
      setState({ submitting: false, message: '로그인되었습니다.' });
      window.location.href = resolveLoginReturnUrl();
    } catch (error) {
      setState({ submitting: false, message: `로그인 실패: ${error.message}` });
    }
  }

  return (
    <Layout variant="login">
      <main className="login-content-wrap final-login-page">
        <section className="login-box react-final-login-box">
          <h2>LOGIN</h2>
          <h3>큐빅아이에 오신것을 환영합니다!</h3>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              submitLogin();
            }}
          >
            <div className="input-box id r-30">
              <label htmlFor="userId">
                <img src="/final-ui/static/img/icon/id.svg" alt="아이디" />
              </label>
              <input
                id="userId"
                autoComplete="username"
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="아이디"
                type="text"
                value={form.email}
              />
            </div>
            <div className="input-box pw r-30">
              <label htmlFor="userPw">
                <img src="/final-ui/static/img/icon/pw.svg" alt="비밀번호" />
              </label>
              <input
                id="userPw"
                autoComplete="current-password"
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="비밀번호"
                type="password"
                value={form.password}
              />
            </div>
            <button className="big-btn r-30 primary-login-btn" disabled={state.submitting} type="submit">
              {state.submitting ? '로그인 중' : '로그인'}
            </button>
            <a className="big-btn r-30 secondary-signup-btn" href="/mainSignUp">회원가입</a>
            <fieldset>
              <div className="f-left">
                <input
                  checked={saveLoginId}
                  id="id-save"
                  name="idSaveCheck"
                  onChange={(event) => setSaveLoginId(event.target.checked)}
                  type="checkbox"
                />
                <label className="id-save" htmlFor="id-save">아이디 저장</label>
              </div>
              <div className="f-right">
                <a className="btn" href="/idSearch">아이디 찾기</a>
                <a className="btn" href="/pwdReset">비밀번호 찾기</a>
              </div>
            </fieldset>
          </form>
          {state.message ? <p className={state.message.includes('실패') ? 'auth-message error' : 'auth-message success'}>{state.message}</p> : null}
          <hr />
          <div className="cs-box">
            <b>큐빅아이 고객지원</b> <span>02-6925-6373 / 카톡 ID : cubici</span>
          </div>
        </section>
      </main>
    </Layout>
  );
}

function resolveLoginReturnUrl() {
  const value = new URLSearchParams(window.location.search).get('returnUrl');
  if (value?.startsWith('/') && !value.startsWith('//')) return value;
  return '/cubici/mypage/profile';
}

function IdSearchPage() {
  const [form, setForm] = useState({ name: '', phone: '', biz_num: '' });
  const [message, setMessage] = useState('');

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submitSearch() {
    const missing = !form.name.trim() || !form.phone.trim() || !form.biz_num.trim();
    setMessage(
      missing
        ? '대표자명, 휴대전화, 사업자등록번호를 입력해야 합니다.'
        : '아이디 찾기 API가 아직 연결되지 않았습니다. 운영 구현 시 본인확인 후 마스킹된 회원ID를 반환해야 합니다.',
    );
  }

  return (
    <Layout>
      <main className="login-content-wrap final-login-page final-auth-help-page">
        <section className="login-box react-final-login-box">
          <h2>ID SEARCH</h2>
          <h3>가입 정보를 입력해 회원ID를 확인합니다.</h3>
          <div className="input-box id r-30">
            <label htmlFor="searchName">
              <img src="/final-ui/static/img/icon/id.svg" alt="대표자명" />
            </label>
            <input id="searchName" onChange={(event) => updateField('name', event.target.value)} placeholder="대표자명" type="text" value={form.name} />
          </div>
          <div className="input-box id r-30">
            <label htmlFor="searchPhone">
              <img src="/final-ui/static/img/icon/id.svg" alt="휴대전화" />
            </label>
            <input id="searchPhone" onChange={(event) => updateField('phone', event.target.value)} placeholder="휴대전화" type="tel" value={form.phone} />
          </div>
          <div className="input-box id r-30">
            <label htmlFor="searchBizNum">
              <img src="/final-ui/static/img/icon/id.svg" alt="사업자등록번호" />
            </label>
            <input id="searchBizNum" maxLength="12" onChange={(event) => updateField('biz_num', event.target.value)} placeholder="사업자등록번호" type="text" value={form.biz_num} />
          </div>
          <button className="big-btn r-30 primary-login-btn" onClick={submitSearch} type="button">아이디 확인</button>
          {message ? <p className={message.includes('아직') ? 'auth-message error' : 'auth-message success'}>{message}</p> : null}
          <div className="login-links"><a href="/login">로그인</a><a href="/pwdReset">비밀번호 찾기</a></div>
        </section>
      </main>
    </Layout>
  );
}

function PasswordResetPage() {
  const [form, setForm] = useState({ email: '', name: '', phone: '' });
  const [message, setMessage] = useState('');

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submitReset() {
    const missing = !form.email.trim() || !form.name.trim() || !form.phone.trim();
    setMessage(
      missing
        ? '회원ID, 대표자명, 휴대전화를 입력해야 합니다.'
        : '비밀번호 재설정 API가 아직 연결되지 않았습니다. 운영 구현 시 인증번호 확인 후 임시 비밀번호 또는 재설정 토큰을 발급해야 합니다.',
    );
  }

  return (
    <Layout>
      <main className="login-content-wrap final-login-page final-auth-help-page">
        <section className="login-box react-final-login-box">
          <h2>PASSWORD</h2>
          <h3>가입 정보를 입력해 비밀번호 재설정을 요청합니다.</h3>
          <div className="input-box id r-30">
            <label htmlFor="resetEmail">
              <img src="/final-ui/static/img/icon/id.svg" alt="회원ID" />
            </label>
            <input id="resetEmail" onChange={(event) => updateField('email', event.target.value)} placeholder="회원ID" type="email" value={form.email} />
          </div>
          <div className="input-box id r-30">
            <label htmlFor="resetName">
              <img src="/final-ui/static/img/icon/id.svg" alt="대표자명" />
            </label>
            <input id="resetName" onChange={(event) => updateField('name', event.target.value)} placeholder="대표자명" type="text" value={form.name} />
          </div>
          <div className="input-box pw r-30">
            <label htmlFor="resetPhone">
              <img src="/final-ui/static/img/icon/pw.svg" alt="휴대전화" />
            </label>
            <input id="resetPhone" onChange={(event) => updateField('phone', event.target.value)} placeholder="휴대전화" type="tel" value={form.phone} />
          </div>
          <button className="big-btn r-30 primary-login-btn" onClick={submitReset} type="button">재설정 요청</button>
          {message ? <p className={message.includes('아직') ? 'auth-message error' : 'auth-message success'}>{message}</p> : null}
          <div className="login-links"><a href="/login">로그인</a><a href="/idSearch">아이디 찾기</a></div>
        </section>
      </main>
    </Layout>
  );
}

function SignupPage() {
  const [signupStep, setSignupStep] = useState(1);
  const [completedUser, setCompletedUser] = useState(null);
  const [form, setForm] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    name: '',
    phone: '',
    biz_name: '',
    biz_num: '',
    biz_setup_date: '',
    biz_type: 'GENERAL',
    sectors: 'OTHER',
    postal_code: '',
    address: '',
    address_detail: '',
    email_code: '',
    phone_code: '',
    partner_code: '',
  });
  const [termsAccepted, setTermsAccepted] = useState({
    agree1: false,
    agree2: false,
    agree3: false,
  });
  const [state, setState] = useState({ submitting: false, message: '' });
  const [checks, setChecks] = useState({
    businessNumber: false,
    emailFormat: false,
    emailRequested: false,
    phoneRequested: false,
  });
  const allTermsAccepted = Object.values(termsAccepted).every(Boolean);
  const signupMessageIsError = /실패|입력|일치|동의|먼저|정확히|연동 전/.test(state.message);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    if (field === 'biz_num') setChecks((current) => ({ ...current, businessNumber: false }));
    if (field === 'email') setChecks((current) => ({ ...current, emailFormat: false, emailRequested: false }));
    if (field === 'phone') setChecks((current) => ({ ...current, phoneRequested: false }));
  }

  function confirmBusinessNumber() {
    const valid = form.biz_num.replace(/\D/g, '').length === 10;
    setChecks((current) => ({ ...current, businessNumber: valid }));
    setState({ submitting: false, message: valid ? '사업자등록번호 형식을 확인했습니다.' : '사업자등록번호는 숫자 10자리로 입력해 주세요.' });
  }

  function confirmEmailFormat() {
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
    setChecks((current) => ({ ...current, emailFormat: valid, emailRequested: false }));
    setState({ submitting: false, message: valid ? '아이디 형식을 확인했습니다. 최종 중복 여부는 가입 저장 시 확인됩니다.' : '이메일 형식의 아이디를 입력해 주세요.' });
  }

  function requestVerification(kind) {
    if (kind === 'email' && !checks.emailFormat) {
      setState({ submitting: false, message: '아이디 중복확인을 먼저 진행해 주세요.' });
      return;
    }
    if (kind === 'phone' && form.phone.replace(/\D/g, '').length < 10) {
      setState({ submitting: false, message: '대표자 핸드폰 번호를 정확히 입력해 주세요.' });
      return;
    }
    setChecks((current) => ({ ...current, [kind === 'email' ? 'emailRequested' : 'phoneRequested']: true }));
    setState({ submitting: false, message: `${kind === 'email' ? '이메일' : 'SMS'} 인증 발송은 외부 연동 전입니다.` });
  }

  function verifyCode(kind) {
    const code = kind === 'email' ? form.email_code : form.phone_code;
    setState({
      submitting: false,
      message: code.trim()
        ? `${kind === 'email' ? '이메일' : 'SMS'} 인증 확인은 외부 연동 전입니다.`
        : '인증번호를 입력해 주세요.',
    });
  }

  async function submitSignup() {
    if (!allTermsAccepted) {
      setState({ submitting: false, message: '회원가입 약관 3종에 모두 동의해야 합니다.' });
      return;
    }
    const requiredFields = ['biz_name', 'biz_num', 'name', 'email', 'password'];
    if (requiredFields.some((field) => !form[field].trim())) {
      setState({ submitting: false, message: '필수 기본정보를 모두 입력해 주세요.' });
      return;
    }
    if (form.biz_num.replace(/\D/g, '').length !== 10) {
      setState({ submitting: false, message: '사업자등록번호는 숫자 10자리로 입력해 주세요.' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setState({ submitting: false, message: '이메일 형식의 아이디를 입력해 주세요.' });
      return;
    }
    if (form.password.length < 8) {
      setState({ submitting: false, message: '암호는 8자 이상 입력해 주세요.' });
      return;
    }
    if (form.password !== form.passwordConfirm) {
      setState({ submitting: false, message: '암호와 암호확인이 일치하지 않습니다.' });
      return;
    }
    setState({ submitting: true, message: '가입 저장 중' });
    try {
      const session = await postJson('/v1/api/accounts/signup', {
        email: form.email,
        password: form.password,
        name: form.name,
        phone: form.phone,
        biz_name: form.biz_name,
        biz_num: form.biz_num,
        biz_setup_date: form.biz_setup_date,
        biz_type: form.biz_type,
        sectors: form.sectors,
        partner_code: form.partner_code || null,
      });
      saveAuthSession(session);
      setCompletedUser(session.user);
      setState({ submitting: false, message: '' });
      setSignupStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setState({ submitting: false, message: `가입 실패: ${error.message}` });
    }
  }

  return (
    <Layout variant="signup">
      <div className="visual-wrap signup-visual">
        <div className="inner">
          <div className="visual">
            <h2 className="visual-tit">회원가입</h2>
          </div>
        </div>
      </div>
      <main className={`content-wrap final-signup-page bg-gray${signupStep === 1 ? ' member-join final-signup-terms-page' : signupStep === 2 ? ' join-form final-signup-info-page' : ' join-finish final-signup-complete-page'}`}>
        <section className="section sec-1 bg-gray">
          <div className="inner">
            <div className="app-step">
              <ul className="step">
                <li className={signupStep === 1 ? 'active' : ''}>약관동의</li>
                <li className={signupStep === 2 ? 'active' : ''}>기본정보</li>
                <li className={signupStep === 3 ? 'active' : ''}>가입완료</li>
              </ul>
            </div>
            {signupStep === 1 ? (
              <>
                <SignupTermsPanel accepted={termsAccepted} onChange={setTermsAccepted} />
                <div className="btn-box txt-center signup-next-box">
                  <button
                    className="btn lg-btn btn-color2"
                    disabled={!allTermsAccepted}
                    onClick={() => {
                      setSignupStep(2);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    type="button"
                  >
                    다음
                  </button>
                </div>
              </>
            ) : signupStep === 2 ? (
              <>
            <div className="sub-tit-wrap">
              <h3 className="sub-tit">기본정보</h3>
            </div>
            <div className="form-wrap select-z-index">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  submitSignup();
                }}
              >
                <fieldset className="fieldset select-z-index">
                  <div className="input-group">
                    <div className="input-box col-2">
                      <h4 className="tit">회사명</h4>
                      <input aria-label="회사명" className="input-style-4 flex-1" onChange={(event) => updateField('biz_name', event.target.value)} placeholder="회사명" type="text" value={form.biz_name} />
                    </div>
                    <div className="input-box col-2">
                      <h4 className="tit">사업자등록 번호</h4>
                      <input aria-label="사업자등록 번호" className="input-style-4 flex-1" inputMode="numeric" maxLength="12" onChange={(event) => updateField('biz_num', event.target.value)} placeholder="사업자등록번호" type="text" value={form.biz_num} />
                      <button className="btn btn-color4" onClick={confirmBusinessNumber} type="button">확인</button>
                    </div>
                  </div>
                  <div className="input-group">
                    <div className="input-box col-2">
                      <h4 className="tit">대표자명</h4>
                      <input aria-label="대표자명" className="input-style-4 flex-1" onChange={(event) => updateField('name', event.target.value)} placeholder="대표자명" type="text" value={form.name} />
                    </div>
                    <div className="input-box col-2">
                      <h4 className="tit">설립연도</h4>
                      <input aria-label="설립연도" className="input-style-4 flex-1" inputMode="numeric" maxLength="8" onChange={(event) => updateField('biz_setup_date', event.target.value)} placeholder="YYYYMMDD" type="text" value={form.biz_setup_date} />
                    </div>
                  </div>
                  <div className="input-group select-z-index">
                    <div className="input-box col-2 select-z-index">
                      <h4 className="tit">사업자 유형</h4>
                      <select className="select-type-2 input-style-4 flex-1" onChange={(event) => updateField('biz_type', event.target.value)} value={form.biz_type}>
                        <option value="GENERAL">일반(개인)사업자</option>
                        <option value="SIMPLE">일반(간이)사업자</option>
                        <option value="CORPORATE">법인사업자</option>
                        <option value="TAXFREE">면세사업자</option>
                      </select>
                    </div>
                    <div className="input-box col-2 select-z-index">
                      <h4 className="tit">업종</h4>
                      <select className="select-type-2 input-style-4 flex-1" onChange={(event) => updateField('sectors', event.target.value)} value={form.sectors}>
                        <option value="FASHION">의류</option>
                        <option value="GENERAL">잡화</option>
                        <option value="OTHER">기타</option>
                      </select>
                    </div>
                  </div>
                  <div className="input-group post-box">
                    <div className="input-box col-2">
                      <h4 className="tit">주소</h4>
                      <input aria-label="우편번호" className="input-style-4 col-1" inputMode="numeric" onChange={(event) => updateField('postal_code', event.target.value)} placeholder="우편번호" type="text" value={form.postal_code} />
                      <button
                        className="btn btn-color4"
                        onClick={() => setState({ submitting: false, message: '주소 찾기 서비스는 외부 연동 전입니다. 직접 입력해 주세요.' })}
                        type="button"
                      >
                        찾기
                      </button>
                      <input aria-label="주소" className="input-style-4 flex-1" onChange={(event) => updateField('address', event.target.value)} placeholder="주소" type="text" value={form.address} />
                      <input aria-label="상세주소" className="input-style-4 col-3" onChange={(event) => updateField('address_detail', event.target.value)} placeholder="상세주소" type="text" value={form.address_detail} />
                    </div>
                  </div>
                </fieldset>
                <hr />
                <fieldset className="fieldset">
                  <div className="input-group id-box">
                    <div className="input-box col-2">
                      <h4 className="tit">아이디</h4>
                      <input aria-label="아이디" className="input-style-4 flex-1" onChange={(event) => updateField('email', event.target.value)} placeholder="이메일 아이디" type="email" value={form.email} />
                      <button className="btn btn-color4" onClick={confirmEmailFormat} type="button">중복확인</button>
                      <button className="btn btn-color4" onClick={() => requestVerification('email')} type="button">이메일 인증</button>
                      <div>
                        <input aria-label="이메일 인증번호" className="input-style-4 flex-1" disabled={!checks.emailRequested} onChange={(event) => updateField('email_code', event.target.value)} placeholder="인증번호 입력" type="text" value={form.email_code} />
                        <button className="btn btn-color4" disabled={!checks.emailRequested} onClick={() => verifyCode('email')} type="button">인증하기</button>
                      </div>
                    </div>
                  </div>
                  <div className="input-group">
                    <div className="input-box col-2">
                      <h4 className="tit">암호</h4>
                      <input aria-label="암호" className="input-style-4 flex-1" onChange={(event) => updateField('password', event.target.value)} placeholder="8자 이상 입력" type="password" value={form.password} />
                    </div>
                    <div className="input-box col-2">
                      <h4 className="tit">암호확인</h4>
                      <input aria-label="암호확인" className="input-style-4 flex-1" onChange={(event) => updateField('passwordConfirm', event.target.value)} placeholder="암호 재입력" type="password" value={form.passwordConfirm} />
                    </div>
                  </div>
                  <div className="input-group">
                    <div className="input-box col-2">
                      <h4 className="tit">대표자 핸드폰</h4>
                      <input aria-label="대표자 핸드폰" className="input-style-4 flex-1" inputMode="tel" onChange={(event) => updateField('phone', event.target.value)} placeholder="숫자만 입력" type="tel" value={form.phone} />
                      <button className="btn btn-color4" onClick={() => requestVerification('phone')} type="button">SMS 인증</button>
                    </div>
                    <div className="input-box col-2">
                      <h4 className="tit">인증번호 입력</h4>
                      <input aria-label="SMS 인증번호" className="input-style-4 flex-1" disabled={!checks.phoneRequested} onChange={(event) => updateField('phone_code', event.target.value)} placeholder="인증번호 입력" type="text" value={form.phone_code} />
                      <button className="btn btn-color4" disabled={!checks.phoneRequested} onClick={() => verifyCode('phone')} type="button">인증하기</button>
                    </div>
                  </div>
                  <div className="input-group select-z-index">
                    <div className="input-box col-2 select-z-index">
                      <h4 className="tit">협력사 (선택)</h4>
                      <select aria-label="협력사 (선택)" className="select-type-2 input-style-4 flex-1" onChange={(event) => updateField('partner_code', event.target.value)} value={form.partner_code}>
                        <option value="">선택</option>
                        <option value="PARTNER">협력사</option>
                      </select>
                    </div>
                  </div>
                </fieldset>
                <div className="btn-box txt-center">
                  <button
                    className="btn lg-btn line-btn1"
                    onClick={() => {
                      setSignupStep(1);
                      setState({ submitting: false, message: '' });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    type="button"
                  >
                    이전
                  </button>
                  <button className="btn lg-btn btn-color2" disabled={state.submitting} type="submit">
                    {state.submitting ? '가입 저장 중' : '회원가입 확인'}
                  </button>
                </div>
              </form>
            </div>
              </>
            ) : (
              <SignupCompletePanel user={completedUser} />
            )}
          </div>
          {signupStep !== 3 && state.message ? <p className={signupMessageIsError ? 'auth-message error' : 'auth-message success'}>{state.message}</p> : null}
        </section>
      </main>
    </Layout>
  );
}

function SignupCompletePanel({ user }) {
  return (
    <>
      <section className="column-box signup-complete-panel">
        <div className="img-box">
          <img alt="회원가입 완료" src="/final-ui/static/img/icon/finish.png" />
        </div>
        <h3 className="tit">큐빅아이 회원가입을 환영합니다!</h3>
        <p className="desc">
          <span className="br">큐빅아이 선정산 및 쇼핑몰 통합 서비스를 이용하기 위해서는 회원님이 운영 중인</span> 쇼핑몰을 등록해야 합니다.<br />
          <br />
          쇼핑몰은 마이페이지 &gt; 쇼핑몰 추가 등록에서 등록할 수 있습니다.
        </p>
        <div className="sub-tit-wrap mb-0">
          <h4 className="sub-tit sm">쇼핑몰 등록</h4>
        </div>
        <div className="table-r-border4 wid-100p signup-complete-table">
          <div className="info-table type-2">
            <dl className="table-item flex-1">
              <dt className="table-dt">회원명</dt>
              <dd className="table-dd">{user?.name || '-'}</dd>
            </dl>
            <dl className="table-item flex-1">
              <dt className="table-dt">큐빅아이 ID</dt>
              <dd className="table-dd">{user?.email || '-'}</dd>
            </dl>
          </div>
        </div>
        <p className="desc">쇼핑몰을 등록해 선정산 및 쇼핑몰 통합 서비스를 이용하세요.</p>
        <p className="desc">큐빅아이와 함께 더욱 성공적인 사업으로 <span className="inline">발전하시길 기원합니다.</span></p>
        <p className="desc">감사합니다.<br />큐빅아이</p>
      </section>
      <div className="btn-box txt-center signup-complete-action">
        <a className="btn lg-btn btn-color2" href="/cubici/mypage/businessInfo">확인</a>
      </div>
    </>
  );
}

function SignupTermsPanel({ accepted, onChange }) {
  function updateTerm(termId, checked) {
    onChange((current) => ({ ...current, [termId]: checked }));
  }

  return (
    <section className="member-join final-signup-terms">
      <p className="top-txt">
        <span className="big-txt">3개월 무료 이용!</span>
        쇼핑몰 통합정산 서비스 큐빅아이에 오신 것을 환영합니다.<br />
        회원가입을 하시면 큐빅아이를 마음껏 이용해 보실 수 있습니다. 무료이용기간 후 서비스가 마음에 들지 않으시면 아무런 제한 없이 해지도 자유롭습니다.<br />
        인공지능 기반의 쇼핑몰 통합정보 서비스, 큐빅아이가 회원님의 사업 성공을 기원합니다.
      </p>
      <div className="sub-tit-wrap">
        <h3 className="sub-tit">이용약관</h3>
        <label className="check-wrap">
          <input
            checked={Object.values(accepted).every(Boolean)}
            className="checkbox"
            onChange={(event) => {
              const checked = event.target.checked;
              onChange({ agree1: checked, agree2: checked, agree3: checked });
            }}
            type="checkbox"
          />
          <span className="label">이용약관 전체동의</span>
        </label>
      </div>
      {signupTerms.map(([id, title, termsUrl]) => (
        <article className="policy-box" key={id}>
          <div className="sub-tit-wrap signup-term-header">
            <h4 className="sub-tit sm">{title}</h4>
          </div>
          <div className="policy-txt-box scroll-y-table">
            <iframe
              loading="lazy"
              onLoad={(event) => {
                const frameDocument = event.currentTarget.contentDocument;
                if (!frameDocument?.body) return;
                frameDocument.body.style.margin = '0';
                frameDocument.body.style.fontFamily = "'Noto Sans KR', '맑은 고딕', sans-serif";
                frameDocument.body.style.fontSize = '14px';
                frameDocument.body.style.lineHeight = '1.6';
                frameDocument.body.style.color = '#32373e';
              }}
              src={termsUrl}
              title={title}
            />
          </div>
          <div className="box-bottom">
            <label className="check-wrap">
              <input
                checked={accepted[id]}
                className="checkbox"
                onChange={(event) => updateTerm(id, event.target.checked)}
                type="checkbox"
              />
              <span className="label">약관에 동의합니다.</span>
            </label>
          </div>
        </article>
      ))}
    </section>
  );
}

function MyPage({ path }) {
  const [auth, setAuth] = useState(readAuthSession);
  const section = resolveMypageSection(path ?? window.location.pathname);
  const shopFilter = useAuthenticatedShopPairs(auth);
  const user = auth?.user;
  const dashboard = useUserDashboardData({
    userNo: user?.user_no,
    shopPairs: shopFilter.shopPairs,
    enabled: Boolean(auth?.access_token && user?.user_no && ['myCharge', 'withdraw'].includes(section)),
  });
  const latestContract = dashboard.contracts?.items?.[0];
  const feeSummary = latestContractFee(latestContract);
  const latestRedemption = (dashboard.redemptions?.items ?? []).find((item) => item.mbid === latestContract?.mbid)
    ?? dashboard.redemptions?.items?.[0];
  const activeMypageHref = section === 'myCharge'
    ? '/cubici/mypage/myCharge'
    : section === 'withdraw'
      ? '/cubici/mypage/withdraw'
      : '/cubici/mypage/profile';
  const contentClass = section === 'myCharge'
    ? 'c6p2'
    : section === 'withdraw'
      ? 'c6p3'
      : 'c6p1';

  return (
    <Layout>
      <PageTitle title="마이페이지" />
      <Tabs activeHref={activeMypageHref} tabs={mypageTabs} />
      <main className={`content-wrap ${contentClass} final-core-page final-mypage-page u22-mypage-page u22-${section}-page`} id="Main">
        <section className="section sec-1">
          <h2 className="hidden">마이페이지</h2>
          <div className="inner">
        {!auth?.access_token ? <p className="auth-message error">로그인 후 마이페이지 정보를 확인할 수 있습니다.</p> : null}
        {shopFilter.message && ['businessInfo', 'myAuth'].includes(section) ? <p className="auth-message error">{shopFilter.message}</p> : null}
        {section === 'profile' ? <MypageAccessPanel /> : null}
        {section === 'companyInfo' ? <CompanyInfoPanel auth={auth} onAuthChange={setAuth} user={user} /> : null}
        {section === 'businessInfo' ? <BusinessInfoPanel auth={auth} /> : null}
        {section === 'myAuth' ? <AuthInfoPanel auth={auth} /> : null}
        {section === 'myCharge' ? <ChargeInfoPanelLite latestContract={latestContract} /> : null}
        {section === 'withdraw' ? <WithdrawPanel latestContract={latestContract} latestRedemption={latestRedemption} user={user} /> : null}
          </div>
        </section>
      </main>
    </Layout>
  );
}

function MypageAccessPanel() {
  const [message, setMessage] = useState('');

  return (
    <section className="join-wrap u22-access-panel">
      <h2 className="join-tit">가입 정보 접속 안내</h2>
      <p className="join-txt">
        회원님의 소중한 정보보호를 위해 인증번호 입력이 필요합니다.<br />
        &quot;인증번호 받기&quot;를 클릭하시면 등록하신 핸드폰 번호로 인증번호를 보내드립니다.
      </p>
      <div className="u22-access-form">
        <input aria-label="가입정보 인증번호" className="auth-input" readOnly type="password" value="******" />
        <button className="btn llg-btn btn-color2" onClick={() => setMessage('휴대전화 인증번호 발송 API가 아직 연결되지 않았습니다.')} type="button">인증번호 받기</button>
      </div>
      {message ? <p className="auth-message error">{message}</p> : null}
    </section>
  );
}

function MypageSummaryPanel({ dashboard, feeSummary, latestContract, latestRedemption, show }) {
  if (!show) return null;
  return (
    <>
      <section className="finance-summary-grid">
          <article>
            <div>
              <span>최근 계약</span>
              <strong>{dashboard.loading ? '조회 중' : latestContract?.mbid ?? '-'}</strong>
            </div>
            <dl>
              <div><dt>상태</dt><dd>{formatContractStatus(latestContract?.status)}</dd></div>
              <div><dt>상품</dt><dd>{formatProductCode(latestContract?.product_code)}</dd></div>
              <div><dt>신청일</dt><dd>{formatDate(latestContract?.request_date)}</dd></div>
              <div><dt>계약일</dt><dd>{formatDate(latestContract?.contract_date)}</dd></div>
            </dl>
            {latestContract?.mbid ? <a className="status-link" href={contractDetailPath(latestContract.mbid)}>계약 상세</a> : null}
          </article>
          <article>
            <div>
              <span>적용 금융조건</span>
              <strong>{formatProductCode(latestContract?.product_code)}</strong>
            </div>
            <dl>
              <div><dt>지급율</dt><dd>{formatPercent(feeSummary.paymentRate)}</dd></div>
              <div><dt>평균 수수료</dt><dd>{formatPercent(feeSummary.feeRate)}</dd></div>
              <div><dt>월매출</dt><dd>{formatAmount(latestContract?.sales_amount)}</dd></div>
              <div><dt>제출서류</dt><dd>{latestContract ? `${latestContract.document_file_count ?? 0}건` : '-'}</dd></div>
            </dl>
          </article>
          <article>
            <div>
              <span>상환 요약</span>
              <strong>{latestRedemption?.mbid ?? '-'}</strong>
            </div>
            <dl>
              <div><dt>총 지급</dt><dd>{formatAmount(latestRedemption?.latest_cumulative_provision_amount)}</dd></div>
              <div><dt>총 상환</dt><dd>{formatAmount(latestRedemption?.latest_cumulative_repayment_amount)}</dd></div>
              <div><dt>미상환잔액</dt><dd>{formatAmount(latestRedemption?.latest_outstanding_balance)}</dd></div>
              <div><dt>최근 이력일</dt><dd>{formatDate(latestRedemption?.latest_history_date)}</dd></div>
            </dl>
          </article>
      </section>
      <section className="mypage-grid">
        {[
          ['회사정보', '사업자 정보와 대표자 기본 정보를 확인합니다.', '/cubici/mypage/companyInfo'],
          ['사업정보', '쇼핑몰 계정 연결과 운영 정보를 확인합니다.', '/cubici/mypage/businessInfo'],
          ['인증정보', 'API 연동, 인증서, 계좌 확인 정보를 관리합니다.', '/cubici/mypage/myAuth'],
          ['요금정보', '요금제와 결제 상태를 확인합니다.', '/cubici/mypage/myCharge'],
        ].map(([title, text, href]) => (
          <article key={title}>
            <h2>{title}</h2>
            <p>{text}</p>
            <a className="status-link" href={href}>바로가기</a>
          </article>
        ))}
      </section>
    </>
  );
}

function CompanyInfoPanel({ auth, onAuthChange, user }) {
  const [form, setForm] = useState(() => buildCompanyForm(user));
  const [state, setState] = useState({ submitting: false, message: '' });

  useEffect(() => {
    setForm(buildCompanyForm(user));
  }, [user]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function saveCompanyInfo() {
    setState({ submitting: true, message: '회사정보 저장 중' });
    try {
      const response = await putAuthJson('/v1/api/accounts/me/company', form);
      const nextAuth = { ...auth, user: response.user };
      saveAuthSession(nextAuth);
      onAuthChange(nextAuth);
      setState({ submitting: false, message: '회사정보가 저장되었습니다.' });
    } catch (error) {
      setState({ submitting: false, message: `회사정보 저장 실패: ${error.message}` });
    }
  }

  if (!auth?.access_token) {
    return (
      <LegacyFormPanel title="기본 정보">
        <p className="auth-message error">로그인 후 회사정보를 수정할 수 있습니다.</p>
      </LegacyFormPanel>
    );
  }

  return (
    <section className="u22-company-info">
      <div className="sub-tit-wrap"><h2 className="sub-tit">기본 정보</h2></div>
      <div className="table-r-border2">
        <div className="info-table u22-basic-info">
          {[
            ['회사명', form.biz_name || '-'],
            ['아이디', user?.email ?? '-'],
            ['대표자명', form.name || '-'],
            ['사업자등록번호', form.biz_num || '-'],
            ['설립일자', form.biz_setup_date || '-'],
            ['사업자 유형', companyTypeLabel(form.biz_type)],
            ['주요 판매품목', form.sectors || '-'],
          ].map(([label, value]) => (
            <dl className="table-item col-3" key={label}>
              <dt className="table-dt"><span>{label}</span></dt>
              <dd className="table-dd"><input aria-label={label} readOnly type="text" value={value} /></dd>
            </dl>
          ))}
        </div>
      </div>
      <div className="form-wrap u22-change-info">
        <div className="table-r-border2">
          <div className="info-table">
            <dl className="table-item col-1">
              <dt className="table-dt"><label htmlFor="u22-phone">등록핸드폰 변경</label></dt>
              <dd className="table-dd">
                <input id="u22-phone" maxLength="20" onChange={(event) => updateField('phone', event.target.value)} type="tel" value={form.phone} />
                <span className="u22-api-note">휴대전화 인증 API 연동 전</span>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="btn-box txt-center u22-company-actions">
        <a className="btn llg-btn btn-color1" href="/cubici/mypage/profile">취소</a>
        <button className="btn llg-btn btn-color2" disabled={state.submitting} onClick={saveCompanyInfo} type="button">{state.submitting ? '저장 중' : '수정 확인'}</button>
      </div>
      {state.message ? <p className={state.message.includes('실패') ? 'auth-message error' : 'auth-message success'}>{state.message}</p> : null}
    </section>
  );
}

function companyTypeLabel(value) {
  return {
    GENERAL: '일반사업자',
    SIMPLE: '간이사업자',
    TAXFREE: '면세사업자',
    CORPORATE: '법인사업자',
  }[value] ?? value ?? '-';
}

function buildCompanyForm(user) {
  return {
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    biz_name: user?.biz_name ?? '',
    biz_num: user?.biz_num ?? '',
    biz_setup_date: user?.biz_setup_date ?? '',
    biz_type: user?.biz_type ?? 'GENERAL',
    sectors: user?.sectors ?? 'OTHER',
    partner_code: user?.partner_code ?? '',
  };
}

function BusinessInfoPanel({ auth }) {
  return <ShopConnectionPanel auth={auth} />;
}

function AuthInfoPanel({ auth }) {
  return <ShopConnectionPanel auth={auth} openApiOnLoad />;
}

function ChargeInfoPanelLite({ latestContract }) {
  const [state, setState] = useState({ loading: true, message: '', items: [] });
  const [selectedCode, setSelectedCode] = useState('');
  const [requestMessage, setRequestMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetchChargePlans()
      .then((response) => {
        if (!cancelled) {
          const items = response.items ?? [];
          setState({ loading: false, message: '', items });
          setSelectedCode(items.find((item) => item.is_current)?.charge_code ?? items[0]?.charge_code ?? '');
        }
      })
      .catch((error) => {
        if (!cancelled) setState({ loading: false, message: `요금 조회 실패: ${error.message}`, items: [] });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const currentPlan = state.items.find((item) => item.is_current);
  const selectedPlan = state.items.find((item) => item.charge_code === selectedCode);
  const referenceDate = new Intl.DateTimeFormat('ko-KR', { dateStyle: 'long' }).format(new Date());

  return (
    <section className="u24-charge-page">
      <article className="u24-current-charge">
        <div className="u24-charge-title">
          <h3>현재 요금제</h3>
          <span><img alt="" src="/final-ui/static/img/icon/calendar-s.png" /> <strong>기준</strong> {referenceDate}</span>
        </div>
        <div className="u24-current-summary">
          <div><img alt="" src="/final-ui/static/img/icon/charge1.png" /><span><strong>요금제</strong>{currentPlan?.charge_name ?? '사용자 요금 연동 전'}</span></div>
          <div><img alt="" src="/final-ui/static/img/icon/charge2.png" /><span><strong>이용료</strong>{currentPlan ? formatAmount(currentPlan.amount) : '-'}</span></div>
          <div><img alt="" src="/final-ui/static/img/icon/charge3.png" /><span><strong>이용기간</strong>{currentPlan ? formatPeriod(currentPlan.period, currentPlan.period_unit) : '-'}</span></div>
        </div>
        <p className="u24-charge-note">사용자별 현재 요금제 조회 API가 제공되기 전에는 운영 요금제 목록만 표시합니다.</p>
      </article>

      <article className="u24-plan-select">
        <div className="u24-charge-title"><h3>변경 요금제 선택</h3></div>
        {state.message ? <p className="auth-message error">{state.message}</p> : null}
        <div className="u24-plan-grid">
          {state.loading ? <p>요금 정보를 조회 중입니다.</p> : state.items.length ? state.items.slice(0, 4).map((item) => (
            <label className={item.charge_code === selectedCode ? 'selected' : ''} key={item.charge_code}>
              <input checked={item.charge_code === selectedCode} name="chargePlan" onChange={() => setSelectedCode(item.charge_code)} type="radio" />
              <span className="u24-plan-period">{formatPeriod(item.period, item.period_unit)}</span>
              <strong>{formatAmount(item.amount)}<small>원</small></strong>
              <span>{item.charge_name}</span>
              <i aria-hidden="true" />
            </label>
          )) : <p>등록된 요금제가 없습니다.</p>}
        </div>
        <div className="u24-payment-preview">
          <div><span>현재 요금제</span><strong>{currentPlan?.charge_name ?? '확인 전'}</strong></div>
          <b aria-hidden="true">→</b>
          <div><span>변경 요금제</span><strong>{selectedPlan?.charge_name ?? '-'}</strong></div>
          <div><span>결제 요청액</span><strong>{selectedPlan ? formatAmount(selectedPlan.amount) : '-'}</strong></div>
          <button onClick={() => setRequestMessage('요금제 변경 및 결제 API는 아직 연결되지 않았습니다.')} type="button">결제하기</button>
        </div>
        {requestMessage ? <p className="auth-message error">{requestMessage}</p> : null}
      </article>

      <article className="u24-usage-history">
        <div className="u24-charge-title"><h3>서비스 이용 내역</h3></div>
        <div className="u24-history-table">
          <table>
            <thead><tr><th>회차</th><th>구분</th><th>이용료</th><th>서비스 기간</th><th>결제일자</th><th>결제금액</th><th>잔여일자</th><th>영수증</th></tr></thead>
            <tbody>
              <tr><td colSpan="8">사용자별 결제·서비스 이용내역 API 연동 전입니다.</td></tr>
            </tbody>
          </table>
          <p className="u24-history-empty-mobile">사용자별 결제·서비스 이용내역 API 연동 전입니다.</p>
        </div>
      </article>
      {latestContract ? <a className="u24-contract-link" href={`/moneybank/current/${encodeURIComponent(latestContract.mbid)}`}>머니뱅크 계약 상세 보기</a> : null}
    </section>
  );
}

function WithdrawPanel({ latestContract, latestRedemption, user }) {
  return (
    <LegacyFormPanel title="회원탈퇴">
      <div className="field-grid">
        <ReadOnlyField label="회원번호" value={user?.user_no ?? '-'} />
        <ReadOnlyField label="회원ID" value={user?.email ?? '-'} />
        <ReadOnlyField label="최근 계약" value={latestContract?.mbid ?? '-'} />
        <ReadOnlyField label="계약상태" value={formatContractStatus(latestContract?.status)} />
        <ReadOnlyField label="미상환잔액" value={formatAmount(latestRedemption?.latest_outstanding_balance)} />
        <ReadOnlyField label="최근 상환일" value={formatDate(latestRedemption?.latest_history_date)} />
      </div>
      <p className="auth-message error">회원탈퇴/해지신청 API는 아직 연결되지 않았습니다. 미상환잔액 보유 계약의 차단/허용 정책 확정 후 구현해야 합니다.</p>
      <button className="secondary-action" disabled type="button">탈퇴 신청 준비중</button>
    </LegacyFormPanel>
  );
}

function ShopConnectionPanel({ auth, openApiOnLoad = false }) {
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [registration, setRegistration] = useState({ shop_type: 'NAVER', shop_id: '' });
  const [apiTarget, setApiTarget] = useState(null);
  const [apiDialogOpen, setApiDialogOpen] = useState(false);
  const [apiForm, setApiForm] = useState({
    shop_account_id: '',
    shop_account_password: '',
    vendor_id: '',
    api_key: '',
    api_secret_key: '',
    settlement: '',
    status: 'Y',
  });
  const [state, setState] = useState({ loading: false, message: '' });

  async function fetchShopItems() {
    const response = await fetchAuthJson('/v1/api/accounts/me/shops');
    return response.items ?? [];
  }

  function prepareApiConnection(item) {
    setApiTarget(item ?? null);
    setApiForm({
      shop_account_id: item?.shop_account_id ?? '',
      shop_account_password: '',
      vendor_id: item?.vendor_id ?? '',
      api_key: '',
      api_secret_key: '',
      settlement: item?.settlement ?? '',
      status: item?.status ?? 'Y',
    });
    setApiDialogOpen(true);
  }

  const loadShops = useCallback(async () => {
    if (!auth?.access_token) return;
    setState((current) => ({ ...current, loading: true, message: '' }));
    try {
      const nextItems = await fetchShopItems();
      setItems(nextItems);
      if (openApiOnLoad) prepareApiConnection(nextItems[0]);
      setState({ loading: false, message: '' });
    } catch (error) {
      if (openApiOnLoad) setApiDialogOpen(true);
      setState({ loading: false, message: `쇼핑몰 조회 실패: ${error.message}` });
    }
  }, [auth?.access_token, openApiOnLoad]);

  useEffect(() => {
    loadShops();
  }, [loadShops]);

  function updateRegistration(field, value) {
    setRegistration((current) => ({ ...current, [field]: value }));
  }

  function updateApiField(field, value) {
    setApiForm((current) => ({ ...current, [field]: value }));
  }

  function resetRegistration() {
    setEditingId(null);
    setRegistration({ shop_type: 'NAVER', shop_id: '' });
  }

  async function saveRegistration() {
    if (!registration.shop_id.trim()) {
      setState({ loading: false, message: '쇼핑몰 ID를 입력해 주세요.' });
      return;
    }
    setState({ loading: true, message: editingId ? '쇼핑몰 정보 수정 중' : '쇼핑몰 등록 중' });
    try {
      if (editingId) {
        const result = await putAuthJson(`/v1/api/accounts/me/shops/${encodeURIComponent(editingId)}`, {
          shop_type: registration.shop_type,
          shop_id: registration.shop_id.trim(),
        });
        setItems((current) => current.map((item) => (item.id === editingId ? result.item : item)));
        setState({ loading: false, message: '쇼핑몰 정보가 수정되었습니다.' });
      } else {
        const result = await postAuthJson('/v1/api/accounts/me/shops', {
          shop_type: registration.shop_type,
          shop_id: registration.shop_id.trim(),
        });
        setItems((current) => [result.item, ...current]);
        setCurrentPage(1);
        setState({ loading: false, message: '쇼핑몰이 등록되었습니다.' });
      }
      resetRegistration();
    } catch (error) {
      setState({ loading: false, message: `쇼핑몰 저장 실패: ${error.message}` });
    }
  }

  function editShop(item) {
    setEditingId(item.id);
    setRegistration({
      shop_type: item.shop_type ?? 'NAVER',
      shop_id: item.shop_id ?? '',
    });
    setState({ loading: false, message: '수정할 쇼핑몰을 선택했습니다.' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function saveApiConnection() {
    if (!apiTarget?.id) {
      setState({ loading: false, message: 'API를 연결할 쇼핑몰을 먼저 등록해 주세요.' });
      return;
    }
    setState({ loading: true, message: 'API 연동정보 저장 중' });
    try {
      const result = await putAuthJson(
        `/v1/api/accounts/me/shops/${encodeURIComponent(apiTarget.id)}`,
        buildApiPayload(apiForm),
      );
      setItems((current) => current.map((item) => (item.id === apiTarget.id ? result.item : item)));
      setApiTarget(result.item);
      setApiForm((current) => ({ ...current, shop_account_password: '', api_key: '', api_secret_key: '' }));
      setState({ loading: false, message: 'API 연동정보가 저장되었습니다.' });
    } catch (error) {
      setState({ loading: false, message: `API 연동 실패: ${error.message}` });
    }
  }

  async function toggleShopStatus(item) {
    const nextStatus = item.status === 'N' ? 'Y' : 'N';
    setState({ loading: true, message: nextStatus === 'Y' ? '쇼핑몰 계정 활성화 중' : '쇼핑몰 계정 비활성화 중' });
    try {
      const result = await putAuthJson(`/v1/api/accounts/me/shops/${encodeURIComponent(item.id)}`, { status: nextStatus });
      setItems((current) => current.map((currentItem) => (
        currentItem.id === item.id ? result.item : currentItem
      )));
      setState({ loading: false, message: nextStatus === 'Y' ? '쇼핑몰 계정이 활성화되었습니다.' : '쇼핑몰 계정이 비활성화되었습니다.' });
    } catch (error) {
      setState({ loading: false, message: `쇼핑몰 상태 변경 실패: ${error.message}` });
    }
  }

  async function deleteShop(item) {
    setState({ loading: true, message: '쇼핑몰 계정 삭제 중' });
    try {
      await deleteAuthJson(`/v1/api/accounts/me/shops/${encodeURIComponent(item.id)}`);
      if (editingId === item.id) resetRegistration();
      if (apiTarget?.id === item.id) {
        setApiTarget(null);
        setApiDialogOpen(false);
      }
      setItems((current) => current.filter((currentItem) => currentItem.id !== item.id));
      setState({ loading: false, message: '쇼핑몰 계정이 삭제되었습니다.' });
    } catch (error) {
      setState({ loading: false, message: `쇼핑몰 삭제 실패: ${error.message}` });
    }
  }

  if (!auth?.access_token) {
    return <p className="auth-message error">로그인 후 쇼핑몰 계정을 연결할 수 있습니다.</p>;
  }

  const pageSize = 5;
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(currentPage, pageCount);
  const visibleItems = items.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <section aria-label="쇼핑몰 계정 연결" className="u23-shop-panel">
      <section className="u23-shop-register">
        <div className="sub-tit-wrap"><h3 className="sub-tit">쇼핑몰 등록</h3></div>
        <div className="table-r-border3">
          <div className="info-table">
            <dl className="table-item col-2">
              <dt className="table-dt"><label htmlFor="u23ShopType">추가쇼핑몰</label></dt>
              <dd className="table-dd">
                <select id="u23ShopType" onChange={(event) => updateRegistration('shop_type', event.target.value)} value={registration.shop_type}>
                  <option value="NAVER">네이버</option>
                  <option value="COUPANG">쿠팡</option>
                  <option value="GMARKET">지마켓</option>
                  <option value="STREET11">11번가</option>
                  <option value="AUCTION">옥션</option>
                </select>
              </dd>
            </dl>
            <dl className="table-item col-2">
              <dt className="table-dt"><label htmlFor="u23ShopId">쇼핑몰ID</label></dt>
              <dd className="table-dd u23-shop-id-field">
                <input id="u23ShopId" maxLength="50" onChange={(event) => updateRegistration('shop_id', event.target.value)} type="text" value={registration.shop_id} />
                <button className="btn btn-color3 rs-btn" disabled={state.loading} onClick={saveRegistration} type="button">
                  {editingId ? '수정' : '등록'}
                </button>
              </dd>
            </dl>
          </div>
        </div>
      </section>

      <section className="u23-shop-list">
        <div className="sub-tit-wrap"><h3 className="sub-tit">쇼핑몰 정보</h3></div>
        <div className="table-r-border">
          <div className="table basic-table auto-xy-scroll">
            <table aria-label="쇼핑몰 정보">
              <thead>
                <tr>
                  <th scope="col">운영 쇼핑몰</th>
                  <th scope="col">쇼핑몰 ID</th>
                  <th scope="col">선정산 대상</th>
                  <th scope="col">API 연결</th>
                  <th scope="col">정보수정</th>
                </tr>
              </thead>
              <tbody>
                {visibleItems.length ? visibleItems.map((item) => (
                  <tr key={item.id}>
                    <td data-label="운영 쇼핑몰">{shopTypeLabel(item.shop_type)}</td>
                    <td data-label="쇼핑몰 ID">{item.shop_id ?? '-'}</td>
                    <td data-label="선정산 대상"><span aria-label={item.settlement ? '선정산 대상' : '선정산 비대상'} className={`u23-target-mark ${item.settlement ? 'yes' : 'no'}`}>{item.settlement ? 'O' : 'X'}</span></td>
                    <td data-label="API 연결"><button className="u23-link-button" onClick={() => prepareApiConnection(item)} type="button">연결</button></td>
                    <td data-label="정보수정">
                      <div className="u23-row-actions">
                        <button disabled={state.loading} onClick={() => editShop(item)} type="button">수정</button>
                        <button disabled={state.loading} onClick={() => toggleShopStatus(item)} type="button">{item.status === 'N' ? '활성' : '비활성'}</button>
                        <button disabled={state.loading} onClick={() => deleteShop(item)} type="button">삭제</button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr className="u23-empty-row"><td colSpan="5">이용중인 서비스가 없습니다.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <nav aria-label="쇼핑몰 페이지" className="u23-pagination">
          <button aria-label="이전 페이지" disabled={safePage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} type="button">‹</button>
          {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
            <button aria-current={page === safePage ? 'page' : undefined} className={page === safePage ? 'active' : ''} key={page} onClick={() => setCurrentPage(page)} type="button">{page}</button>
          ))}
          <button aria-label="다음 페이지" disabled={safePage === pageCount} onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))} type="button">›</button>
        </nav>
        <div className="u23-shop-actions">
          <button className="btn btn-color1" disabled={state.loading} onClick={resetRegistration} type="button">취소</button>
          <button className="btn btn-color2" disabled={state.loading} onClick={saveRegistration} type="button">수정 확인</button>
        </div>
      </section>

      {state.message ? <p className={state.message.includes('실패') || state.message.includes('입력') || state.message.includes('먼저') ? 'auth-message error' : 'auth-message success'}>{state.message}</p> : null}

      {apiDialogOpen ? (
        <div className="u23-api-backdrop" onKeyDown={(event) => { if (event.key === 'Escape') setApiDialogOpen(false); }} onMouseDown={(event) => { if (event.target === event.currentTarget) setApiDialogOpen(false); }}>
          <section aria-label="API 인증 요청" aria-modal="true" className="u23-api-dialog" role="dialog">
            <header className="u23-api-header">
              <div><img alt="" src="/final-ui/static/img/sub/c6/icon.png" /><h3>API 인증 요청</h3></div>
              <button aria-label="닫기" autoFocus onClick={() => setApiDialogOpen(false)} type="button">×</button>
            </header>
            <div className="u23-api-content">
              {apiTarget ? (
                <>
                  <p className="u23-api-copy">
                    큐빅아이에서는 회원님의 쇼핑몰 정보를 쉽고 정확하게 확인하기 위해 쇼핑몰에서 제공하는 API 방식을 사용하고 있습니다.<br />
                    아래 연동정보를 확인하고 입력해 주세요.
                  </p>
                  <div className="u23-api-market">
                    {apiTarget.shop_type === 'STREET11' ? <img alt="11번가" src="/final-ui/static/img/logo/11st-s.jpg" /> : null}
                    <span>{shopTypeLabel(apiTarget.shop_type)} API 연동</span>
                  </div>
                  <p className="u23-api-copy">엑세스 키, 쇼핑몰 계정 ID와 비밀번호를 입력해 주십시오.</p>
                  <div className="u23-api-form">
                    <label><span>엑세스 키</span><input aria-label="엑세스 키" autoComplete="off" onChange={(event) => updateApiField('api_key', event.target.value)} placeholder="엑세스 키" type="password" value={apiForm.api_key} /></label>
                    <label><span>쇼핑몰 계정 ID</span><input aria-label="쇼핑몰 계정 ID" maxLength="50" onChange={(event) => updateApiField('shop_account_id', event.target.value)} placeholder="쇼핑몰 계정 ID" type="text" value={apiForm.shop_account_id} /></label>
                    <label><span>쇼핑몰 계정 비밀번호</span><input aria-label="쇼핑몰 계정 비밀번호" autoComplete="new-password" maxLength="100" onChange={(event) => updateApiField('shop_account_password', event.target.value)} placeholder="쇼핑몰 계정 비밀번호" type="password" value={apiForm.shop_account_password} /></label>
                  </div>
                  <details className="u23-api-extra">
                    <summary>추가 연동정보</summary>
                    <label>Vendor ID<input aria-label="Vendor ID" maxLength="20" onChange={(event) => updateApiField('vendor_id', event.target.value)} type="text" value={apiForm.vendor_id} /></label>
                    <label>API Secret<input aria-label="API Secret" autoComplete="new-password" maxLength="100" onChange={(event) => updateApiField('api_secret_key', event.target.value)} type="password" value={apiForm.api_secret_key} /></label>
                    <label>선정산 설정<select aria-label="선정산 설정" onChange={(event) => updateApiField('settlement', event.target.value)} value={apiForm.settlement}><option value="">비대상</option><option value="선정산 대상">선정산 대상</option></select></label>
                    <label>연결 상태<select aria-label="연결 상태" onChange={(event) => updateApiField('status', event.target.value)} value={apiForm.status}><option value="Y">활성</option><option value="N">비활성</option></select></label>
                  </details>
                  <p className="u23-api-notice">정보 입력 후 ‘연동’ 버튼을 클릭해 주십시오. 데이터 취합까지는 다소 시간이 소요됩니다.</p>
                  {state.message ? <p className={state.message.includes('실패') ? 'u23-api-message error' : 'u23-api-message'}>{state.message}</p> : null}
                </>
              ) : <p className="u23-api-empty">API를 연결할 쇼핑몰을 먼저 등록해 주세요.</p>}
            </div>
            <footer className="u23-api-footer">
              <button disabled={state.loading || !apiTarget} onClick={saveApiConnection} type="button">연동</button>
            </footer>
          </section>
        </div>
      ) : null}
    </section>
  );
}

function shopTypeLabel(value) {
  return {
    NAVER: '네이버',
    COUPANG: '쿠팡',
    GMARKET: '지마켓',
    STREET11: '11번가',
    AUCTION: '옥션',
  }[value] ?? value ?? '-';
}

function buildApiPayload(form) {
  const payload = {
    shop_account_id: form.shop_account_id.trim() || null,
    vendor_id: form.vendor_id.trim() || null,
    settlement: form.settlement || null,
    status: form.status,
  };
  if (form.shop_account_password.trim()) payload.shop_account_password = form.shop_account_password;
  if (form.api_key.trim()) payload.api_key = form.api_key;
  if (form.api_secret_key.trim()) payload.api_secret_key = form.api_secret_key;
  return payload;
}


export { IdSearchPage, LoginPage, MyPage, PasswordResetPage, SignupPage };
