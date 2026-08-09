import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DashboardSummary,
  Layout,
  PageTitle,
  Tabs,
  LegacyPanel,
  LegacySearchPanel,
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

function formatMainAmount(value) {
  return Number(value ?? 0).toLocaleString('ko-KR');
}

function formatMainActivityDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
}

function useAuthenticatedMainSummary(enabled) {
  const [state, setState] = useState({ loading: enabled, error: '', summary: null });

  useEffect(() => {
    let active = true;
    if (!enabled) {
      setState({ loading: false, error: '', summary: null });
      return () => {
        active = false;
      };
    }

    setState((current) => ({ ...current, loading: true, error: '' }));
    fetchAuthJson('/v1/api/accounts/me/dashboard-summary')
      .then((summary) => {
        if (active) setState({ loading: false, error: '', summary });
      })
      .catch((error) => {
        if (active) setState({ loading: false, error: `요약 정보 조회 실패: ${error.message}`, summary: null });
      });

    return () => {
      active = false;
    };
  }, [enabled]);

  return state;
}

function MainAmount({ loading, value }) {
  return <><span className="data-in ff-ns">{loading ? '-' : formatMainAmount(value)}</span>원</>;
}

function AuthenticatedMainDashboard({ data }) {
  const summary = data.summary ?? {};
  const activities = summary.activities ?? [];

  return (
    <div className="content lv-auth-dashboard">
      <section className="section sec-1">
        <div className="page-tit pc">
          <h2 className="tit blue-dot">매출/정산 한눈에 보기</h2>
        </div>
        <div className="col-box col-2">
          <article className="col-item item-1 r-30">
            <h3 className="item-tit">매출총액</h3>
            <div className="data-wrap"><MainAmount loading={data.loading} value={summary.sales_total_amount} /></div>
            <a className="btn link-btn fc-01" href="/cubici/salesInfo/sales">내역 상세보기 +</a>
          </article>
          <article className="col-item item-2 r-30">
            <h3 className="item-tit">정산입금</h3>
            <div className="data-wrap"><MainAmount loading={data.loading} value={summary.settlement_total_amount} /></div>
            <a className="btn link-btn" href="/cubici/calculateInfo/details">내역 상세보기 +</a>
          </article>
        </div>
      </section>

      <section className="section sec-2">
        <h3 className="hidden">머니뱅크 이용 요약</h3>
        <div className="main-r-box">
          <article className="mony-bank">
            <div className="bank-item item-1">
              <i className="icon"><img src="/final-ui/static/img/icon/passbook.svg" alt="" /></i>
              <div className="inner-item">
                <h4 className="tit">머니뱅크 서비스 이용잔액</h4>
                <div className="data-wrap"><MainAmount loading={data.loading} value={summary.moneybank_available_balance} /></div>
              </div>
            </div>
            <div className="bank-item item-2">
              <i className="icon pc"><img src="/final-ui/static/img/icon/icon-2.svg" alt="" /></i>
              <article className="inner-item">
                <h4 className="tit">총 이용원금</h4>
                <div className="data-wrap"><MainAmount loading={data.loading} value={summary.total_principal_amount} /></div>
              </article>
              <article className="inner-item">
                <h4 className="tit">총 상환원금</h4>
                <div className="data-wrap"><MainAmount loading={data.loading} value={summary.total_repayment_amount} /></div>
              </article>
            </div>
          </article>
          <article className="bank-item item-3 bb-0">
            <i className="icon pc"><img src="/final-ui/static/img/icon/talk.svg" alt="" /></i>
            <div className="inner-item">
              <h4 className="tit"><a href="/moneybank/current">머니뱅크 이용내역 <i className="fi icon-angle-right" /></a></h4>
              <div className="data-wrap">
                <table>
                  <colgroup><col style={{ width: '15%' }} /><col style={{ width: '25%' }} /><col style={{ width: '30%' }} /><col style={{ width: '30%' }} /></colgroup>
                  <tbody>
                    {activities.length ? activities.slice(0, 2).map((item, index) => (
                      <tr key={`${item.occurred_at}-${item.operation_type}-${index}`}>
                        <th>{formatMainActivityDate(item.occurred_at)}</th>
                        <td>{item.operation_type === 'REPAYMENT' ? '머니뱅크 상환' : '머니뱅크 입금'}</td>
                        <td><span className="data-in">{formatMainAmount(item.amount)}</span>원</td>
                        <td>{item.outstanding_balance === null || item.outstanding_balance === undefined ? '-' : <><span className="data-in">{formatMainAmount(item.outstanding_balance)}</span>원</>}</td>
                      </tr>
                    )) : (
                      <tr className="null"><td colSpan="4">{data.loading ? '이용 내역 조회 중' : '이용 내역 없음'}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </article>
        </div>
        {data.error ? <p className="lv-main-data-message" role="status">{data.error}</p> : null}
      </section>
    </div>
  );
}

function MainPage() {
  const [auth] = useState(readAuthSession);
  const isAuthenticated = Boolean(auth?.access_token && auth?.user);
  const dashboard = useAuthenticatedMainSummary(isAuthenticated);
  const [activeSlide, setActiveSlide] = useState(0);
  const [activePcSlide, setActivePcSlide] = useState(0);
  const touchStartX = useRef(null);
  const slidesCount = 4;

  const moveSlide = useCallback((direction) => {
    setActiveSlide((current) => (current + direction + slidesCount) % slidesCount);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => moveSlide(1), 6000);
    return () => window.clearInterval(timer);
  }, [moveSlide]);

  useEffect(() => {
    const timer = window.setInterval(() => setActivePcSlide((current) => (current + 1) % 3), 6000);
    return () => window.clearInterval(timer);
  }, []);

  function handleTouchStart(event) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event) {
    if (touchStartX.current === null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const distance = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(distance) >= 45) moveSlide(distance < 0 ? 1 : -1);
  }

  return (
    <Layout variant={isAuthenticated ? 'auth-main' : 'public-main'}>
      <main className={`final-main-page lv-main-page${isAuthenticated ? ' lv-auth-main-page' : ''}`}>
        <div className="mainContents pc">
        <figure className="mainSlideArea">
          <div id="mainSlide" className="swiper-container slideAni react-main-slide">
            <div
              className="swiper-wrapper lv-main-track"
              style={{ transform: `translate3d(-${activeSlide * 100}%, 0, 0)` }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <div className={`swiper-slide ${activeSlide === 0 ? 'swiper-slide-active' : ''}`}>
                <div className="visualBox visual01">
                  <span className="bg" />
                  <div className="vCon inner">
                    <div className="txtBox">
                      <p className="sObj t-medium t1">큐빅아이</p>
                      <p className="sObj t-light t2">
                        인공지능 기반의 온라인 쇼핑몰 통합관리 서비스 <br />
                        복잡하고 어려웠던 쇼핑몰 관리를 쉽고 편리하게 <br />
                        바로 확인할 수 있는 차세대 서비스를 경험하세요.
                      </p>
                      <p className="sObj t-light t2">새로운 e-Commerce 큐빅아이가 시작합니다!</p>
                    </div>
                    <div className="sObj imgBox">
                      <div className="pcMockup">
                        <div className="pcFrame">
                          <div id="mainPcSlide" className="swiper-container">
                            <ul className="swiper-wrapper lv-pc-track" style={{ transform: `translate3d(-${activePcSlide * 100}%, 0, 0)` }}>
                              {[
                                ['main-pc-slide01-1.jpg', '큐빅아이 대시보드'],
                                ['main-pc-slide02-1.jpg', '큐빅아이 매출 분석'],
                                ['main-pc-slide03-1.jpg', '큐빅아이 상품 분석'],
                              ].map(([image, alt]) => (
                                <li className="swiper-slide" key={image}>
                                  <img src={`/final-ui/static/img/main/${image}`} alt={alt} />
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`swiper-slide ${activeSlide === 1 ? 'swiper-slide-active' : ''}`}>
                <div className="visualBox visual02">
                  <span className="bg" />
                  <div className="vCon inner">
                    <div className="txtBox">
                      <p className="sObj t-medium t1">상상이상의 혁신적 기능!</p>
                      <p className="sObj t-light t2">
                        쇼핑몰 현황을 한눈에<br />
                        판매부터 재고까지 한번에
                        <br /><br />
                        직관적 결정으로 쇼핑몰<br />
                        성공에 기여합니다.
                      </p>
                    </div>
                    <div className="imgBox">
                      <ul className="bubble-motion">
                        <li className="bgColorLB c5 item-01">재고<br />정보</li>
                        <li className="bgColorLB c4 item-02">매출<br />관리</li>
                        <li className="bgColorLB c5 item-03">정산<br />캘린더</li>
                        <li className="bgColorSB c4 item-04">머니<br />뱅크</li>
                        <li className="bgColorSB c4 item-05">통합<br />분석</li>
                        <li className="bgColorSB c6 item-06"><b>큐빅아이<br />주요기능</b></li>
                        <li className="bgColorLB c3 item-07" />
                        <li className="bgColorLB c2 item-08" />
                        <li className="bgColorSB c1 item-09" />
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`swiper-slide ${activeSlide === 2 ? 'swiper-slide-active' : ''}`}>
                <div className="visualBox visual03">
                  <span className="bg" />
                  <div className="vCon inner">
                    <div className="txtBox">
                      <p className="sObj t-reguler t1">귀찮은 상품정보 입력없이</p>
                      <p className="sObj t-medium t1">판매재고를 관리한다!</p>
                      <p className="sObj t-light t2">
                        회원가입 만으로 <br />
                        상품정보를 자동으로 취합하고<br />
                        재고정보도 바로 업데이트
                        <br /><br />
                        상품재고관리 <br />
                        이보다 더 편할 수 없다!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`swiper-slide ${activeSlide === 3 ? 'swiper-slide-active' : ''}`}>
                <div className="visualBox visual04">
                  <span className="bg" />
                  <div className="vCon inner">
                    <div className="txtBox">
                      <p className="sObj t-middle t1">
                        운영자금만 있으면<br />
                        바로 매출을 높일 수 있는데
                      </p>
                      <p className="sObj t-light t2">
                        혁신적인 방식의 온라인 금융 서비스 머니뱅크가 <br />
                        그 해결방법을 제공합니다.
                      </p>
                      <p className="sObj t-light t2">
                        비대면 방식의 머니뱅크는 신청만으로 <br />
                        바로 이용가능한 금액을 산출하고 가장 합리적인 조건으로 <br />
                        사업운영자금을 지원합니다. <br />
                      </p>
                      <p className="sObj t-middle t1">머니뱅크</p>
                    </div>
                    <div className="sObj imgBox">
                      <div id="main-slide04-up">
                        {[
                          ['main-slide04-img04.png', '머니뱅크 서비스 화면'],
                          ['main-slide04-img01.png', '머니뱅크 서비스 화면'],
                          ['main-slide04-img02.png', '머니뱅크 서비스 화면'],
                          ['main-slide04-img03.png', '머니뱅크 서비스 화면'],
                        ].map(([image, alt], index) => (
                          <div className={`s04-img i-0${index + 1}`} key={image}>
                            <img src={`/final-ui/static/img/main/${image}`} alt={alt} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <button className="swiper-button-prev" type="button" aria-label="이전 메인 화면" onClick={() => moveSlide(-1)} />
            <button className="swiper-button-next" type="button" aria-label="다음 메인 화면" onClick={() => moveSlide(1)} />
            <div className="swiper-pagination" role="tablist" aria-label="메인 화면 선택">
              {Array.from({ length: slidesCount }, (_, index) => (
                <button
                  className={`swiper-pagination-bullet ${activeSlide === index ? 'swiper-pagination-bullet-active' : ''}`}
                  type="button"
                  role="tab"
                  aria-selected={activeSlide === index}
                  aria-label={`${index + 1}번째 메인 화면`}
                  key={index}
                  onClick={() => setActiveSlide(index)}
                />
              ))}
            </div>
          </div>
        </figure>
        </div>

        <section className="mobile-view final-mobile-logout">
          <div className="logout-content">
            <nav className="lv-mobile-section-tabs" aria-label="주요 서비스 바로가기">
              <a className="active" href="/cubici/integratedInfo/tab1">통합정보</a>
              <a href="/cubici/salesInfo/sales">매출정보</a>
              <a href="/cubici/calculateInfo/calendar">정산정보</a>
              <a href="/moneybank/intro/advpay">머니뱅크</a>
            </nav>
            <div className="first-slider-wrap">
              <div className="first-slider swiper">
                <div className="swiper-wrapper">
                  <article className="swiper-slide swiper-slide-active">
                    <figure className="figure">
                      <img src="/final-ui/static/img/main/logout-slide-1.png" alt="큐빅아이 모바일 소개" />
                    </figure>
                    <div className="slider-txt">
                      <p className="desc">
                        인공지능 기반의
                        <span>Smart e-Commerce System</span>
                      </p>
                      <h3 className="tit">큐빅아이</h3>
                    </div>
                  </article>
                </div>
                <div className="lv-mobile-slide-control" aria-hidden="true">
                  <i className="active" />
                  <i />
                  <i />
                  <i />
                  <img src="/final-ui/static/img/icon/stop-w.png" alt="" />
                </div>
              </div>
            </div>
            <div className="login-wrap inner">
              <div className="login-box">
                <h2>로그인</h2>
                <form>
                  <div className="input-box id">
                    <label htmlFor="main-user-id">
                      <img src="/final-ui/static/img/icon/id.svg" alt="아이디" />
                    </label>
                    <input id="main-user-id" placeholder="아이디" readOnly type="text" />
                  </div>
                  <div className="input-box pw">
                    <label htmlFor="main-user-pw">
                      <img src="/final-ui/static/img/icon/pw.svg" alt="비밀번호" />
                    </label>
                    <input id="main-user-pw" placeholder="비밀번호" readOnly type="password" />
                  </div>
                  <div className="btn-box">
                    <a href="/idSearch">ID 찾기</a>
                    <a href="/pwdReset">PW 찾기</a>
                  </div>
                  <a className="big-btn r-30" href="/login">로그인</a>
                  <a className="big-btn r-30" href="/mainSignUp">회원가입</a>
                </form>
              </div>
            </div>
          </div>
        </section>

        <section className="content-wrap lv-main-content">
          <div className="main-wrap inner">
            {isAuthenticated ? <AuthenticatedMainDashboard data={dashboard} /> : null}
            <aside className="side-menu">
              <h2 className="side-tit blue-dot">큐빅아이 주요 서비스</h2>
              <ul className="menu-list">
                <li className="list-item-1">
                  <a className="item-pd" href="/cubici/integratedInfo/tab1">
                    <span className="sm-txt">통합정보</span>
                    <p className="desc">스마트한 쇼핑몰 관리<br /><span>상품분석 및 매출분석</span></p>
                    <figure className="figure"><img src="/final-ui/static/img/main/side-icon-1.png" alt="통합정보" /></figure>
                  </a>
                </li>
                <li className="list-item-2">
                  <a className="item-pd" href="/cubici/salesInfo/sales">
                    <span className="sm-txt">매출정보</span>
                    <p className="desc">쇼핑몰별 판매현황<br /><span>반품/교환, 진행상황</span></p>
                    <figure className="figure"><img src="/final-ui/static/img/main/side-icon-2.png" alt="매출정보" /></figure>
                  </a>
                </li>
                <li className="list-item-3 item-pd">
                  <span className="sm-txt">정산정보</span>
                  <p className="desc">큐빅아이 캘린더에서<br /><span>월정산정보를 한눈에</span></p>
                  <div className="btn-box">
                    <a className="btn link-btn" href="/cubici/calculateInfo/calendar">정산 캘린더</a>
                    <a className="btn link-btn" href="/cubici/calculateInfo/details">정산상세</a>
                  </div>
                  <figure className="figure"><img src="/final-ui/static/img/main/side-icon-3.png" alt="정산정보" /></figure>
                </li>
                <li className="list-item-4 item-pd">
                  <span className="sm-txt">머니뱅크</span>
                  <p className="desc">필요한 사업 자금을<br /><span>큐빅아이에서 간편 이용</span></p>
                  <div className="btn-box">
                    <a className="btn link-btn" href="/moneybank/intro/advpay">서비스 소개</a>
                    <a className="btn link-btn" href="/moneybank/request">서비스 신청</a>
                  </div>
                  <figure className="figure"><img src="/final-ui/static/img/main/side-icon-4.png" alt="머니뱅크" /></figure>
                </li>
              </ul>
            </aside>
          </div>
        </section>
      </main>
    </Layout>
  );
}

function IntegratedInfoPage({ tab = 'tab1' }) {
  const [auth] = useState(readAuthSession);
  const shopFilter = useAuthenticatedShopPairs(auth);
  const [salesFilterDraft, setSalesFilterDraft] = useState({ shopType: '', fromDate: '', toDate: '' });
  const [salesFilters, setSalesFilters] = useState({ shopType: '', fromDate: '', toDate: '' });
  const [state, setState] = useState({
    loading: Boolean(auth?.access_token),
    message: '',
    sales: [],
    returns: [],
    settlements: [],
    monthly: null,
  });
  const activeTab = ['tab1', 'tab2', 'tab3'].includes(tab) ? tab : 'tab1';

  useEffect(() => {
    let active = true;
    async function load() {
      if (!auth?.access_token) {
        setState({ loading: false, message: '로그인 후 조회합니다.', sales: [], returns: [], settlements: [], monthly: null });
        return;
      }
      if (shopFilter.loading || !shopFilter.shopPairs) {
        setState((current) => ({ ...current, loading: true, message: '쇼핑몰 정보 확인 중' }));
        return;
      }
      setState((current) => ({ ...current, loading: true, message: '' }));
      try {
        const shopPairs = encodeURIComponent(shopFilter.shopPairs);
        const salesParams = new URLSearchParams({ limit: '100', offset: '0', shop_pairs: shopFilter.shopPairs });
        if (salesFilters.shopType) salesParams.set('shop_type', salesFilters.shopType);
        if (salesFilters.fromDate) salesParams.set('from_date', salesFilters.fromDate);
        if (salesFilters.toDate) salesParams.set('to_date', salesFilters.toDate);
        const [sales, returns, settlements, monthly] = await Promise.allSettled([
          fetchJson(`/v1/api/sales/orders?${salesParams.toString()}`),
          fetchJson(`/v1/api/sales/returns?limit=100&offset=0&shop_pairs=${shopPairs}`),
          fetchJson(`/v1/api/settlements?limit=100&offset=0&shop_pairs=${shopPairs}`),
          fetchAuthJson('/v1/api/accounts/me/dashboard-summary'),
        ]);
        if (!active) return;
        const rejected = [sales, returns, settlements, monthly].find((result) => result.status === 'rejected');
        setState({
          loading: false,
          message: rejected ? `일부 통합정보 조회 실패: ${rejected.reason.message}` : '',
          sales: sales.status === 'fulfilled' ? sales.value.items ?? [] : [],
          returns: returns.status === 'fulfilled' ? returns.value.items ?? [] : [],
          settlements: settlements.status === 'fulfilled' ? settlements.value.items ?? [] : [],
          monthly: monthly.status === 'fulfilled' ? monthly.value : null,
        });
      } catch (error) {
        if (!active) return;
        setState({ loading: false, message: `통합정보 조회 실패: ${error.message}`, sales: [], returns: [], settlements: [], monthly: null });
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [auth?.access_token, salesFilters.fromDate, salesFilters.shopType, salesFilters.toDate, shopFilter.loading, shopFilter.shopPairs]);

  const summary = useMemo(() => buildIntegratedSummary(state), [state]);
  const monthlySummary = useMemo(() => buildIntegratedMonthlySummary(state.monthly, summary), [state.monthly, summary]);
  const tabs = [
    ['당월현황', '/cubici/integratedInfo/tab1'],
    ['매출분석', '/cubici/integratedInfo/tab2'],
    ['상품분석', '/cubici/integratedInfo/tab3'],
  ];

  return (
    <Layout variant="integrated">
      <PageTitle
        title="통합정보"
      />
      <Tabs tabs={tabs} />
      <main className={`content-wrap c1p${activeTab.replace('tab', '')} final-core-page final-integrated-page`} id="Main">
        <section className="section sec-1">
          <h2 className="hidden">{tabs.find((item) => item[1].endsWith(activeTab))?.[0] ?? '통합정보'}</h2>
          <div className="inner">
        <IntegratedMobileServiceNav />
        {!auth?.access_token ? <p className="auth-message error">로그인 후 통합정보를 조회할 수 있습니다.</p> : null}
        {shopFilter.message ? <p className="auth-message error">{shopFilter.message}</p> : null}
        {auth?.access_token && !shopFilter.loading && !shopFilter.shops.length ? (
          <p className="auth-message error">연결된 쇼핑몰 계정이 없습니다. 마이페이지에서 쇼핑몰 계정을 먼저 연결해주세요.</p>
        ) : null}

        {activeTab === 'tab1' ? (
          <>
            <div className="table-wrap">
              <FinalDateTop />
              <div className="table-r-border2">
                <div className="table trans-table">
                  <table>
                    <colgroup className="pc">
                      <col style={{ width: '17.4%' }} />
                      <col style={{ width: '20.65%' }} />
                      <col style={{ width: '20.65%' }} />
                      <col style={{ width: '20.65%' }} />
                      <col style={{ width: '20.65%' }} />
                    </colgroup>
                    <thead>
                      <tr className="th-bg-2">
                        <th></th>
                        <th scope="col">결제액(원)</th>
                        <th scope="col">주문건수(개)</th>
                        <th scope="col">정산입금액(원)</th>
                        <th scope="col">등록상품수(개)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th scope="row">당월</th>
                        <td>{formatIntegratedNumber(monthlySummary.current.salesAmount)}</td>
                        <td>{formatIntegratedNumber(monthlySummary.current.orderCount)}</td>
                        <td>{formatIntegratedNumber(monthlySummary.current.settlementAmount)}</td>
                        <td>{formatIntegratedNumber(monthlySummary.current.productCount)}</td>
                      </tr>
                      <tr>
                        <th scope="row">전월 동기</th>
                        <td>{formatIntegratedNumber(monthlySummary.previous.salesAmount)}</td>
                        <td>{formatIntegratedNumber(monthlySummary.previous.orderCount)}</td>
                        <td>{formatIntegratedNumber(monthlySummary.previous.settlementAmount)}</td>
                        <td>{formatIntegratedNumber(monthlySummary.previous.productCount)}</td>
                      </tr>
                      <tr className="change-row">
                        <th scope="row">증감</th>
                        <td>{formatIntegratedNumber(monthlySummary.change.salesAmount)}</td>
                        <td>{formatIntegratedNumber(monthlySummary.change.orderCount)}</td>
                        <td>{formatIntegratedNumber(monthlySummary.change.settlementAmount)}</td>
                        <td>{formatIntegratedNumber(monthlySummary.change.productCount)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <FinalChart title="결제추이 비교" src="/final-ui/static/img/sub/chart-1.jpg" />
          </>
        ) : null}

        {activeTab === 'tab2' ? (
          <>
            <FinalDateTop />
            <IntegratedAnalysisFilter
              connectedShops={shopFilter.shops}
              filters={salesFilterDraft}
              loading={state.loading}
              onChange={(name, value) => setSalesFilterDraft((current) => ({ ...current, [name]: value }))}
              onSearch={() => setSalesFilters(salesFilterDraft)}
            />
            <FinalChart title="쇼핑몰 결제 금액" src="/final-ui/static/img/sub/chart-2.jpg" />
          </>
        ) : null}

        {activeTab === 'tab3' ? (
          <>
            <FinalDateTop />
            <IntegratedAnalysisFilter
              connectedShops={shopFilter.shops}
              filters={salesFilterDraft}
              loading={state.loading}
              onChange={(name, value) => setSalesFilterDraft((current) => ({ ...current, [name]: value }))}
              onSearch={() => setSalesFilters(salesFilterDraft)}
            />
            <div className="final-chart-grid u09-chart-stack">
              <FinalChart title="쇼핑몰 결제 비중" src="/final-ui/static/img/sub/chart-3.png" />
              <FinalChart title="쇼핑몰 가격할인 및 판촉" src="/final-ui/static/img/sub/chart-4.png" />
              <FinalChart title="TOP 10 매출상품" src="/final-ui/static/img/sub/chart-5.png" />
            </div>
          </>
        ) : null}
            {state.message ? <p className="auth-message error">{state.message}</p> : null}
            {activeTab !== 'tab1' && state.loading ? <p className="hidden" role="status">DB API 조회 중</p> : null}
          </div>
        </section>
      </main>
    </Layout>
  );
}

function IntegratedAnalysisFilter({ connectedShops, filters, loading, onChange, onSearch }) {
  const connectedShopTypes = new Set((connectedShops ?? []).map((shop) => shop.shop_type).filter(Boolean));

  function submit(event) {
    event.preventDefault();
    onSearch();
  }

  return (
    <form className="integrated-analysis-filter u08-sales-filter" onSubmit={submit}>
      <label>
        <span>쇼핑몰</span>
        <select aria-label="쇼핑몰" value={filters.shopType} onChange={(event) => onChange('shopType', event.target.value)}>
          <option value="">전체</option>
          {shopOptions
            .filter(([code]) => !connectedShopTypes.size || connectedShopTypes.has(code))
            .map(([code, name]) => <option key={code} value={code}>{name}</option>)}
        </select>
      </label>
      <label>
        <span>기준</span>
        <select aria-label="기준" defaultValue="amount" disabled>
          <option value="amount">금액</option>
        </select>
      </label>
      <label>
        <span>시작</span>
        <input aria-label="시작기간" type="date" value={filters.fromDate} onChange={(event) => onChange('fromDate', event.target.value)} />
      </label>
      <label>
        <span>종료</span>
        <input aria-label="종료기간" type="date" value={filters.toDate} onChange={(event) => onChange('toDate', event.target.value)} />
      </label>
      <button type="submit" disabled={loading}>검색 <i className="fi icon-search-1" aria-hidden="true" /></button>
    </form>
  );
}

function IntegratedMobileServiceNav() {
  const items = [
    ['통합정보', '/cubici/integratedInfo/tab1'],
    ['매출정보', '/cubici/salesInfo/sales'],
    ['정산정보', '/cubici/calculateInfo/calendar'],
    ['머니뱅크', '/moneybank/current'],
  ];
  return (
    <div className="u07-mobile-service-nav">
      <h2>통합정보</h2>
      <nav aria-label="모바일 서비스 메뉴">
        {items.map(([label, href], index) => <a className={index === 0 ? 'active' : ''} href={href} key={href}>{label}</a>)}
      </nav>
    </div>
  );
}

function FinalDateTop() {
  return (
    <div className="table-top flex-end">
      <div className="date-wrap">
        <i className="icon mr-5"><img src="/final-ui/static/img/icon/calendar-s.png" alt="icon" /></i>
        <strong className="fw-600">기준</strong>
        <span className="data-in">{new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: '2-digit' })}</span>
      </div>
    </div>
  );
}

function FinalChart({ title, src }) {
  return (
    <div className="chart-wrap">
      <div className="chart-header">
        <h3 className="chart-tit">{title}</h3>
      </div>
      <div className="chart-over">
        <div className="chart-con">
          <img src={src} alt="차트" />
        </div>
      </div>
    </div>
  );
}

function InventoryPage() {
  const [auth] = useState(readAuthSession);
  const shopFilter = useAuthenticatedShopPairs(auth);
  const [filters, setFilters] = useState({ keyword: '', status: '' });
  const [state, setState] = useState({ loading: false, message: '', items: [] });

  useEffect(() => {
    let active = true;
    async function load() {
      if (!auth?.access_token || shopFilter.loading || !shopFilter.shopPairs) {
        return;
      }
      setState((current) => ({ ...current, loading: true, message: '' }));
      try {
        const params = new URLSearchParams({
          limit: '100',
          offset: '0',
          shop_pairs: shopFilter.shopPairs,
        });
        if (filters.keyword) params.set('keyword', filters.keyword);
        if (filters.status) params.set('status', filters.status);
        const sales = await fetchJson(`/v1/api/sales/orders?${params.toString()}`);
        if (!active) return;
        setState({ loading: false, message: '', items: sales.items ?? [] });
      } catch (error) {
        if (!active) return;
        setState({ loading: false, message: `상품현황 조회 실패: ${error.message}`, items: [] });
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [auth?.access_token, filters.keyword, filters.status, shopFilter.loading, shopFilter.shopPairs]);

  const productRows = useMemo(() => buildInventoryRows(state.items), [state.items]);

  function updateFilter(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  return (
    <Layout>
      <PageTitle
        title="상품/재고현황"
        text="연결 쇼핑몰의 판매 상품 기준으로 상품 수량과 최근 판매 흐름을 확인합니다."
      />
      <main className="content-wrap c1p4 final-core-page final-inventory-page" id="Main">
        <section className="section sec-1">
          <h2 className="hidden">상품/재고현황</h2>
          <div className="inner">
            {!auth?.access_token ? <p className="auth-message error">로그인 후 상품현황을 조회할 수 있습니다.</p> : null}
            {shopFilter.message ? <p className="auth-message error">{shopFilter.message}</p> : null}
            <LegacySearchPanel title="검색조건">
              <label>판매상태<input aria-label="판매상태" name="status" value={filters.status} onChange={updateFilter} placeholder="상태 코드" /></label>
              <label>검색어<input aria-label="상품 검색어" name="keyword" value={filters.keyword} onChange={updateFilter} placeholder="상품명, 상품번호" /></label>
              <p className="api-note">
                legacy 재고 원천 테이블은 현재 PostgreSQL migration 대상에 없어 판매 데이터 기반 상품현황으로 표시합니다.
              </p>
            </LegacySearchPanel>
            <LegacyPanel title="상품 목록" className="react-legacy-inventory-panel">
              <div className="tableSet">
                <div className="fixTable">
                  <table>
                    <thead>
                      <tr>
                        <th>상품명</th>
                        <th>상품번호</th>
                        <th>판매수량</th>
                        <th>판매금액</th>
                        <th>결제금액</th>
                        <th>최근 판매일</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productRows.length ? productRows.map((row) => (
                        <tr key={`${row.productNo}-${row.productName}`}>
                          <td>{row.productName}</td>
                          <td>{row.productNo}</td>
                          <td>{row.quantity.toLocaleString('ko-KR')}</td>
                          <td>{formatAmount(row.salesAmount)}</td>
                          <td>{formatAmount(row.paymentAmount)}</td>
                          <td>{formatDate(row.latestPaidDate)}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan="6">{state.loading ? '조회 중입니다.' : '상품 데이터가 없습니다.'}</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <p className="api-note">{state.loading ? 'DB API 조회 중' : state.message || '조회 완료'}</p>
            </LegacyPanel>
          </div>
        </section>
      </main>
    </Layout>
  );
}

function buildIntegratedSummary(state) {
  const latest = (items, key) => items.map((item) => item[key]).filter(Boolean).sort().at(-1) ?? null;
  return {
    salesCount: state.sales.length,
    salesAmount: sumBy(state.sales, 'sales_amount'),
    salesQuantity: sumBy(state.sales, 'quantity'),
    returnCount: state.returns.length,
    returnAmount: sumBy(state.returns, 'payment_amount'),
    settlementCount: state.settlements.length,
    settlementAmount: sumBy(state.settlements, 'settlement_amount'),
    productCount: new Set(state.sales.map((item) => item.product_no || item.product_name).filter(Boolean)).size,
    latestSalesDate: latest(state.sales, 'paid_date'),
    latestReturnDate: latest(state.returns, 'request_date'),
    latestSettlementDate: latest(state.settlements, 'settlement_date'),
  };
}

function buildIntegratedMonthlySummary(monthly, fallback) {
  const current = {
    salesAmount: Number(monthly?.current_sales_amount ?? fallback.salesAmount ?? 0),
    orderCount: Number(monthly?.current_order_count ?? fallback.salesCount ?? 0),
    settlementAmount: Number(monthly?.current_settlement_amount ?? fallback.settlementAmount ?? 0),
    productCount: Number(monthly?.current_product_count ?? fallback.productCount ?? 0),
  };
  const previous = {
    salesAmount: Number(monthly?.previous_sales_amount ?? 0),
    orderCount: Number(monthly?.previous_order_count ?? 0),
    settlementAmount: Number(monthly?.previous_settlement_amount ?? 0),
    productCount: Number(monthly?.previous_product_count ?? 0),
  };
  return {
    current,
    previous,
    change: {
      salesAmount: current.salesAmount - previous.salesAmount,
      orderCount: current.orderCount - previous.orderCount,
      settlementAmount: current.settlementAmount - previous.settlementAmount,
      productCount: current.productCount - previous.productCount,
    },
  };
}

function formatIntegratedNumber(value) {
  return Number(value ?? 0).toLocaleString('ko-KR');
}

function buildProductRows(sales) {
  const rows = new Map();
  for (const item of sales) {
    const productName = item.product_name || item.product_no || '-';
    const current = rows.get(productName) ?? { productName, quantity: 0, salesAmount: 0, paymentAmount: 0 };
    current.quantity += Number(item.quantity ?? 0);
    current.salesAmount += Number(item.sales_amount ?? 0);
    current.paymentAmount += Number(item.payment_amount ?? 0);
    rows.set(productName, current);
  }
  return Array.from(rows.values()).sort((a, b) => b.paymentAmount - a.paymentAmount).slice(0, 20);
}

function buildInventoryRows(sales) {
  const rows = new Map();
  for (const item of sales) {
    const productName = item.product_name || '-';
    const productNo = item.product_no || '-';
    const key = `${productNo}\n${productName}`;
    const current = rows.get(key) ?? {
      productName,
      productNo,
      quantity: 0,
      salesAmount: 0,
      paymentAmount: 0,
      latestPaidDate: null,
    };
    current.quantity += Number(item.quantity ?? 0);
    current.salesAmount += Number(item.sales_amount ?? 0);
    current.paymentAmount += Number(item.payment_amount ?? 0);
    current.latestPaidDate = [current.latestPaidDate, item.paid_date].filter(Boolean).sort().at(-1) ?? null;
    rows.set(key, current);
  }
  return Array.from(rows.values()).sort((a, b) => b.paymentAmount - a.paymentAmount);
}

function sumBy(items, key) {
  return items.reduce((total, item) => total + Number(item[key] ?? 0), 0);
}

export { IntegratedInfoPage, InventoryPage, MainPage };
