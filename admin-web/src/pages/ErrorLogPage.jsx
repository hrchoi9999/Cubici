import { useEffect, useState } from 'react';
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
          setSelected(null);
        }
      } catch (error) {
        if (!ignore) {
          setItems([]);
          setTotal(0);
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

  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

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

  function selectLog(row) {
    setSelected(row);
    window.requestAnimationFrame(() => {
      document.querySelector('.errorLogLvList .tableScroll')?.scrollTo({ left: 0 });
    });
  }

  return (
    <section className="adminPage monitoringPage errorLogPage errorLogLvPage">
      <form className="errorLogLvSearch" onSubmit={handleSearch}>
        <div className="errorLogLvSearchPrimary">
          <div className="inputBox">
            <label htmlFor="errorFromDate">시작</label>
            <input id="errorFromDate" name="fromDate" type="date" value={formValues.fromDate} onChange={updateSearchValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="errorToDate">종료</label>
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
          <button className="sBtn sColorLB" type="submit">검색</button>
        </div>
        <div className="errorLogLvSearchSecondary">
          <div className="inputBox">
            <label htmlFor="errorScenario">시나리오</label>
            <input id="errorScenario" name="scenario" type="text" placeholder="시나리오..." value={formValues.scenario} onChange={updateSearchValue} />
          </div>
        </div>
      </form>

      {message ? <div className="m-alert">{message}</div> : null}

      <div className="errorLogLvList">
        <div className="tableScroll">
        <table className="m-shadowTable errorLogTable errorLogLvTable">
          <caption className="caption">에러로그 목록</caption>
          <thead>
            <tr>
              <th>쇼핑몰</th>
              <th>ID</th>
              <th>시나리오</th>
              <th>시작일</th>
              <th>실행시간</th>
              <th>상태</th>
              <th>에러로그</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row, index) => (
              <tr key={`${row.status}-${row.shop_id ?? 'shop'}-${row.started_at ?? index}`} className={selected === row ? 'active' : ''}>
                <td>{row.shop_name ?? '-'}</td>
                <td>{row.shop_id ?? '-'}</td>
                <td className="subject">{row.scenario ?? '-'}</td>
                <td>{formatDateTime(row.started_at)}</td>
                <td>{row.runtime_label ?? '-'}</td>
                <td>
                  <span className={`sBtn ${row.status === '성공' ? 'sColorLS' : 'sColorR'} rBtn`}>{row.status}</span>
                </td>
                <td className="subject">
                  <button className="errorLogLvSelect" type="button" onClick={() => selectLog(row)}>{shortLog(row.error_log)}</button>
                </td>
              </tr>
            ))}
            {isLoading ? (
              <tr>
                <td colSpan="7">조회 중입니다.</td>
              </tr>
            ) : null}
            {!isLoading && items.length === 0 ? (
              <tr>
                <td colSpan="7">조회된 데이터가 없습니다.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="pagingControls">
        <button type="button" onClick={goToPreviousPage} disabled={offset === 0}>이전</button>
        <span>{currentPage}</span>
        <button type="button" onClick={goToNextPage} disabled={offset + PAGE_SIZE >= total}>다음</button>
      </div>
      </div>

      {selected ? <section className="errorLogLvDetail">
        <header>
          <h3>에러로그 상세</h3>
          <button type="button" onClick={() => setSelected(null)}>닫기</button>
        </header>
        <dl>
          <div><dt>쇼핑몰</dt><dd>{selected.shop_name ?? '-'}</dd></div>
          <div><dt>ID</dt><dd>{selected.shop_id ?? '-'}</dd></div>
          <div><dt>시나리오</dt><dd>{selected.scenario ?? '-'}</dd></div>
          <div><dt>시작일</dt><dd>{formatDateTime(selected.started_at)}</dd></div>
          <div><dt>실행시간</dt><dd>{selected.runtime_label ?? '-'}</dd></div>
          <div><dt>상태</dt><dd>{selected.status ?? '-'}</dd></div>
          <div><dt>원본</dt><dd>{selected.source_table ?? '-'}</dd></div>
          <div><dt>후속조치</dt><dd>{selected.follow_up_action_label ?? '-'}</dd></div>
        </dl>
        <pre>{selected.error_log || '-'}</pre>
      </section> : null}
    </section>
  );
}
