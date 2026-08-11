import { useEffect, useState } from 'react';

export const adminMenu = [
  {
    id: 'memberInfo',
    title: '회원관리',
    pages: [
      { id: 'member', title: '회원 현황', href: '/admin/cubici/manageMember/member_tab1' },
    ],
  },
  {
    id: 'shoppingIntegrated',
    title: '쇼핑몰 통합',
    pages: [
      { id: 'integrated', title: '통합 현황', href: '/admin/cubici/infoIntegrated/cubici_tab1' },
      { id: 'payment', title: '결제 관리', href: '/admin/cubici/manageMember/payment_tab1' },
    ],
  },
  {
    id: 'moneybankOperation',
    title: '머니뱅크 운영',
    pages: [
      { id: 'integrated', title: '통합 현황', href: '/admin/moneybank/cubici/management/info_tab1' },
      { id: 'service', title: '서비스 현황', href: '/admin/cubici/infoIntegrated/moneybank_tab1' },
      { id: 'usage', title: '이용 상세', href: '/admin/moneybank/management/usageList' },
      { id: 'request', title: '신청/승인', href: '/admin/moneybank/request' },
      { id: 'approval', title: '심사 승인', href: '/admin/moneybank/approval_tab1' },
      { id: 'contract', title: '계약/상환', href: '/admin/moneybank/approval_tab2' },
      { id: 'settlement', title: '정산 관리', href: '/admin/moneybank/settlement' },
      { id: 'redemption', title: '상환 관리', pageTitle: '계약/상환', href: '/admin/moneybank/redemption' },
      { id: 'funding', title: '자금조달 관리', pageTitle: '자금조달관리', href: '/admin/moneybank/funding' },
      { id: 'manage', title: '신용평가지표', href: '/admin-spa?view=prism-management' },
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
      { id: 'fintech', title: '펌뱅킹 전문', href: '/admin/cubici/adminMonitor/fintech_trade' },
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
      { id: 'prizm', title: 'Prism System', href: '/admin-spa?view=prism-config' },
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

function AdminHeader({ adminSession, isNavigationOpen, onToggleNavigation }) {
  const adminEmail = adminSession?.user?.email ?? 'admin@example.com';

  return (
    <header id="header">
      <div className="topLine">
        <div className="inner">
          <div className="logo">
            <a href="/admin">
              <img src="/resources/rudicks/img/logo-w.svg" alt="Cubici" />
            </a>
          </div>
          <button
            aria-controls="admin-navigation"
            aria-expanded={isNavigationOpen}
            aria-label={isNavigationOpen ? '관리자 메뉴 닫기' : '관리자 메뉴 열기'}
            className="adminNavigationToggle"
            onClick={onToggleNavigation}
            type="button"
          >
            <span aria-hidden="true" />
          </button>
          <div className="userMenu">
            <div className="userInfo">{adminEmail} 님, 안녕하세요!</div>
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
  const [openCategoryId, setOpenCategoryId] = useState(activeCategoryId);

  useEffect(() => {
    setOpenCategoryId(activeCategoryId);
  }, [activeCategoryId]);

  function toggleCategory(categoryId) {
    setOpenCategoryId((current) => (
      current === categoryId && categoryId !== activeCategoryId ? activeCategoryId : categoryId
    ));
  }

  return (
    <aside className="snbArea" id="admin-navigation">
      <ul id="snb">
        {adminMenu.map((category) => {
          const isActiveCategory = category.id === activeCategoryId;
          const isOpenCategory = category.id === openCategoryId || isActiveCategory;

          return (
          <li
            key={category.id}
            id={category.id}
            className={[
              isActiveCategory ? 'active' : '',
              isOpenCategory ? 'open' : '',
            ].filter(Boolean).join(' ')}
          >
            <button className="snbCategoryButton" type="button" onClick={() => toggleCategory(category.id)}>
              {category.title}
            </button>
            <ul>
              {category.pages.map((page) => (
                <li key={page.id} className={category.id === activeCategoryId && page.id === activePageId ? 'active' : ''}>
                  <a href={page.href}>{page.title}</a>
                </li>
              ))}
            </ul>
          </li>
          );
        })}
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

export function AdminLayout({ activeCategoryId, activePageId, adminSession, children }) {
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);
  const activeCategory = adminMenu.find((category) => category.id === activeCategoryId)
    ?? { id: activeCategoryId, title: activeCategoryId === 'unmappedRoute' ? 'Route 점검' : '' };
  const activePage = activeCategory?.pages?.find((page) => page.id === activePageId)
    ?? { id: activePageId, title: activePageId === 'unmappedRoute' ? '미구현 경로' : '' };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
    setIsNavigationOpen(false);
  }, [activeCategoryId, activePageId]);

  useEffect(() => {
    if (!isNavigationOpen) return undefined;

    function closeOnEscape(event) {
      if (event.key === 'Escape') setIsNavigationOpen(false);
    }

    document.body.classList.add('adminNavigationOpen');
    window.addEventListener('keydown', closeOnEscape);

    return () => {
      document.body.classList.remove('adminNavigationOpen');
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [isNavigationOpen]);

  function navigateWithinAdmin(event) {
    if (
      event.defaultPrevented
      || event.button !== 0
      || event.metaKey
      || event.ctrlKey
      || event.shiftKey
      || event.altKey
    ) {
      return;
    }

    const anchor = event.target.closest?.('a[href]');
    if (!anchor || anchor.target || anchor.hasAttribute('download')) return;

    const target = new URL(anchor.href, window.location.href);
    if (
      target.origin !== window.location.origin
      || !target.pathname.startsWith('/admin')
      || target.pathname === '/admin/logout'
    ) {
      return;
    }

    event.preventDefault();
    window.history.pushState({}, '', `${target.pathname}${target.search}${target.hash}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }

  return (
    <>
      <LoadingSpinner />
      <div id="wrap" className="adminReactWrap" onClick={navigateWithinAdmin}>
        <AdminHeader
          adminSession={adminSession}
          isNavigationOpen={isNavigationOpen}
          onToggleNavigation={() => setIsNavigationOpen((current) => !current)}
        />
        <div className="container">
          <figure className="subVisualArea">
            <div className="inner">
              <div className="subVisual">
                <div className="txtBox">
                  <h2>{activeCategory?.title ?? ''}</h2>
                  <h3>{activePage?.pageTitle ?? activePage?.title ?? ''}</h3>
                </div>
              </div>
            </div>
          </figure>
          <div className={isNavigationOpen ? 'subContainer navigationOpen' : 'subContainer'} id="subNavigation">
            <button
              aria-label="관리자 메뉴 닫기"
              className="adminNavigationBackdrop"
              onClick={() => setIsNavigationOpen(false)}
              type="button"
            />
            <div className="inner">
              <AdminSidebar activeCategoryId={activeCategoryId} activePageId={activePageId} />
              <div className="subContents">
                <article className="subBox transparent adminReactPage">
                  <div className="contentArea">{children}</div>
                </article>
              </div>
            </div>
          </div>
        </div>
      </div>
      <CommonModal id="modal-info" />
      <CommonModal id="modal-reload" />
    </>
  );
}
