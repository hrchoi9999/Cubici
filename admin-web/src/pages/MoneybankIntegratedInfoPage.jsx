import { useEffect, useMemo, useState } from 'react';
import { fetchManagementOverview } from '../api/management.js';

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

export function MoneybankIntegratedInfoPage() {
  const [overview, setOverview] = useState(null);
  const [filters, setFilters] = useState({ unit: 'day', fromDate: '', toDate: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadOverview() {
      setIsLoading(true);
      setMessage('');
      try {
        const data = await fetchManagementOverview({
          unit: filters.unit,
          from_date: filters.fromDate,
          to_date: filters.toDate,
        });
        if (!ignore) {
          setOverview(data);
          setFilters((current) => ({
            ...current,
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
  }, [filters.unit, filters.fromDate, filters.toDate]);

  const summary = overview?.summary;
  const series = overview?.series ?? [];
  const amountMax = useMemo(
    () => getMaxValue(series, ['provision_amount', 'repayment_amount', 'settlement_amount']),
    [series],
  );

  function updateFilter(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  return (
    <section className="adminPage">
      <div className="adminPageHeader">
        <div>
          <h2>통합정보</h2>
          <p>머니뱅크 선정산, 정산, 상환, 잔액 현황을 확인합니다.</p>
        </div>
        <div className="summaryPills">
          <span>기준 {formatDate(summary?.standard_date)}</span>
          <span>{summary?.data_source_label ?? 'PostgreSQL 직접집계'}</span>
          <span>{summary?.aggregation_status_label ?? 'legacy procedure 대조 필요'}</span>
          <span>{summary?.balance_reconcile_status_label ?? '미검증'}</span>
          <span>{isLoading ? '조회 중' : '조회 완료'}</span>
        </div>
      </div>

      <div className="legacyTabs">
        <a href="/admin/cubici/infoIntegrated/cubici_tab1">큐빅아이</a>
        <a className="active" href="/admin/cubici/infoIntegrated/moneybank_tab1">머니뱅크</a>
      </div>

      {message ? <p className="statusMessage">{message}</p> : null}

      <div className="integratedMetricGrid">
        <article>
          <h4>계약</h4>
          <strong>{formatNumber(summary?.contract_total_count)}</strong>
          <span>활성 {formatNumber(summary?.active_contract_count)}건</span>
        </article>
        <article>
          <h4>선정산</h4>
          <strong>{formatNumber(summary?.provision_total_amount)}</strong>
          <span>{formatNumber(summary?.provision_total_count)}건</span>
        </article>
        <article>
          <h4>상환</h4>
          <strong>{formatNumber(summary?.repayment_total_amount)}</strong>
          <span>{formatNumber(summary?.repayment_total_count)}건</span>
        </article>
        <article>
          <h4>잔액</h4>
          <strong>{formatNumber(summary?.outstanding_balance_amount)}</strong>
          <span>{formatNumber(summary?.outstanding_balance_count)}건 / 차이 {formatNumber(summary?.balance_reconcile_diff)}</span>
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
        <h4>머니뱅크 금액 추이</h4>
        <table className="legacyTable integratedSeriesTable">
          <thead>
            <tr>
              <th>기간</th>
              <th>계약</th>
              <th>선정산</th>
              <th>상환</th>
              <th>정산</th>
              <th>추이</th>
            </tr>
          </thead>
          <tbody>
            {series.length === 0 ? (
              <tr><td colSpan="6">조회된 추이 데이터가 없습니다.</td></tr>
            ) : series.map((row) => (
              <tr key={row.bucket}>
                <td>{formatDate(row.bucket)}</td>
                <td>{formatNumber(row.contract_count)}</td>
                <td>{formatNumber(row.provision_amount)}</td>
                <td>{formatNumber(row.repayment_amount)}</td>
                <td>{formatNumber(row.settlement_amount)}</td>
                <td>
                  <span className="managementBar"><span style={{ width: makeBarWidth(row.provision_amount, amountMax) }} /></span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </section>
  );
}
