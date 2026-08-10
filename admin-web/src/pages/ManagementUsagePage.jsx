import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchManagementUsage } from '../api/management.js';

const PAGE_SIZE = 20;
const OPTIONAL_COLUMNS = [
  { key: 'feeRate', label: '수수료' },
  { key: 'paymentRate', label: '지급율' },
  { key: 'provisionAmount', label: '이용금액' },
  { key: 'repaymentAmount', label: '누적상환' },
  { key: 'outstandingBalance', label: '상환잔액' },
  { key: 'prizmGrade', label: 'PCS' },
];

function formatDate(value) {
  if (!value) {
    return '-';
  }

  return value.slice(0, 10);
}

function formatNumber(value) {
  if (value === null || value === undefined) {
    return '-';
  }

  return Number(value).toLocaleString('ko-KR');
}

function formatPercent(value) {
  if (value === null || value === undefined) {
    return '-';
  }

  return `${Number(value).toLocaleString('ko-KR', { maximumFractionDigits: 2 })}%`;
}

function statusClassName(status) {
  if (status === '신청') {
    return 'sColorY';
  }
  if (status === '심사') {
    return 'sColorGN';
  }
  if (status === '상환') {
    return 'sColorLS';
  }
  if (status === '거부') {
    return 'sColorR';
  }
  if (status === '만료') {
    return 'sColorR';
  }
  return 'sColorN';
}

function escapeCsvCell(value) {
  const text = value === null || value === undefined ? '' : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export function ManagementUsagePage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState(null);
  const [sums, setSums] = useState(null);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [message, setMessage] = useState('');
  const [exportMessage, setExportMessage] = useState('');
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(() => OPTIONAL_COLUMNS.map(({ key }) => key));
  const listScrollRef = useRef(null);
  const [listScroll, setListScroll] = useState({ left: 0, max: 0 });
  const [formValues, setFormValues] = useState({
    userName: '',
    firmName: '',
    userEmail: '',
    productCode: '',
    status: '',
    fromDate: '',
    toDate: '',
    orderBy: 'request_date_desc',
  });
  const [filters, setFilters] = useState({ order_by: 'request_date_desc' });

  useEffect(() => {
    let ignore = false;

    async function loadUsage() {
      setIsLoading(true);
      setMessage('');

      try {
        const data = await fetchManagementUsage({ limit: PAGE_SIZE, offset, ...filters });
        if (!ignore) {
          setItems(data.items ?? []);
          setTotal(data.total ?? 0);
          setCounts(data.counts ?? null);
          setSums(data.sums ?? null);
        }
      } catch (error) {
        if (!ignore) {
          setItems([]);
          setTotal(0);
          setCounts(null);
          setSums(null);
          setMessage(error.message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadUsage();

    return () => {
      ignore = true;
    };
  }, [offset, filters]);

  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rows = useMemo(() => items, [items]);
  const visibleColumnCount = 9 + visibleColumns.length;

  useEffect(() => {
    const container = listScrollRef.current;
    if (!container) {
      return undefined;
    }

    function updateScrollState() {
      setListScroll({
        left: Math.round(container.scrollLeft),
        max: Math.max(0, Math.round(container.scrollWidth - container.clientWidth)),
      });
    }

    updateScrollState();
    container.addEventListener('scroll', updateScrollState, { passive: true });
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('scroll', updateScrollState);
      resizeObserver.disconnect();
    };
  }, [rows, visibleColumns]);

  function goToPreviousPage() {
    setOffset((value) => Math.max(0, value - PAGE_SIZE));
  }

  function goToNextPage() {
    setOffset((value) => {
      const next = value + PAGE_SIZE;
      return next >= total ? value : next;
    });
  }

  function updateFormValue(event) {
    const { name, value } = event.target;
    setFormValues((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleSearch(event) {
    event.preventDefault();
    setOffset(0);
    setFilters({
      user_name: formValues.userName,
      firm_name: formValues.firmName,
      user_email: formValues.userEmail,
      product_code: formValues.productCode,
      status: formValues.status,
      from_date: formValues.fromDate,
      to_date: formValues.toDate,
      order_by: formValues.orderBy,
    });
  }

  function toggleColumn(key) {
    setVisibleColumns((current) => (
      current.includes(key)
        ? current.filter((column) => column !== key)
        : [...current, key]
    ));
  }

  function moveListScroll(direction) {
    const container = listScrollRef.current;
    if (!container) return;
    container.scrollTo({ left: container.scrollLeft + direction * Math.max(240, container.clientWidth * 0.65), behavior: 'smooth' });
  }

  function changeListScroll(event) {
    listScrollRef.current?.scrollTo({ left: Number(event.target.value) });
  }

  async function handleExport() {
    setIsExporting(true);
    setExportMessage('');
    try {
      const exportItems = [];
      let exportOffset = 0;
      let exportTotal = 0;
      do {
        const data = await fetchManagementUsage({ limit: 100, offset: exportOffset, ...filters });
        const pageItems = data.items ?? [];
        exportTotal = data.total ?? pageItems.length;
        exportItems.push(...pageItems);
        exportOffset += pageItems.length;
        if (pageItems.length === 0) break;
      } while (exportOffset < exportTotal && exportOffset < 10000);

      const headers = ['이용상태', '신청일자', '회원ID', '회사명', '회원명', '이용서비스', '시작일자', '종료일자', '수수료', '지급율', '이용금액', '누적상환', '상환잔액', 'PCS'];
      const csvRows = exportItems.map((row) => [
        row.usage_status,
        formatDate(row.request_date),
        row.user_email,
        row.firm_name,
        row.user_name,
        row.product_code,
        formatDate(row.contract_date),
        formatDate(row.expire_date),
        formatPercent(row.fee_rate),
        row.payment_rate === null || row.payment_rate === undefined ? '-' : `${row.payment_rate}%`,
        row.provision_amount || row.sales_amount,
        row.repayment_amount,
        row.outstanding_balance,
        row.prizm_grade,
      ]);
      const csv = [headers, ...csvRows].map((row) => row.map(escapeCsvCell).join(',')).join('\n');
      const blobUrl = URL.createObjectURL(new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `cubici-management-usage-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(blobUrl);
      setExportMessage(`${formatNumber(exportItems.length)}건을 내려받았습니다.`);
    } catch (error) {
      setExportMessage(error.message);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <>
      <div className="managementUsageLvPage">
      <div className="m-options managementOptions managementUsageLvOptions">
        <div className="pRight">
          <span className="baseDate pRight">
            <b>기준</b>이관 DB 최신 데이터
          </span>
        </div>
      </div>

      <form className="m-search searchArea managementUsageLvSearch" onSubmit={handleSearch}>
        <div className="line">
          <div className="inputBox">
            <label htmlFor="usageUserName">회원명</label>
            <input id="usageUserName" name="userName" type="text" value={formValues.userName} onChange={updateFormValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="usageFirmName">회사명</label>
            <input id="usageFirmName" name="firmName" type="text" value={formValues.firmName} onChange={updateFormValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="usageUserEmail">회원ID</label>
            <input id="usageUserEmail" name="userEmail" type="text" value={formValues.userEmail} onChange={updateFormValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="usageProductCode">서비스</label>
            <select id="usageProductCode" name="productCode" value={formValues.productCode} onChange={updateFormValue}>
              <option value="">전체</option>
              <option value="MP">머니플러스</option>
            </select>
          </div>
        </div>
        <div className="line">
          <div className="inputBox">
            <label htmlFor="usageStatus">이용상태</label>
            <select id="usageStatus" name="status" value={formValues.status} onChange={updateFormValue}>
              <option value="">전체</option>
              <option value="approval">신청</option>
              <option value="judge">심사</option>
              <option value="repayment">상환</option>
              <option value="refuse">거부</option>
              <option value="expire">만료</option>
            </select>
          </div>
          <div className="inputBox">
            <label htmlFor="usageFromDate">신청시작</label>
            <input id="usageFromDate" name="fromDate" type="date" value={formValues.fromDate} onChange={updateFormValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="usageToDate">신청종료</label>
            <input id="usageToDate" name="toDate" type="date" value={formValues.toDate} onChange={updateFormValue} />
          </div>
          <button className="sBtn sColorLB" type="submit">
            검색
          </button>
        </div>
      </form>

      <div className="tableSet">
        <div className="m-options">
          <div className="pRight">
            <div className="fwBox">
              <span className="ft">보기기준</span>
              <div className="input">
                <select name="orderBy" value={formValues.orderBy} onChange={updateFormValue}>
                  <option value="request_date_desc">최근 순</option>
                  <option value="request_date_asc">과거 순</option>
                </select>
              </div>
            </div>
            <span className="btns">
              <button type="button" className="sBtn sColorLG excel" onClick={handleExport} disabled={isExporting || isLoading}>
                {isExporting ? '다운로드 중' : '엑셀 다운로드'}
              </button>
            </span>
            <div className={`managementUsageColumnFilter${isColumnMenuOpen ? ' open' : ''}`}>
              <button
                type="button"
                className="sBtn sColorN setting"
                aria-expanded={isColumnMenuOpen}
                onClick={() => setIsColumnMenuOpen((current) => !current)}
              >
                항목 선택
              </button>
              {isColumnMenuOpen ? (
                <div className="managementUsageColumnMenu">
                  <p>고정 항목 8개 외 표시할 항목</p>
                  {OPTIONAL_COLUMNS.map((column) => (
                    <label key={column.key}>
                      <input
                        type="checkbox"
                        checked={visibleColumns.includes(column.key)}
                        onChange={() => toggleColumn(column.key)}
                      />
                      <span>{column.label}</span>
                    </label>
                  ))}
                  <button type="button" className="sBtn sColorLB" onClick={() => setIsColumnMenuOpen(false)}>적용</button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {message ? <p className="detailMessage">{message}</p> : null}
        {exportMessage ? <p className="managementUsageExportMessage" role="status">{exportMessage}</p> : null}
        <div id="fixTable" className="fixTable wide legacyListTable managementUsageLvTableWrap">
          <div className="overflowBox table-scroll" ref={listScrollRef}>
          <table className="m-shadowTable managementUsageTable">
            <caption className="caption">머니뱅크 이용상세 목록</caption>
            <thead>
              <tr>
                <th scope="col">이용상태</th>
                <th scope="col">신청일자</th>
                <th scope="col">회원ID</th>
                <th scope="col">회사명</th>
                <th scope="col">회원명</th>
                <th scope="col">이용서비스</th>
                <th scope="col">시작일자</th>
                <th scope="col">종료일자</th>
                {visibleColumns.includes('feeRate') ? <th scope="col">수수료</th> : null}
                {visibleColumns.includes('paymentRate') ? <th scope="col">지급율</th> : null}
                {visibleColumns.includes('provisionAmount') ? <th scope="col">이용금액</th> : null}
                {visibleColumns.includes('repaymentAmount') ? <th scope="col">누적상환</th> : null}
                {visibleColumns.includes('outstandingBalance') ? <th scope="col">상환잔액</th> : null}
                {visibleColumns.includes('prizmGrade') ? <th scope="col">PCS</th> : null}
                <th scope="col">상세</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={visibleColumnCount}>이용상세 목록을 조회 중입니다.</td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumnCount}>조회된 이용상세 데이터가 없습니다.</td>
                </tr>
              ) : rows.map((row) => (
                <tr key={row.mbid}>
                  <td>
                    <span className={`sBtn ${statusClassName(row.usage_status)} rBtn`}>
                      {row.usage_status}
                    </span>
                  </td>
                  <td>{formatDate(row.request_date)}</td>
                  <td>{row.user_email ?? '-'}</td>
                  <td>{row.firm_name ?? '-'}</td>
                  <td>{row.user_name ?? '-'}</td>
                  <td>{row.product_code ?? '-'}</td>
                  <td>{formatDate(row.contract_date)}</td>
                  <td>{formatDate(row.expire_date)}</td>
                  {visibleColumns.includes('feeRate') ? <td>{formatPercent(row.fee_rate)}</td> : null}
                  {visibleColumns.includes('paymentRate') ? <td>{row.payment_rate === null || row.payment_rate === undefined ? '-' : `${row.payment_rate}%`}</td> : null}
                  {visibleColumns.includes('provisionAmount') ? <td>{formatNumber(row.provision_amount || row.sales_amount)}</td> : null}
                  {visibleColumns.includes('repaymentAmount') ? <td>{formatNumber(row.repayment_amount)}</td> : null}
                  {visibleColumns.includes('outstandingBalance') ? <td>{formatNumber(row.outstanding_balance)}</td> : null}
                  {visibleColumns.includes('prizmGrade') ? <td>{row.prizm_grade ?? '-'}</td> : null}
                  <td>
                    <button
                      className="sColorLB refund-btn"
                      type="button"
                      onClick={() => {
                        window.location.href = `/admin/moneybank/management/usageDetail?mbid=${encodeURIComponent(row.mbid)}`;
                      }}
                    >
                      보기
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          {listScroll.max > 0 ? <div className="horizontalTableScrollbar managementUsageHorizontalScrollbar" aria-label="이용상세 목록 좌우 스크롤">
            <button type="button" aria-label="이용상세 목록 왼쪽으로 스크롤" onClick={() => moveListScroll(-1)} disabled={listScroll.left <= 0}>&lt;</button>
            <input
              type="range"
              aria-label="이용상세 목록 가로 스크롤"
              min="0"
              max={listScroll.max}
              step="1"
              value={Math.min(listScroll.left, listScroll.max)}
              onChange={changeListScroll}
            />
            <button type="button" aria-label="이용상세 목록 오른쪽으로 스크롤" onClick={() => moveListScroll(1)} disabled={listScroll.left >= listScroll.max}>&gt;</button>
          </div> : null}
          <UsageSummary counts={counts} sums={sums} total={total} />
        </div>

        <div className="m-paging paging" id="pagingButton">
          <ul>
            <li>
              <button className="oiBtn prev" type="button" onClick={goToPreviousPage} disabled={offset === 0}>
                이전
              </button>
            </li>
            <li>
              <a className="num active" href="javascript:;">
                {currentPage}
              </a>
            </li>
            <li>
              <button className="oiBtn next" type="button" onClick={goToNextPage} disabled={offset + PAGE_SIZE >= total}>
                다음
              </button>
            </li>
          </ul>
        </div>
      </div>
      </div>
    </>
  );
}

function UsageSummary({ counts, sums, total }) {
  return (
    <div className="fixBottom">
      <ul className="tableTotal">
        <li><span className="txt">총 :</span><span className="result"> {formatNumber(total)} 건</span></li>
        <li><span className="txt">신청 :</span><span className="result">{formatNumber(counts?.request_count ?? 0)} 건</span></li>
        <li><span className="txt">심사 :</span><span className="result">{formatNumber(counts?.review_count ?? 0)} 건</span></li>
        <li><span className="txt">거부 :</span><span className="result">{formatNumber(counts?.rejected_count ?? 0)} 건</span></li>
        <li><span className="txt">상환 :</span><span className="result">{formatNumber(counts?.repayment_count ?? 0)} 건</span></li>
        <li><span className="txt">만료 :</span><span className="result">{formatNumber(counts?.expired_count ?? 0)} 건</span></li>
        <li><span className="txt">이용금액 :</span><span className="result">{formatNumber(sums?.provision_amount ?? 0)}</span></li>
        <li><span className="txt">상환잔액 :</span><span className="result">{formatNumber(sums?.outstanding_balance ?? 0)}</span></li>
      </ul>
    </div>
  );
}
