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
  ['요약', '/cubici/mypage/profile'],
  ['회사정보', '/cubici/mypage/companyInfo'],
  ['사업정보', '/cubici/mypage/businessInfo'],
  ['인증정보', '/cubici/mypage/myAuth'],
  ['요금정보', '/cubici/mypage/myCharge'],
  ['회원탈퇴', '/cubici/mypage/withdraw'],
];

const signupTerms = [
  ['agree1', '큐빅아이 서비스 이용약관', '/legacy-terms/agree1.html'],
  ['agree2', '개인정보 처리방침', '/legacy-terms/agree2.html'],
  ['agree3', '제3자 개인(신용)정보 제공 동의서', '/legacy-terms/agree3.html'],
];

function resolveMypageSection(path) {
  if (path?.includes('/businessInfo')) return 'businessInfo';
  if (path?.includes('/myAuth')) return 'myAuth';
  if (path?.includes('/myCharge')) return 'myCharge';
  if (path?.includes('/withdraw')) return 'withdraw';
  if (path?.includes('/companyInfo')) return 'companyInfo';
  return 'profile';
}

function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [state, setState] = useState({ submitting: false, message: '' });

  async function submitLogin() {
    setState({ submitting: true, message: '로그인 확인 중' });
    try {
      const session = await postJson('/v1/api/accounts/login', form);
      saveAuthSession(session);
      setState({ submitting: false, message: '로그인되었습니다.' });
      window.location.href = resolveLoginReturnUrl();
    } catch (error) {
      setState({ submitting: false, message: `로그인 실패: ${error.message}` });
    }
  }

  return (
    <Layout>
      <main className="login-box react-login-box">
        <section className="login-inner">
          <h2>LOGIN</h2>
          <h3>큐빅아이에 오신것을 환영합니다!</h3>
          <div className="input-box id">
            <label aria-label="아이디" htmlFor="userId" />
            <input
              id="userId"
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="ID"
              type="text"
              value={form.email}
            />
          </div>
          <div className="input-box pw">
            <label aria-label="패스워드" htmlFor="userPw" />
            <input
              id="userPw"
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              onKeyDown={(event) => {
                if (event.key === 'Enter') submitLogin();
              }}
              placeholder="PASSWORD"
              type="password"
              value={form.password}
            />
          </div>
          <button className="big-btn primary-login-btn" disabled={state.submitting} onClick={submitLogin} type="button">
            {state.submitting ? '로그인 중' : '로그인'}
          </button>
          <a className="big-btn secondary-signup-btn" href="/mainSignUp">회원가입</a>
          <fieldset>
            <div className="f-left">
              <input name="idSaveCheck" type="checkbox" />
              <label>아이디 저장</label>
            </div>
            <div className="f-right">
              <a className="sm-btn" href="/idSearch">아이디 찾기</a>
              <a className="sm-btn" href="/pwdReset">비밀번호 찾기</a>
            </div>
          </fieldset>
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
      <main className="auth-page">
        <section className="auth-card">
          <h1>아이디 찾기</h1>
          <label>대표자명<input onChange={(event) => updateField('name', event.target.value)} type="text" value={form.name} /></label>
          <label>휴대전화<input onChange={(event) => updateField('phone', event.target.value)} type="tel" value={form.phone} /></label>
          <label>사업자등록번호<input maxLength="12" onChange={(event) => updateField('biz_num', event.target.value)} type="text" value={form.biz_num} /></label>
          <button onClick={submitSearch} type="button">아이디 확인</button>
          {message ? <p className={message.includes('아직') ? 'auth-message error' : 'auth-message success'}>{message}</p> : null}
          <div><a href="/login">로그인</a><a href="/pwdReset">비밀번호 찾기</a></div>
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
      <main className="auth-page">
        <section className="auth-card">
          <h1>비밀번호 찾기</h1>
          <label>회원ID<input onChange={(event) => updateField('email', event.target.value)} type="email" value={form.email} /></label>
          <label>대표자명<input onChange={(event) => updateField('name', event.target.value)} type="text" value={form.name} /></label>
          <label>휴대전화<input onChange={(event) => updateField('phone', event.target.value)} type="tel" value={form.phone} /></label>
          <button onClick={submitReset} type="button">재설정 요청</button>
          {message ? <p className={message.includes('아직') ? 'auth-message error' : 'auth-message success'}>{message}</p> : null}
          <div><a href="/login">로그인</a><a href="/idSearch">아이디 찾기</a></div>
        </section>
      </main>
    </Layout>
  );
}

function SignupPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    biz_name: '',
    biz_num: '',
    biz_setup_date: '',
    biz_type: 'GENERAL',
    sectors: 'OTHER',
  });
  const [termsAccepted, setTermsAccepted] = useState({
    agree1: false,
    agree2: false,
    agree3: false,
  });
  const [state, setState] = useState({ submitting: false, message: '' });
  const allTermsAccepted = Object.values(termsAccepted).every(Boolean);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submitSignup() {
    if (!allTermsAccepted) {
      setState({ submitting: false, message: '회원가입 약관 3종에 모두 동의해야 합니다.' });
      return;
    }
    setState({ submitting: true, message: '가입 저장 중' });
    try {
      const session = await postJson('/v1/api/accounts/signup', form);
      saveAuthSession(session);
      setState({ submitting: false, message: '가입이 저장되었습니다.' });
      window.location.href = '/cubici/mypage/profile';
    } catch (error) {
      setState({ submitting: false, message: `가입 실패: ${error.message}` });
    }
  }

  return (
    <Layout>
      <main className="auth-page wide">
        <section className="auth-card">
          <h1>회원가입</h1>
          <div className="field-grid">
            <label>아이디<input onChange={(event) => updateField('email', event.target.value)} type="email" value={form.email} /></label>
            <label>비밀번호<input onChange={(event) => updateField('password', event.target.value)} type="password" value={form.password} /></label>
            <label>대표자명<input onChange={(event) => updateField('name', event.target.value)} type="text" value={form.name} /></label>
            <label>휴대전화<input onChange={(event) => updateField('phone', event.target.value)} type="tel" value={form.phone} /></label>
            <label>상호<input onChange={(event) => updateField('biz_name', event.target.value)} type="text" value={form.biz_name} /></label>
            <label>사업자등록번호<input maxLength="12" onChange={(event) => updateField('biz_num', event.target.value)} type="text" value={form.biz_num} /></label>
            <label>개업일자<input maxLength="10" onChange={(event) => updateField('biz_setup_date', event.target.value)} placeholder="YYYYMMDD" type="text" value={form.biz_setup_date} /></label>
            <label>
              사업자유형
              <select onChange={(event) => updateField('biz_type', event.target.value)} value={form.biz_type}>
                <option value="GENERAL">일반</option>
                <option value="SIMPLE">간이</option>
                <option value="TAXFREE">면세</option>
                <option value="CORPORATE">법인</option>
              </select>
            </label>
          </div>
          <SignupTermsPanel accepted={termsAccepted} onChange={setTermsAccepted} />
          <button disabled={state.submitting} onClick={submitSignup} type="button">
            {state.submitting ? '가입 저장 중' : '가입 저장'}
          </button>
          {state.message ? <p className={state.message.includes('실패') ? 'auth-message error' : 'auth-message success'}>{state.message}</p> : null}
        </section>
      </main>
    </Layout>
  );
}

function SignupTermsPanel({ accepted, onChange }) {
  function updateTerm(termId, checked) {
    onChange((current) => ({ ...current, [termId]: checked }));
  }

  return (
    <section className="signup-terms">
      <h2>회원가입 약관</h2>
      {signupTerms.map(([id, title, src]) => (
        <article className="signup-term-item" key={id}>
          <div className="signup-term-header">
            <strong>{title}</strong>
            <label>
              <input
                checked={accepted[id]}
                onChange={(event) => updateTerm(id, event.target.checked)}
                type="checkbox"
              />
              동의
            </label>
          </div>
          <iframe src={src} title={title} />
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
    enabled: Boolean(auth?.access_token && user?.user_no),
  });
  const latestContract = dashboard.contracts?.items?.[0];
  const feeSummary = latestContractFee(latestContract);
  const latestRedemption = (dashboard.redemptions?.items ?? []).find((item) => item.mbid === latestContract?.mbid)
    ?? dashboard.redemptions?.items?.[0];

  return (
    <Layout>
      <main className="sub-page">
        <PageTitle title="마이페이지" text="회사정보, 사업정보, 인증정보, 이용요금을 관리합니다." />
        <Tabs tabs={mypageTabs} />
        <LegacyPanel title="회원 기본정보" className="react-legacy-mypage-panel">
          <div className="profile-summary">
            <ReadOnlyField label="회원번호" value={user?.user_no ?? '-'} />
            <ReadOnlyField label="회원유형" value={user?.user_type ?? '-'} />
            <ReadOnlyField label="회원ID" value={user?.email ?? '-'} />
            <ReadOnlyField label="상호" value={user?.biz_name ?? '-'} />
            <ReadOnlyField label="사업자번호" value={user?.biz_num ?? '-'} />
            <ReadOnlyField label="제휴코드" value={user?.partner_code ?? '-'} />
            <ReadOnlyField label="쇼핑몰 연결 수" value={shopFilter.loading ? '확인 중' : `${shopFilter.shops.length}개`} />
            <ReadOnlyField label="마지막 로그인" value={formatDate(user?.last_login_date)} />
            <ReadOnlyField label="등록일" value="-" />
          </div>
        </LegacyPanel>
        {!auth?.access_token ? <p className="auth-message error">로그인 후 마이페이지 정보를 확인할 수 있습니다.</p> : null}
        {shopFilter.message ? <p className="auth-message error">{shopFilter.message}</p> : null}
        <MypageSummaryPanel
          dashboard={dashboard}
          feeSummary={feeSummary}
          latestContract={latestContract}
          latestRedemption={latestRedemption}
          show={section === 'profile'}
        />
        {section === 'companyInfo' ? <CompanyInfoPanel auth={auth} onAuthChange={setAuth} user={user} /> : null}
        {section === 'businessInfo' ? <BusinessInfoPanel auth={auth} user={user} /> : null}
        {section === 'myAuth' ? <AuthInfoPanel auth={auth} /> : null}
        {section === 'myCharge' ? <ChargeInfoPanelLite latestContract={latestContract} /> : null}
        {section === 'withdraw' ? <WithdrawPanel latestContract={latestContract} latestRedemption={latestRedemption} user={user} /> : null}
      </main>
    </Layout>
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
      <LegacyFormPanel title="회사정보">
        <p className="auth-message error">로그인 후 회사정보를 수정할 수 있습니다.</p>
      </LegacyFormPanel>
    );
  }

  return (
    <LegacyFormPanel title="회사정보">
      <div className="field-grid">
        <ReadOnlyField label="회원ID" value={user?.email ?? '-'} />
        <label>대표자명<input onChange={(event) => updateField('name', event.target.value)} type="text" value={form.name} /></label>
        <label>휴대전화<input onChange={(event) => updateField('phone', event.target.value)} type="tel" value={form.phone} /></label>
        <label>상호<input onChange={(event) => updateField('biz_name', event.target.value)} type="text" value={form.biz_name} /></label>
        <label>사업자등록번호<input maxLength="12" onChange={(event) => updateField('biz_num', event.target.value)} type="text" value={form.biz_num} /></label>
        <label>개업일자<input maxLength="10" onChange={(event) => updateField('biz_setup_date', event.target.value)} placeholder="YYYYMMDD" type="text" value={form.biz_setup_date} /></label>
        <label>
          사업자유형
          <select onChange={(event) => updateField('biz_type', event.target.value)} value={form.biz_type}>
            <option value="GENERAL">일반</option>
            <option value="SIMPLE">간이</option>
            <option value="TAXFREE">면세</option>
            <option value="CORPORATE">법인</option>
          </select>
        </label>
        <label>업종코드<input onChange={(event) => updateField('sectors', event.target.value)} type="text" value={form.sectors} /></label>
        <label>제휴코드<input maxLength="10" onChange={(event) => updateField('partner_code', event.target.value)} type="text" value={form.partner_code} /></label>
      </div>
      <button className="primary-action" disabled={state.submitting} onClick={saveCompanyInfo} type="button">
        {state.submitting ? '저장 중' : '회사정보 저장'}
      </button>
      {state.message ? <p className={state.message.includes('실패') ? 'auth-message error' : 'auth-message success'}>{state.message}</p> : null}
    </LegacyFormPanel>
  );
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

function BusinessInfoPanel({ auth, user }) {
  return (
    <>
      <LegacyFormPanel title="사업정보">
        <div className="field-grid">
          <ReadOnlyField label="상호" value={user?.biz_name ?? '-'} />
          <ReadOnlyField label="사업자등록번호" value={user?.biz_num ?? '-'} />
          <ReadOnlyField label="회원유형" value={user?.user_type ?? '-'} />
          <ReadOnlyField label="회원번호" value={user?.user_no ?? '-'} />
        </div>
      </LegacyFormPanel>
      <ShopConnectionPanel auth={auth} />
    </>
  );
}

function AuthInfoPanel({ auth }) {
  return (
    <LegacyFormPanel title="인증정보">
      <div className="field-grid">
        <ReadOnlyField label="로그인 토큰" value={auth?.access_token ? '발급됨' : '없음'} />
        <ReadOnlyField label="API 연동정보" value="쇼핑몰 계정별 관리" />
        <ReadOnlyField label="계좌 확인" value="미연결" />
        <ReadOnlyField label="접근감사" value="운영 구현 필요" />
      </div>
      <p className="auth-message error">API Key, Secret, 계좌 식별정보는 화면에 원문 표시하지 않습니다. 운영 구현 시 마스킹, 암호화, 접근감사가 필요합니다.</p>
    </LegacyFormPanel>
  );
}

function ChargeInfoPanelLite({ latestContract }) {
  const [state, setState] = useState({ loading: true, message: '', items: [] });

  useEffect(() => {
    let cancelled = false;
    fetchChargePlans()
      .then((response) => {
        if (!cancelled) setState({ loading: false, message: '', items: response.items ?? [] });
      })
      .catch((error) => {
        if (!cancelled) setState({ loading: false, message: `요금 조회 실패: ${error.message}`, items: [] });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <LegacyFormPanel title="요금정보">
      <div className="profile-summary">
        <ReadOnlyField label="현재 계약" value={latestContract?.mbid ?? '-'} />
        <ReadOnlyField label="상품" value={formatProductCode(latestContract?.product_code)} />
        <ReadOnlyField label="계약상태" value={formatContractStatus(latestContract?.status)} />
        <ReadOnlyField label="계약일" value={formatDate(latestContract?.contract_date)} />
      </div>
      {state.message ? <p className="auth-message error">{state.message}</p> : null}
      <div className="react-legacy-inline-table">
        <h3>요금제</h3>
        <div className="tableSet">
          <div className="fixTable">
            <table>
              <thead>
                <tr><th>코드</th><th>구분</th><th>금액</th><th>주기</th><th>상태</th></tr>
              </thead>
              <tbody>
                {state.loading ? (
                  <tr><td colSpan="5">요금 정보를 조회 중입니다.</td></tr>
                ) : state.items.length ? state.items.map((item) => (
                  <tr key={item.charge_code}>
                    <td>{item.charge_code}</td>
                    <td>{formatChargeType(item.charge_type)}</td>
                    <td>{formatAmount(item.amount)}</td>
                    <td>{formatPeriod(item.charge_period, item.period_unit)}</td>
                    <td>{item.use_yn ?? '-'}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="5">등록된 요금제가 없습니다.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </LegacyFormPanel>
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

function ShopConnectionPanel({ auth }) {
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    shop_type: 'NAVER',
    shop_id: '',
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

  const loadShops = useCallback(async () => {
    if (!auth?.access_token) return;
    setState((current) => ({ ...current, loading: true, message: '' }));
    try {
      const nextItems = await fetchShopItems();
      setItems(nextItems);
      setState({ loading: false, message: '' });
    } catch (error) {
      setState({ loading: false, message: `쇼핑몰 조회 실패: ${error.message}` });
    }
  }, [auth?.access_token]);

  useEffect(() => {
    loadShops();
  }, [loadShops]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submitShop() {
    setState({ loading: true, message: '쇼핑몰 계정 저장 중' });
    try {
      const payload = buildShopPayload(form, Boolean(editingId));
      let result;
      if (editingId) {
        result = await putAuthJson(`/v1/api/accounts/me/shops/${encodeURIComponent(editingId)}`, payload);
        setItems((current) => current.map((item) => (
          item.id === editingId ? result.item : item
        )));
      } else {
        result = await postAuthJson('/v1/api/accounts/me/shops', payload);
        setItems((current) => [result.item, ...current]);
      }
      resetShopForm();
      setState({ loading: false, message: editingId ? '쇼핑몰 계정이 수정되었습니다.' : '쇼핑몰 계정이 저장되었습니다.' });
    } catch (error) {
      setState({ loading: false, message: `쇼핑몰 저장 실패: ${error.message}` });
    }
  }

  function resetShopForm() {
    setEditingId(null);
    setForm({
      shop_type: 'NAVER',
      shop_id: '',
      shop_account_id: '',
      shop_account_password: '',
      vendor_id: '',
      api_key: '',
      api_secret_key: '',
      settlement: '',
      status: 'Y',
    });
  }

  function editShop(item) {
    setEditingId(item.id);
    setForm({
      shop_type: item.shop_type ?? 'NAVER',
      shop_id: item.shop_id ?? '',
      shop_account_id: item.shop_account_id ?? '',
      shop_account_password: '',
      vendor_id: item.vendor_id ?? '',
      api_key: '',
      api_secret_key: '',
      settlement: item.settlement ?? '',
      status: item.status ?? 'Y',
    });
    setState({ loading: false, message: '수정할 쇼핑몰 계정을 선택했습니다. 비밀번호와 API Secret은 비워두면 유지됩니다.' });
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
      if (editingId === item.id) resetShopForm();
      setItems((current) => current.filter((currentItem) => currentItem.id !== item.id));
      setState({ loading: false, message: '쇼핑몰 계정이 삭제되었습니다.' });
    } catch (error) {
      setState({ loading: false, message: `쇼핑몰 삭제 실패: ${error.message}` });
    }
  }

  if (!auth?.access_token) {
    return (
      <LegacyFormPanel title="쇼핑몰 계정 연결">
        <p className="auth-message error">로그인 후 쇼핑몰 계정을 연결할 수 있습니다.</p>
      </LegacyFormPanel>
    );
  }

  return (
    <LegacyFormPanel title="쇼핑몰 계정 연결">
      <div className="field-grid">
        <label>
          쇼핑몰
          <select onChange={(event) => updateField('shop_type', event.target.value)} value={form.shop_type}>
            <option value="NAVER">네이버</option>
            <option value="COUPANG">쿠팡</option>
            <option value="GMARKET">지마켓</option>
            <option value="STREET11">11번가</option>
            <option value="AUCTION">옥션</option>
          </select>
        </label>
        <label>상점 ID<input onChange={(event) => updateField('shop_id', event.target.value)} type="text" value={form.shop_id} /></label>
        <label>계정 ID<input onChange={(event) => updateField('shop_account_id', event.target.value)} type="text" value={form.shop_account_id} /></label>
        <label>계정 비밀번호<input onChange={(event) => updateField('shop_account_password', event.target.value)} type="password" value={form.shop_account_password} /></label>
        <label>Vendor ID<input onChange={(event) => updateField('vendor_id', event.target.value)} type="text" value={form.vendor_id} /></label>
        <label>API Key<input onChange={(event) => updateField('api_key', event.target.value)} type="text" value={form.api_key} /></label>
        <label>API Secret<input onChange={(event) => updateField('api_secret_key', event.target.value)} placeholder={editingId ? '비워두면 유지' : ''} type="password" value={form.api_secret_key} /></label>
        <label>정산 메모<input onChange={(event) => updateField('settlement', event.target.value)} type="text" value={form.settlement} /></label>
        <label>
          상태
          <select onChange={(event) => updateField('status', event.target.value)} value={form.status}>
            <option value="Y">활성</option>
            <option value="N">비활성</option>
          </select>
        </label>
      </div>
      <div className="form-actions">
        <button className="primary-action" disabled={state.loading} onClick={submitShop} type="button">
          {state.loading ? '저장 중' : editingId ? '계정 수정 저장' : '계정 연결'}
        </button>
        {editingId ? <button className="secondary-action" disabled={state.loading} onClick={resetShopForm} type="button">수정 취소</button> : null}
      </div>
      {state.message ? <p className={state.message.includes('실패') ? 'auth-message error' : 'auth-message success'}>{state.message}</p> : null}
      <div className="react-legacy-inline-table">
        <h3>연결된 쇼핑몰</h3>
        <div className="tableSet">
          <div className="fixTable">
            <table>
              <thead>
                <tr><th>쇼핑몰</th><th>상점 ID</th><th>계정 ID</th><th>상태</th><th>등록일</th><th>관리</th></tr>
              </thead>
              <tbody>
                {items.length ? items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.shop_type ?? '-'}</td>
                    <td>{item.shop_id ?? '-'}</td>
                    <td>{item.shop_account_id ?? '-'}</td>
                    <td>{item.status ?? '-'}</td>
                    <td>{formatDate(item.reg_date)}</td>
                    <td>
                      <button className="secondary-action" disabled={state.loading} onClick={() => editShop(item)} type="button">수정</button>
                      <button className="secondary-action" disabled={state.loading} onClick={() => toggleShopStatus(item)} type="button">
                        {item.status === 'N' ? '활성' : '비활성'}
                      </button>
                      <button className="secondary-action" disabled={state.loading} onClick={() => deleteShop(item)} type="button">삭제</button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="6">연결된 쇼핑몰 계정이 없습니다.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </LegacyFormPanel>
  );
}

function buildShopPayload(form, editing) {
  const payload = { ...form };
  if (editing && !payload.shop_account_password.trim()) {
    delete payload.shop_account_password;
  }
  if (editing && !payload.api_secret_key.trim()) {
    delete payload.api_secret_key;
  }
  if (!editing) {
    delete payload.status;
  }
  return payload;
}


export { IdSearchPage, LoginPage, MyPage, PasswordResetPage, SignupPage };
