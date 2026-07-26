const adminMenu = [
  {
    id: 'cubiciInfo',
    title: '통합정보',
    pages: [
      { id: 'cubici', title: '큐빅아이', href: '/admin/cubici/infoIntegrated/cubici_tab1' },
      { id: 'moneybank', title: '머니뱅크', href: '/admin/cubici/infoIntegrated/moneybank_tab1' },
    ],
  },
  {
    id: 'memberInfo',
    title: '회원관리',
    pages: [
      { id: 'member', title: '회원현황', href: '/admin/cubici/manageMember/member_tab1' },
      { id: 'payment', title: '결제관리', href: '/admin/cubici/manageMember/payment_tab1' },
    ],
  },
  {
    id: 'moneybankManagement',
    title: '머니뱅크 관리',
    pages: [
      { id: 'integrated', title: '통합 현황', href: '/admin/moneybank/cubici/management/info_tab1' },
      { id: 'usage', title: '이용상세', href: '/admin/moneybank/management/usageList' },
    ],
  },
  {
    id: 'moneybankOperation',
    title: '머니뱅크 운영',
    pages: [
      { id: 'request', title: '신청 접수', href: '/admin/moneybank/request' },
      { id: 'approval', title: '심사 승인', href: '/admin/moneybank/approval_tab1' },
      { id: 'settlement', title: '정산 관리', href: '/admin/moneybank/settlement' },
      { id: 'redemption', title: '상환 관리', href: '/admin/moneybank/redemption' },
      { id: 'manage', title: '프리즘 지표 관리', href: '/admin/moneybank/manage' },
    ],
  },
  {
    id: 'supportMember',
    title: '고객관리',
    pages: [
      { id: 'inquiry', title: '고객문의', href: '/admin/cubici/supportMember/manageInquiry' },
      { id: 'message', title: '문자/이메일', href: '/admin/cubici/supportMember/manageSms' },
      { id: 'notice', title: '고객 공지 관리', href: '/admin/cubici/supportMember/manageBoard_tab1' },
    ],
  },
  {
    id: 'monitorInfo',
    title: '모니터링',
    pages: [
      { id: 'error', title: 'Error Log', href: '/admin/cubici/adminMonitor/error_report' },
      { id: 'server', title: '서버 관리', href: '/admin/cubici/adminMonitor/server_monitor' },
    ],
  },
  {
    id: 'preferInfo',
    title: '환경설정',
    pages: [
      { id: 'admin', title: '관리자 등록', href: '/admin/cubici/adminPreference/adminRegister_tab1' },
      { id: 'charge', title: '요금제 관리', href: '/admin/cubici/adminPreference/manageCharge' },
      { id: 'promotion', title: '연계코드 관리', href: '/admin/cubici/adminPreference/managePromotion' },
      { id: 'partner', title: '협력사 관리', href: '/admin/cubici/adminPreference/managePartner' },
      { id: 'moneybank', title: '머니뱅크 관리', href: '/admin/cubici/adminPreference/manageMoneybank_tab1' },
      { id: 'prizm', title: 'Prism System', href: '/admin/cubici/adminPreference/prizmConfig' },
    ],
  },
];

function LoadingSpinner() {
  return (
    <div className="loadingSpinner" style={{ zIndex: 1000000, display: 'none' }} aria-hidden="true">
      {Array.from({ length: 12 }, (_, index) => (
        <i key={index} />
      ))}
    </div>
  );
}

function AdminHeader() {
  return (
    <header id="header">
      <div className="topLine">
        <div className="inner">
          <div className="logo">
            <a href="/admin">
              <img src="/resources/rudicks/img/logo-w.svg" alt="Cubici" />
            </a>
          </div>
          <div className="userMenu">
            <div className="userInfo">admin 님, 안녕하세요!</div>
            <div className="btns">
              <a href="/logout" className="sBtn bsColorN hrBtn modalOpen">
                로그아웃
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function AdminSidebar({ activeCategoryId, activePageId }) {
  return (
    <aside className="snbArea">
      <ul id="snb">
        {adminMenu.map((category) => (
          <li key={category.id} id={category.id} className={category.id === activeCategoryId ? 'active' : ''}>
            <a href="javascript:;">{category.title}</a>
            <ul>
              {category.pages.map((page) => (
                <li key={page.id} className={category.id === activeCategoryId && page.id === activePageId ? 'active' : ''}>
                  <a href={page.href}>{page.title}</a>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function CommonModal({ id }) {
  return (
    <div className="modal-container alert-pass nresetClose" id={id}>
      <div className="modal-wrapper">
        <header>
          <h2>서비스 안내</h2>
          <a href="javascript:;" className="modalClose">
            닫기
          </a>
        </header>
        <div className="alert-content">
          <div className="alert-txt">
            <div className="txtBox" style={{ textAlign: 'center', padding: 0 }} />
          </div>
          <div className="btnArea">
            <a href="javascript:;" className="modalClose sBtn sColorLS2">
              확인
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminLayout({ activeCategoryId, activePageId, children }) {
  const activeCategory = adminMenu.find((category) => category.id === activeCategoryId);
  const activePage = activeCategory?.pages.find((page) => page.id === activePageId);

  return (
    <>
      <LoadingSpinner />
      <div id="wrap">
        <AdminHeader />
        <div className="container">
          <figure className="subVisualArea">
            <div className="inner">
              <div className="subVisual">
                <div className="txtBox">
                  <h2>{activeCategory?.title ?? ''}</h2>
                  <h3>{activePage?.title ?? ''}</h3>
                </div>
              </div>
            </div>
          </figure>
          <div className="subContainer" id="subNavigation">
            <div className="inner">
              <AdminSidebar activeCategoryId={activeCategoryId} activePageId={activePageId} />
              <div className="subContents">{children}</div>
            </div>
          </div>
        </div>
      </div>
      <CommonModal id="modal-info" />
      <CommonModal id="modal-reload" />
    </>
  );
}
