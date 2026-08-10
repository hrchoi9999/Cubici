import { useEffect, useMemo, useRef } from 'react';
import Chart from 'chart.js/auto';

const SHOP_COLORS = ['#0049ad', '#f9a268', '#3de962', '#fe7b90', '#26ccd2', '#7c2dde', '#9cbae4'];
const SHOP_NAMES = {
  STREET11: '11번가',
  GMARKET: 'G마켓',
  AUCTION: '옥션',
  COUPANG: '쿠팡',
  NAVER: '네이버',
  INTERPARK: '인터파크',
  CAFE24: '카페24',
  KAKAO: '카카오쇼핑',
  SSG: '신세계스토어',
  GRIP: '그립',
};

function amountLabel(value) {
  return `${Number(value ?? 0).toLocaleString('ko-KR')}원`;
}

function useChart(config) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !config) return undefined;
    chartRef.current?.destroy();
    chartRef.current = new Chart(canvasRef.current, config);
    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [config]);

  return canvasRef;
}

function ChartPanel({ title, children, empty }) {
  return (
    <div className="chart-wrap u09-live-chart-panel">
      <div className="chart-header">
        <h3 className="chart-tit">{title}</h3>
      </div>
      <div className="chart-over">
        <div className="chart-con u09-live-chart">
          {empty ? <p className="u09-chart-empty">조회된 판매 데이터가 없습니다.</p> : children}
        </div>
      </div>
    </div>
  );
}

function DoughnutChart({ rows }) {
  const config = useMemo(() => ({
    type: 'doughnut',
    data: {
      labels: rows.map((row) => SHOP_NAMES[row.shop_type] ?? row.shop_type),
      datasets: [{
        data: rows.map((row) => row.payment_amount),
        backgroundColor: SHOP_COLORS,
        borderColor: '#fff',
        borderWidth: 3,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '57%',
      plugins: {
        legend: { position: 'right', labels: { boxWidth: 12, boxHeight: 12, padding: 18, font: { size: 13 } } },
        tooltip: { callbacks: { label: (context) => `${context.label}: ${amountLabel(context.raw)}` } },
      },
    },
  }), [rows]);
  const ref = useChart(config);
  return <canvas ref={ref} role="img" aria-label="쇼핑몰별 결제 비중 원형 그래프" />;
}

function PromotionChart({ rows }) {
  const config = useMemo(() => ({
    type: 'bar',
    data: {
      labels: rows.map((row) => SHOP_NAMES[row.shop_type] ?? row.shop_type),
      datasets: [
        { label: '실판매액', data: rows.map((row) => row.payment_amount), backgroundColor: '#f9a268', borderColor: '#f9a268', yAxisID: 'amount' },
        { label: '판매가격', data: rows.map((row) => row.sales_amount), backgroundColor: '#0049ad', borderColor: '#0049ad', yAxisID: 'amount' },
        { label: '할인/판촉률', data: rows.map((row) => row.promotion_rate), type: 'line', borderColor: '#23c552', backgroundColor: '#23c552', pointRadius: 4, pointHoverRadius: 6, tension: 0, yAxisID: 'rate' },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      scales: {
        amount: { beginAtZero: true, ticks: { callback: (value) => Number(value).toLocaleString('ko-KR') }, grid: { color: '#edf0f5' } },
        rate: { beginAtZero: true, position: 'right', grid: { drawOnChartArea: false }, ticks: { callback: (value) => `${value}%` } },
        x: { grid: { display: false } },
      },
      plugins: {
        legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'rect', padding: 18 } },
        tooltip: { callbacks: { label: (context) => context.dataset.yAxisID === 'rate' ? `${context.dataset.label}: ${context.raw}%` : `${context.dataset.label}: ${amountLabel(context.raw)}` } },
      },
    },
  }), [rows]);
  const ref = useChart(config);
  return <canvas ref={ref} role="img" aria-label="쇼핑몰 가격할인 및 판촉 그래프" />;
}

function TopProductsChart({ rows }) {
  const config = useMemo(() => ({
    type: 'bar',
    data: {
      labels: rows.map((row) => row.product_name),
      datasets: [{ label: '결제액', data: rows.map((row) => row.payment_amount), backgroundColor: '#0049ad', borderRadius: 2 }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { beginAtZero: true, ticks: { callback: (value) => Number(value).toLocaleString('ko-KR') }, grid: { color: '#edf0f5' } },
        y: { grid: { display: false }, ticks: { autoSkip: false } },
      },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (context) => amountLabel(context.raw) } },
      },
    },
  }), [rows]);
  const ref = useChart(config);
  return <canvas ref={ref} role="img" aria-label="TOP 10 매출상품 그래프" />;
}

export default function ProductAnalysisCharts({ analysis, loading }) {
  const shops = analysis?.shop_breakdown ?? [];
  const products = analysis?.top_products ?? [];
  const empty = !loading && shops.length === 0;

  return (
    <div className="final-chart-grid u09-chart-stack" aria-busy={loading ? 'true' : 'false'}>
      <ChartPanel title="쇼핑몰 결제 비중" empty={empty}>
        <DoughnutChart rows={shops} />
      </ChartPanel>
      <ChartPanel title="쇼핑몰 가격할인 및 판촉" empty={empty}>
        <PromotionChart rows={shops} />
      </ChartPanel>
      <ChartPanel title="TOP 10 매출상품" empty={!loading && products.length === 0}>
        <TopProductsChart rows={products} />
      </ChartPanel>
    </div>
  );
}
