import React from "react";
import ReactDOM from "react-dom/client";
import {
  Banknote,
  BarChart3,
  CalendarCheck,
  ChevronRight,
  Database,
  MonitorCog,
  PackageCheck,
  ShieldCheck,
  TrendingUp
} from "lucide-react";
import "./styles.css";

const img = "/resources/rudicks/img";
const mainImg = `${img}/main`;

const navItems = ["통합정보", "매출정보", "정산관리", "재고정보", "머니뱅크", "고객지원"];

const tabs = [
  { icon: MonitorCog, title: "통합정보", desc: "온라인 사업 현황을 한눈에" },
  { icon: BarChart3, title: "매출정보", desc: "채널별 매출과 추이 분석" },
  { icon: CalendarCheck, title: "정산관리", desc: "입금 예정과 누락 점검" },
  { icon: PackageCheck, title: "재고정보", desc: "상품 흐름과 재고 리스크" },
  { icon: Banknote, title: "머니뱅크", desc: "자금 흐름 통합 관리" }
];

const features = [
  {
    kicker: "Integrated management",
    title: "흩어진 쇼핑몰 데이터를 하나의 화면으로",
    desc: "자사몰, 오픈마켓, 소셜커머스, 라이브 채널의 주문과 정산 데이터를 연결해 매출, 상품, 고객 흐름을 빠르게 확인합니다.",
    image: `${mainImg}/panel2/av01-p01-2.png`,
    points: ["채널별 매출 현황", "상품별 성과 분석", "주문/취소/반품 추적"]
  },
  {
    kicker: "Sales intelligence",
    title: "매출 변화와 회수 가능 금액을 바로 확인",
    desc: "일자별, 채널별, 상품별 매출 지표를 정리하고 정산 예정 금액과 실제 입금 흐름을 비교해 이상 징후를 줄입니다.",
    image: `${mainImg}/av02-ipad2.png`,
    points: ["매출 추이 리포트", "미정산 금액 관리", "입금 지연 알림"]
  },
  {
    kicker: "Settlement control",
    title: "정산 누락과 지연을 놓치지 않는 운영 체계",
    desc: "복잡한 판매 채널 정산 구조를 캘린더와 리포트로 정리해 운영자가 매일 확인해야 할 항목을 명확하게 보여줍니다.",
    image: `${mainImg}/av03-calendar01.png`,
    points: ["정산 캘린더", "누락 항목 점검", "증빙 자료 관리"]
  },
  {
    kicker: "Inventory signal",
    title: "재고 흐름까지 연결되는 사업 분석",
    desc: "판매 속도와 재고 변화를 함께 보며 품절, 과재고, 채널별 상품 편차를 더 빠르게 파악할 수 있습니다.",
    image: `${mainImg}/av04-phone.png`,
    points: ["상품 회전율", "채널별 재고 비교", "리스크 상품 감지"]
  }
];

const metrics = [
  { label: "연결 채널", value: "12+", note: "쇼핑몰, 마켓, 내부 시스템" },
  { label: "데이터 범위", value: "5개", note: "매출, 정산, 재고, 고객, 자금" },
  { label: "운영 방식", value: "통합", note: "분석과 보고를 한 화면에서" }
];

function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="#home" aria-label="Cubici home">
        <img src={`${img}/logo-w.svg`} alt="Cubici" />
      </a>
      <nav aria-label="주요 메뉴">
        {navItems.map((item) => (
          <a href={`#${item}`} key={item}>
            {item}
          </a>
        ))}
      </nav>
      <a className="trial-link" href="#contact">
        무료체험
      </a>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-bg" />
      <Header />
      <div className="hero-inner">
        <div className="hero-copy">
          <p className="eyebrow">Business analysis solution</p>
          <h1>온라인 사업의 모든 흐름을 하나로 연결합니다.</h1>
          <p>
            Cubici는 매출, 정산, 재고, 자금 흐름을 통합해 운영자가 매일 봐야 하는 지표를
            빠르고 선명하게 보여주는 데이터 분석 서비스입니다.
          </p>
          <div className="hero-actions">
            <a className="primary-action" href="#통합정보">
              주요 기능 보기
              <ChevronRight size={18} />
            </a>
            <a className="secondary-action" href="#contact">
              도입 문의
            </a>
          </div>
        </div>

        <div className="hero-visual" aria-label="Cubici dashboard preview">
          <div className="monitor">
            <img className="monitor-screen" src={`${mainImg}/main-pc-slide01-1.jpg`} alt="" />
            <img className="monitor-glare" src={`${mainImg}/main-slide01-glare.png`} alt="" />
          </div>
          <img className="monitor-bottom" src={`${mainImg}/main-slide01-bottom.png`} alt="" />
        </div>
      </div>
    </section>
  );
}

function FeatureTabs() {
  return (
    <section className="feature-tabs" aria-label="Cubici 기능 분류">
      {tabs.map(({ icon: Icon, title, desc }, index) => (
        <a className={index === 0 ? "active" : ""} href={`#${title}`} key={title}>
          <Icon size={28} />
          <strong>{title}</strong>
          <span>{desc}</span>
        </a>
      ))}
    </section>
  );
}

function FeatureSection() {
  return (
    <section className="feature-list">
      {features.map((feature, index) => (
        <article className="feature-row" id={tabs[index]?.title} key={feature.title}>
          <div className="feature-copy">
            <p className="eyebrow dark">{feature.kicker}</p>
            <h2>{feature.title}</h2>
            <p>{feature.desc}</p>
            <ul>
              {feature.points.map((point) => (
                <li key={point}>
                  <ShieldCheck size={18} />
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div className="feature-image">
            <img src={feature.image} alt="" />
          </div>
        </article>
      ))}
    </section>
  );
}

function InsightPanel() {
  return (
    <section className="insight-panel" id="머니뱅크">
      <div className="insight-copy">
        <p className="eyebrow">Cubici dashboard</p>
        <h2>보고서가 아니라, 바로 움직일 수 있는 운영 화면</h2>
        <p>
          필요한 데이터만 모아 보여주고, 정산 지연과 상품 리스크처럼 액션이 필요한 항목을
          먼저 드러내 운영 시간을 줄입니다.
        </p>
        <div className="metric-grid">
          {metrics.map((metric) => (
            <div key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <p>{metric.note}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mockup-card">
        <img src={`${mainImg}/visual-mac-mockup.png`} alt="" />
        <div className="floating-stat top">
          <TrendingUp size={18} />
          매출 추이 분석
        </div>
        <div className="floating-stat bottom">
          <Database size={18} />
          정산 데이터 통합
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer" id="contact">
      <img src={`${img}/logo-w.svg`} alt="Cubici" />
      <div>
        <strong>데이터 기반 온라인 사업 관리, Cubici</strong>
        <p>기존 Cubici 디자인 자산을 기반으로 Cloudflare Pages 배포 준비가 된 홈페이지입니다.</p>
      </div>
      <a href="mailto:contact@cubici.co.kr">contact@cubici.co.kr</a>
    </footer>
  );
}

function App() {
  return (
    <main>
      <Hero />
      <FeatureTabs />
      <FeatureSection />
      <InsightPanel />
      <Footer />
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
