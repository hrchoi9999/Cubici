import { useEffect, useMemo, useState } from 'react';
import { fetchErrorLogs } from '../api/monitoring.js';

const PAGE_SIZE = 20;

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function beforeIso(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

function formatDateTime(value) {
  if (!value) {
    return '-';
  }
  return value.replace('T', ' ').slice(0, 19);
}

function shortLog(value) {
  if (!value || value === '-') {
    return '-';
  }
  return value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

export function ErrorLogPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState({ success: 0, fail: 0, pending: 0, workflow: '-' });
  const [offset, setOffset] = useState(0);
  const [filters, setFilters] = useState({
    from_date: beforeIso(7),
    to_date: todayIso(),
    status: 'ALL',
  });
  const [formValues, setFormValues] = useState({
    fromDate: filters.from_date,
    toDate: filters.to_date,
    shop: '',
    status: 'ALL',
    scenario: '',
  });
  const [selected, setSelected] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadLogs() {
      setIsLoading(true);
      setMessage('');
      try {
        const data = await fetchErrorLogs({ limit: PAGE_SIZE, offset, ...filters });
        if (!ignore) {
          setItems(data.items ?? []);
          setTotal(data.total ?? 0);
          setCounts({
            success: data.success_count ?? 0,
            fail: data.fail_count ?? 0,
            pending: data.pending_action_count ?? data.fail_count ?? 0,
            workflow: data.workflow_status_label ?? '-',
          });
          setSelected((current) => current ?? data.items?.[0] ?? null);
        }
      } catch (error) {
        if (!ignore) {
          setItems([]);
          setTotal(0);
          setCounts({ success: 0, fail: 0, pending: 0, workflow: '-' });
          setSelected(null);
          setMessage(error.message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadLogs();

    return () => {
      ignore = true;
    };
  }, [offset, filters]);

  const rows = useMemo(() => items, [items]);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function updateSearchValue(event) {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  }

  function handleSearch(event) {
    event.preventDefault();
    setOffset(0);
    setSelected(null);
    setFilters({
      from_date: formValues.fromDate,
      to_date: formValues.toDate,
      shop: formValues.shop,
      status: formValues.status,
      scenario: formValues.scenario,
    });
  }

  function goToPreviousPage() {
    setOffset((value) => Math.max(0, value - PAGE_SIZE));
  }

  function goToNextPage() {
    setOffset((value) => {
      const next = value + PAGE_SIZE;
      return next >= total ? value : next;
    });
  }

  return (
    <>
      <div className="legacyTabs">
        <a className="active" href="/admin/cubici/adminMonitor/error_report">Error Log</a>
        <a href="/admin/cubici/adminMonitor/server_monitor">서버 관리</a>
        <a href="/admin/cubici/adminMonitor/fintech_trade">펌뱅킹 전문</a>
      </div>

      <form className="m-search searchArea" onSubmit={handleSearch}>
        <div className="line">
          <div className="inputBox">
            <label htmlFor="errorFromDate">시작일</label>
            <input id="errorFromDate" name="fromDate" type="date" value={formValues.fromDate} onChange={updateSearchValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="errorToDate">종료일</label>
            <input id="errorToDate" name="toDate" type="date" value={formValues.toDate} onChange={updateSearchValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="errorShop">쇼핑몰</label>
            <input id="errorShop" name="shop" type="text" value={formValues.shop} onChange={updateSearchValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="errorStatus">상태</label>
            <select id="errorStatus" name="status" value={formValues.status} onChange={updateSearchValue}>
              <option value="ALL">전체</option>
              <option value="SUCCESS">성공</option>
              <option value="FAIL">실패</option>
            </select>
          </div>
          <div className="inputBox">
            <label htmlFor="errorScenario">시나리오명</label>
            <input id="errorScenario" name="scenario" type="text" value={formValues.scenario} onChange={updateSearchValue} />
          </div>
          <button className="m-btn m-btnPrimary" type="submit">검색</button>
        </div>
      </form>

      <div className="inquirySummary">
        <span>전체 {total.toLocaleString()}건</span>
        <span>성공 {counts.success.toLocaleString()}건</span>
        <span>실패 {counts.fail.toLocaleString()}건</span>
        <span>조치필요 {counts.pending.toLocaleString()}건</span>
        <span>Workflow {counts.workflow}</span>
        <span>{isLoading ? '조회 중' : `페이지 ${currentPage.toLocaleString()} / ${pageCount.toLocaleString()}`}</span>
      </div>

      {message ? <div className="m-alert">{message}</div> : null}

      <div className="tableScroll">
        <table className="m-table errorLogTable">
          <thead>
            <tr>
              <th>쇼핑몰</th>
              <th>ID</th>
              <th>시나리오</th>
              <th>시작일</th>
              <th>실행시간</th>
              <th>상태</th>
              <th>처리</th>
              <th>후속조치</th>
              <th>에러로그</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row.status}-${row.shop_id ?? 'shop'}-${row.started_at ?? index}`} onClick={() => setSelected(row)}>
                <td>{row.shop_name ?? '-'}</td>
                <td>{row.shop_id ?? '-'}</td>
                <td className="subject">{row.scenario ?? '-'}</td>
                <td>{formatDateTime(row.started_at)}</td>
                <td>{row.runtime_label}</td>
                <td>
                  <span className={`sBtn ${row.status === '성공' ? 'sColorLS' : 'sColorR'} rBtn`}>{row.status}</span>
                </td>
                <td>{row.processing_status_label ?? '-'}</td>
                <td>{row.follow_up_action_label ?? '-'}</td>
                <td className="subject">{shortLog(row.error_log)}</td>
              </tr>
            ))}
            {!isLoading && rows.length === 0 ? (
              <tr>
                <td colSpan="9">조회된 데이터가 없습니다.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button className="m-btn" type="button" onClick={goToPreviousPage} disabled={offset === 0}>이전</button>
        <span>{currentPage} / {pageCount}</span>
        <button className="m-btn" type="button" onClick={goToNextPage} disabled={offset + PAGE_SIZE >= total}>다음</button>
      </div>

      <section className="messageTemplatePreview errorLogPreview">
        <h4>에러로그 상세</h4>
        <div className="summaryPills">
          <span>{selected?.processing_status_label ?? '미선택'}</span>
          <span>{selected?.source_table ?? '-'}</span>
          <span>{selected?.follow_up_action_label ?? '-'}</span>
        </div>
        <p>{selected ? selected.error_log || '-' : '선택된 로그가 없습니다.'}</p>
      </section>
    </>
  );
}
