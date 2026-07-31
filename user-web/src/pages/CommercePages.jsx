import { useEffect, useMemo, useState } from 'react';
import {
  Layout,
  PageTitle,
  LegacyPanel,
  LegacySearchPanel,
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
};

function SalesOrSettlementPage({ type }) {
  const [auth] = useState(readAuthSession);
  const shopFilter = useAuthenticatedShopPairs(auth);
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(0);
  const [expandedId, setExpandedId] = useState(null);
  const [state, setState] = useState({ loading: false, error: '', total: 0, items: [] });
  const config = pageConfig[type] ?? pageConfig.sales;
  const isSales = type === 'sales';
  const isReturns = type === 'returns';
  const isSettlements = type === 'settlements';
  const isCalendar = isSettlements && window.location.pathname.includes('/calendar');
  const pageCount = Math.max(1, Math.ceil((state.total || 0) / PAGE_SIZE));
  const connectedShopTypes = useMemo(
    () => new Set((shopFilter.shops ?? []).map((item) => item.shop_type).filter(Boolean)),
    [shopFilter.shops],
  );
  const calendarRows = useMemo(() => buildCalendarRows(state.items), [state.items]);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!auth?.access_token || shopFilter.loading || !shopFilter.shopPairs) {
        return;
      }
      setState((current) => ({ ...current, loading: true, error: '' }));
      try {
        const params = new URLSearchParams({
          limit: String(PAGE_SIZE),
          offset: String(page * PAGE_SIZE),
          shop_pairs: shopFilter.shopPairs,
        });
        appendParam(params, 'from_date', filters.fromDate);
        appendParam(params, 'to_date', filters.toDate);
        appendParam(params, 'shop_type', filters.shopType);
        appendParam(params, 'status', filters.status);
        appendParam(params, 'keyword', filters.keyword);
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
  }, [auth?.access_token, config.endpoint, filters, page, shopFilter.loading, shopFilter.shopPairs]);

  function updateFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value }));
    setPage(0);
    setExpandedId(null);
  }

  function resetFilters() {
    setFilters(initialFilters);
    setPage(0);
    setExpandedId(null);
  }

  function exportCsv() {
    const rows = state.items.map((item) => buildExportRow(item, type));
    downloadCsv(config.exportName, rows);
  }

  return (
    <Layout>
      <main className="sub-page">
        <PageTitle
          title={isCalendar ? '정산 캘린더' : config.title}
          text={isCalendar ? '정산일 기준으로 일자별 정산액을 요약합니다.' : config.text}
        />
        {!auth?.access_token ? <p className="auth-message error">로그인 후 연결 쇼핑몰 기준 데이터를 조회할 수 있습니다.</p> : null}
        {shopFilter.message ? <p className="auth-message error">{shopFilter.message}</p> : null}
        {auth?.access_token && !shopFilter.loading && !shopFilter.shops.length ? (
          <p className="auth-message error">연결된 쇼핑몰 계정이 없습니다. 마이페이지에서 쇼핑몰 계정을 먼저 연결해주세요.</p>
        ) : null}

        <LegacySearchPanel
          title="검색조건"
          actions={(
            <>
              <button type="button" onClick={resetFilters}>초기화</button>
              <button type="button" onClick={exportCsv} disabled={!state.items.length}>CSV 다운로드</button>
            </>
          )}
        >
          <label>
            시작일
            <input
              aria-label="시작일"
              type="date"
              value={filters.fromDate}
              onChange={(event) => updateFilter('fromDate', event.target.value)}
            />
          </label>
          <label>
            종료일
            <input
              aria-label="종료일"
              type="date"
              value={filters.toDate}
              onChange={(event) => updateFilter('toDate', event.target.value)}
            />
          </label>
          <label>
            쇼핑몰
            <select
              aria-label="쇼핑몰"
              value={filters.shopType}
              onChange={(event) => updateFilter('shopType', event.target.value)}
            >
              <option value="">전체</option>
              {shopOptions
                .filter(([code]) => !connectedShopTypes.size || connectedShopTypes.has(code))
                .map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
            </select>
          </label>
          <label>
            상태
            <input
              aria-label="상태"
              value={filters.status}
              onChange={(event) => updateFilter('status', event.target.value)}
              placeholder="상태 코드"
            />
          </label>
          <label>
            검색어
            <input
              aria-label="검색어"
              value={filters.keyword}
              onChange={(event) => updateFilter('keyword', event.target.value)}
              placeholder="주문번호, 상품명 등"
            />
          </label>
          <p className="api-note">
            조회 쇼핑몰: {shopFilter.loading ? '확인 중' : shopFilter.shops.length ? `${shopFilter.shops.length}개` : '-'}
            {' / '}
            조회 결과: {state.total.toLocaleString('ko-KR')}건
          </p>
        </LegacySearchPanel>

        {isCalendar ? (
          <CalendarSummary rows={calendarRows} loading={state.loading} error={state.error} />
        ) : (
          <LegacyPanel title={`${isCalendar ? '정산 캘린더' : config.title} 목록`} className="react-legacy-commerce-panel">
            <div className="tableSet">
              <div className="fixTable">
                <CommerceTable
                  items={state.items}
                  type={type}
                  expandedId={expandedId}
                  onToggle={(id) => setExpandedId((current) => (current === id ? null : id))}
                />
              </div>
            </div>
            <Pagination
              page={page}
              pageCount={pageCount}
              loading={state.loading}
              onPrev={() => setPage((current) => Math.max(0, current - 1))}
              onNext={() => setPage((current) => Math.min(pageCount - 1, current + 1))}
            />
            <p className="api-note">{state.loading ? 'DB API 조회 중' : state.error || '조회 완료'}</p>
          </LegacyPanel>
        )}
      </main>
    </Layout>
  );
}

function CommerceTable({ items, type, expandedId, onToggle }) {
  const isSales = type === 'sales';
  const isReturns = type === 'returns';
  return (
    <table>
      <thead>
        {isSales && (
          <tr><th>주문번호</th><th>쇼핑몰</th><th>상태</th><th>결제일</th><th>결제금액</th><th>정산예정</th><th>상세</th></tr>
        )}
        {isReturns && (
          <tr><th>클레임번호</th><th>주문번호</th><th>쇼핑몰</th><th>상태</th><th>결제금액</th><th>요청일</th><th>상세</th></tr>
        )}
        {!isSales && !isReturns && (
          <tr><th>정산번호</th><th>쇼핑몰</th><th>정산구분</th><th>상태</th><th>정산일</th><th>정산액</th><th>상세</th></tr>
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
          <tr><td colSpan="7">조회 결과가 없습니다.</td></tr>
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
            <td>{item.order_no ?? id}</td>
            <td>{item.shop_type ?? '-'}</td>
            <td>{item.status ?? '-'}</td>
            <td>{formatDate(item.paid_date)}</td>
            <td>{formatAmount(item.payment_amount)}</td>
            <td>{formatAmount(item.settle_estimate_amount)}</td>
          </>
        )}
        {isReturns && (
          <>
            <td>{id}</td>
            <td>{item.order_no ?? '-'}</td>
            <td>{item.shop_type ?? '-'}</td>
            <td>{item.claim_status ?? item.status ?? '-'}</td>
            <td>{formatAmount(item.payment_amount)}</td>
            <td>{formatDate(item.request_date)}</td>
          </>
        )}
        {!isSales && !isReturns && (
          <>
            <td>{id}</td>
            <td>{item.shop_type ?? '-'}</td>
            <td>{item.settlement_type ?? '-'}</td>
            <td>{item.status ?? '-'}</td>
            <td>{formatDate(item.settlement_date)}</td>
            <td>{formatAmount(item.settlement_amount)}</td>
          </>
        )}
        <td><button type="button" onClick={onToggle}>{isExpanded ? '닫기' : '보기'}</button></td>
      </tr>
      {isExpanded ? (
        <tr>
          <td colSpan="7">
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

function CalendarSummary({ rows, loading, error }) {
  return (
    <LegacyPanel title="정산 캘린더 요약" className="react-legacy-commerce-panel">
      <div className="tableSet">
        <div className="fixTable">
          <table>
            <thead>
              <tr><th>정산일</th><th>건수</th><th>정산액 합계</th><th>쇼핑몰</th></tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.date}>
                  <td>{row.date}</td>
                  <td>{row.count.toLocaleString('ko-KR')}건</td>
                  <td>{formatAmount(row.amount)}</td>
                  <td>{row.shops.join(', ')}</td>
                </tr>
              ))}
              {!rows.length ? (
                <tr><td colSpan="4">조회 결과가 없습니다.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
      <p className="api-note">{loading ? 'DB API 조회 중' : error || '조회 완료'}</p>
    </LegacyPanel>
  );
}

function Pagination({ page, pageCount, loading, onPrev, onNext }) {
  return (
    <p className="api-note">
      <button type="button" onClick={onPrev} disabled={loading || page <= 0}>이전</button>
      {' '}
      {page + 1} / {pageCount}
      {' '}
      <button type="button" onClick={onNext} disabled={loading || page + 1 >= pageCount}>다음</button>
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
