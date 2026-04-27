import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";

const rudicksImg = "/resources/rudicks/img";
const rudicksMain = `${rudicksImg}/main`;
const latestMain = "/resources/img/main";
const icon = "/resources/img/icon";

const navItems = ["통합정보", "매출정보", "정산관리", "재고정보", "머니뱅크"];

const heroSlides = [
  {
    className: "visual01",
    label: "01",
    title: "인공지능 기반 온라인 쇼핑몰 통합관리 서비스",
    desc: "복잡하고 어려웠던 쇼핑몰 관리를 쉽고 편리하게 바로 확인할 수 있는 차세대 서비스입니다."
  },
  {
    className: "visual02",
    label: "02",
    title: "상상이상의 혁신적 기능",
    desc: "쇼핑몰 현황을 한눈에 확인하고 판매부터 재고까지 한 번에 관리합니다."
  },
  {
    className: "visual03",
    label: "03",
    title: "상품정보 입력 없이 판매재고를 관리합니다",
    desc: "회원가입만으로 상품정보를 자동 취합하고 재고정보를 바로 업데이트합니다."
  },
  {
    className: "visual04",
    label: "04",
    title: "운영자금이 필요할 때 바로 연결되는 머니뱅크",
    desc: "온라인 금융 서비스 머니뱅크가 비대면 방식으로 사업 운영자금을 지원합니다."
  }
];

const featureTabs = [
  { id: "integrated", title: "통합정보", icon: `${icon}/tab-con01-hover.png` },
  { id: "sales", title: "매출정보", icon: `${icon}/tab-con02-hover.png` },
  { id: "settlement", title: "정산관리", icon: `${icon}/calendar.svg` },
  { id: "stock", title: "재고정보", icon: `${icon}/store.png` },
  { id: "moneybank", title: "머니뱅크", icon: `${icon}/money-get.svg` }
];

const featureSections = [
  {
    id: "integrated",
    title: "경영상황을 한눈에, 직관적으로 표시합니다.",
    image: `${rudicksMain}/panel2/av01-p01-2.png`,
    className: "integrated",
    points: ["당월 주요지표", "상품 분석", "매출 분석"]
  },
  {
    id: "sales",
    title: "매출관리의 모든 정보를 한 곳에서 편리하게",
    image: `${rudicksMain}/av02-ipad2.png`,
    className: "sales",
    points: ["판매상태 검색", "상품별 매출 분석", "엑셀 다운로드"]
  },
  {
    id: "settlement",
    title: "쇼핑몰 정산금액을 캘린더로 편리하게",
    image: `${rudicksMain}/av03-calendar01-2.png`,
    className: "settlement",
    points: ["정산 캘린더", "상세 정산내역", "정산 검색"]
  },
  {
    id: "stock",
    title: "상품정보 입력 없이 재고정보를 확인합니다.",
    image: `${rudicksMain}/av04-phone-2.png`,
    className: "stock",
    points: ["자동 상품 취합", "같은 상품 묶음 관리", "상세 상품정보 확인"]
  },
  {
    id: "moneybank",
    title: "온라인 금융의 새로운 사업자금 확보 방식",
    image: `${rudicksMain}/av05-macbook.png`,
    className: "moneybank",
    points: ["비대면 신청", "운영자금 지원", "제휴 금융 서비스"]
  }
];

const partners = [
  "지마켓",
  "옥션",
  "11번가",
  "쿠팡",
  "인터파크",
  "스마트스토어",
  "SSG",
  "티몬",
  "위메프",
  "CJ Mall",
  "롯데ON",
  "GS Shop"
];

function Header() {
  return (
    <header className="site-header">
      <a href="#top" className="brand" aria-label="Cubici">
        <img src={`${rudicksImg}/logo-w.svg`} alt="Cubici" />
      </a>
      <nav aria-label="주요 메뉴">
        {navItems.map((item) => (
          <a href={`#${featureTabs.find((tab) => tab.title === item)?.id ?? "top"}`} key={item}>
            {item}
          </a>
        ))}
      </nav>
      <a className="header-cta" href="#start">
        1개월 무료이용
      </a>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero" id="top">
      <Header />
      <div className="hero-layout">
        <div className="hero-copy">
          <p className="eyebrow">Cubici e-Commerce management</p>
          <h1>온라인 사업의 모든 흐름을 하나로 연결합니다.</h1>
          <p>
            Cubici는 쇼핑몰 통합관리, 매출, 정산, 재고, 자금 흐름을 한 화면에 담아
            온라인 사업자가 더 빠르고 정확하게 운영 현황을 판단하도록 돕습니다.
          </p>
          <div className="hero-actions" id="start">
            <a href="#moneybank" className="primary-action">
              머니뱅크 보기
            </a>
            <a href="#integrated" className="secondary-action">
              주요 기능 보기
            </a>
          </div>
        </div>

        <div className="latest-visual" aria-label="2023 latest MoneyBank visual">
          <span className="visual-bg" />
          <img className="money-img i01" src={`${latestMain}/main-slide04-img04.png`} alt="" />
          <img className="money-img i02" src={`${latestMain}/main-slide04-img01.png`} alt="" />
          <img className="money-img i03" src={`${latestMain}/main-slide04-img02.png`} alt="" />
          <img className="money-img i04" src={`${latestMain}/main-slide04-img03.png`} alt="" />
        </div>
      </div>

      <div className="slide-summary" aria-label="main slide summary">
        {heroSlides.map((slide, index) => (
          <article className={slide.className} key={slide.title}>
            <span>{slide.label}</span>
            <strong>{slide.title}</strong>
            <p>{slide.desc}</p>
            <i>{index === 3 ? "2023.03 추가 슬라이드" : "기존 메인 슬라이드"}</i>
          </article>
        ))}
      </div>
    </section>
  );
}

function FeatureNav() {
  return (
    <section className="feature-nav" aria-label="서비스 영역">
      {featureTabs.map((tab, index) => (
        <a className={index === 0 ? "active" : ""} href={`#${tab.id}`} key={tab.id}>
          <img src={tab.icon} alt="" />
          <span>{tab.title}</span>
        </a>
      ))}
    </section>
  );
}

function FeatureRows() {
  return (
    <section className="feature-rows">
      {featureSections.map((feature) => (
        <article className={`feature-row ${feature.className}`} id={feature.id} key={feature.id}>
          <div className="feature-media">
            <img src={feature.image} alt="" />
            {feature.id === "integrated" && (
              <>
                <img className="overlay-card card-one" src={`${rudicksMain}/panel2/av01-p02.png`} alt="" />
                <img className="overlay-card card-two" src={`${rudicksMain}/panel2/av01-p03.png`} alt="" />
              </>
            )}
            {feature.id === "stock" && (
              <img className="overlay-card bubble" src={`${rudicksMain}/av04-bubble01-2.png`} alt="" />
            )}
          </div>
          <div className="feature-copy">
            <p className="eyebrow">Cubici service</p>
            <h2>{feature.title}</h2>
            <ul>
              {feature.points.map((point, index) => (
                <li key={point}>
                  <img src={`${icon}/icon-0${Math.min(index + 1, 9)}.png`} alt="" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </article>
      ))}
    </section>
  );
}

function PartnerArea() {
  return (
    <section className="partner-area">
      <h2>
        주요 쇼핑몰과의 연동을
        <br />
        지속적으로 확대하고 있습니다.
      </h2>
      <div className="partner-grid">
        {partners.map((partner) => (
          <span key={partner}>{partner}</span>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <img src={`${rudicksImg}/logo-w.svg`} alt="Cubici" />
      <p>온라인 쇼핑몰 통합관리와 사업자금 흐름을 연결하는 Cubici 서비스입니다.</p>
      <a href="mailto:contact@cubici.co.kr">contact@cubici.co.kr</a>
    </footer>
  );
}

function App() {
  return (
    <main>
      <Hero />
      <FeatureNav />
      <FeatureRows />
      <PartnerArea />
      <Footer />
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
