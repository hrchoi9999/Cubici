import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchMemberSummary, fetchMemberSummaryOptions } from '../api/management.js';

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

function MemberSummaryChart({ isLoading, series }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || series.length === 0 || !window.Chart) return undefined;

    const chart = new window.Chart(canvasRef.current.getContext('2d'), {
      type: 'bar',
      data: {
        labels: series.map((row) => formatDate(row.bucket)),
        datasets: [
          {
            label: '누적 큐빅아이',
            data: series.map((row) => row.cubici_cumulative ?? 0),
            yAxisID: 'member-count',
            backgroundColor: '#0049ad',
            borderColor: '#0049ad',
            barThickness: 10,
          },
          {
            type: 'line',
            label: '누적 머니뱅크',
            data: series.map((row) => row.moneybank_cumulative ?? 0),
            yAxisID: 'member-count',
            borderColor: '#f9a268',
            backgroundColor: '#f9a268',
            borderWidth: 2,
            fill: false,
            lineTension: 0,
            pointRadius: 2,
          },
          {
            type: 'line',
            label: '누적 가입해지',
            data: series.map((row) => -(row.terminated_cumulative ?? 0)),
            yAxisID: 'member-count',
            borderColor: '#f95d7e',
            backgroundColor: '#f95d7e',
            borderWidth: 2,
            fill: false,
            lineTension: 0,
            pointRadius: 2,
          },
          {
            type: 'line',
            label: '머니뱅크 %',
            data: series.map((row) => row.moneybank_ratio ?? 0),
            yAxisID: 'moneybank-ratio',
            borderColor: '#26a94b',
            backgroundColor: '#26a94b',
            borderWidth: 2,
            fill: false,
            lineTension: 0,
            pointRadius: 2,
          },
        ],
      },
      options: {
        animation: { duration: 0 },
        maintainAspectRatio: false,
        responsive: true,
        legend: {
          display: true,
          labels: { boxWidth: 13, fontSize: 12 },
        },
        scales: {
          xAxes: [{
            categoryPercentage: 0.8,
            barPercentage: 1,
            ticks: { maxRotation: 90, minRotation: 45 },
          }],
          yAxes: [
            {
              id: 'member-count',
              position: 'left',
              ticks: { beginAtZero: true },
            },
            {
              id: 'moneybank-ratio',
              position: 'right',
              gridLines: { drawOnChartArea: false },
              ticks: {
                beginAtZero: true,
                callback: (value) => `${value}%`,
              },
            },
          ],
        },
      },
    });

    return () => chart.destroy();
  }, [series]);

  return (
    <div className="memberSummaryChartBox">
      <canvas
        aria-label="큐빅아이, 머니뱅크, 가입해지 누적 및 머니뱅크 비율 그래프"
        ref={canvasRef}
        role="img"
      />
      {isLoading ? <p className="memberSummaryChartState">그래프를 조회 중입니다.</p> : null}
      {!isLoading && series.length === 0 ? <p className="memberSummaryChartState">조회된 그래프 데이터가 없습니다.</p> : null}
    </div>
  );
}

function csvCell(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
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
  const [optionMessage, setOptionMessage] = useState('');
  const [partnerOptions, setPartnerOptions] = useState([]);
  const [productOptions, setProductOptions] = useState([]);

  useEffect(() => {
    let ignore = false;

    fetchMemberSummaryOptions().then((options) => {
      if (ignore) return;
      setPartnerOptions(options.partners ?? []);
      setProductOptions(options.products ?? []);
    }).catch((error) => {
      if (!ignore) setOptionMessage(error.message);
    });

    return () => {
      ignore = true;
    };
  }, []);

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
      ['구간', '큐빅아이 증가', '머니뱅크 증가', '해지 증가', '큐빅아이 누적', '머니뱅크 누적', '해지 누적', '머니뱅크 비율'],
      ...series.map((row) => [
        formatDate(row.bucket),
        row.cubici_count,
        row.moneybank_count,
        row.terminated_count,
        row.cubici_cumulative,
        row.moneybank_cumulative,
        row.terminated_cumulative,
        row.moneybank_ratio == null ? '' : `${row.moneybank_ratio.toFixed(2)}%`,
      ]),
    ];
    const csv = `\ufeff${rows.map((row) => row.map(csvCell).join(',')).join('\r\n')}`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `cubici-member-summary-${filters.from_date}-${filters.to_date}.csv`;
    link.click();
    URL.revokeObjectURL(url);
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

      <div className="colorTxtBoxArea memberMetricGrid">
        <article>
          <div className="colorBox">큐빅아이</div>
          <div className="txtBox">
            <table>
              <tbody>
                <tr><td>• 전일 : {formatNumber(metrics?.cubici_yesterday_count)}명</td></tr>
                <tr><td>• 누적 : {formatNumber(metrics?.cubici_total_count)}명</td></tr>
              </tbody>
            </table>
          </div>
        </article>
        <article>
          <div className="colorBox">머니뱅크</div>
          <div className="txtBox">
            <table>
              <tbody>
                <tr><td>• 전일 : {formatNumber(metrics?.moneybank_yesterday_count)}명</td></tr>
                <tr><td>• 누적 : {formatNumber(metrics?.moneybank_total_count)}명</td></tr>
              </tbody>
            </table>
          </div>
        </article>
        <article>
          <div className="colorBox">가입해지</div>
          <div className="txtBox">
            <table>
              <tbody>
                <tr><td>• 전일 : {formatNumber(metrics?.terminated_yesterday_count)}명</td></tr>
                <tr><td>• 누적 : {formatNumber(metrics?.terminated_total_count)}명</td></tr>
              </tbody>
            </table>
          </div>
        </article>
        <article>
          <div className="colorBox">제휴 회원</div>
          <div className="txtBox">
            <table>
              <tbody>
                <tr><td>• 전일 : {formatNumber(metrics?.partner_yesterday_count)}개</td></tr>
                <tr><td>• 누적 : {formatNumber(metrics?.partner_total_count)}개</td></tr>
              </tbody>
            </table>
          </div>
        </article>
      </div>

      <form className="m-search searchArea" onSubmit={handleSearch}>
        <div className="line">
          <div className="inputBox">
            <label htmlFor="memberPartnerCode">협력사</label>
            <select id="memberPartnerCode" name="partnerCode" value={formValues.partnerCode} onChange={updateSearchValue}>
              <option value="">전체</option>
              {partnerOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
          <div className="inputBox">
            <label htmlFor="memberProductCode">서비스 구분</label>
            <select id="memberProductCode" name="productCode" value={formValues.productCode} onChange={updateSearchValue}>
              <option value="">전체</option>
              {productOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
          <div className="inputBox">
            <label htmlFor="memberStatusDivision">구분</label>
            <select id="memberStatusDivision" defaultValue="all">
              <option value="all">전체</option>
            </select>
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
          <button className="sBtn sColorLB search" type="submit">검색</button>
          <button className="sBtn sColorLG excel" disabled={series.length === 0} onClick={handleDownload} type="button">엑셀 다운로드</button>
        </div>
      </form>

      {message ? <div className="m-alert">{message}</div> : null}
      {optionMessage ? <div className="m-alert">{optionMessage}</div> : null}

      <article className="subBox memberTrendPanel">
        <header>
          <h4>회원 현황</h4>
        </header>
        <div className="contentArea">
          <MemberSummaryChart isLoading={isLoading} series={series} />
        </div>
      </article>
    </>
  );
}
