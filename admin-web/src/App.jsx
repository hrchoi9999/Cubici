import { useEffect, useState } from 'react';

import {
  clearAdminSession,
  installAdminFetchInterceptor,
  readAdminSession,
  setAdminFetchSession,
  verifyMasterAdminSession,
} from './auth/adminAuth.js';
import { AdminLayout, adminMenu } from './components/layout/AdminLayout.jsx';
import { AdminAccountManagementPage } from './pages/AdminAccountManagementPage.jsx';
import { AdminDashboardPage } from './pages/AdminDashboardPage.jsx';
import { AdminLoginPage } from './pages/AdminLoginPage.jsx';
import { ApprovalManagementPage } from './pages/ApprovalManagementPage.jsx';
import { ChargeManagementPage } from './pages/ChargeManagementPage.jsx';
import { ContractManagementPage } from './pages/ContractManagementPage.jsx';
import { CreditIndicatorManagementPage } from './pages/CreditIndicatorManagementPage.jsx';
import { CustomerBoardPage } from './pages/CustomerBoardPage.jsx';
import { CustomerInquiryPage } from './pages/CustomerInquiryPage.jsx';
import { CubiciIntegratedInfoPage } from './pages/CubiciIntegratedInfoPage.jsx';
import { ErrorLogPage } from './pages/ErrorLogPage.jsx';
import { FintechTradeRequestPage } from './pages/FintechTradeRequestPage.jsx';
import { FundingManagementPage } from './pages/FundingManagementPage.jsx';
import { ManagementOverviewPage } from './pages/ManagementOverviewPage.jsx';
import { ManagementUsageDetailPage } from './pages/ManagementUsageDetailPage.jsx';
import { ManagementUsagePage } from './pages/ManagementUsagePage.jsx';
import { MemberChargeChangePage } from './pages/MemberChargeChangePage.jsx';
import { MemberInfoPage } from './pages/MemberInfoPage.jsx';
import { MemberPaymentPage } from './pages/MemberPaymentPage.jsx';
import { MemberStatusPage } from './pages/MemberStatusPage.jsx';
import { MemberSummaryPage } from './pages/MemberSummaryPage.jsx';
import { MemberWithdrawalPage } from './pages/MemberWithdrawalPage.jsx';
import { MessageTemplatePage } from './pages/MessageTemplatePage.jsx';
import { MigrationRouteStatusPage } from './pages/MigrationRouteStatusPage.jsx';
import { MoneybankProductPreferencePage } from './pages/MoneybankProductPreferencePage.jsx';
import { MoneybankIntegratedInfoPage } from './pages/MoneybankIntegratedInfoPage.jsx';
import { PartnerManagementPage } from './pages/PartnerManagementPage.jsx';
import { PrizmManagementPage } from './pages/PrizmManagementPage.jsx';
import { PrizmConfigPage } from './pages/PrizmConfigPage.jsx';
import { RawDataConfigPage } from './pages/RawDataConfigPage.jsx';
import { PromotionManagementPage } from './pages/PromotionManagementPage.jsx';
import { RedemptionManagementPage } from './pages/RedemptionManagementPage.jsx';
import { SettlementManagementPage } from './pages/SettlementManagementPage.jsx';
import { ServerMonitorPage } from './pages/ServerMonitorPage.jsx';

function findRoute(path) {
  const routeAliases = [
    {
      match: '/admin/cubici/infoIntegrated/moneybank_tab2',
      categoryId: 'moneybankOperation',
      pageId: 'service',
    },
    {
      match: '/admin/moneybank/cubici/management/info_tab2',
      categoryId: 'moneybankOperation',
      pageId: 'integrated',
    },
    {
      match: '/admin/cubici/manageMember/member_tab2',
      categoryId: 'memberInfo',
      pageId: 'member',
    },
    {
      match: '/admin/cubici/manageMember/member_tab3',
      categoryId: 'memberInfo',
      pageId: 'member',
    },
    {
      match: '/admin/cubici/manageMember/userstatus',
      categoryId: 'memberInfo',
      pageId: 'member',
    },
    {
      match: '/admin/cubici/manageMember/payment_tab2',
      categoryId: 'shoppingIntegrated',
      pageId: 'payment',
    },
    {
      match: '/admin/cubici/supportMember/manageBoard_tab2',
      categoryId: 'supportMember',
      pageId: 'notice',
    },
    {
      match: '/admin/cubici/supportMember/manageEmail',
      categoryId: 'supportMember',
      pageId: 'message',
    },
  ];

  const alias = routeAliases.find((item) => path.includes(item.match));
  if (alias) {
    const category = adminMenu.find((item) => item.id === alias.categoryId);
    const page = category.pages.find((item) => item.id === alias.pageId);
    return { category, page };
  }

  if (path.includes('/admin/cubici/adminPreference/manageMoneybank_tab2')) {
    const category = adminMenu.find((item) => item.id === 'moneybankOperation');
    const page = category.pages.find((item) => item.id === 'funding');
    return { category, page };
  }

  if (path.includes('/admin/cubici/adminPreference/prizmRawData')) {
    const category = adminMenu.find((item) => item.id === 'preferInfo');
    const page = category.pages.find((item) => item.id === 'prizm');
    return { category, page };
  }

  if (path.includes('/admin/moneybank/management/usageDetail')) {
    const category = adminMenu.find((item) => item.id === 'moneybankOperation');
    const page = category.pages.find((item) => item.id === 'usage');
    return { category, page };
  }

  if (path === '/admin/moneybank/manage') {
    const category = adminMenu.find((item) => item.id === 'moneybankOperation');
    const page = category.pages.find((item) => item.id === 'manage');
    return { category, page };
  }

  if (path === '/admin/moneybank/risk-results') {
    const category = adminMenu.find((item) => item.id === 'moneybankOperation');
    const page = category.pages.find((item) => item.id === 'manage');
    return { category, page };
  }

  if (path === '/admin/cubici/adminPreference/prizmConfig') {
    const category = adminMenu.find((item) => item.id === 'preferInfo');
    const page = category.pages.find((item) => item.id === 'prizm');
    return { category, page };
  }

  for (const category of adminMenu) {
    for (const page of category.pages) {
      if (path === page.href || path.startsWith(`${page.href}/`)) {
        return { category, page };
      }
    }
  }

  return {
    category: { id: 'unmappedRoute', title: 'Route 점검', pages: [] },
    page: { id: 'unmappedRoute', title: '미구현 경로', href: path },
  };
}

export default function App() {
  const requestedView = new URLSearchParams(window.location.search).get('view');
  const path = requestedView === 'prism-config'
    ? '/admin/cubici/adminPreference/prizmConfig'
    : requestedView === 'prism-management'
      ? '/admin/moneybank/manage'
      : requestedView === 'prism-results'
        ? '/admin/moneybank/risk-results'
      : requestedView === 'prism'
        ? '/admin/cubici/adminPreference/prizmConfig'
        : window.location.pathname;
  const [adminSession, setAdminSession] = useState(() => {
    const session = readAdminSession();
    setAdminFetchSession(session);
    installAdminFetchInterceptor();
    return session;
  });
  const [isCheckingSession, setIsCheckingSession] = useState(Boolean(adminSession));

  useEffect(() => {
    let cancelled = false;
    if (!adminSession) {
      setIsCheckingSession(false);
      return () => {
        cancelled = true;
      };
    }

    verifyMasterAdminSession(adminSession)
      .then((verifiedSession) => {
        if (cancelled) return;
        setAdminFetchSession(verifiedSession);
        setAdminSession(verifiedSession);
        setIsCheckingSession(false);
      })
      .catch(() => {
        if (cancelled) return;
        clearAdminSession();
        setAdminFetchSession(null);
        setAdminSession(null);
        setIsCheckingSession(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (path === '/logout' || path === '/admin/logout') {
    clearAdminSession();
    window.location.replace('/admin');
    return null;
  }

  if (isCheckingSession) {
    return <div className="adminLoginPage">관리자 권한 확인 중입니다.</div>;
  }

  if (!adminSession) {
    return (
      <AdminLoginPage
        onLogin={(session) => {
          setAdminFetchSession(session);
          setAdminSession(session);
          if (path === '/admin') {
            window.location.replace('/admin/cubici/infoIntegrated/cubici_tab1');
          }
        }}
      />
    );
  }

  if (path === '/admin') {
    window.location.replace('/admin/cubici/infoIntegrated/cubici_tab1');
    return null;
  }

  const isSettlementPage = path.includes('/admin/moneybank/settlement');
  const isRedemptionPage = path.includes('/admin/moneybank/redemption');
  const isCubiciIntegratedInfoPage = path.includes('/admin/cubici/infoIntegrated/cubici_tab1');
  const isMoneybankIntegratedInfoPage = path.includes('/admin/cubici/infoIntegrated/moneybank_tab1') || path.includes('/admin/cubici/infoIntegrated/moneybank_tab2');
  const isManagementOverviewPage = path.includes('/admin/moneybank/cubici/management/info_tab');
  const isManagementUsageDetailPage = path.includes('/admin/moneybank/management/usageDetail');
  const isManagementUsagePage = path.includes('/admin/moneybank/management/usageList');
  const isMemberSummaryPage = path.includes('/admin/cubici/manageMember/member_tab1');
  const isMemberInfoPage = path.includes('/admin/cubici/manageMember/member_tab2');
  const isMemberWithdrawalPage = path.includes('/admin/cubici/manageMember/member_tab3');
  const isMemberPaymentPage = path.includes('/admin/cubici/manageMember/payment_tab1');
  const isMemberChargeChangePage = path.includes('/admin/cubici/manageMember/payment_tab2');
  const isMemberStatusPage = path.includes('/admin/cubici/manageMember/userstatus');
  const isRequestPage = path.includes('/admin/moneybank/request');
  const isApprovalPage = path.includes('/admin/moneybank/approval_tab1');
  const isContractManagementPage = path.includes('/admin/moneybank/approval_tab2');
  const isCreditIndicatorManagementPage = path === '/admin/moneybank/manage';
  const isPrizmManagementPage = path === '/admin/moneybank/risk-results';
  const isCustomerInquiryPage = path.includes('/admin/cubici/supportMember/manageInquiry');
  const isMessageTemplatePage = path.includes('/admin/cubici/supportMember/manageSms') || path.includes('/admin/cubici/supportMember/manageEmail');
  const isCustomerBoardPage = path.includes('/admin/cubici/supportMember/manageBoard_tab1') || path.includes('/admin/cubici/supportMember/manageBoard_tab2');
  const isErrorLogPage = path.includes('/admin/cubici/adminMonitor/error_report');
  const isServerMonitorPage = path.includes('/admin/cubici/adminMonitor/server_monitor');
  const isFintechTradeRequestPage = path.includes('/admin/cubici/adminMonitor/fintech_trade');
  const isAdminAccountPage = path.includes('/admin/cubici/adminPreference/adminRegister_tab1');
  const isChargeManagementPage = path.includes('/admin/cubici/adminPreference/manageCharge');
  const isPromotionManagementPage = path.includes('/admin/cubici/adminPreference/managePromotion');
  const isPartnerManagementPage = path.includes('/admin/cubici/adminPreference/managePartner');
  const isFundingManagementPage = path === '/admin/moneybank/funding';
  const isMoneybankProductPreferencePage = path.includes('/admin/cubici/adminPreference/manageMoneybank_tab1') || path.includes('/admin/cubici/adminPreference/manageMoneybank_tab2');
  const isPrizmConfigPage = path.includes('/admin/cubici/adminPreference/prizmConfig');
  const isRawDataConfigPage = path.includes('/admin/cubici/adminPreference/prizmRawData');
  const { category, page } = findRoute(path);

  return (
    <AdminLayout activeCategoryId={category.id} activePageId={page.id} adminSession={adminSession}>
      {isManagementOverviewPage ? <ManagementOverviewPage /> : null}
      {isCubiciIntegratedInfoPage ? <CubiciIntegratedInfoPage /> : null}
      {isMoneybankIntegratedInfoPage ? <MoneybankIntegratedInfoPage /> : null}
      {isManagementUsageDetailPage ? <ManagementUsageDetailPage /> : null}
      {isManagementUsagePage ? <ManagementUsagePage /> : null}
      {isMemberSummaryPage ? <MemberSummaryPage /> : null}
      {isMemberInfoPage ? <MemberInfoPage /> : null}
      {isMemberWithdrawalPage ? <MemberWithdrawalPage /> : null}
      {isMemberPaymentPage ? <MemberPaymentPage /> : null}
      {isMemberChargeChangePage ? <MemberChargeChangePage /> : null}
      {isMemberStatusPage ? <MemberStatusPage /> : null}
      {isRequestPage ? <AdminDashboardPage /> : null}
      {isApprovalPage ? <ApprovalManagementPage /> : null}
      {isContractManagementPage ? <ContractManagementPage /> : null}
      {isCreditIndicatorManagementPage ? <CreditIndicatorManagementPage /> : null}
      {isPrizmManagementPage ? <PrizmManagementPage /> : null}
      {isSettlementPage ? <SettlementManagementPage /> : null}
      {isRedemptionPage ? <RedemptionManagementPage /> : null}
      {isCustomerInquiryPage ? <CustomerInquiryPage /> : null}
      {isMessageTemplatePage ? <MessageTemplatePage /> : null}
      {isCustomerBoardPage ? <CustomerBoardPage /> : null}
      {isErrorLogPage ? <ErrorLogPage /> : null}
      {isServerMonitorPage ? <ServerMonitorPage /> : null}
      {isFintechTradeRequestPage ? <FintechTradeRequestPage /> : null}
      {isAdminAccountPage ? <AdminAccountManagementPage /> : null}
      {isChargeManagementPage ? <ChargeManagementPage /> : null}
      {isPromotionManagementPage ? <PromotionManagementPage /> : null}
      {isPartnerManagementPage ? <PartnerManagementPage /> : null}
      {isFundingManagementPage ? <FundingManagementPage /> : null}
      {isMoneybankProductPreferencePage ? <MoneybankProductPreferencePage /> : null}
      {isPrizmConfigPage ? <PrizmConfigPage /> : null}
      {isRawDataConfigPage ? <RawDataConfigPage /> : null}
      {!isManagementOverviewPage && !isCubiciIntegratedInfoPage && !isMoneybankIntegratedInfoPage && !isManagementUsageDetailPage && !isManagementUsagePage && !isMemberSummaryPage && !isMemberInfoPage && !isMemberWithdrawalPage && !isMemberPaymentPage && !isMemberChargeChangePage && !isMemberStatusPage && !isRequestPage && !isApprovalPage && !isContractManagementPage && !isCreditIndicatorManagementPage && !isPrizmManagementPage && !isSettlementPage && !isRedemptionPage && !isCustomerInquiryPage && !isMessageTemplatePage && !isCustomerBoardPage && !isErrorLogPage && !isServerMonitorPage && !isFintechTradeRequestPage && !isAdminAccountPage && !isChargeManagementPage && !isPromotionManagementPage && !isPartnerManagementPage && !isFundingManagementPage && !isMoneybankProductPreferencePage && !isPrizmConfigPage && !isRawDataConfigPage ? (
        <MigrationRouteStatusPage
          categoryTitle={category.title}
          currentPath={path}
          legacyPath={page.href}
          pageTitle={page.title}
        />
      ) : null}
    </AdminLayout>
  );
}
