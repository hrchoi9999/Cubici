import { useEffect, useMemo, useState } from 'react';
import {
  Layout,
  PageTitle,
  Tabs,
  fetchJson,
  formatAmount,
  formatDate,
  readAuthSession,
  shopOptions,
  useAuthenticatedShopPairs,
} from '../shared/UserCore.jsx';

const PAGE_SIZE = 10;

const pageConfig = {
  sales: {
    title: '판매현황',
    text: '로그인 사용자의 연결 쇼핑몰 기준으로 판매 내역을 조회합니다.',
    endpoint: '/v1/api/sales/orders',
    idKey: 'sales_id',
    dateField: 'paid_date',
    amountField: 'payment_amount',
    exportName: 'cubici-sales.csv',
  },
  returns: {
    title: '반품/교환',
    text: '로그인 사용자의 연결 쇼핑몰 기준으로 반품/교환 클레임을 조회합니다.',
    endpoint: '/v1/api/sales/returns',
    idKey: 'returns_id',
    dateField: 'request_date',
    amountField: 'payment_amount',
    exportName: 'cubici-returns.csv',
  },
  settlements: {
    title: '정산 상세',
    text: '로그인 사용자의 연결 쇼핑몰 기준으로 정산 내역을 조회합니다.',
    endpoint: '/v1/api/settlements',
    idKey: 'settlements_id',
    dateField: 'settlement_date',
    amountField: 'settlement_amount',
    exportName: 'cubici-settlements.csv',
  },
};

const initialFilters = {
  fromDate: '',
  toDate: '',
  shopType: '',
  status: '',
  keyword: '',
  sortBy: 'paid_date',
};

function initialFiltersFor(type) {
  return {
    ...initialFilters,
    sortBy: type === 'returns' ? 'request_date' : type === 'settlements' ? 'settlement_date' : initialFilters.sortBy,
  };
}

function SalesOrSettlementPage({ type }) {
  const [auth] = useState(readAuthSession);
  const shopFilter = useAuthenticatedShopPairs(auth);
  const [filters, setFilters] = useState(() => initialFiltersFor(type));
  const [lvFilterDraft, setLvFilterDraft] = useState(() => initialFiltersFor(type));
  const [calendarMonth, setCalendarMonth] = useState(() => monthKey(new Date()));
  const [page, setPage] = useState(0);
  const [expandedId, setExpandedId] = useState(null);
  const [state, setState] = useState({ loading: false, error: '', total: 0, items: [] });
  const config = pageConfig[type] ?? pageConfig.sales;
  const isSales = type === 'sales';
  const isReturns = type === 'returns';
  const isSettlements = type === 'settlements';
  const isLvCommerce = isSales || isReturns;
  const isCalendar = isSettlements && window.location.pathname.includes('/calendar');
  const isSettlementDetails = isSettlements && !isCalendar;
  const isLvShell = isLvCommerce || isSettlements;
  const pageTitle = isSettlements ? '정산정보' : '매출정보';
  const subTabs = isSettlements
    ? [
      ['정산 캘린더', '/cubici/calculateInfo/calendar'],
      ['정산 상세', '/cubici/calculateInfo/details'],
    ]
    : [
      ['판매현황', '/cubici/salesInfo/sales'],
      ['반품/교환', '/cubici/salesInfo/return'],
    ];
  const contentClass = isCalendar ? 'c3p1' : isSettlements ? 'c3p2' : isReturns ? 'c2p2' : 'c2p1';
  const pageCount = Math.max(1, Math.ceil((state.total || 0) / PAGE_SIZE));
  const connectedShopTypes = useMemo(
    () => new Set((shopFilter.shops ?? []).map((item) => item.shop_type).filter(Boolean)),
    [shopFilter.shops],
  );
  const calendarRows = useMemo(() => buildCalendarRows(state.items), [state.items]);
  const visibleItems = useMemo(
    () => {
      if (isSales) return sortSalesItems(state.items, filters.sortBy);
      if (isReturns) return sortReturnItems(state.items, filters.sortBy);
      return sortSettlementItems(state.items, filters.sortBy);
    },
    [filters.sortBy, isReturns, isSales, state.items],
  );

  useEffect(() => {
    let active = true;
    async function load() {
      if (!auth?.access_token || shopFilter.loading || !shopFilter.shopPairs) {
        return;
      }
      setState((current) => ({ ...current, loading: true, error: '' }));
      try {
        const params = new URLSearchParams({
          limit: String(isCalendar ? 100 : PAGE_SIZE),
          offset: String(isCalendar ? 0 : page * PAGE_SIZE),
          shop_pairs: shopFilter.shopPairs,
        });
        const calendarRange = monthDateRange(calendarMonth);
        appendParam(params, 'from_date', isCalendar ? calendarRange.from : filters.fromDate);
        appendParam(params, 'to_date', isCalendar ? calendarRange.to : filters.toDate);
        appendParam(params, 'shop_type', filters.shopType);
        if (!isCalendar) {
          appendParam(params, 'status', filters.status);
          appendParam(params, 'keyword', filters.keyword);
        }
        const body = await fetchJson(`${config.endpoint}?${params.toString()}`);
        if (!active) return;
        setState({ loading: false, error: '', total: body.total ?? 0, items: body.items ?? [] });
      } catch (error) {
        if (!active) return;
        setState({ loading: false, error: `조회 실패: ${error.message}`, total: 0, items: [] });
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [auth?.access_token, calendarMonth, config.endpoint, filters, isCalendar, page, shopFilter.loading, shopFilter.shopPairs]);

  function updateFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value }));
    setPage(0);
    setExpandedId(null);
  }

  function resetFilters() {
    const nextFilters = initialFiltersFor(type);
    setFilters(nextFilters);
    setLvFilterDraft(nextFilters);
    setPage(0);
    setExpandedId(null);
  }

  function applyLvFilters() {
    setFilters(lvFilterDraft);
    setPage(0);
    setExpandedId(null);
  }

  function exportCsv() {
    const rows = visibleItems.map((item) => buildExportRow(item, type));
    downloadCsv(config.exportName, rows);
  }

  return (
    <Layout variant={isLvShell ? 'commerce' : undefined}>
      <PageTitle
        title={pageTitle}
        text={isCalendar ? '정산일 기준으로 일자별 정산액을 요약합니다.' : config.text}
      />
      <Tabs tabs={subTabs} />
      <main className={`content-wrap ${contentClass} final-core-page final-commerce-page`} id="Main">
        <section className="section sec-1">
          <h2 className="hidden">{isCalendar ? '정산 캘린더' : config.title}</h2>
          <div className="inner">
        {isLvShell ? <CommerceMobileServiceNav /> : null}
        {!auth?.access_token ? <p className="auth-message error">로그인 후 연결 쇼핑몰 기준 데이터를 조회할 수 있습니다.</p> : null}
        {shopFilter.message ? <p className="auth-message error">{shopFilter.message}</p> : null}
        {auth?.access_token && !shopFilter.loading && !shopFilter.shops.length ? (
          <p className="auth-message error">연결된 쇼핑몰 계정이 없습니다. 마이페이지에서 쇼핑몰 계정을 먼저 연결해주세요.</p>
        ) : null}

        {isCalendar ? null : isLvCommerce ? (
          <FinalCommerceLvSearch
            type={type}
            filters={lvFilterDraft}
            connectedShopTypes={connectedShopTypes}
            loading={state.loading}
            onUpdate={(name, value) => setLvFilterDraft((current) => ({ ...current, [name]: value }))}
            onSearch={applyLvFilters}
            onExport={exportCsv}
            canExport={Boolean(state.items.length)}
          />
        ) : isSettlementDetails ? (
          <FinalSettlementSearch
            filters={lvFilterDraft}
            connectedShopTypes={connectedShopTypes}
            loading={state.loading}
            onUpdate={(name, value) => setLvFilterDraft((current) => ({ ...current, [name]: value }))}
            onSearch={applyLvFilters}
            onExport={exportCsv}
            canExport={Boolean(state.items.length)}
          />
        ) : (
          <FinalCommerceSearch
            filters={filters}
            connectedShopTypes={connectedShopTypes}
            shopFilter={shopFilter}
            total={state.total}
            onUpdate={updateFilter}
            onReset={resetFilters}
            onExport={exportCsv}
            canExport={Boolean(state.items.length)}
          />
        )}

        {isCalendar ? (
          <CalendarSummary
            rows={calendarRows}
            items={state.items}
            month={calendarMonth}
            shopType={filters.shopType}
            connectedShopTypes={connectedShopTypes}
            loading={state.loading}
            error={state.error}
            onMonthChange={setCalendarMonth}
            onShopChange={(value) => updateFilter('shopType', value)}
            onExport={exportCsv}
          />
        ) : (
          <div className="table-wrap final-commerce-table-wrap">
            {isLvCommerce || isSettlementDetails ? <SalesTableControls /> : (
              <div className="table-top flex-end">
                <div className="table-caption">{config.title} 목록</div>
              </div>
            )}
            <div className={isLvCommerce || isSettlementDetails ? 'u10-table-scroll' : ''}>
              <div className="table basic-table table-r-border auto-xy-scroll">
                <CommerceTable
                  items={visibleItems}
                  type={type}
                  expandedId={expandedId}
                  onToggle={(id) => setExpandedId((current) => (current === id ? null : id))}
                />
              </div>
              {isSales ? <SalesSummary items={visibleItems} total={state.total} /> : null}
              {isReturns ? <ReturnSummary items={visibleItems} total={state.total} /> : null}
              {isSettlementDetails ? <SettlementSummary items={visibleItems} total={state.total} /> : null}
            </div>
            <Pagination
              page={page}
              pageCount={pageCount}
              loading={state.loading}
              onPrev={() => setPage((current) => Math.max(0, current - 1))}
              onNext={() => setPage((current) => Math.min(pageCount - 1, current + 1))}
            />
            {isSettlementDetails && expandedId != null ? (
              <SettlementDetailModal
                item={visibleItems.find((item) => item.settlements_id === expandedId)}
                onClose={() => setExpandedId(null)}
              />
            ) : null}
            {state.loading || state.error ? <p className={state.error ? 'api-note error' : 'hidden'} role="status">{state.loading ? 'DB API 조회 중' : state.error}</p> : null}
          </div>
        )}
          </div>
        </section>
      </main>
    </Layout>
  );
}

function CommerceMobileServiceNav() {
  const items = [
    ['통합정보', '/cubici/integratedInfo/tab1'],
    ['매출정보', '/cubici/salesInfo/sales'],
    ['정산정보', '/cubici/calculateInfo/calendar'],
    ['머니뱅크', '/moneybank/current'],
  ];
  const currentPath = window.location.pathname;
  const activeIndex = currentPath.includes('/integratedInfo') || currentPath.includes('/infoIntegrated')
    ? 0
    : currentPath.includes('/salesInfo')
      ? 1
      : currentPath.includes('/calculateInfo')
        ? 2
        : 3;
  return (
    <div className="commerce-mobile-service-nav">
      <h2>{items[activeIndex][0]}</h2>
      <nav aria-label="모바일 서비스 메뉴">
        {items.map(([label, href], index) => <a className={index === activeIndex ? 'active' : ''} href={href} key={href}>{label}</a>)}
      </nav>
    </div>
  );
}

function FinalCommerceLvSearch({ type, filters, connectedShopTypes, loading, onUpdate, onSearch, onExport, canExport }) {
  const isReturns = type === 'returns';
  function submit(event) {
    event.preventDefault();
    onSearch();
  }
  return (
    <form className={`u10-sales-search ${isReturns ? 'u11-return-search' : ''}`} onSubmit={submit}>
      <label>
        <span>진행상태</span>
        <select aria-label="진행상태" value={filters.status} onChange={(event) => onUpdate('status', event.target.value)}>
          <option value="">전체</option>
          {isReturns ? (
            <>
              <option value="EXCHANGE">교환</option>
              <option value="RETURN">반품</option>
            </>
          ) : (
            <>
              <option value="ORDER_COMPLETE">주문완료</option>
              <option value="DELIVERY_COMPLETE">배송완료</option>
              <option value="PURCHASE_CONFIRMED">구매확정</option>
            </>
          )}
        </select>
      </label>
      <label>
        <span>쇼핑몰</span>
        <select aria-label="쇼핑몰" value={filters.shopType} onChange={(event) => onUpdate('shopType', event.target.value)}>
          <option value="">선택</option>
          {shopOptions
            .filter(([code]) => !connectedShopTypes.size || connectedShopTypes.has(code))
            .map(([code, name]) => <option key={code} value={code}>{name}</option>)}
        </select>
      </label>
      <label>
        <span>제품명</span>
        <input aria-label="제품명" value={filters.keyword} onChange={(event) => onUpdate('keyword', event.target.value)} placeholder="제품명" />
      </label>
      <button className="export-button" type="button" onClick={onExport} disabled={!canExport}>엑셀 다운로드 <i className="fi excel" aria-hidden="true" /></button>
      <label>
        <span>시작</span>
        <input aria-label="시작일" type="date" value={filters.fromDate} onChange={(event) => onUpdate('fromDate', event.target.value)} />
      </label>
      <label>
        <span>종료</span>
        <input aria-label="종료일" type="date" value={filters.toDate} onChange={(event) => onUpdate('toDate', event.target.value)} />
      </label>
      <label>
        <span>보기설정</span>
        <select aria-label="보기설정" value={filters.sortBy} onChange={(event) => onUpdate('sortBy', event.target.value)}>
          <option value={isReturns ? 'request_date' : 'paid_date'}>{isReturns ? '신청일자' : '주문일자'}</option>
          {isReturns ? <option value="reg_date">주문일자</option> : null}
          <option value="shop_type">쇼핑몰</option>
          {!isReturns ? <option value="payment_amount">주문금액</option> : null}
          {!isReturns ? <option value="quantity">주문수량</option> : null}
        </select>
      </label>
      <button className="search-button" type="submit" disabled={loading}>검색 <i className="fi icon-search-1" aria-hidden="true" /></button>
    </form>
  );
}

function FinalSettlementSearch({ filters, connectedShopTypes, loading, onUpdate, onSearch, onExport, canExport }) {
  function submit(event) {
    event.preventDefault();
    onSearch();
  }
  return (
    <form className="u10-sales-search u13-settlement-search" onSubmit={submit}>
      <label>
        <span>진행상태</span>
        <select aria-label="진행상태" value={filters.status} onChange={(event) => onUpdate('status', event.target.value)}>
          <option value="">정산예정</option>
          <option value="PENDING">정산예정</option>
          <option value="COMPLETE">정산완료</option>
        </select>
      </label>
      <label>
        <span>쇼핑몰</span>
        <select aria-label="쇼핑몰" value={filters.shopType} onChange={(event) => onUpdate('shopType', event.target.value)}>
          <option value="">선택</option>
          {shopOptions
            .filter(([code]) => !connectedShopTypes.size || connectedShopTypes.has(code))
            .map(([code, name]) => <option key={code} value={code}>{name}</option>)}
        </select>
      </label>
      <label>
        <span>제품명</span>
        <input aria-label="제품명" value={filters.keyword} onChange={(event) => onUpdate('keyword', event.target.value)} placeholder="제품명" />
      </label>
      <button className="export-button" type="button" onClick={onExport} disabled={!canExport}>엑셀 다운로드 <i className="fi excel" aria-hidden="true" /></button>
      <label>
        <span>시작</span>
        <input aria-label="시작일" type="date" value={filters.fromDate} onChange={(event) => onUpdate('fromDate', event.target.value)} />
      </label>
      <label>
        <span>종료</span>
        <input aria-label="종료일" type="date" value={filters.toDate} onChange={(event) => onUpdate('toDate', event.target.value)} />
      </label>
      <label>
        <span>보기설정</span>
        <select aria-label="보기설정" value={filters.sortBy} onChange={(event) => onUpdate('sortBy', event.target.value)}>
          <option value="settlement_date">주문일자</option>
          <option value="shop_type">쇼핑몰</option>
          <option value="settlement_amount">정산입금액</option>
        </select>
      </label>
      <button className="search-button" type="submit" disabled={loading}>검색 <i className="fi icon-search-1" aria-hidden="true" /></button>
    </form>
  );
}

function SalesTableControls() {
  return (
    <div className="table-top flex-end u10-table-controls">
      <label>보기설정 <select aria-label="페이지 표시 수" defaultValue="10"><option value="10">10개</option></select></label>
      <label><select aria-label="표시 옵션" defaultValue="selected"><option value="selected">선택옵션</option></select></label>
    </div>
  );
}

function SalesSummary({ items, total }) {
  const quantity = items.reduce((sum, item) => sum + Number(item.quantity ?? 0), 0);
  const amount = items.reduce((sum, item) => sum + Number(item.payment_amount ?? 0), 0);
  return (
    <div className="u10-sales-summary">
      <span>총 주문건수 합계 <strong>{total.toLocaleString('ko-KR')}</strong></span>
      <span>판매수량 합계 <strong>{quantity.toLocaleString('ko-KR')}</strong></span>
      <span>주문금액 합계 <strong>{amount.toLocaleString('ko-KR')}</strong></span>
    </div>
  );
}

function ReturnSummary({ items, total }) {
  const totals = items.reduce((current, item) => {
    const kind = claimKind(item);
    const count = Number(item.cancel_count ?? item.total_cancel_count ?? 1) || 1;
    const amount = Number(item.payment_amount ?? 0);
    if (kind === 'exchange') {
      current.exchangeCount += count;
      current.exchangeAmount += amount;
    } else {
      current.returnCount += count;
      current.returnAmount += amount;
    }
    return current;
  }, { returnCount: 0, returnAmount: 0, exchangeCount: 0, exchangeAmount: 0 });
  return (
    <div className="u10-sales-summary u11-return-summary">
      <span>총 주문건수 합계 <strong>{total.toLocaleString('ko-KR')}</strong></span>
      <span>반품금액 합계 <strong>{totals.returnCount.toLocaleString('ko-KR')}건 / {formatAmount(totals.returnAmount)}</strong></span>
      <span>교환금액 합계 <strong>{totals.exchangeCount.toLocaleString('ko-KR')}건 / {formatAmount(totals.exchangeAmount)}</strong></span>
    </div>
  );
}

function SettlementSummary({ items, total }) {
  const amount = items.reduce((sum, item) => sum + Number(item.settlement_amount ?? 0), 0);
  return (
    <div className="u13-settlement-summary">
      <span>총 주문건수 합계 <strong>{total.toLocaleString('ko-KR')}건</strong></span>
      <span>누적 정산 입금액 <strong>{formatAmount(amount)}</strong></span>
    </div>
  );
}

function FinalCommerceSearch({
  filters,
  connectedShopTypes,
  shopFilter,
  total,
  onUpdate,
  onReset,
  onExport,
  canExport,
}) {
  return (
    <div className="form-wrap select-z-index final-commerce-search">
      <form onSubmit={(event) => event.preventDefault()}>
        <div className="top-form-wrap color-r-box">
          <div className="input-group select-z-index">
            <div className="select-wrap col-3">
              <label className="select-box input-item">
                <h4 className="tit">진행상태</h4>
                <input
                  aria-label="상태"
                  className="input-style-4"
                  value={filters.status}
                  onChange={(event) => onUpdate('status', event.target.value)}
                  placeholder="전체"
                />
              </label>
            </div>
            <div className="select-wrap col-3">
              <label className="select-box input-item">
                <h4 className="tit">쇼핑몰</h4>
                <select
                  aria-label="쇼핑몰"
                  className="select"
                  value={filters.shopType}
                  onChange={(event) => onUpdate('shopType', event.target.value)}
                >
                  <option value="">전체</option>
                  {shopOptions
                    .filter(([code]) => !connectedShopTypes.size || connectedShopTypes.has(code))
                    .map(([code, name]) => (
                      <option key={code} value={code}>{name}</option>
                    ))}
                </select>
              </label>
            </div>
            <div className="input-box col-3">
              <label className="input-item">
                <h4 className="tit">검색어</h4>
                <input
                  aria-label="검색어"
                  className="flex-1 ml-10"
                  value={filters.keyword}
                  onChange={(event) => onUpdate('keyword', event.target.value)}
                  placeholder="주문번호, 상품명 등"
                />
              </label>
            </div>
            <button className="btn btn-color1 r-btn" type="button" onClick={onExport} disabled={!canExport}>엑셀다운</button>
          </div>
          <div className="input-group">
            <div className="input-box col-3">
              <label className="docs-datepicker input-item">
                <h4 className="tit">시작</h4>
                <input
                  aria-label="시작일"
                  className="calendar"
                  type="date"
                  value={filters.fromDate}
                  onChange={(event) => onUpdate('fromDate', event.target.value)}
                />
                <i className="fi icon-calendar-check-o"></i>
              </label>
            </div>
            <div className="input-box col-3">
              <label className="docs-datepicker input-item">
                <h4 className="tit">종료</h4>
                <input
                  aria-label="종료일"
                  className="calendar"
                  type="date"
                  value={filters.toDate}
                  onChange={(event) => onUpdate('toDate', event.target.value)}
                />
                <i className="fi icon-calendar-check-o"></i>
              </label>
            </div>
            <button className="btn btn-color1 r-btn" type="button" onClick={onReset}>초기화</button>
            <p className="api-note final-search-note">
              조회 쇼핑몰: {shopFilter.loading ? '확인 중' : shopFilter.shops.length ? `${shopFilter.shops.length}개` : '-'}
              {' / '}
              조회 결과: {total.toLocaleString('ko-KR')}건
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}

function CommerceTable({ items, type, expandedId, onToggle }) {
  const isSales = type === 'sales';
  const isReturns = type === 'returns';
  return (
    <table>
      <thead>
        {isSales && (
          <tr><th>결제일자</th><th>쇼핑몰</th><th>주문번호</th><th>진행상태</th><th>상품명</th><th>쇼핑몰상품번호</th><th>판매수량</th><th>주문금액</th><th>구매자명</th><th>구매자ID</th></tr>
        )}
        {isReturns && (
          <tr><th>결제일자</th><th>쇼핑몰</th><th>주문번호</th><th>진행상태</th><th>상품명</th><th>쇼핑몰상품번호</th><th>송장번호</th><th>배송완료일자</th><th>구매자명</th><th>구매자ID</th><th>수령자</th><th>주문금액</th><th>판매수량</th><th>(반품/교환)신청일</th><th>수거송장번호</th><th>재배송송장번호</th></tr>
        )}
        {!isSales && !isReturns && (
          <tr><th>결제일자</th><th>쇼핑몰</th><th>주문번호</th><th>진행상태</th><th>상품명</th><th>상품번호</th><th>구매자명</th><th>구매자ID</th><th>판매수량</th><th>주문금액</th><th>정산예정일</th><th>정산예정액</th><th>정산입금일</th><th>정산입금액</th></tr>
        )}
      </thead>
      <tbody>
        {items.map((item) => {
          const id = isSales ? item.sales_id : isReturns ? item.returns_id : item.settlements_id;
          const isExpanded = expandedId === id;
          return (
            <RowWithDetail
              key={id}
              item={item}
              type={type}
              id={id}
              isExpanded={isExpanded}
              onToggle={() => onToggle(id)}
            />
          );
        })}
        {!items.length ? (
          <tr><td colSpan={isSales ? 10 : isReturns ? 16 : 14}>조회 결과가 없습니다.</td></tr>
        ) : null}
      </tbody>
    </table>
  );
}

function RowWithDetail({ item, type, id, isExpanded, onToggle }) {
  const isSales = type === 'sales';
  const isReturns = type === 'returns';
  return (
    <>
      <tr>
        {isSales && (
          <>
            <td>{formatDate(item.paid_date)}</td>
            <td>{formatShopName(item.shop_type)}</td>
            <td><button className="u10-order-link" type="button" onClick={onToggle} aria-label={`${item.order_no ?? id} 상세 보기`}>{item.order_no ?? id}</button></td>
            <td><span className="u10-status-pill">{formatSalesStatus(item.status)}</span></td>
            <td className="u10-product-name" title={item.product_name ?? ''}>{item.product_name ?? '-'}</td>
            <td>{item.product_no ?? '-'}</td>
            <td>{Number(item.quantity ?? 0).toLocaleString('ko-KR')}</td>
            <td>{formatAmount(item.payment_amount)}</td>
            <td>{item.orderer_name ?? '-'}</td>
            <td>{maskBuyerId(item.orderer_id)}</td>
          </>
        )}
        {isReturns && (
          <>
            <td>{formatDate(item.reg_date ?? item.request_date)}</td>
            <td>{formatShopName(item.shop_type)}</td>
            <td><button className="u10-order-link u11-order-link" type="button" onClick={onToggle} aria-label={`${item.order_no ?? id} 상세 보기`}>{item.order_no ?? id}</button></td>
            <td><span className={`u11-status-pill claim-${claimKind(item)}`}>{formatReturnStatus(item)}</span></td>
            <td className="u10-product-name">{item.product_name ?? '-'}</td>
            <td>{item.product_no ?? '-'}</td>
            <td>{item.delivery_no ?? item.payment_no ?? '-'}</td>
            <td>{formatDate(item.delivery_complete_date ?? item.claim_complete_date)}</td>
            <td>{item.orderer_name ?? '-'}</td>
            <td>{maskBuyerId(item.orderer_id)}</td>
            <td>{item.recipient_name ?? '-'}</td>
            <td>{formatAmount(item.payment_amount)}</td>
            <td>{Number(item.order_count ?? item.cancel_count ?? 0).toLocaleString('ko-KR')}</td>
            <td>{formatDate(item.request_date)}</td>
            <td>{item.return_delivery_no ?? '-'}</td>
            <td>{item.redelivery_no ?? '-'}</td>
          </>
        )}
        {!isSales && !isReturns && (
          <>
            <td>{formatDate(item.paid_date ?? item.reg_date ?? item.settlement_date)}</td>
            <td>{formatShopName(item.shop_type)}</td>
            <td><button className="u10-order-link u13-order-link" type="button" onClick={onToggle} aria-label={`${item.order_no ?? id} 상세 보기`}>{item.order_no ?? id}</button></td>
            <td><span className="u10-status-pill u13-status-pill">{formatSettlementStatus(item)}</span></td>
            <td className="u10-product-name">{item.product_name ?? '-'}</td>
            <td>{item.product_no ?? '-'}</td>
            <td>{item.orderer_name ?? '-'}</td>
            <td>{maskBuyerId(item.orderer_id)}</td>
            <td>{item.quantity == null ? '-' : Number(item.quantity).toLocaleString('ko-KR')}</td>
            <td>{formatAmount(item.payment_amount ?? item.total_sale)}</td>
            <td>{formatDate(item.settlement_date)}</td>
            <td>{formatAmount(item.settlement_target_amount)}</td>
            <td>{formatDate(item.deposit_date ?? item.settlement_date)}</td>
            <td>{formatAmount(item.settlement_amount)}</td>
          </>
        )}
      </tr>
      {isExpanded && (isSales || isReturns) ? (
        <tr>
          <td colSpan={isSales ? 10 : 16}>
            <DetailPanel item={item} type={type} />
          </td>
        </tr>
      ) : null}
    </>
  );
}

function DetailPanel({ item, type }) {
  if (type === 'sales') {
    return (
      <dl className="detail-list">
        <dt>상품명</dt><dd>{item.product_name ?? '-'}</dd>
        <dt>옵션명</dt><dd>{item.option_name ?? '-'}</dd>
        <dt>수량</dt><dd>{item.quantity ?? '-'}</dd>
        <dt>주문일</dt><dd>{formatDate(item.ordered_date)}</dd>
        <dt>구매확정일</dt><dd>{formatDate(item.confirm_date)}</dd>
        <dt>정산완료일</dt><dd>{formatDate(item.settle_complete_date)}</dd>
        <dt>주문자</dt><dd>{item.orderer_name ?? item.orderer_id ?? '-'}</dd>
      </dl>
    );
  }
  if (type === 'returns') {
    return (
      <dl className="detail-list">
        <dt>접수번호</dt><dd>{item.receipt_no ?? '-'}</dd>
        <dt>결제번호</dt><dd>{item.payment_no ?? '-'}</dd>
        <dt>접수유형</dt><dd>{item.receipt_type ?? '-'}</dd>
        <dt>사유코드</dt><dd>{item.reason_code ?? '-'}</dd>
        <dt>반송장번호</dt><dd>{item.return_delivery_no ?? '-'}</dd>
        <dt>클레임완료일</dt><dd>{formatDate(item.claim_complete_date)}</dd>
      </dl>
    );
  }
  return (
    <dl className="detail-list">
      <dt>총판매액</dt><dd>{formatAmount(item.total_sale)}</dd>
      <dt>서비스 수수료</dt><dd>{formatAmount(item.service_fee)}</dd>
      <dt>정산대상액</dt><dd>{formatAmount(item.settlement_target_amount)}</dd>
      <dt>정산예정 보류액</dt><dd>{formatAmount(item.pending_released_amount)}</dd>
      <dt>쿠폰/할인</dt><dd>{formatAmount(Number(item.seller_discount_coupon ?? 0) + Number(item.downloadable_coupon ?? 0))}</dd>
      <dt>은행</dt><dd>{item.bank_name ?? '-'}</dd>
    </dl>
  );
}

function CalendarSummary({
  rows,
  items,
  month,
  shopType,
  connectedShopTypes,
  loading,
  error,
  onMonthChange,
  onShopChange,
  onExport,
}) {
  const [activeDate, setActiveDate] = useState('');
  const [showInfo, setShowInfo] = useState(false);
  const calendarDays = useMemo(() => buildCalendarDays(rows, month), [month, rows]);
  const totalAmount = rows.reduce((sum, row) => sum + row.amount, 0);
  const activeItems = items.filter((item) => formatDate(item.settlement_date) === activeDate);

  function moveMonth(offset) {
    const [year, monthNumber] = month.split('-').map(Number);
    onMonthChange(monthKey(new Date(year, monthNumber - 1 + offset, 1)));
    setActiveDate('');
  }

  return (
    <div className="final-calendar-section u12-calendar-section">
      <div className="calendar-top u12-calendar-heading">
        <button className="u12-month-button" type="button" aria-label="이전 달" onClick={() => moveMonth(-1)}>‹</button>
        <div className="top-wrap">
          <h3 className="year-wrap"><strong>{calendarDays.year}</strong>년 <strong>{calendarDays.month}</strong>월</h3>
          <p className="total-data">TOTAL <strong className="data-in">{formatAmount(totalAmount)}</strong></p>
        </div>
        <button className="u12-month-button" type="button" aria-label="다음 달" onClick={() => moveMonth(1)}>›</button>
      </div>
      <div className="table-top u12-calendar-tools">
        <button className="today-btn" type="button" onClick={() => onMonthChange(monthKey(new Date()))}>오늘</button>
        <label className="u12-shop-select">
          <span>쇼핑몰</span>
          <select aria-label="달력 쇼핑몰" value={shopType} onChange={(event) => onShopChange(event.target.value)}>
            <option value="">전체</option>
            {shopOptions
              .filter(([code]) => !connectedShopTypes.size || connectedShopTypes.has(code))
              .map(([code, name]) => <option key={code} value={code}>{name}</option>)}
          </select>
        </label>
        <div className="u12-info-wrap">
          <button className="u12-info-button" type="button" aria-label="정산 캘린더 안내" aria-expanded={showInfo} onClick={() => setShowInfo((current) => !current)}>i</button>
          {showInfo ? <p role="tooltip">정산일별 건수와 정산금액을 표시합니다.</p> : null}
        </div>
        <button className="u12-export-button" type="button" onClick={onExport} disabled={!items.length}>엑셀 다운로드 <i className="fi excel" aria-hidden="true" /></button>
      </div>
      <div className="calendar-wrap table-r-border u12-calendar">
        <ul className="calendar-header th-bg-1">
          {['일', '월', '화', '수', '목', '금', '토'].map((day) => <li key={day}>{day}</li>)}
        </ul>
        <ul className="calendar-body">
          {calendarDays.days.map((day, index) => (
            <li
              className={[
                day.inMonth ? '' : 'dis-txt',
                index % 7 === 0 ? 'holiday' : '',
                index % 7 === 6 ? 'saturday' : '',
                day.isToday ? 'today' : '',
              ].filter(Boolean).join(' ')}
              key={`${day.date}-${index}`}
            >
              <div className="day-header"><span className="date">{day.day}</span></div>
              <div className={day.row ? 'day-body block' : 'day-body'}>
                {day.row ? (
                  <>
                    <button type="button" className="item1" aria-label={`${day.date} 정산 상세`} onClick={() => setActiveDate(day.date)}>{day.row.count.toLocaleString('ko-KR')}건</button>
                    <button type="button" className="item2" aria-label={`${day.date} 정산금액 상세`} onClick={() => setActiveDate(day.date)}>{formatAmount(day.row.amount)}</button>
                  </>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
      {loading || error ? <p className={error ? 'api-note error' : 'api-note'} role="status">{loading ? 'DB API 조회 중' : error}</p> : null}
      {activeDate ? (
        <div
          className="u12-day-modal"
          role="dialog"
          aria-modal="true"
          aria-label="일일 정산 상세내역"
          onKeyDown={(event) => { if (event.key === 'Escape') setActiveDate(''); }}
          onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveDate(''); }}
        >
          <div className="u12-day-modal-panel">
            <header>
              <div className="final-modal-title"><img src="/final-ui/static/img/sub/c6/icon.png" alt="" /><h3>일일 정산 상세내역</h3></div>
              <button type="button" aria-label="닫기" autoFocus onClick={() => setActiveDate('')}><img src="/final-ui/static/img/icon/close-w.svg" alt="" /></button>
            </header>
            <p className="u12-modal-date"><strong>기준</strong> {activeDate}</p>
            <div className="u12-modal-table">
              <table>
                <thead><tr><th>쇼핑몰</th><th>정산구분</th><th>총판매액</th><th>수수료</th><th>정산액</th></tr></thead>
                <tbody>
                  {activeItems.map((item) => (
                    <tr key={item.settlements_id}>
                      <td>{formatShopName(item.shop_type)}</td>
                      <td>{item.settlement_type ?? '-'}</td>
                      <td>{formatAmount(item.total_sale)}</td>
                      <td>{formatAmount(item.service_fee)}</td>
                      <td>{formatAmount(item.settlement_amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SettlementDetailModal({ item, onClose }) {
  if (!item) return null;
  return (
    <div
      className="u13-settlement-modal"
      role="dialog"
      aria-modal="true"
      aria-label="정산 상세정보"
      onKeyDown={(event) => { if (event.key === 'Escape') onClose(); }}
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className="u13-settlement-modal-panel">
        <header>
          <div className="final-modal-title"><img src="/final-ui/static/img/sub/c6/icon.png" alt="" /><h3>정산 상세정보</h3></div>
          <button type="button" aria-label="닫기" autoFocus onClick={onClose}><img src="/final-ui/static/img/icon/close-w.svg" alt="" /></button>
        </header>
        <dl className="detail-list">
          <dt>정산번호</dt><dd>{item.settlements_id}</dd>
          <dt>쇼핑몰</dt><dd>{formatShopName(item.shop_type)}</dd>
          <dt>진행상태</dt><dd>{formatSettlementStatus(item)}</dd>
          <dt>정산구분</dt><dd>{item.settlement_type ?? '-'}</dd>
          <dt>총판매액</dt><dd>{formatAmount(item.total_sale)}</dd>
          <dt>서비스 수수료</dt><dd>{formatAmount(item.service_fee)}</dd>
          <dt>정산예정액</dt><dd>{formatAmount(item.settlement_target_amount)}</dd>
          <dt>정산입금액</dt><dd>{formatAmount(item.settlement_amount)}</dd>
          <dt>정산일</dt><dd>{formatDate(item.settlement_date)}</dd>
          <dt>은행</dt><dd>{item.bank_name ?? '-'}</dd>
        </dl>
      </div>
    </div>
  );
}

function formatShopName(code) {
  return shopOptions.find(([value]) => value === code)?.[1] ?? code ?? '-';
}

function formatSalesStatus(status) {
  return {
    ORDER_COMPLETE: '주문완료',
    DELIVERY_COMPLETE: '배송완료',
    PURCHASE_CONFIRMED: '구매확정',
  }[status] ?? status ?? '-';
}

function maskBuyerId(value) {
  const text = String(value ?? '');
  if (!text) return '-';
  return `${text.slice(0, 4)}****`;
}

function sortSalesItems(items, sortBy) {
  const sorted = [...items];
  if (sortBy === 'shop_type') return sorted.sort((a, b) => String(a.shop_type ?? '').localeCompare(String(b.shop_type ?? ''), 'ko'));
  if (sortBy === 'payment_amount') return sorted.sort((a, b) => Number(b.payment_amount ?? 0) - Number(a.payment_amount ?? 0));
  if (sortBy === 'quantity') return sorted.sort((a, b) => Number(b.quantity ?? 0) - Number(a.quantity ?? 0));
  return sorted.sort((a, b) => String(b.paid_date ?? '').localeCompare(String(a.paid_date ?? '')));
}

function sortReturnItems(items, sortBy) {
  const sorted = [...items];
  if (sortBy === 'shop_type') return sorted.sort((a, b) => String(a.shop_type ?? '').localeCompare(String(b.shop_type ?? ''), 'ko'));
  if (sortBy === 'reg_date') return sorted.sort((a, b) => String(b.reg_date ?? '').localeCompare(String(a.reg_date ?? '')));
  return sorted.sort((a, b) => String(b.request_date ?? '').localeCompare(String(a.request_date ?? '')));
}

function claimKind(item) {
  const value = String(item.receipt_type ?? item.claim_status ?? item.status ?? '').toUpperCase();
  return /EXCHANGE|SWAP|교환/.test(value) ? 'exchange' : 'return';
}

function formatReturnStatus(item) {
  return claimKind(item) === 'exchange' ? '교환' : '반품';
}

function formatSettlementStatus(item) {
  const label = {
    PENDING: '정산예정',
    EXPECTED: '정산예정',
    COMPLETE: '정산완료',
    COMPLETED: '정산완료',
    PAID: '정산완료',
  }[String(item.status ?? '').toUpperCase()] ?? item.status ?? '정산예정';
  return item.settlement_type ? `${label}(${item.settlement_type})` : label;
}

function sortSettlementItems(items, sortBy) {
  const sorted = [...items];
  if (sortBy === 'shop_type') return sorted.sort((a, b) => String(a.shop_type ?? '').localeCompare(String(b.shop_type ?? ''), 'ko'));
  if (sortBy === 'settlement_amount') return sorted.sort((a, b) => Number(b.settlement_amount ?? 0) - Number(a.settlement_amount ?? 0));
  return sorted.sort((a, b) => String(b.settlement_date ?? '').localeCompare(String(a.settlement_date ?? '')));
}

function Pagination({ page, pageCount, loading, onPrev, onNext }) {
  return (
    <p className="api-note final-pagination">
      <button className="pagination-btn" type="button" onClick={onPrev} disabled={loading || page <= 0}>이전</button>
      {' '}
      {page + 1} / {pageCount}
      {' '}
      <button className="pagination-btn" type="button" onClick={onNext} disabled={loading || page + 1 >= pageCount}>다음</button>
    </p>
  );
}

function appendParam(params, name, value) {
  const normalized = String(value ?? '').trim();
  if (normalized) {
    params.set(name, normalized);
  }
}

function buildCalendarRows(items) {
  const grouped = new Map();
  for (const item of items) {
    const date = formatDate(item.settlement_date);
    const current = grouped.get(date) ?? { date, count: 0, amount: 0, shops: new Set() };
    current.count += 1;
    current.amount += Number(item.settlement_amount ?? 0);
    if (item.shop_type) current.shops.add(item.shop_type);
    grouped.set(date, current);
  }
  return Array.from(grouped.values()).map((row) => ({
    ...row,
    shops: Array.from(row.shops),
  }));
}

function buildCalendarDays(rows, monthKeyValue) {
  const today = new Date();
  const base = new Date(`${monthKeyValue}-01T00:00:00`);
  const year = base.getFullYear();
  const month = base.getMonth() + 1;
  const first = new Date(year, month - 1, 1);
  const start = new Date(year, month - 1, 1 - first.getDay());
  const rowsByDate = new Map(rows.map((row) => [row.date, row]));
  const days = Array.from({ length: 42 }, (_, index) => {
    const current = new Date(start);
    current.setDate(start.getDate() + index);
    const date = [
      current.getFullYear(),
      String(current.getMonth() + 1).padStart(2, '0'),
      String(current.getDate()).padStart(2, '0'),
    ].join('-');
    return {
      date,
      day: current.getDate(),
      inMonth: current.getMonth() === month - 1,
      isToday: date === [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, '0'),
        String(today.getDate()).padStart(2, '0'),
      ].join('-'),
      row: rowsByDate.get(date),
    };
  });
  return { year, month, days };
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function monthDateRange(value) {
  const [year, month] = value.split('-').map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  return {
    from: `${value}-01`,
    to: `${value}-${String(lastDay).padStart(2, '0')}`,
  };
}

function buildExportRow(item, type) {
  if (type === 'sales') {
    return {
      order_no: item.order_no ?? '',
      shop_type: item.shop_type ?? '',
      status: item.status ?? '',
      paid_date: formatDate(item.paid_date),
      product_name: item.product_name ?? '',
      payment_amount: item.payment_amount ?? 0,
      settle_estimate_amount: item.settle_estimate_amount ?? 0,
    };
  }
  if (type === 'returns') {
    return {
      returns_id: item.returns_id ?? '',
      order_no: item.order_no ?? '',
      shop_type: item.shop_type ?? '',
      status: item.claim_status ?? item.status ?? '',
      request_date: formatDate(item.request_date),
      payment_amount: item.payment_amount ?? 0,
    };
  }
  return {
    settlements_id: item.settlements_id ?? '',
    shop_type: item.shop_type ?? '',
    settlement_type: item.settlement_type ?? '',
    status: item.status ?? '',
    settlement_date: formatDate(item.settlement_date),
    settlement_amount: item.settlement_amount ?? 0,
  };
}

function downloadCsv(fileName, rows) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(',')),
  ];
  const blob = new Blob([`\uFEFF${lines.join('\n')}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function csvCell(value) {
  const text = String(value ?? '');
  return `"${text.replaceAll('"', '""')}"`;
}

export { SalesOrSettlementPage };
