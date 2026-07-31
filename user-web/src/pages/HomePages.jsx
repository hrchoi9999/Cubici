import { useCallback, useEffect, useMemo, useState } from 'react';
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

function MainPage() {
  return (
    <Layout>
      <main className="mainContents">
        <figure className="mainSlideArea">
          <div id="mainSlide" className="swiper-container slideAni react-main-slide">
            <div className="swiper-wrapper">
              <div className="swiper-slide swiper-slide-active">
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
                      <div className="sObj btnArea">
                        <a href="/mainSignUp" className="mBtn sColorS">1개월 무료이용</a>
                      </div>
                    </div>
                    <div className="sObj imgBox">
                      <div className="pcMockup">
                        <div className="pcFrame">
                          <div id="mainPcSlide" className="swiper-container">
                            <ul className="swiper-wrapper">
                              <li className="swiper-slide swiper-slide-active">
                                <img src="/resources/rudicks/img/main/main-pc-slide01-1.jpg" alt="큐빅아이 대시보드" />
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </figure>

        <section className="actionVisual react-action-visual">
          <div className="tabList inner">
            <ul>
              <li className="info on"><a href="/cubici/integratedInfo/tab1">통합정보</a></li>
              <li className="sales"><a href="/cubici/salesInfo/sales">매출정보</a></li>
              <li className="settle"><a href="/cubici/calculateInfo/calendar">정산정보</a></li>
              <li className="stock"><a href="/cubici/invento/index">재고정보</a></li>
              <li className="bank"><a href="/moneybank/intro/advpay">머니뱅크</a></li>
            </ul>
          </div>
          <h2 className="sTitle"><b>쇼핑몰 운영</b>을 하나의 흐름으로 관리합니다.</h2>
          <div className="inner react-feature-grid">
            {[
              ['통합정보', '쇼핑몰 주요 지표와 판매 흐름을 한 화면에서 확인합니다.'],
              ['매출정보', '판매, 반품, 교환 내역을 조회합니다.'],
              ['정산관리', '정산 예정과 완료 금액을 캘린더와 상세 목록으로 확인합니다.'],
              ['머니뱅크', '선정산 신청, 계약, 상환 현황을 관리합니다.'],
            ].map(([title, text]) => (
              <article className="conArticle shadowBox hasPadding" key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="partnerArea">
          <h2 className="sTitle">다양한 <b>쇼핑몰 채널</b>을 지원합니다.</h2>
          <div className="inner">
            <ul className="logoList">
              {[
                ['gmarket', '지마켓'],
                ['auction', '옥션'],
                ['m11st', '11번가'],
                ['coupang', '쿠팡'],
                ['interpark', '인터파크'],
                ['smartStore', '스마트스토어'],
                ['ssg', 'SSG'],
                ['lotteon', '롯데온'],
                ['tmon', '티몬'],
                ['wmp', '위메프'],
              ].map(([className, label]) => (
                <li className={className} key={className}><span>{label}</span></li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </Layout>
  );
}

function IntegratedInfoPage({ tab = 'tab1' }) {
  const [auth] = useState(readAuthSession);
  const shopFilter = useAuthenticatedShopPairs(auth);
  const [state, setState] = useState({
    loading: Boolean(auth?.access_token),
    message: '',
    sales: [],
    returns: [],
    settlements: [],
  });
  const activeTab = ['tab1', 'tab2', 'tab3'].includes(tab) ? tab : 'tab1';

  useEffect(() => {
    let active = true;
    async function load() {
      if (!auth?.access_token) {
        setState({ loading: false, message: '로그인 후 조회합니다.', sales: [], returns: [], settlements: [] });
        return;
      }
      if (shopFilter.loading || !shopFilter.shopPairs) {
        setState((current) => ({ ...current, loading: true, message: '쇼핑몰 정보 확인 중' }));
        return;
      }
      setState((current) => ({ ...current, loading: true, message: '' }));
      try {
        const shopPairs = encodeURIComponent(shopFilter.shopPairs);
        const [sales, returns, settlements] = await Promise.allSettled([
          fetchJson(`/v1/api/sales/orders?limit=100&offset=0&shop_pairs=${shopPairs}`),
          fetchJson(`/v1/api/sales/returns?limit=100&offset=0&shop_pairs=${shopPairs}`),
          fetchJson(`/v1/api/settlements?limit=100&offset=0&shop_pairs=${shopPairs}`),
        ]);
        if (!active) return;
        const rejected = [sales, returns, settlements].find((result) => result.status === 'rejected');
        setState({
          loading: false,
          message: rejected ? `일부 통합정보 조회 실패: ${rejected.reason.message}` : '',
          sales: sales.status === 'fulfilled' ? sales.value.items ?? [] : [],
          returns: returns.status === 'fulfilled' ? returns.value.items ?? [] : [],
          settlements: settlements.status === 'fulfilled' ? settlements.value.items ?? [] : [],
        });
      } catch (error) {
        if (!active) return;
        setState({ loading: false, message: `통합정보 조회 실패: ${error.message}`, sales: [], returns: [], settlements: [] });
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [auth?.access_token, shopFilter.loading, shopFilter.shopPairs]);

  const summary = useMemo(() => buildIntegratedSummary(state), [state]);
  const productRows = useMemo(() => buildProductRows(state.sales), [state.sales]);
  const tabs = [
    ['당월현황', '/cubici/integratedInfo/tab1'],
    ['매출분석', '/cubici/integratedInfo/tab2'],
    ['상품분석', '/cubici/integratedInfo/tab3'],
  ];

  return (
    <Layout>
      <main className="sub-page">
        <PageTitle
          title="통합정보"
          text="연결 쇼핑몰 기준으로 매출, 반품, 정산, 상품 판매 흐름을 확인합니다."
        />
        <Tabs tabs={tabs} />
        {!auth?.access_token ? <p className="auth-message error">로그인 후 통합정보를 조회할 수 있습니다.</p> : null}
        {shopFilter.message ? <p className="auth-message error">{shopFilter.message}</p> : null}
        {auth?.access_token && !shopFilter.loading && !shopFilter.shops.length ? (
          <p className="auth-message error">연결된 쇼핑몰 계정이 없습니다. 마이페이지에서 쇼핑몰 계정을 먼저 연결해주세요.</p>
        ) : null}

        {activeTab === 'tab1' ? (
          <LegacyPanel title="당월현황" className="react-legacy-integrated-panel">
            <div className="field-grid">
              <ReadOnlyField label="판매금액" value={formatAmount(summary.salesAmount)} />
              <ReadOnlyField label="판매수량" value={`${summary.salesQuantity.toLocaleString('ko-KR')}개`} />
              <ReadOnlyField label="정산금액" value={formatAmount(summary.settlementAmount)} />
              <ReadOnlyField label="반품/교환" value={`${summary.returnCount.toLocaleString('ko-KR')}건`} />
              <ReadOnlyField label="등록상품" value={`${summary.productCount.toLocaleString('ko-KR')}개`} />
              <ReadOnlyField label="연결 쇼핑몰" value={shopFilter.loading ? '확인 중' : `${shopFilter.shops.length}개`} />
            </div>
            <p className="api-note">{state.loading ? 'DB API 조회 중' : state.message || '조회 완료'}</p>
          </LegacyPanel>
        ) : null}

        {activeTab === 'tab2' ? (
          <LegacyPanel title="매출분석" className="react-legacy-integrated-panel">
            <div className="tableSet">
              <div className="fixTable">
                <table>
                  <thead>
                    <tr>
                      <th>구분</th>
                      <th>건수</th>
                      <th>금액</th>
                      <th>최근일</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>판매</td>
                      <td>{summary.salesCount.toLocaleString('ko-KR')}</td>
                      <td>{formatAmount(summary.salesAmount)}</td>
                      <td>{formatDate(summary.latestSalesDate)}</td>
                    </tr>
                    <tr>
                      <td>반품/교환</td>
                      <td>{summary.returnCount.toLocaleString('ko-KR')}</td>
                      <td>{formatAmount(summary.returnAmount)}</td>
                      <td>{formatDate(summary.latestReturnDate)}</td>
                    </tr>
                    <tr>
                      <td>정산</td>
                      <td>{summary.settlementCount.toLocaleString('ko-KR')}</td>
                      <td>{formatAmount(summary.settlementAmount)}</td>
                      <td>{formatDate(summary.latestSettlementDate)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <p className="api-note">{state.loading ? 'DB API 조회 중' : state.message || '조회 완료'}</p>
          </LegacyPanel>
        ) : null}

        {activeTab === 'tab3' ? (
          <LegacyPanel title="상품분석" className="react-legacy-integrated-panel">
            <div className="tableSet">
              <div className="fixTable">
                <table>
                  <thead>
                    <tr>
                      <th>상품명</th>
                      <th>판매수량</th>
                      <th>판매금액</th>
                      <th>결제금액</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productRows.length ? productRows.map((row) => (
                      <tr key={row.productName}>
                        <td>{row.productName}</td>
                        <td>{row.quantity.toLocaleString('ko-KR')}</td>
                        <td>{formatAmount(row.salesAmount)}</td>
                        <td>{formatAmount(row.paymentAmount)}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan="4">{state.loading ? '조회 중입니다.' : '상품 판매 데이터가 없습니다.'}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="api-note">{state.loading ? 'DB API 조회 중' : state.message || '조회 완료'}</p>
          </LegacyPanel>
        ) : null}
      </main>
    </Layout>
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
      <main className="sub-page">
        <PageTitle
          title="상품/재고현황"
          text="연결 쇼핑몰의 판매 상품 기준으로 상품 수량과 최근 판매 흐름을 확인합니다."
        />
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
