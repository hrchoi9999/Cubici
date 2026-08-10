import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchCubiciIntegratedInfo } from '../api/management.js';

const METRIC_CARDS = [
  { key: 'new_members', title: '큐빅아이 신규가입', icon: '01', kind: 'integer' },
  { key: 'withdrawn_members', title: '큐빅아이 해지회원', icon: '02', kind: 'integer' },
  { key: 'fee_income', title: '이용료 수입 (백만원)', icon: '03', kind: 'million' },
  { key: 'dormant_members', title: '휴면회원 (명)', icon: '04', kind: 'integer' },
  { key: 'sales_amount', title: '매출금액 (백만원)', icon: '05', kind: 'million' },
  { key: 'sales_quantity', title: '판매수량', icon: '06', kind: 'integer' },
  { key: 'settlement_amount', title: '정산금액 (백만원)', icon: '08', kind: 'million' },
  { key: 'sku_count', title: '등록 SKU 수', icon: '07', kind: 'integer' },
  { key: 'visitor_count', title: '방문자 수', icon: '09', kind: 'integer' },
  { key: 'max_concurrent_users', title: '최대동시 접속', icon: '10', kind: 'integer' },
  { key: 'average_usage_minutes', title: '평균 이용시간', icon: '11', kind: 'decimal' },
  { key: 'average_shop_count', title: '평균등록 쇼핑몰', icon: '12', kind: 'decimal' },
];

const CHANNEL_COLORS = ['#0049ad', '#f9a268', '#fe7b90', '#26ccd2', '#8769d1', '#4caf50'];

function formatDate(value) {
  return value ? value.slice(0, 10) : '-';
}

function formatValue(metric, period, kind) {
  if (!metric?.available) return '미집계';
  const value = metric?.[period];
  if (value == null) return '-';
  if (kind === 'million') {
    return (Number(value) / 1_000_000).toLocaleString('ko-KR', { maximumFractionDigits: 2 });
  }
  if (kind === 'decimal') {
    return Number(value).toLocaleString('ko-KR', { maximumFractionDigits: 2 });
  }
  return Number(value).toLocaleString('ko-KR', { maximumFractionDigits: 0 });
}

function chartOptions({ rightAxis = false, stacked = false } = {}) {
  const yAxes = [{
    id: 'primary',
    position: 'left',
    stacked,
    ticks: { beginAtZero: true },
  }];
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
      xAxes: [{
        stacked,
        categoryPercentage: 0.72,
        barPercentage: 0.9,
        ticks: { minRotation: 45, maxRotation: 90 },
      }],
      yAxes,
    },
  };
}

function IntegratedChart({ ariaLabel, datasets, labels, options }) {
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
    <div className="integratedLvChartBox">
      <canvas aria-label={ariaLabel} ref={canvasRef} role="img" />
      {labels.length === 0 ? <p>조회된 그래프 데이터가 없습니다.</p> : null}
    </div>
  );
}

function csvCell(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

export function CubiciIntegratedInfoPage() {
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({ unit: 'day' });
  const [formValues, setFormValues] = useState({
    unit: 'day',
    fromDate: '',
    toDate: '',
    partnerCode: '',
    productCode: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let ignore = false;
    async function loadData() {
      setIsLoading(true);
      setMessage('');
      try {
        const response = await fetchCubiciIntegratedInfo(filters);
        if (!ignore) {
          setData(response);
          setFormValues((current) => ({
            ...current,
            fromDate: current.fromDate || formatDate(response.metrics?.from_date),
            toDate: current.toDate || formatDate(response.metrics?.to_date),
          }));
        }
      } catch (error) {
        if (!ignore) {
          setData(null);
          setMessage(error.message);
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      ignore = true;
    };
  }, [filters]);

  const metrics = data?.metrics;
  const series = useMemo(() => data?.series ?? [], [data]);
  const channels = useMemo(() => data?.channels ?? [], [data]);
  const labels = useMemo(() => series.map((row) => formatDate(row.bucket)), [series]);

  const membershipDatasets = useMemo(() => [
    {
      label: '신규가입',
      data: series.map((row) => row.new_member_count ?? 0),
      yAxisID: 'primary',
      backgroundColor: '#0049ad',
      borderColor: '#0049ad',
      barThickness: 10,
    },
    {
      type: 'line',
      label: '가입해지',
      data: series.map((row) => row.withdrawn_member_count ?? 0),
      yAxisID: 'primary',
      borderColor: '#f9a268',
      backgroundColor: '#f9a268',
      borderWidth: 2,
      fill: false,
      lineTension: 0,
      pointRadius: 2,
    },
    {
      type: 'line',
      label: '누적회원',
      data: series.map((row) => row.cumulative_member_count ?? 0),
      yAxisID: 'secondary',
      borderColor: '#26a94b',
      backgroundColor: '#26a94b',
      borderWidth: 2,
      fill: false,
      lineTension: 0,
      pointRadius: 2,
    },
  ], [series]);

  const periodDatasets = useMemo(() => [
    {
      label: '큐빅아이',
      data: series.map((row) => row.cubici_average_days ?? 0),
      yAxisID: 'primary',
      backgroundColor: '#0049ad',
      barThickness: 10,
    },
    {
      type: 'line',
      label: '머니뱅크',
      data: series.map((row) => row.moneybank_average_days ?? 0),
      yAxisID: 'primary',
      borderColor: '#f9a268',
      backgroundColor: '#f9a268',
      borderWidth: 2,
      fill: false,
      lineTension: 0,
      pointRadius: 2,
    },
  ], [series]);

  const channelDatasets = useMemo(() => channels.map((channel, index) => ({
    label: channel.label,
    data: series.map((row) => row.channel_counts?.[channel.value] ?? 0),
    yAxisID: 'primary',
    backgroundColor: CHANNEL_COLORS[index % CHANNEL_COLORS.length],
    borderColor: CHANNEL_COLORS[index % CHANNEL_COLORS.length],
  })), [channels, series]);

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

  function handleDownload() {
    if (series.length === 0) return;
    const rows = [
      ['기간', '신규가입', '가입해지', '누적회원', '큐빅아이 가입기간', '머니뱅크 가입기간', ...channels.map((item) => item.label)],
      ...series.map((row) => [
        formatDate(row.bucket),
        row.new_member_count,
        row.withdrawn_member_count,
        row.cumulative_member_count,
        row.cubici_average_days,
        row.moneybank_average_days,
        ...channels.map((item) => row.channel_counts?.[item.value] ?? 0),
      ]),
    ];
    const csv = `\ufeff${rows.map((row) => row.map(csvCell).join(',')).join('\r\n')}`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `cubici-integrated-${formValues.fromDate}-${formValues.toDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="adminPage integratedInfoPage integratedLvPage">
      <div className="m-tab integratedLvTabs">
        <ul>
          <li className="active"><a href="/admin/cubici/infoIntegrated/cubici_tab1">종합 지표</a></li>
          <li><a href="/admin/cubici/infoIntegrated/cubici_tab2">매출 지표</a></li>
          <li><a href="/admin/cubici/infoIntegrated/cubici_tab3">활동 지표</a></li>
          <li><a href="/admin/cubici/infoIntegrated/cubici_tab4">이용료 지표</a></li>
        </ul>
      </div>

      <div className="m-options integratedLvOptions">
        <div className="pRight">
          <span className="infoArea" title="금일은 기준일, 당월은 월초부터 기준일, 전월은 전월 전체 합계입니다.">
            <span className="oiBtn infoBtn navy">정보</span>
          </span>
          <span className="baseDate pRight"><b>기준</b>{formatDate(metrics?.standard_date)}</span>
        </div>
      </div>

      <div className="colorTxtBoxArea integratedLvMetricGrid">
        {METRIC_CARDS.map((card) => {
          const metric = metrics?.[card.key];
          return (
            <article key={card.key}>
              <div className="colorBox2">
                <img alt="" src={`/resources/img/icon/icon-${card.icon}.png`} />
              </div>
              <div className="txtBox">
                <table>
                  <tbody>
                    <tr><th><h3>{card.title}</h3></th></tr>
                    <tr><td>• 금일 : {formatValue(metric, 'today', card.kind)}</td></tr>
                    <tr><td>• 당월 : {formatValue(metric, 'current_month', card.kind)}</td></tr>
                    <tr><td>• 전월 : {formatValue(metric, 'previous_month', card.kind)}</td></tr>
                  </tbody>
                </table>
              </div>
            </article>
          );
        })}
      </div>

      <form className="m-search searchArea integratedLvSearch" onSubmit={handleSearch}>
        <div className="line">
          <div className="inputBox">
            <label htmlFor="integratedPartnerCode">협력사</label>
            <select id="integratedPartnerCode" name="partnerCode" onChange={updateSearchValue} value={formValues.partnerCode}>
              <option value="">전체</option>
              {(data?.partners ?? []).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
          <div className="inputBox">
            <label htmlFor="integratedProductCode">서비스</label>
            <select id="integratedProductCode" name="productCode" onChange={updateSearchValue} value={formValues.productCode}>
              <option value="">전체</option>
              {(data?.products ?? []).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
          <div className="inputBox">
            <label htmlFor="integratedUnit">분석단위</label>
            <select id="integratedUnit" name="unit" onChange={updateSearchValue} value={formValues.unit}>
              <option value="day">일 단위</option>
              <option value="week">주 단위</option>
              <option value="month">월 단위</option>
            </select>
          </div>
          <div className="inputBox">
            <label htmlFor="integratedFromDate">시작</label>
            <input id="integratedFromDate" name="fromDate" onChange={updateSearchValue} type="date" value={formValues.fromDate} />
          </div>
          <div className="inputBox">
            <label htmlFor="integratedToDate">종료</label>
            <input id="integratedToDate" name="toDate" onChange={updateSearchValue} type="date" value={formValues.toDate} />
          </div>
          <button className="sBtn sColorLB search" disabled={isLoading} type="submit">검색</button>
          <button className="sBtn sColorLG excel" disabled={series.length === 0} onClick={handleDownload} type="button">엑셀 다운로드</button>
        </div>
      </form>

      {message ? <div className="m-alert">{message}</div> : null}

      <article className="subBox integratedLvPanel">
        <header><h4>회원가입</h4></header>
        <div className="contentArea">
          <IntegratedChart
            ariaLabel="신규가입, 가입해지, 누적회원 그래프"
            datasets={membershipDatasets}
            labels={labels}
            options={chartOptions({ rightAxis: true })}
          />
        </div>
      </article>

      <article className="subBox integratedLvPanel">
        <header><h4>가입 기간</h4></header>
        <div className="contentArea">
          <IntegratedChart
            ariaLabel="큐빅아이와 머니뱅크 평균 가입기간 그래프"
            datasets={periodDatasets}
            labels={labels}
            options={chartOptions()}
          />
        </div>
      </article>

      <article className="subBox integratedLvPanel">
        <header><h4>가입 채널</h4></header>
        <div className="contentArea">
          <IntegratedChart
            ariaLabel="큐빅아이와 제휴사별 가입 채널 그래프"
            datasets={channelDatasets}
            labels={labels}
            options={chartOptions({ stacked: true })}
          />
        </div>
      </article>
    </section>
  );
}
