import { useEffect, useMemo, useState } from 'react';
import { fetchManagementOverview } from '../api/management.js';

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

function formatMillion(value) {
  if (value === null || value === undefined) {
    return '-';
  }

  return (Number(value) / 1000000).toLocaleString('ko-KR', {
    maximumFractionDigits: 1,
  });
}

function getMaxValue(items, keys) {
  return Math.max(1, ...items.flatMap((item) => keys.map((key) => Number(item[key] ?? 0))));
}

function makeBarWidth(value, maxValue) {
  return `${Math.max(2, Math.round((Number(value ?? 0) / maxValue) * 100))}%`;
}

export function ManagementOverviewPage() {
  const [overview, setOverview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [formValues, setFormValues] = useState({
    unit: 'day',
    fromDate: '',
    toDate: '',
  });
  const [filters, setFilters] = useState({ unit: 'day' });

  useEffect(() => {
    let ignore = false;

    async function loadOverview() {
      setIsLoading(true);
      setMessage('');

      try {
        const data = await fetchManagementOverview(filters);
        if (!ignore) {
          setOverview(data);
          setFormValues((current) => ({
            ...current,
            unit: data.unit ?? current.unit,
            fromDate: current.fromDate || formatDate(data.summary?.from_date),
            toDate: current.toDate || formatDate(data.summary?.to_date),
          }));
        }
      } catch (error) {
        if (!ignore) {
          setOverview(null);
          setMessage(error.message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadOverview();

    return () => {
      ignore = true;
    };
  }, [filters]);

  const summary = overview?.summary;
  const series = overview?.series ?? [];
  const warningRows = overview?.warnings ?? [];
  const countMax = useMemo(() => getMaxValue(series, ['contract_count']), [series]);
  const amountMax = useMemo(
    () => getMaxValue(series, ['provision_amount', 'repayment_amount', 'settlement_amount']),
    [series],
  );

  function updateFormValue(event) {
    const { name, value } = event.target;
    setFormValues((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleSearch(event) {
    event.preventDefault();
    setFilters({
      unit: formValues.unit,
      from_date: formValues.fromDate,
      to_date: formValues.toDate,
    });
  }

  return (
    <>
      <div className="m-tab">
        <ul>
          <li className="active">
            <a href="/admin/moneybank/cubici/management/info_tab1">현황 종합</a>
          </li>
          <li>
            <a href="/admin/moneybank/cubici/management/info_tab2">운영지표</a>
          </li>
        </ul>
      </div>

      <div className="m-options managementOptions">
        <div className="pRight">
          <span className="baseDate pRight">
            <b>기준</b>{formatDate(summary?.standard_date)}
          </span>
          <span className="baseDate pRight">
            <b>집계</b>{summary?.aggregation_status_label ?? 'legacy procedure 대조 필요'}
          </span>
          <span className="baseDate pRight">
            <b>잔액검산</b>{summary?.balance_reconcile_status_label ?? '미검증'}
          </span>
        </div>
      </div>

      {message ? <p className="detailMessage">{message}</p> : null}
      <ManagementKpiArea summary={summary} isLoading={isLoading} />

      <section className="mArticleArea stateTableArea managementWarningArea">
        <div className="stateBox sColorP">
          <div className="txt">
            <img src="/resources/rudicks/admin/img/icon/warning.svg" alt="경고" />
            <p>경고</p>
          </div>
        </div>
        <div className="maxHeight">
          <table className="m-shadowTable style-gray managementWarningTable">
            <caption className="caption">잔액 경고 목록</caption>
            <thead>
              <tr>
                <th scope="col">선정산ID</th>
                <th scope="col">성명</th>
                <th scope="col">회사명</th>
                <th scope="col">선정산금액</th>
                <th scope="col">상환금액</th>
                <th scope="col">선정산잔액</th>
                <th scope="col">이상증후</th>
                <th scope="col">프리즘</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="8">경고 목록을 조회 중입니다.</td>
                </tr>
              ) : warningRows.length === 0 ? (
                <tr>
                  <td colSpan="8">조회된 경고 데이터가 없습니다.</td>
                </tr>
              ) : warningRows.map((row) => (
                <tr key={row.mbid}>
                  <td>{row.mbid}</td>
                  <td>{row.user_name ?? '-'}</td>
                  <td>{row.firm_name ?? '-'}</td>
                  <td>{formatNumber(row.provision_amount)}</td>
                  <td>{formatNumber(row.repayment_amount)}</td>
                  <td>{formatNumber(row.outstanding_balance)}</td>
                  <td>{row.signal}</td>
                  <td>{row.prizm_grade ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <form className="m-search searchArea" onSubmit={handleSearch}>
        <div className="line">
          <div className="inputBox">
            <label htmlFor="overviewUnit">분석단위</label>
            <select id="overviewUnit" name="unit" value={formValues.unit} onChange={updateFormValue}>
              <option value="day">일</option>
              <option value="week">주</option>
              <option value="month">월</option>
            </select>
          </div>
          <div className="inputBox">
            <label htmlFor="overviewFromDate">시작</label>
            <input id="overviewFromDate" name="fromDate" type="date" value={formValues.fromDate} onChange={updateFormValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="overviewToDate">종료</label>
            <input id="overviewToDate" name="toDate" type="date" value={formValues.toDate} onChange={updateFormValue} />
          </div>
          <button className="sBtn sColorLB" type="submit">
            검색
          </button>
        </div>
      </form>

      <article className="subBox managementChartBox">
        <header>
          <h4>머니뱅크 회원 현황</h4>
        </header>
        <div className="contentArea">
          <table className="m-shadowTable managementSeriesTable">
            <caption className="caption">회원 현황 추이</caption>
            <thead>
              <tr>
                <th scope="col">기간</th>
                <th scope="col">신규신청</th>
                <th scope="col">추이</th>
              </tr>
            </thead>
            <tbody>
              {series.length === 0 ? (
                <tr>
                  <td colSpan="3">조회된 추이 데이터가 없습니다.</td>
                </tr>
              ) : series.map((row) => (
                <tr key={`count-${row.bucket}`}>
                  <td>{formatDate(row.bucket)}</td>
                  <td>{formatNumber(row.contract_count)}</td>
                  <td>
                    <span className="managementBar">
                      <span style={{ width: makeBarWidth(row.contract_count, countMax) }} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      <article className="subBox managementChartBox">
        <header>
          <h4>머니뱅크 이용 현황</h4>
        </header>
        <div className="contentArea">
          <table className="m-shadowTable managementSeriesTable amount">
            <caption className="caption">금액 현황 추이</caption>
            <thead>
              <tr>
                <th scope="col">기간</th>
                <th scope="col">선정산</th>
                <th scope="col">상환</th>
                <th scope="col">정산</th>
                <th scope="col">추이</th>
              </tr>
            </thead>
            <tbody>
              {series.length === 0 ? (
                <tr>
                  <td colSpan="5">조회된 추이 데이터가 없습니다.</td>
                </tr>
              ) : series.map((row) => (
                <tr key={`amount-${row.bucket}`}>
                  <td>{formatDate(row.bucket)}</td>
                  <td>{formatNumber(row.provision_amount)}</td>
                  <td>{formatNumber(row.repayment_amount)}</td>
                  <td>{formatNumber(row.settlement_amount)}</td>
                  <td>
                    <span className="managementMultiBar">
                      <span className="provision" style={{ width: makeBarWidth(row.provision_amount, amountMax) }} />
                      <span className="repayment" style={{ width: makeBarWidth(row.repayment_amount, amountMax) }} />
                      <span className="settlement" style={{ width: makeBarWidth(row.settlement_amount, amountMax) }} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </>
  );
}

function ManagementKpiArea({ summary, isLoading }) {
  const empty = isLoading || !summary;

  return (
    <div className="colorTxtBoxArea managementKpiArea">
      <article>
        <div className="colorBox">
          <img src="/resources/rudicks/admin/img/icon/user-round.png" alt="머니뱅크 회원" />
        </div>
        <div className="txtBox">
          <table>
            <tbody>
              <tr>
                <th><h3>머니뱅크 회원</h3></th>
                <td><span className="gray">(명)</span></td>
              </tr>
              <tr>
                <td colSpan="2">금일: {empty ? '-' : formatNumber(summary.contract_today_count)}</td>
              </tr>
              <tr>
                <td colSpan="2">누적: {empty ? '-' : formatNumber(summary.contract_total_count)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
      <article>
        <div className="colorBox">
          <img src="/resources/rudicks/admin/img/icon/money-get.svg" alt="서비스 원금누적" />
        </div>
        <div className="txtBox">
          <table>
            <tbody>
              <tr>
                <th><h3>서비스 원금누적</h3></th>
                <td><span className="gray">(백만원)</span></td>
              </tr>
              <tr>
                <td>금일: {empty ? '-' : formatMillion(summary.provision_today_amount)}</td>
                <td>{empty ? '-' : formatNumber(summary.provision_total_count)} 건</td>
              </tr>
              <tr>
                <td>누적: {empty ? '-' : formatMillion(summary.provision_total_amount)}</td>
                <td>{empty ? '-' : formatNumber(summary.provision_total_count)} 건</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
      <article>
        <div className="colorBox">
          <img src="/resources/rudicks/admin/img/icon/won-round.svg" alt="상환 원금누적" />
        </div>
        <div className="txtBox">
          <table>
            <tbody>
              <tr>
                <th><h3>상환 원금누적</h3></th>
                <td><span className="gray">(백만원)</span></td>
              </tr>
              <tr>
                <td>금일: {empty ? '-' : formatMillion(summary.repayment_today_amount)}</td>
                <td>{empty ? '-' : formatNumber(summary.repayment_total_count)} 건</td>
              </tr>
              <tr>
                <td>누적: {empty ? '-' : formatMillion(summary.repayment_total_amount)}</td>
                <td>{empty ? '-' : formatNumber(summary.repayment_total_count)} 건</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
      <article>
        <div className="colorBox">
          <img src="/resources/rudicks/admin/img/icon/scale.svg" alt="상환 원금잔액" />
        </div>
        <div className="txtBox">
          <table>
            <tbody>
              <tr>
                <th><h3>상환 원금잔액</h3></th>
                <td><span className="gray">(백만원)</span></td>
              </tr>
              <tr>
                <td>잔액총액: {empty ? '-' : formatMillion(summary.outstanding_balance_amount)}</td>
                <td>{empty ? '-' : formatNumber(summary.outstanding_balance_count)} 건</td>
              </tr>
              <tr>
                <td>검산차이: {empty ? '-' : formatMillion(summary.balance_reconcile_diff)}</td>
                <td>{empty ? '-' : summary.balance_reconcile_status_label}</td>
              </tr>
              <tr>
                <td>운영계약: {empty ? '-' : formatNumber(summary.active_contract_count)}</td>
                <td>종료 {empty ? '-' : formatNumber(summary.terminated_contract_count)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
    </div>
  );
}
