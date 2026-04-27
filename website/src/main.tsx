import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";

const base = "/resources";
const rudicks = `${base}/rudicks/img`;
const main = `${rudicks}/main`;
const icons = `${base}/img/icon`;

const quickLinks = [
  {
    label: "통합정보",
    title: "스마트한 쇼핑몰 관리",
    accent: "상품분석 및 매출분석",
    icon: `${icons}/calendar02.png`,
    tone: "sky"
  },
  {
    label: "매출정보",
    title: "쇼핑몰별 판매현황",
    accent: "반품/교환, 진행상황",
    icon: `${icons}/write-btn.svg`,
    tone: "pink"
  },
  {
    label: "정산정보",
    title: "큐빅아이 캘린더에서",
    accent: "월정산정보를 한눈에",
    icon: `${icons}/icon-09.png`,
    actions: ["정산 캘린더", "정산상세"],
    tone: "blue"
  },
  {
    label: "머니뱅크",
    title: "필요한 사업 자금을",
    accent: "큐빅아이에서 간편 이용",
    icon: `${icons}/cash.png`,
    actions: ["서비스 소개", "서비스 신청", "서비스 현황"],
    tone: "green"
  }
];

const serviceCards = [
  {
    title: "총 이용원금",
    value: "35,546,000 원",
    icon: `${icons}/won-round.svg`
  },
  {
    title: "총 상환원금",
    value: "23,746,000 원",
    icon: `${icons}/money-get.svg`
  }
];

function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Cubici home">
        <img src={`${rudicks}/logo-w.svg`} alt="Cubici" />
      </a>
      <nav aria-label="주요 메뉴">
        <a href="#integrated">통합정보</a>
        <a href="#sales">매출정보</a>
        <a href="#settlement">정산정보</a>
        <a href="#moneybank">머니뱅크</a>
        <a href="#support">고객지원</a>
      </nav>
      <div className="member-links">
        <span className="user-chip">더브레이브님</span>
        <a href="#logout">로그아웃</a>
        <a href="#mypage">마이페이지</a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero" id="top">
      <Header />
      <div className="hero-inner">
        <div className="hero-copy">
          <h1>큐빅아이</h1>
          <p>
            인공지능 기반의 온라인 쇼핑몰 통합관리 서비스
            <br />
            복잡하고 어려웠던 쇼핑몰 관리를 쉽고 편리하게
            <br />
            바로 확인할 수 있는 차세대 서비스를 경험하세요.
          </p>
          <strong>새로운 e-Commerce 큐빅아이가 시작합니다!</strong>
        </div>

        <div className="monitor" aria-label="큐빅아이 서비스 화면 예시">
          <div className="monitor-frame">
            <img src={`${main}/main-pc-slide01-1.jpg`} alt="" />
          </div>
          <span className="monitor-stand" />
        </div>
      </div>
      <div className="slider-dots" aria-hidden="true">
        <span className="active" />
        <span />
        <span />
        <span />
      </div>
    </section>
  );
}

function SummaryPanel() {
  return (
    <section className="summary-section" aria-labelledby="summary-title">
      <div className="content-grid">
        <article className="dashboard-panel">
          <h2 id="summary-title">매출/정산 한눈에 보기</h2>

          <div className="metric-cards">
            <div className="metric-card primary" id="sales">
              <p>매출총액</p>
              <strong>123,500,000</strong>
              <span>원</span>
              <a href="#sales-detail">내역 상세보기 +</a>
            </div>
            <div className="metric-card outline" id="settlement">
              <p>정산입금</p>
              <strong>123,500,000</strong>
              <span>원</span>
              <a href="#settlement-detail">내역 상세보기 +</a>
            </div>
          </div>

          <div className="balance-card" id="moneybank">
            <div className="balance-head">
              <img src={`${icons}/doc-bank.svg`} alt="" />
              <span>선정산 서비스 이용잔액</span>
              <strong>123,500,000 <small>원</small></strong>
            </div>
            <div className="balance-row">
              {serviceCards.map((card) => (
                <div className="service-stat" key={card.title}>
                  <img src={card.icon} alt="" />
                  <span>{card.title}</span>
                  <strong>{card.value}</strong>
                </div>
              ))}
            </div>
            <div className="balance-row history">
              <img src={`${icons}/doc-check.png`} alt="" />
              <span>선정산 이용내역</span>
              <ul>
                <li>
                  <time>10/10</time>
                  <span>선정산 입금</span>
                  <strong>520,000원</strong>
                  <em>11,800,000원</em>
                </li>
                <li>
                  <time>10/09</time>
                  <span>선정산 상환</span>
                  <strong>680,000원</strong>
                  <em>11,800,000원</em>
                </li>
              </ul>
            </div>
          </div>

          <div className="promo-card" id="integrated">
            <div>
              <h3>큐빅아이의 스마트한 쇼핑몰 관리시스템을 체험하고 싶으시다면?</h3>
              <p>한 달 무료 이용기간을 통해 충분히 이용 후 신청하세요!</p>
              <a href="#trial">1달 무료체험 바로가기</a>
            </div>
            <div>
              <h3>지금 큐빅아이에 가입하시면?</h3>
              <p>1년 이용료 할인을 받으실 수 있습니다.</p>
              <a href="#signup">회원가입 바로가기</a>
            </div>
          </div>
        </article>

        <aside className="quick-panel" aria-labelledby="quick-title">
          <h2 id="quick-title">큐빅아이 바로가기</h2>
          {quickLinks.map((link) => (
            <article className={`quick-card ${link.tone}`} key={link.title}>
              <div>
                <span>{link.label}</span>
                <strong>{link.title}</strong>
                <b>{link.accent}</b>
                {link.actions && (
                  <div className="quick-actions">
                    {link.actions.map((action) => (
                      <a href={`#${action}`} key={action}>
                        {action}
                      </a>
                    ))}
                  </div>
                )}
              </div>
              <img src={link.icon} alt="" />
            </article>
          ))}
        </aside>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer" id="support">
      <div>
        <img src={`${rudicks}/logo-w.svg`} alt="Cubici" />
      </div>
      <address>
        법인명: (주)한국공급망데이터&nbsp;&nbsp; 대표전화: 02-6925-6373&nbsp;&nbsp;
        이메일: admin@koreascf.com&nbsp;&nbsp; 사업자등록번호: 412-87-03180
      </address>
      <a className="top-button" href="#top" aria-label="맨 위로 이동">
        ↑
      </a>
    </footer>
  );
}

function App() {
  return (
    <main>
      <Hero />
      <SummaryPanel />
      <Footer />
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
