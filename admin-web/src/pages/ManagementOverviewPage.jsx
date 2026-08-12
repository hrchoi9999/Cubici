import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchManagementOverview } from '../api/management.js';

function formatDate(value) {
  return value ? value.slice(0, 10) : '-';
}

function formatNumber(value) {
  return Number(value ?? 0).toLocaleString('ko-KR');
}

function formatMillion(value) {
  return (Number(value ?? 0) / 1000000).toLocaleString('ko-KR', { maximumFractionDigits: 1 });
}

function cumulative(rows, key) {
  let total = 0;
  return rows.map((row) => {
    total += Number(row[key] ?? 0);
    return total;
  });
}

function ratio(numerator, denominator) {
  return numerator.map((value, index) => {
    const base = Number(denominator[index] ?? 0);
    return base > 0 ? Number(((Number(value ?? 0) / base) * 100).toFixed(2)) : 0;
  });
}

function carryForward(rows, key) {
  let latest = 0;
  return rows.map((row) => {
    const value = Number(row[key] ?? 0);
    if (value !== 0) latest = value;
    return latest;
  });
}

function chartDatasets(variant, rows) {
  const requestCounts = cumulative(rows, 'contract_count');
  const terminatedCounts = cumulative(rows, 'terminated_count');
  const memberCounts = requestCounts.map((value, index) => Math.max(0, value - terminatedCounts[index]));
  const provisionCounts = cumulative(rows, 'provision_count');
  const provisionAmounts = cumulative(rows, 'provision_amount');
  const repaymentAmounts = cumulative(rows, 'repayment_amount');
  const outstandingBalances = carryForward(rows, 'outstanding_balance');

  const presets = {
    members: [
      { label: '신규가입', data: rows.map((row) => row.contract_count ?? 0), backgroundColor: '#0049ad' },
      { type: 'line', label: '가입해지', data: rows.map((row) => row.terminated_count ?? 0), borderColor: '#f9a268', backgroundColor: '#f9a268' },
      { type: 'line', label: '누적회원', data: memberCounts, borderColor: '#26a94b', backgroundColor: '#26a94b' },
    ],
    usage: [
      { label: '이용회원', data: provisionCounts, backgroundColor: '#0049ad' },
      { type: 'line', label: '선정산 이용금액', data: provisionAmounts, borderColor: '#f9a268', backgroundColor: '#f9a268', yAxisID: 'amount' },
      {
        type: 'line',
        label: '평균 선정산 금액',
        data: provisionAmounts.map((value, index) => (provisionCounts[index] > 0 ? Math.round(value / provisionCounts[index]) : 0)),
        borderColor: '#26a94b',
        backgroundColor: '#26a94b',
        yAxisID: 'amount',
      },
    ],
    service: [
      { label: '머니뱅크 회원', data: memberCounts, backgroundColor: '#0049ad' },
      { type: 'line', label: '서비스 이용자', data: provisionCounts, borderColor: '#f9a268', backgroundColor: '#f9a268' },
      { type: 'line', label: '신규 계약', data: cumulative(rows, 'approved_count'), borderColor: '#f95d7e', backgroundColor: '#f95d7e' },
      { type: 'line', label: '서비스 이용률', data: ratio(provisionCounts, memberCounts), borderColor: '#26a94b', backgroundColor: '#26a94b', yAxisID: 'percent' },
    ],
    contracts: [
      { label: '신규신청', data: rows.map((row) => row.request_amount ?? 0), backgroundColor: '#0049ad', yAxisID: 'amount' },
      { type: 'line', label: '심사금액', data: rows.map((row) => row.review_amount ?? 0), borderColor: '#f9a268', backgroundColor: '#f9a268', yAxisID: 'amount' },
      { type: 'line', label: '계약금액', data: rows.map((row) => row.approved_amount ?? 0), borderColor: '#f95d7e', backgroundColor: '#f95d7e', yAxisID: 'amount' },
      { type: 'line', label: '계약/신청%', data: ratio(rows.map((row) => row.approved_amount ?? 0), rows.map((row) => row.request_amount ?? 0)), borderColor: '#26a94b', backgroundColor: '#26a94b', yAxisID: 'percent' },
    ],
    repayment: [
      { label: '누적계약', data: provisionAmounts, backgroundColor: '#0049ad', yAxisID: 'amount' },
      { type: 'line', label: '누적상환', data: repaymentAmounts, borderColor: '#f9a268', backgroundColor: '#f9a268', yAxisID: 'amount' },
      { type: 'line', label: '잔액', data: outstandingBalances, borderColor: '#f95d7e', backgroundColor: '#f95d7e', yAxisID: 'amount' },
      { type: 'line', label: '잔액%', data: ratio(outstandingBalances, provisionAmounts), borderColor: '#26a94b', backgroundColor: '#26a94b', yAxisID: 'percent' },
    ],
    fees: [
      { label: '머니뱅크 수수료', data: rows.map((row) => row.repayment_fee ?? 0), backgroundColor: '#0049ad', yAxisID: 'amount' },
      { type: 'line', label: '상환금액 대비 %', data: ratio(rows.map((row) => row.repayment_fee ?? 0), rows.map((row) => row.repayment_amount ?? 0)), borderColor: '#f9a268', backgroundColor: '#f9a268', yAxisID: 'percent' },
    ],
  };

  return presets[variant].map((dataset) => ({
    borderWidth: dataset.type === 'line' ? 2 : 0,
    fill: false,
    lineTension: 0,
    pointRadius: dataset.type === 'line' ? 2 : 0,
    yAxisID: dataset.yAxisID ?? 'count',
    ...dataset,
  }));
}

function ManagementChart({ emptyLabel, rows, variant }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || rows.length === 0 || !window.Chart) return undefined;

    const datasets = chartDatasets(variant, rows);
    const amountUsed = datasets.some((dataset) => dataset.yAxisID === 'amount');
    const percentUsed = datasets.some((dataset) => dataset.yAxisID === 'percent');
    const yAxes = [{ id: 'count', position: 'left', ticks: { beginAtZero: true } }];
    if (amountUsed) yAxes.push({ id: 'amount', position: 'left', ticks: { beginAtZero: true }, gridLines: { drawOnChartArea: false } });
    if (percentUsed) yAxes.push({ id: 'percent', position: 'right', ticks: { beginAtZero: true, callback: (value) => `${value}%` }, gridLines: { drawOnChartArea: false } });

    const chart = new window.Chart(canvasRef.current.getContext('2d'), {
      type: 'bar',
      data: { labels: rows.map((row) => formatDate(row.bucket)), datasets },
      options: {
        animation: { duration: 0 },
        maintainAspectRatio: false,
        responsive: true,
        legend: { display: true, labels: { boxWidth: 13, fontSize: 12 } },
        scales: {
          xAxes: [{ categoryPercentage: 0.7, barPercentage: 1, ticks: { maxRotation: 90, minRotation: 45 } }],
          yAxes,
        },
      },
    });

    return () => chart.destroy();
  }, [rows, variant]);

  return (
    <div className="managementLvChartBox">
      <canvas aria-label={emptyLabel} ref={canvasRef} role="img" />
      {rows.length === 0 ? <p className="managementLvChartState">조회된 그래프 데이터가 없습니다.</p> : null}
    </div>
  );
}

function OverviewKpis({ isLoading, summary }) {
  const empty = isLoading || !summary;
  const items = [
    { icon: 'user-round.png', title: '머니뱅크 회원', unit: '(명)', lines: [`금일: ${empty ? '-' : formatNumber(summary.contract_today_count)}`, `누적: ${empty ? '-' : formatNumber(summary.contract_total_count)}`] },
    { icon: 'money-get.svg', title: '서비스 원금누적', unit: '(백만원)', lines: [`금일: ${empty ? '-' : formatMillion(summary.provision_today_amount)} / ${empty ? '-' : formatNumber(summary.provision_total_count)}건`, `누적: ${empty ? '-' : formatMillion(summary.provision_total_amount)} / ${empty ? '-' : formatNumber(summary.provision_total_count)}건`] },
    { icon: 'won-round.svg', title: '상환 원금누적', unit: '(백만원)', lines: [`금일: ${empty ? '-' : formatMillion(summary.repayment_today_amount)} / ${empty ? '-' : formatNumber(summary.repayment_total_count)}건`, `누적: ${empty ? '-' : formatMillion(summary.repayment_total_amount)} / ${empty ? '-' : formatNumber(summary.repayment_total_count)}건`] },
    { icon: 'scale.svg', title: '상환 원금잔액', unit: '(백만원)', lines: [`잔액총액: ${empty ? '-' : formatMillion(summary.balance_reconcile_amount)}`, `${empty ? '-' : formatNumber(summary.outstanding_balance_count)}건`, ...(summary?.opening_repayment_amount > 0 ? [`초기이관 상환: ${formatNumber(summary.opening_repayment_amount)}원`] : [])] },
  ];

  return <KpiGrid items={items} />;
}

function OperationKpis({ isLoading, summary }) {
  const value = (field) => (isLoading || !summary ? '-' : formatNumber(summary[field]));
  const items = [
    { icon: 'doc-pen.svg', title: '신규 신청', value: `${value('contract_today_count')}건` },
    { icon: 'doc-search.svg', title: '신규 심사', value: `${value('review_today_count')}건` },
    { icon: 'shack-hands.svg', title: '신규 계약', value: `${value('approved_today_count')}건` },
    { icon: 'doc-del.svg', title: '계약 종료', value: `${value('terminated_today_count')}건` },
    { label: '머니뱅크\n운영건수', value: `${value('active_contract_count')}건` },
    { label: '머니뱅크\n상환금액', value: `${value('repayment_total_amount')}원` },
    { label: '머니뱅크\n원금잔액', value: `${value('balance_reconcile_amount')}원` },
    { label: '머니뱅크\n수수료', value: `${value('repayment_fee_total_amount')}원` },
  ];

  return <KpiGrid compact items={items} />;
}

function KpiGrid({ compact = false, items }) {
  return (
    <div className={`colorTxtBoxArea managementLvKpiGrid${compact ? ' compact' : ''}`}>
      {items.map((item) => (
        <article key={item.title ?? item.label}>
          <div className={`colorBox${item.label ? ' textIcon' : ''}`}>
            {item.icon ? <img alt="" src={`/resources/rudicks/admin/img/icon/${item.icon}`} /> : item.label.split('\n').map((line) => <span key={line}>{line}</span>)}
          </div>
          <div className="txtBox">
            {item.value ? (
              <div className="managementLvKpiValue"><h3>{item.title}</h3><strong>{item.value}</strong></div>
            ) : (
              <table><tbody><tr><th><h3>{item.title}</h3></th><td><span className="gray">{item.unit}</span></td></tr>{item.lines.map((line) => <tr key={line}><td colSpan="2">• {line}</td></tr>)}</tbody></table>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

function ChartPanel({ label, rows, variant }) {
  return (
    <article className="subBox managementLvChartPanel">
      <header><h4>{label}</h4></header>
      <div className="contentArea"><ManagementChart emptyLabel={`${label} 그래프`} rows={rows} variant={variant} /></div>
    </article>
  );
}

export function ManagementOverviewPage() {
  const operationsTab = window.location.pathname.endsWith('/info_tab2');
  const [overview, setOverview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [formValues, setFormValues] = useState({ unit: 'day', fromDate: '', toDate: '' });
  const [filters, setFilters] = useState({ unit: 'day' });

  useEffect(() => {
    let ignore = false;
    setIsLoading(true);
    setMessage('');
    fetchManagementOverview(filters).then((data) => {
      if (ignore) return;
      setOverview(data);
      setFormValues((current) => ({
        ...current,
        unit: data.unit ?? current.unit,
        fromDate: current.fromDate || formatDate(data.summary?.from_date),
        toDate: current.toDate || formatDate(data.summary?.to_date),
      }));
    }).catch((error) => {
      if (!ignore) {
        setOverview(null);
        setMessage(error.message);
      }
    }).finally(() => {
      if (!ignore) setIsLoading(false);
    });
    return () => { ignore = true; };
  }, [filters]);

  const summary = overview?.summary;
  const series = useMemo(() => overview?.series ?? [], [overview]);
  const warningRows = overview?.warnings ?? [];

  function updateFormValue(event) {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  }

  function handleSearch(event) {
    event.preventDefault();
    setFilters({ unit: formValues.unit, from_date: formValues.fromDate, to_date: formValues.toDate });
  }

  function handleDownload() {
    if (series.length === 0) return;
    const headings = ['기간', '신청', '심사', '계약', '계약종료', '선정산', '상환', '잔액', '수수료'];
    const rows = series.map((row) => [row.bucket, row.contract_count, row.review_count, row.approved_count, row.terminated_count, row.provision_amount, row.repayment_amount, row.outstanding_balance, row.repayment_fee]);
    const csv = `\ufeff${[headings, ...rows].map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(',')).join('\r\n')}`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `moneybank-overview-${formValues.fromDate}-${formValues.toDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="managementLvPage">
      <div className="m-tab managementLvTabs">
        <ul>
          <li className={operationsTab ? '' : 'active'}><a href="/admin/moneybank/cubici/management/info_tab1">현황 종합</a></li>
          <li className={operationsTab ? 'active' : ''}><a href="/admin/moneybank/cubici/management/info_tab2">운영지표</a></li>
        </ul>
      </div>

      <div className="m-options managementLvOptions"><div className="pRight"><span className="baseDate pRight"><b>기준</b>{formatDate(summary?.standard_date)}</span></div></div>
      {message ? <div className="m-alert">{message}</div> : null}
      {operationsTab ? <OperationKpis isLoading={isLoading} summary={summary} /> : <OverviewKpis isLoading={isLoading} summary={summary} />}

      {!operationsTab ? (
        <section className="mArticleArea stateTableArea managementWarningArea">
          <div className="stateBox sColorP"><div className="txt"><img src="/resources/rudicks/admin/img/icon/warning.svg" alt="경고" /><p>경고</p></div></div>
          <div className="maxHeight"><table className="m-shadowTable style-gray managementWarningTable"><caption className="caption">잔액 경고 목록</caption><thead><tr><th>선정산ID</th><th>성명</th><th>회사명</th><th>선정산금액</th><th>상환금액</th><th>선정산잔액</th><th>이상증후</th><th>프리즘</th></tr></thead><tbody>{isLoading ? <tr><td colSpan="8">경고 목록을 조회 중입니다.</td></tr> : warningRows.length === 0 ? <tr><td colSpan="8">조회된 경고 데이터가 없습니다.</td></tr> : warningRows.map((row) => <tr key={row.mbid}><td>{row.mbid}</td><td>{row.user_name ?? '-'}</td><td>{row.firm_name ?? '-'}</td><td>{formatNumber(row.provision_amount)}</td><td>{formatNumber(row.repayment_amount)}</td><td>{formatNumber(row.outstanding_balance)}</td><td>{row.signal}</td><td>{row.prizm_grade ?? '-'}</td></tr>)}</tbody></table></div>
        </section>
      ) : null}

      <form className="m-search searchArea managementLvSearch" onSubmit={handleSearch}>
        <div className="line">
          <div className="inputBox"><label htmlFor="overviewDivision">구분</label><select id="overviewDivision" defaultValue="all"><option value="all">전체</option></select></div>
          <div className="inputBox"><label htmlFor="overviewUnit">분석단위</label><select id="overviewUnit" name="unit" value={formValues.unit} onChange={updateFormValue}><option value="day">일</option><option value="week">주</option><option value="month">월</option></select></div>
          <div className="inputBox"><label htmlFor="overviewFromDate">시작</label><input id="overviewFromDate" name="fromDate" type="date" value={formValues.fromDate} onChange={updateFormValue} /></div>
          <div className="inputBox"><label htmlFor="overviewToDate">종료</label><input id="overviewToDate" name="toDate" type="date" value={formValues.toDate} onChange={updateFormValue} /></div>
          <button className="sBtn sColorLB" type="submit">검색</button>
          <button className="sBtn sColorLG excel" disabled={series.length === 0} onClick={handleDownload} type="button">엑셀 다운로드</button>
        </div>
      </form>

      {operationsTab ? (
        <><ChartPanel label="신청/심사/계약" rows={series} variant="contracts" /><ChartPanel label="계약/상환/잔액" rows={series} variant="repayment" /><ChartPanel label="머니뱅크 수수료" rows={series} variant="fees" /></>
      ) : (
        <><ChartPanel label="머니뱅크 회원 현황" rows={series} variant="members" /><ChartPanel label="머니뱅크 이용 현황" rows={series} variant="usage" /><ChartPanel label="서비스 이용률" rows={series} variant="service" /></>
      )}
    </div>
  );
}
