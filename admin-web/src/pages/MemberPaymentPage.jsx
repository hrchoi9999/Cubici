import { useEffect, useMemo, useState } from 'react';
import { fetchMemberPayments } from '../api/management.js';

const PAGE_SIZE = 20;

const OPTIONAL_COLUMNS = [
  { key: 'firm_name', label: '회사명' },
  { key: 'user_phone', label: '핸드폰' },
  { key: 'firm_tel', label: '대표전화' },
  { key: 'shop_count', label: '등록 쇼핑몰' },
  { key: 'firm_addr', label: '주소' },
  { key: 'expire_date', label: '서비스 만료' },
  { key: 'payment_date', label: '결제일자' },
  { key: 'payment_status', label: '결제상태' },
  { key: 'amount', label: '결제금액' },
  { key: 'payment_fee', label: '결제수수료' },
  { key: 'vat', label: '부가세' },
  { key: 'profit', label: '순수입' },
];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function beforeIso(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

function formatDateTime(value) {
  return value ? value.replace('T', ' ').slice(0, 19) : '-';
}

function formatNumber(value) {
  return Number(value ?? 0).toLocaleString();
}

function csvCell(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

export function MemberPaymentPage() {
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({ total_count: 0, paid_count: 0 });
  const [sums, setSums] = useState({ amount: 0, payment_fee: 0, vat: 0, profit: 0 });
  const [offset, setOffset] = useState(0);
  const [filters, setFilters] = useState({
    from_date: beforeIso(3650),
    to_date: todayIso(),
    user_type: 'USER',
    order_by: 'payment_date_desc',
  });
  const [formValues, setFormValues] = useState({
    userName: '',
    firmName: '',
    userId: '',
    userType: 'USER',
    fromDate: filters.from_date,
    toDate: filters.to_date,
    orderBy: 'payment_date_desc',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isColumnSelectorOpen, setIsColumnSelectorOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(() => new Set(OPTIONAL_COLUMNS.map((column) => column.key)));

  useEffect(() => {
    let ignore = false;

    async function loadPayments() {
      setIsLoading(true);
      setMessage('');
      try {
        const data = await fetchMemberPayments({ limit: PAGE_SIZE, offset, ...filters });
        if (!ignore) {
          setItems(data.items ?? []);
          setCounts(data.counts ?? { total_count: 0, paid_count: 0 });
          setSums(data.sums ?? { amount: 0, payment_fee: 0, vat: 0, profit: 0 });
        }
      } catch (error) {
        if (!ignore) {
          setItems([]);
          setCounts({ total_count: 0, paid_count: 0 });
          setSums({ amount: 0, payment_fee: 0, vat: 0, profit: 0 });
          setMessage(error.message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadPayments();

    return () => {
      ignore = true;
    };
  }, [offset, filters]);

  const rows = useMemo(() => items, [items]);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
  const pageCount = Math.max(1, Math.ceil((counts.total_count ?? 0) / PAGE_SIZE));

  function updateSearchValue(event) {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  }

  function handleSearch(event) {
    event.preventDefault();
    setOffset(0);
    setFilters({
      user_name: formValues.userName,
      firm_name: formValues.firmName,
      user_id: formValues.userId,
      user_type: formValues.userType,
      from_date: formValues.fromDate,
      to_date: formValues.toDate,
      order_by: formValues.orderBy,
    });
  }

  function goToPreviousPage() {
    setOffset((value) => Math.max(0, value - PAGE_SIZE));
  }

  function goToNextPage() {
    setOffset((value) => {
      const next = value + PAGE_SIZE;
      return next >= counts.total_count ? value : next;
    });
  }

  function toggleColumn(key) {
    setVisibleColumns((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function downloadPayments() {
    if (rows.length === 0) return;
    const headers = ['No', '요금제', '가입일자', '회원ID', '회원명', ...OPTIONAL_COLUMNS.map((column) => column.label)];
    const csvRows = rows.map((row) => [
      row.row_no,
      row.charge_name,
      formatDateTime(row.reg_date),
      row.user_id,
      row.user_name,
      row.firm_name,
      row.user_phone,
      row.firm_tel,
      row.shop_count,
      row.firm_addr,
      formatDateTime(row.expire_date),
      formatDateTime(row.payment_date),
      row.payment_status_label ?? row.payment_status,
      row.amount,
      row.payment_fee,
      row.vat,
      row.profit,
    ]);
    const csv = [headers, ...csvRows].map((row) => row.map(csvCell).join(',')).join('\r\n');
    const href = URL.createObjectURL(new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = href;
    link.download = `cubici-member-payments-${todayIso()}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(href);
  }

  const optionalColumnCount = visibleColumns.size;

  return (
    <section className="paymentLvPage">
      <div className="m-tab paymentLvTabs">
        <ul>
          <li className="active"><a href="/admin/cubici/manageMember/payment_tab1">결제 현황</a></li>
          <li><a href="/admin/cubici/manageMember/payment_tab2">요금변경 관리</a></li>
        </ul>
      </div>

      <div className="m-options paymentLvBaseDate">
        <div className="pRight">
          <span className="baseDate"><b>기준</b>{formValues.toDate.replaceAll('-', '/')}</span>
        </div>
      </div>

      <form className="m-search searchArea paymentLvSearch" onSubmit={handleSearch}>
        <div className="line">
          <div className="inputBox">
            <label htmlFor="paymentUserName">회원명</label>
            <input id="paymentUserName" name="userName" type="text" value={formValues.userName} onChange={updateSearchValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="paymentFirmName">회사명</label>
            <input id="paymentFirmName" name="firmName" type="text" value={formValues.firmName} onChange={updateSearchValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="paymentUserId">회원ID</label>
            <input id="paymentUserId" name="userId" type="text" value={formValues.userId} onChange={updateSearchValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="paymentUserType">회원구분</label>
            <select id="paymentUserType" name="userType" value={formValues.userType} onChange={updateSearchValue}>
              <option value="all">전체</option>
              <option value="USER">사용자</option>
              <option value="ADMIN">관리자</option>
            </select>
          </div>
          <div className="inputBox">
            <label htmlFor="paymentFrom">결제일자 시작</label>
            <input id="paymentFrom" name="fromDate" type="date" value={formValues.fromDate} onChange={updateSearchValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="paymentTo">결제일자 종료</label>
            <input id="paymentTo" name="toDate" type="date" value={formValues.toDate} onChange={updateSearchValue} />
          </div>
          <button className="m-btn m-btnPrimary" type="submit">검색</button>
        </div>
      </form>

      {message ? <div className="m-alert">{message}</div> : null}

      <div className="tableSet paymentLvTableSet">
        <div className="m-options paymentLvTableOptions">
          <div className="pRight">
            <div className="inputBox paymentOrderBox">
              <label htmlFor="paymentOrder">보기기준</label>
              <select id="paymentOrder" name="orderBy" value={formValues.orderBy} onChange={updateSearchValue}>
                <option value="payment_date_desc">최근 순</option>
                <option value="payment_date_asc">과거 순</option>
                <option value="amount_desc">결제금액 높은순</option>
                <option value="amount_asc">결제금액 낮은순</option>
                <option value="name_asc">회원명</option>
                <option value="firm_name_asc">회사명</option>
              </select>
            </div>
            <button className="m-btn paymentDownloadButton" type="button" onClick={downloadPayments} disabled={rows.length === 0}>엑셀 다운로드</button>
            <div className="paymentColumnPicker">
              <button
                className="m-btn paymentColumnButton"
                type="button"
                aria-expanded={isColumnSelectorOpen}
                onClick={() => setIsColumnSelectorOpen((current) => !current)}
              >항목 선택</button>
              {isColumnSelectorOpen ? (
                <div className="paymentColumnMenu">
                  {OPTIONAL_COLUMNS.map((column) => (
                    <label key={column.key}>
                      <input
                        type="checkbox"
                        checked={visibleColumns.has(column.key)}
                        onChange={() => toggleColumn(column.key)}
                      />
                      <span>{column.label}</span>
                    </label>
                  ))}
                  <button className="m-btn m-btnPrimary" type="button" onClick={() => setIsColumnSelectorOpen(false)}>옵션 확인</button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div id="fixTable" className="fixTable legacyListTable paymentLvTableFrame">
          <div className="overflowBox tableScroll">
            <table className="m-shadowTable memberPaymentTable">
          <thead>
            <tr>
              <th>No</th>
              <th>요금제</th>
              <th>가입일자</th>
              <th>회원ID</th>
              <th>회원명</th>
              {visibleColumns.has('firm_name') ? <th>회사명</th> : null}
              {visibleColumns.has('user_phone') ? <th>핸드폰</th> : null}
              {visibleColumns.has('firm_tel') ? <th>대표전화</th> : null}
              {visibleColumns.has('shop_count') ? <th>등록 쇼핑몰</th> : null}
              {visibleColumns.has('firm_addr') ? <th>주소</th> : null}
              {visibleColumns.has('expire_date') ? <th>서비스 만료</th> : null}
              {visibleColumns.has('payment_date') ? <th>결제일자</th> : null}
              {visibleColumns.has('payment_status') ? <th>결제상태</th> : null}
              {visibleColumns.has('amount') ? <th>결제금액</th> : null}
              {visibleColumns.has('payment_fee') ? <th>결제수수료</th> : null}
              {visibleColumns.has('vat') ? <th>부가세</th> : null}
              {visibleColumns.has('profit') ? <th>순수입</th> : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.seq}>
                <td>{row.row_no}</td>
                <td>{row.charge_name ?? '-'}</td>
                <td>{formatDateTime(row.reg_date)}</td>
                <td>{row.user_id ?? '-'}</td>
                <td className="subject">{row.user_name ?? '-'}</td>
                {visibleColumns.has('firm_name') ? <td className="subject">{row.firm_name ?? '-'}</td> : null}
                {visibleColumns.has('user_phone') ? <td>{row.user_phone ?? '-'}</td> : null}
                {visibleColumns.has('firm_tel') ? <td>{row.firm_tel ?? '-'}</td> : null}
                {visibleColumns.has('shop_count') ? <td>{formatNumber(row.shop_count)}</td> : null}
                {visibleColumns.has('firm_addr') ? <td className="subject">{row.firm_addr ?? '-'}</td> : null}
                {visibleColumns.has('expire_date') ? <td>{formatDateTime(row.expire_date)}</td> : null}
                {visibleColumns.has('payment_date') ? <td>{formatDateTime(row.payment_date)}</td> : null}
                {visibleColumns.has('payment_status') ? <td>{row.payment_status_label ?? row.payment_status ?? '-'}</td> : null}
                {visibleColumns.has('amount') ? <td>{formatNumber(row.amount)}원</td> : null}
                {visibleColumns.has('payment_fee') ? <td>{formatNumber(row.payment_fee)}원</td> : null}
                {visibleColumns.has('vat') ? <td>{formatNumber(row.vat)}원</td> : null}
                {visibleColumns.has('profit') ? <td>{formatNumber(row.profit)}원</td> : null}
              </tr>
            ))}
            {!isLoading && rows.length === 0 ? (
              <tr>
                <td colSpan={5 + optionalColumnCount}>조회된 결제 데이터가 없습니다.</td>
              </tr>
            ) : null}
          </tbody>
            </table>
          </div>
          <div className="fixBottom paymentLvTotals">
            <ul className="tableTotal">
              <li><span className="txt">결제건수</span><span className="result">{formatNumber(counts.total_count)} 건</span></li>
              <li><span className="txt">결제금액</span><span className="result">{formatNumber(sums.amount)} 원</span></li>
              <li><span className="txt">결제수수료</span><span className="result">{formatNumber(sums.payment_fee)} 원</span></li>
              <li><span className="txt">부가가치세</span><span className="result">{formatNumber(sums.vat)} 원</span></li>
              <li><span className="txt">순수익</span><span className="result">{formatNumber(sums.profit)} 원</span></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="pagingControls pagination paymentLvPaging">
        <button className="m-btn" type="button" onClick={goToPreviousPage} disabled={offset === 0}>이전</button>
        <span aria-label={`현재 페이지 ${currentPage}`}>{currentPage}</span>
        <button className="m-btn" type="button" onClick={goToNextPage} disabled={offset + PAGE_SIZE >= counts.total_count}>다음</button>
      </div>
    </section>
  );
}
