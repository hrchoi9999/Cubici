import { useEffect, useMemo, useState } from 'react';
import { fetchMemberSummary } from '../api/management.js';

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function beforeIso(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

function formatNumber(value) {
  return Number(value ?? 0).toLocaleString();
}

function formatDate(value) {
  return value ? value.slice(0, 10) : '-';
}

function maxSeriesValue(series) {
  return Math.max(1, ...series.flatMap((row) => [
    row.cubici_cumulative ?? 0,
    row.moneybank_cumulative ?? 0,
    row.terminated_cumulative ?? 0,
  ]));
}

export function MemberSummaryPage() {
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({
    unit: 'day',
    from_date: beforeIso(30),
    to_date: todayIso(),
  });
  const [formValues, setFormValues] = useState({
    unit: filters.unit,
    fromDate: filters.from_date,
    toDate: filters.to_date,
    partnerCode: '',
    productCode: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadSummary() {
      setIsLoading(true);
      setMessage('');
      try {
        const response = await fetchMemberSummary(filters);
        if (!ignore) {
          setData(response);
        }
      } catch (error) {
        if (!ignore) {
          setData(null);
          setMessage(error.message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadSummary();

    return () => {
      ignore = true;
    };
  }, [filters]);

  const metrics = data?.metrics;
  const series = useMemo(() => data?.series ?? [], [data]);
  const maxValue = maxSeriesValue(series);

  function updateSearchValue(event) {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  }

  function handleSearch(event) {
    event.preventDefault();
    setFilters({
      unit: formValues.unit,
      from_date: formValues.fromDate,
      to_date: formValues.toDate,
      partner_code: formValues.partnerCode,
      product_code: formValues.productCode,
    });
  }

  return (
    <>
      <div className="m-tab">
        <ul>
          <li className="active"><a href="/admin/cubici/manageMember/member_tab1">회원 종합</a></li>
          <li><a href="/admin/cubici/manageMember/member_tab2">회원 정보</a></li>
          <li><a href="/admin/cubici/manageMember/member_tab3">휴면/해지</a></li>
        </ul>
      </div>

      <div className="m-options">
        <div className="pRight">
          <span className="baseDate pRight"><b>기준</b>{formatDate(metrics?.standard_date)}</span>
        </div>
      </div>

      <div className="memberMetricGrid">
        <article>
          <div className="colorBox">큐빅아이</div>
          <div className="txtBox">
            <table>
              <tbody>
                <tr><td>전일 : {formatNumber(metrics?.cubici_yesterday_count)}명</td></tr>
                <tr><td>누적 : {formatNumber(metrics?.cubici_total_count)}명</td></tr>
              </tbody>
            </table>
          </div>
        </article>
        <article>
          <div className="colorBox">머니뱅크</div>
          <div className="txtBox">
            <table>
              <tbody>
                <tr><td>전일 : {formatNumber(metrics?.moneybank_yesterday_count)}명</td></tr>
                <tr><td>누적 : {formatNumber(metrics?.moneybank_total_count)}명</td></tr>
              </tbody>
            </table>
          </div>
        </article>
        <article>
          <div className="colorBox">가입해지</div>
          <div className="txtBox">
            <table>
              <tbody>
                <tr><td>전일 : {formatNumber(metrics?.terminated_yesterday_count)}명</td></tr>
                <tr><td>누적 : {formatNumber(metrics?.terminated_total_count)}명</td></tr>
              </tbody>
            </table>
          </div>
        </article>
        <article>
          <div className="colorBox">제휴 회원</div>
          <div className="txtBox">
            <table>
              <tbody>
                <tr><td>전일 : {formatNumber(metrics?.partner_yesterday_count)}개</td></tr>
                <tr><td>누적 : {formatNumber(metrics?.partner_total_count)}개</td></tr>
              </tbody>
            </table>
          </div>
        </article>
      </div>

      <form className="m-search searchArea" onSubmit={handleSearch}>
        <div className="line">
          <div className="inputBox">
            <label htmlFor="memberPartnerCode">협력사</label>
            <input id="memberPartnerCode" name="partnerCode" type="text" value={formValues.partnerCode} onChange={updateSearchValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="memberProductCode">서비스 구분</label>
            <input id="memberProductCode" name="productCode" type="text" value={formValues.productCode} onChange={updateSearchValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="memberUnit">분석단위</label>
            <select id="memberUnit" name="unit" value={formValues.unit} onChange={updateSearchValue}>
              <option value="day">일 단위</option>
              <option value="week">주 단위</option>
              <option value="month">월 단위</option>
            </select>
          </div>
          <div className="inputBox">
            <label htmlFor="memberFromDate">시작일</label>
            <input id="memberFromDate" name="fromDate" type="date" value={formValues.fromDate} onChange={updateSearchValue} />
          </div>
          <div className="inputBox">
            <label htmlFor="memberToDate">종료일</label>
            <input id="memberToDate" name="toDate" type="date" value={formValues.toDate} onChange={updateSearchValue} />
          </div>
          <button className="m-btn m-btnPrimary" type="submit">검색</button>
        </div>
      </form>

      {message ? <div className="m-alert">{message}</div> : null}

      <section className="memberTrendPanel">
        <div className="memberTrendHeader">
          <h4>회원현황 추이</h4>
          <span>{isLoading ? '조회 중' : `${series.length.toLocaleString()}개 구간`}</span>
        </div>
        <div className="memberTrendBars">
          {series.map((row) => (
            <div className="memberTrendRow" key={row.bucket}>
              <span>{formatDate(row.bucket)}</span>
              <div className="memberTrendTrack">
                <i className="cubici" style={{ width: `${Math.max(2, (row.cubici_cumulative / maxValue) * 100)}%` }} />
                <i className="moneybank" style={{ width: `${Math.max(2, (row.moneybank_cumulative / maxValue) * 100)}%` }} />
                <i className="terminated" style={{ width: `${Math.max(2, (row.terminated_cumulative / maxValue) * 100)}%` }} />
              </div>
              <strong>{formatNumber(row.cubici_cumulative)} / {formatNumber(row.moneybank_cumulative)}</strong>
            </div>
          ))}
        </div>
      </section>

      <div className="tableScroll">
        <table className="m-table memberSummaryTable">
          <thead>
            <tr>
              <th>구간</th>
              <th>큐빅아이 증가</th>
              <th>머니뱅크 증가</th>
              <th>해지 증가</th>
              <th>큐빅아이 누적</th>
              <th>머니뱅크 누적</th>
              <th>해지 누적</th>
              <th>머니뱅크 비율</th>
            </tr>
          </thead>
          <tbody>
            {series.map((row) => (
              <tr key={row.bucket}>
                <td>{formatDate(row.bucket)}</td>
                <td>{formatNumber(row.cubici_count)}</td>
                <td>{formatNumber(row.moneybank_count)}</td>
                <td>{formatNumber(row.terminated_count)}</td>
                <td>{formatNumber(row.cubici_cumulative)}</td>
                <td>{formatNumber(row.moneybank_cumulative)}</td>
                <td>{formatNumber(row.terminated_cumulative)}</td>
                <td>{row.moneybank_ratio == null ? '-' : `${row.moneybank_ratio.toFixed(2)}%`}</td>
              </tr>
            ))}
            {!isLoading && series.length === 0 ? (
              <tr>
                <td colSpan="8">조회된 데이터가 없습니다.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </>
  );
}
