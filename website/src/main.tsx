import React from "react";
import ReactDOM from "react-dom/client";
import { AlertTriangle, BarChart3, CheckCircle2, Database, LineChart, ShieldCheck } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import "./styles.css";

const revenue = [
  { month: "1월", sales: 118, recoverable: 72 },
  { month: "2월", sales: 126, recoverable: 79 },
  { month: "3월", sales: 141, recoverable: 85 },
  { month: "4월", sales: 153, recoverable: 97 },
  { month: "5월", sales: 168, recoverable: 109 },
  { month: "6월", sales: 181, recoverable: 118 }
];

const channels = [
  { name: "자사몰", value: 42 },
  { name: "오픈마켓", value: 31 },
  { name: "라이브", value: 16 },
  { name: "기타", value: 11 }
];

const riskRows = [
  { company: "A 커머스", score: 86, status: "안정", settlement: "D+2" },
  { company: "B 리테일", score: 74, status: "관찰", settlement: "D+5" },
  { company: "C 스토어", score: 61, status: "주의", settlement: "D+7" }
];

function App() {
  return (
    <main className="app-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Commerce settlement intelligence</p>
          <h1>Cubici</h1>
          <p>
            판매 채널, 주문, 정산 예정금, 반품과 상환 흐름을 한 화면에서 읽고
            사업자의 현금흐름 판단을 돕는 분석형 서비스 데모입니다.
          </p>
          <div className="hero-actions">
            <a href="#dashboard" className="primary-action">데모 대시보드 보기</a>
            <a href="#contact" className="secondary-action">문의하기</a>
          </div>
        </div>
        <div className="hero-panel" aria-label="Cubici 주요 지표">
          <div>
            <span>예상 매출</span>
            <strong>18.1억</strong>
          </div>
          <div>
            <span>회수 가능 정산</span>
            <strong>11.8억</strong>
          </div>
          <div>
            <span>리스크 알림</span>
            <strong>3건</strong>
          </div>
        </div>
      </section>

      <section className="feature-band">
        <article>
          <Database size={22} />
          <h2>데이터 수집</h2>
          <p>채널별 판매, 주문, 취소, 반품, 정산 예정 정보를 표준 구조로 정리합니다.</p>
        </article>
        <article>
          <BarChart3 size={22} />
          <h2>분석 리포트</h2>
          <p>월별 매출, 채널 분산도, 상환 지연 위험과 업체별 스코어를 제공합니다.</p>
        </article>
        <article>
          <ShieldCheck size={22} />
          <h2>안전한 데모</h2>
          <p>운영 DB, 결제, SMS, 외부 API와 분리된 샘플 데이터만 사용합니다.</p>
        </article>
      </section>

      <section className="dashboard" id="dashboard">
        <div className="section-heading">
          <p className="eyebrow">Demo dashboard</p>
          <h2>관리자 데모 화면</h2>
        </div>

        <div className="dashboard-grid">
          <article className="chart-card wide">
            <div className="card-title">
              <LineChart size={20} />
              <h3>매출과 회수 가능 정산</h3>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={revenue}>
                <CartesianGrid stroke="#d7dee8" strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="sales" stroke="#0f766e" fill="#99f6e4" name="예상 매출" />
                <Area type="monotone" dataKey="recoverable" stroke="#b45309" fill="#fde68a" name="회수 가능 정산" />
              </AreaChart>
            </ResponsiveContainer>
          </article>

          <article className="chart-card">
            <div className="card-title">
              <BarChart3 size={20} />
              <h3>채널 분산도</h3>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={channels}>
                <CartesianGrid stroke="#d7dee8" strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#2563eb" name="비중" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </article>
        </div>

        <div className="risk-table">
          <div className="card-title">
            <AlertTriangle size={20} />
            <h3>업체별 리스크 스코어</h3>
          </div>
          <table>
            <thead>
              <tr>
                <th>업체</th>
                <th>스코어</th>
                <th>상태</th>
                <th>정산 주기</th>
              </tr>
            </thead>
            <tbody>
              {riskRows.map((row) => (
                <tr key={row.company}>
                  <td>{row.company}</td>
                  <td>{row.score}</td>
                  <td><span className={`status ${row.status}`}>{row.status}</span></td>
                  <td>{row.settlement}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="contact" id="contact">
        <CheckCircle2 size={22} />
        <div>
          <h2>1차 공개 목표</h2>
          <p>소개 사이트, 샘플 기반 관리자 데모, 사업자용 분석 자료를 먼저 공개합니다.</p>
        </div>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
