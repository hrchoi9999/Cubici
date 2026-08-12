import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchManagementOverview } from '../api/management.js';

const COLORS = {
  navy: '#0049ad',
  orange: '#f9a268',
  pink: '#fe7b90',
  cyan: '#26ccd2',
  green: '#26a94b',
};

function formatDate(value) {
  return value ? value.slice(0, 10) : '-';
}

function formatNumber(value, maximumFractionDigits = 0) {
  return Number(value ?? 0).toLocaleString('ko-KR', { maximumFractionDigits });
}

function formatMillion(value) {
  return formatNumber(Number(value ?? 0) / 1_000_000, 2);
}

function ratio(numerator, denominator) {
  return denominator ? Math.round((Number(numerator ?? 0) / Number(denominator)) * 100) : 0;
}

function cumulative(values, start = 0) {
  let total = Number(start ?? 0);
  return values.map((value) => {
    total += Number(value ?? 0);
    return total;
  });
}

function chartOptions({ rightAxis = false } = {}) {
  const yAxes = [{ id: 'primary', position: 'left', ticks: { beginAtZero: true } }];
  if (rightAxis) {
    yAxes.push({
      id: 'secondary',
      position: 'right',
      ticks: { beginAtZero: true },
      gridLines: { drawOnChartArea: false },
    });
  }
  return {
    animation: { duration: 0 },
    maintainAspectRatio: false,
    responsive: true,
    legend: { display: true, labels: { boxWidth: 13, fontSize: 12 } },
    scales: {
      xAxes: [{ categoryPercentage: 0.72, barPercentage: 0.9, ticks: { minRotation: 45, maxRotation: 90 } }],
      yAxes,
    },
  };
}

function chartDataset(label, data, color, options = {}) {
  return {
    label,
    data,
    yAxisID: options.yAxisID ?? 'primary',
    backgroundColor: color,
    borderColor: color,
    borderWidth: options.type === 'line' ? 2 : 1,
    barThickness: options.type === 'line' ? undefined : 10,
    fill: false,
    lineTension: 0,
    pointRadius: options.type === 'line' ? 2 : undefined,
    type: options.type,
  };
}

function MoneybankChart({ ariaLabel, datasets, labels, options }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || labels.length === 0 || !window.Chart) return undefined;
    const chart = new window.Chart(canvasRef.current.getContext('2d'), {
      type: 'bar',
      data: { labels, datasets },
      options,
    });
    return () => chart.destroy();
  }, [datasets, labels, options]);

  return (
    <div className="integratedLvChartBox moneybankLvChartBox">
      <canvas aria-label={ariaLabel} ref={canvasRef} role="img" />
      {labels.length === 0 ? <p>조회된 그래프 데이터가 없습니다.</p> : null}
    </div>
  );
}

function MetricCard({ icon, title, lines }) {
  return (
    <article>
      <div className="colorBox"><img alt="" src={icon} /></div>
      <div className="txtBox">
        <table><tbody>
          <tr><th><h3>{title}</h3></th></tr>
          {lines.map((line) => <tr key={line}><td>{line}</td></tr>)}
        </tbody></table>
      </div>
    </article>
  );
}

function csvCell(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

export function MoneybankIntegratedInfoPage() {
  const isOperationsTab = window.location.pathname.includes('moneybank_tab2');
  const [overview, setOverview] = useState(null);
  const [query, setQuery] = useState({ unit: 'day' });
  const [formValues, setFormValues] = useState({ unit: 'day', fromDate: '', toDate: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let ignore = false;
    async function loadOverview() {
      setIsLoading(true);
      setMessage('');
      try {
        const data = await fetchManagementOverview(query);
        if (!ignore) {
          setOverview(data);
          setFormValues((current) => ({
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
        if (!ignore) setIsLoading(false);
      }
    }
    loadOverview();
    return () => {
      ignore = true;
    };
  }, [query]);

  const summary = overview?.summary;
  const series = useMemo(() => overview?.series ?? [], [overview]);
  const labels = useMemo(() => series.map((row) => formatDate(row.bucket)), [series]);

  const approvedValues = useMemo(() => series.map((row) => row.approved_count ?? 0), [series]);
  const terminatedValues = useMemo(() => series.map((row) => row.terminated_count ?? 0), [series]);
  const periodNetMembers = approvedValues.reduce((total, value, index) => total + value - terminatedValues[index], 0);
  const membershipStart = Math.max(0, Number(summary?.active_contract_count ?? 0) - periodNetMembers);
  const cumulativeMembers = cumulative(approvedValues.map((value, index) => value - terminatedValues[index]), membershipStart);

  const overviewCharts = useMemo(() => {
    const provisionCounts = series.map((row) => row.provision_count ?? 0);
    const provisionAverages = series.map((row) => (
      row.provision_count ? Math.round(Number(row.provision_amount ?? 0) / row.provision_count) : 0
    ));
    const utilization = series.map((row, index) => ratio(row.provision_count, cumulativeMembers[index]));
    return [
      {
        title: '회원 현황',
        ariaLabel: '머니뱅크 신규가입, 가입해지, 누적회원 그래프',
        datasets: [
          chartDataset('신규가입', approvedValues, COLORS.navy),
          chartDataset('가입해지', terminatedValues, COLORS.orange, { type: 'line' }),
          chartDataset('누적회원', cumulativeMembers, COLORS.green, { type: 'line', yAxisID: 'secondary' }),
        ],
        options: chartOptions({ rightAxis: true }),
      },
      {
        title: '이용 현황',
        ariaLabel: '머니뱅크 이용회원, 이용건수, 선정산 평균비용 그래프',
        datasets: [
          chartDataset('이용회원', provisionCounts, COLORS.navy),
          chartDataset('이용건수', provisionCounts, COLORS.orange, { type: 'line' }),
          chartDataset('선정산 평균비용', provisionAverages, COLORS.cyan, { type: 'line', yAxisID: 'secondary' }),
        ],
        options: chartOptions({ rightAxis: true }),
      },
      {
        title: '서비스 이용률',
        ariaLabel: '머니뱅크 누적회원, 이용회원, 서비스 이용률 그래프',
        datasets: [
          chartDataset('누적회원', cumulativeMembers, COLORS.navy),
          chartDataset('이용회원', provisionCounts, COLORS.orange),
          chartDataset('서비스 이용률', utilization, COLORS.green, { type: 'line', yAxisID: 'secondary' }),
        ],
        options: chartOptions({ rightAxis: true }),
      },
    ];
  }, [approvedValues, cumulativeMembers, series, terminatedValues]);

  const operationsCharts = useMemo(() => {
    const requestAmounts = series.map((row) => row.request_amount ?? 0);
    const reviewAmounts = series.map((row) => row.review_amount ?? 0);
    const approvedAmounts = series.map((row) => row.approved_amount ?? 0);
    const approvedTotals = cumulative(approvedAmounts);
    const repaymentTotals = cumulative(series.map((row) => row.repayment_amount ?? 0));
    const balances = series.map((row) => row.outstanding_balance ?? 0);
    return [
      {
        title: '신청/심사/계약',
        ariaLabel: '머니뱅크 신청금액, 심사금액, 계약금액, 계약률 그래프',
        datasets: [
          chartDataset('신청금액', requestAmounts, COLORS.navy),
          chartDataset('심사금액', reviewAmounts, COLORS.orange),
          chartDataset('계약금액', approvedAmounts, COLORS.cyan),
          chartDataset('계약률', approvedAmounts.map((value, index) => ratio(value, requestAmounts[index])), COLORS.green, { type: 'line', yAxisID: 'secondary' }),
        ],
        options: chartOptions({ rightAxis: true }),
      },
      {
        title: '계약/상환/잔액',
        ariaLabel: '머니뱅크 누적계약, 누적상환, 원금잔액, 잔액률 그래프',
        datasets: [
          chartDataset('누적계약', approvedTotals, COLORS.navy),
          chartDataset('누적상환', repaymentTotals, COLORS.orange),
          chartDataset('원금잔액', balances, COLORS.cyan),
          chartDataset('잔액률', balances.map((value, index) => ratio(value, approvedTotals[index])), COLORS.green, { type: 'line', yAxisID: 'secondary' }),
        ],
        options: chartOptions({ rightAxis: true }),
      },
      {
        title: '머니뱅크 수수료',
        ariaLabel: '머니뱅크 수수료와 수수료율 그래프',
        datasets: [
          chartDataset('수수료', series.map((row) => row.repayment_fee ?? 0), COLORS.navy),
          chartDataset('수수료율', series.map((row) => ratio(row.repayment_fee, row.repayment_amount)), COLORS.pink, { type: 'line', yAxisID: 'secondary' }),
        ],
        options: chartOptions({ rightAxis: true }),
      },
    ];
  }, [series]);

  const metricCards = isOperationsTab ? [
    { icon: '/resources/rudicks/admin/img/icon/doc-pen.svg', title: '신규 신청', lines: [`${formatNumber(summary?.contract_today_count)} 건`] },
    { icon: '/resources/rudicks/admin/img/icon/doc-search.svg', title: '신규 심사', lines: [`${formatNumber(summary?.review_today_count)} 건`] },
    { icon: '/resources/rudicks/admin/img/icon/doc-check.png', title: '신규 계약', lines: [`${formatNumber(summary?.approved_today_count)} 건`] },
    { icon: '/resources/rudicks/admin/img/icon/close-round.svg', title: '계약 종료', lines: [`${formatNumber(summary?.terminated_today_count)} 건`] },
  ] : [
    { icon: '/resources/rudicks/admin/img/icon/user-round.png', title: '머니뱅크 가입승인', lines: [`• 금일 : ${formatNumber(summary?.approved_today_count)}`, `• 누적 : ${formatNumber(summary?.contract_total_count)}`] },
    { icon: '/resources/rudicks/admin/img/icon/money-get.svg', title: '서비스 원금 (백만원)', lines: [`• 금일 : ${formatMillion(summary?.provision_today_amount)}`, `• 누적 : ${formatMillion(summary?.provision_total_amount)} / ${formatNumber(summary?.provision_total_count)}건`] },
    { icon: '/resources/rudicks/admin/img/icon/won-round.svg', title: '상환 원금 (백만원)', lines: [`• 금일 : ${formatMillion(summary?.repayment_today_amount)}`, `• 누적 : ${formatMillion(summary?.repayment_total_amount)} / ${formatNumber(summary?.repayment_total_count)}건`] },
    { icon: '/resources/rudicks/admin/img/icon/scale.svg', title: '상환 원금잔액 (백만원)', lines: [`• 누적 : ${formatMillion(summary?.outstanding_balance_amount)}`, `• ${formatNumber(summary?.outstanding_balance_count)}건 / ${summary?.balance_reconcile_status_label ?? '미검증'}`, ...(summary?.opening_repayment_amount > 0 ? [`• 초기이관 상환 : ${formatNumber(summary.opening_repayment_amount)}원`] : [])] },
  ];
  const charts = isOperationsTab ? operationsCharts : overviewCharts;

  function updateFormValue(event) {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  }

  function handleSearch(event) {
    event.preventDefault();
    setQuery({ unit: formValues.unit, from_date: formValues.fromDate, to_date: formValues.toDate });
  }

  function handleDownload() {
    if (series.length === 0) return;
    const columns = ['bucket', 'contract_count', 'review_count', 'approved_count', 'terminated_count', 'request_amount', 'review_amount', 'approved_amount', 'provision_amount', 'provision_count', 'repayment_amount', 'repayment_fee', 'settlement_amount', 'outstanding_balance'];
    const rows = [columns, ...series.map((row) => columns.map((column) => row[column]))];
    const csv = `\ufeff${rows.map((row) => row.map(csvCell).join(',')).join('\r\n')}`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `moneybank-${isOperationsTab ? 'operations' : 'overview'}-${formValues.fromDate}-${formValues.toDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="adminPage integratedInfoPage integratedLvPage moneybankLvPage">
      <div className="m-tab integratedLvTabs moneybankLvTabs">
        <ul>
          <li className={!isOperationsTab ? 'active' : ''}><a href="/admin/cubici/infoIntegrated/moneybank_tab1">현황 종합</a></li>
          <li className={isOperationsTab ? 'active' : ''}><a href="/admin/cubici/infoIntegrated/moneybank_tab2">운영지표</a></li>
        </ul>
      </div>

      <div className="m-options integratedLvOptions">
        <div className="pRight">
          {!isOperationsTab ? <span className="infoArea" title="기준일자는 금일 하루 전(D-1)이며 누적은 기준일까지의 합계입니다."><span className="oiBtn infoBtn navy">정보</span></span> : null}
          <span className="baseDate pRight"><b>기준</b>{formatDate(summary?.standard_date)}</span>
        </div>
      </div>

      <div className="colorTxtBoxArea integratedLvMetricGrid moneybankLvMetricGrid">
        {metricCards.map((card) => <MetricCard key={card.title} {...card} />)}
      </div>

      <form className="m-search searchArea integratedLvSearch moneybankLvSearch" onSubmit={handleSearch}>
        <div className="line">
          <div className="inputBox">
            <label htmlFor="moneybankUnit">분석단위</label>
            <select id="moneybankUnit" name="unit" onChange={updateFormValue} value={formValues.unit}>
              <option value="day">일 단위</option>
              <option value="week">주 단위</option>
              <option value="month">월 단위</option>
            </select>
          </div>
          <div className="inputBox">
            <label htmlFor="moneybankFromDate">시작</label>
            <input id="moneybankFromDate" name="fromDate" onChange={updateFormValue} type="date" value={formValues.fromDate} />
          </div>
          <div className="inputBox">
            <label htmlFor="moneybankToDate">종료</label>
            <input id="moneybankToDate" name="toDate" onChange={updateFormValue} type="date" value={formValues.toDate} />
          </div>
          <button className="sBtn sColorLB search" disabled={isLoading} type="submit">검색</button>
          <button className="sBtn sColorLG excel" disabled={series.length === 0} onClick={handleDownload} type="button">엑셀 다운로드</button>
        </div>
      </form>

      {message ? <div className="m-alert">{message}</div> : null}

      {charts.map((chart) => (
        <article className="subBox integratedLvPanel" key={chart.title}>
          <header><h4>{chart.title}</h4></header>
          <div className="contentArea">
            <MoneybankChart ariaLabel={chart.ariaLabel} datasets={chart.datasets} labels={labels} options={chart.options} />
          </div>
        </article>
      ))}
    </section>
  );
}
