import { useEffect, useMemo, useState } from 'react';
import { fetchMemberPayments, fetchMemberSummary } from '../api/management.js';

function formatDate(value) {
  return value ? value.slice(0, 10) : '-';
}

function formatNumber(value) {
  return Number(value ?? 0).toLocaleString('ko-KR');
}

function getMaxValue(items, keys) {
  return Math.max(1, ...items.flatMap((item) => keys.map((key) => Number(item[key] ?? 0))));
}

function makeBarWidth(value, maxValue) {
  return `${Math.max(2, Math.round((Number(value ?? 0) / maxValue) * 100))}%`;
}

export function CubiciIntegratedInfoPage() {
  const [summary, setSummary] = useState(null);
  const [payments, setPayments] = useState(null);
  const [filters, setFilters] = useState({ unit: 'day', fromDate: '', toDate: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      setIsLoading(true);
      setMessage('');
      try {
        const [summaryData, paymentData] = await Promise.all([
          fetchMemberSummary({
            unit: filters.unit,
            from_date: filters.fromDate,
            to_date: filters.toDate,
          }),
          fetchMemberPayments({ limit: 1, offset: 0 }),
        ]);
        if (!ignore) {
          setSummary(summaryData);
          setPayments(paymentData);
          setFilters((current) => ({
            ...current,
            fromDate: current.fromDate || formatDate(summaryData.metrics?.from_date),
            toDate: current.toDate || formatDate(summaryData.metrics?.to_date),
          }));
        }
      } catch (error) {
        if (!ignore) {
          setSummary(null);
          setPayments(null);
          setMessage(error.message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      ignore = true;
    };
  }, [filters.unit, filters.fromDate, filters.toDate]);

  const metrics = summary?.metrics;
  const series = summary?.series ?? [];
  const seriesMax = useMemo(() => getMaxValue(series, ['cubici_count', 'moneybank_count', 'terminated_count']), [series]);

  function updateFilter(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  return (
    <section className="adminPage integratedInfoPage">
      <div className="legacyTabs">
        <a className="active" href="/admin/cubici/infoIntegrated/cubici_tab1">큐빅아이</a>
        <a href="/admin/cubici/infoIntegrated/moneybank_tab1">머니뱅크</a>
      </div>

      <div className="integratedStatusLine">
        <div className="summaryPills">
          <span>기준 {formatDate(metrics?.standard_date)}</span>
          <span>{metrics?.data_source_label ?? 'PostgreSQL 직접집계'}</span>
          <span>{metrics?.aggregation_status_label ?? 'legacy procedure 대조 필요'}</span>
          <span>{metrics?.shop_grouping_status_label ?? 'shop grouping 대조 필요'}</span>
          <span>{isLoading ? '조회 중' : '조회 완료'}</span>
        </div>
      </div>

      {message ? <p className="statusMessage">{message}</p> : null}

      <div className="integratedMetricGrid">
        <article>
          <h4>큐빅아이 신규가입</h4>
          <strong>{formatNumber(metrics?.cubici_yesterday_count)}</strong>
          <span>누적 {formatNumber(metrics?.cubici_total_count)}명</span>
        </article>
        <article>
          <h4>머니뱅크 전환</h4>
          <strong>{formatNumber(metrics?.moneybank_yesterday_count)}</strong>
          <span>누적 {formatNumber(metrics?.moneybank_total_count)}명</span>
        </article>
        <article>
          <h4>해지회원</h4>
          <strong>{formatNumber(metrics?.terminated_yesterday_count)}</strong>
          <span>누적 {formatNumber(metrics?.terminated_total_count)}명</span>
        </article>
        <article>
          <h4>결제금액</h4>
          <strong>{formatNumber(payments?.sums?.amount)}</strong>
          <span>결제 {formatNumber(payments?.counts?.paid_count)}건</span>
        </article>
      </div>

      <form className="legacySearchBox" onSubmit={(event) => event.preventDefault()}>
        <label>
          <span>분석단위</span>
          <select name="unit" value={filters.unit} onChange={updateFilter}>
            <option value="day">일</option>
            <option value="week">주</option>
            <option value="month">월</option>
          </select>
        </label>
        <label>
          <span>시작일</span>
          <input name="fromDate" type="date" value={filters.fromDate} onChange={updateFilter} />
        </label>
        <label>
          <span>종료일</span>
          <input name="toDate" type="date" value={filters.toDate} onChange={updateFilter} />
        </label>
      </form>

      <section className="integratedPanel">
        <h4>회원 추이</h4>
        <table className="legacyTable integratedSeriesTable">
          <thead>
            <tr>
              <th>기간</th>
              <th>큐빅아이</th>
              <th>머니뱅크</th>
              <th>해지</th>
              <th>전환율</th>
              <th>추이</th>
            </tr>
          </thead>
          <tbody>
            {series.length === 0 ? (
              <tr><td colSpan="6">조회된 추이 데이터가 없습니다.</td></tr>
            ) : series.map((row) => (
              <tr key={row.bucket}>
                <td>{formatDate(row.bucket)}</td>
                <td>{formatNumber(row.cubici_count)}</td>
                <td>{formatNumber(row.moneybank_count)}</td>
                <td>{formatNumber(row.terminated_count)}</td>
                <td>{row.moneybank_ratio ?? '-'}%</td>
                <td>
                  <span className="managementBar"><span style={{ width: makeBarWidth(row.cubici_count, seriesMax) }} /></span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </section>
  );
}
