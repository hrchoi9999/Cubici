import { IntegratedInfoPage, InventoryPage, MainPage } from './pages/HomePages.jsx';
import { IdSearchPage, LoginPage, MyPage, PasswordResetPage, SignupPage } from './pages/AccountPages.jsx';
import { SalesOrSettlementPage } from './pages/CommercePages.jsx';
import { ClauseDetailsPage, ContractDetailPage, ContractFormPage, CurrentPage, DepositTestPage, EvaluatePage, MoneybankIntroPage, MoneybankProcessRoutePage, RequestPage } from './pages/MoneybankPages.jsx';
import { BoardDetailPage, ChargeDetailPage, ChargeInfoPage, InquiryDetailPage, SupportBoardPage } from './pages/SupportPages.jsx';
import { NotReadyPage, readAuthSession } from './shared/UserCore.jsx';

export default function App() {
  const path = normalizeLegacyMobilePath(window.location.pathname);
  if (path === '/' || path === '/main') return <MainPage />;
  if (path === '/login') return <LoginPage />;
  if (path === '/mainSignUp') return <SignupPage />;
  if (path === '/idSearch') return <IdSearchPage />;
  if (path === '/pwdReset') return <PasswordResetPage />;
  if (path === '/cubici/integratedInfo/tab1' || path === '/cubici/infoIntegrated/tab1') return requireAuth(<IntegratedInfoPage tab="tab1" />);
  if (path === '/cubici/integratedInfo/tab2' || path === '/cubici/infoIntegrated/tab2') return requireAuth(<IntegratedInfoPage tab="tab2" />);
  if (path === '/cubici/integratedInfo/tab3' || path === '/cubici/infoIntegrated/tab3') return requireAuth(<IntegratedInfoPage tab="tab3" />);
  if (path === '/cubici/invento/index') return requireAuth(<InventoryPage />);
  if (path === '/moneybank/intro/advpay' || path === '/cubici/moneybank/advPayIntro') return <MoneybankIntroPage kind="advpay" />;
  if (path === '/moneybank/intro/advcalc' || path === '/cubici/moneybank/advCalcIntro') return <MoneybankIntroPage kind="advcalc" />;
  if (path === '/moneybank/intro/creditpay' || path === '/cubici/moneybank/creditIntro') return <MoneybankIntroPage kind="creditpay" />;
  if (path === '/moneybank/processContinue') return requireAuth(<MoneybankProcessRoutePage mode="continue" />);
  if (path === '/moneybank/processEnd') return requireAuth(<MoneybankProcessRoutePage mode="end" />);
  if (path === '/moneybank/request' || path === '/cubici/moneybank/together/request') return requireAuth(<RequestPage />);
  if (path === '/moneybank/advPay/request' || path === '/cubici/moneybank/hellopayBiz/request') return requireAuth(<RequestPage kind="advpay" />);
  if (path === '/moneybank/advcalc/request' || path === '/cubici/moneybank/hellopayCal/request') return requireAuth(<RequestPage kind="advcalc" />);
  if (path === '/moneybank/advPay/evaluate' || path === '/cubici/moneybank/hellopayBiz/evaluate') return requireAuth(<EvaluatePage kind="advpay" />);
  if (path === '/moneybank/advcalc/evaluate' || path === '/cubici/moneybank/hellopayCal/evaluate') return requireAuth(<EvaluatePage kind="advcalc" />);
  if (path === '/moneybank/advPay/contractForm' || path === '/moneybank/hellopayBiz/contract' || path === '/cubici/moneybank/hellopayBiz/contractForm') return requireAuth(<ContractFormPage kind="advpay" />);
  if (path === '/moneybank/advcalc/contractForm' || path === '/moneybank/advcalc/contract' || path === '/cubici/moneybank/hellopayCal/contractForm') return requireAuth(<ContractFormPage kind="advcalc" />);
  if (path.startsWith('/moneybank/advcalc/request/clause-details/')) return <ClauseDetailsPage clauseNo={decodeURIComponent(path.split('/').pop() ?? '1')} />;
  if (path.startsWith('/cubici/moneybank/clauseDetails/details')) return <ClauseDetailsPage clauseNo={decodeURIComponent(path.replace(/\D/g, '') || '1')} />;
  if (path === '/cubici/moneybank/together/depositTest' || path === '/moneybank/together/depositTest') return requireAuth(<DepositTestPage />);
  if (path === '/moneybank/current' || path === '/cubici/moneybank/together/current') return requireAuth(<CurrentPage />);
  if (path.startsWith('/moneybank/current/')) return requireAuth(<ContractDetailPage mbid={decodeURIComponent(path.split('/').pop() ?? '')} />);
  if (path.startsWith('/cubici/moneybank/together/current/')) return requireAuth(<ContractDetailPage mbid={decodeURIComponent(path.split('/').pop() ?? '')} />);
  if (path === '/cubici/salesInfo/sales') return requireAuth(<SalesOrSettlementPage type="sales" />);
  if (path === '/cubici/salesInfo/return') return requireAuth(<SalesOrSettlementPage type="returns" />);
  if (path === '/cubici/calculateInfo/details' || path === '/cubici/calculateInfo/calendar') return requireAuth(<SalesOrSettlementPage type="settlements" />);
  if (path.startsWith('/cubici/mypage')) return requireAuth(<MyPage path={path} />);
  if (path === '/board/notice/index') return <SupportBoardPage kind="notice" />;
  if (path.startsWith('/board/notice/')) return <BoardDetailPage kind="notice" postId={decodeURIComponent(path.split('/').pop() ?? '')} />;
  if (path === '/board/qa/index') return requireAuth(<SupportBoardPage kind="qa" />);
  if (path === '/board/qa/write') return requireAuth(<SupportBoardPage kind="qa" mode="write" />);
  if (path.startsWith('/board/qa/')) return requireAuth(<InquiryDetailPage qnaId={decodeURIComponent(path.split('/').pop() ?? '')} />);
  if (path === '/board/faq/index') return <SupportBoardPage kind="faq" />;
  if (path.startsWith('/board/faq/')) return <BoardDetailPage kind="faq" postId={decodeURIComponent(path.split('/').pop() ?? '')} />;
  if (path === '/chargeInfo') return <ChargeInfoPage />;
  if (path.startsWith('/chargeInfo/')) return <ChargeDetailPage chargeCode={decodeURIComponent(path.split('/').pop() ?? '')} />;
  return <NotReadyPage />;
}

function requireAuth(page) {
  if (readAuthSession()?.access_token) return page;
  const returnUrl = `${window.location.pathname}${window.location.search}`;
  window.location.replace(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
  return null;
}

function normalizeLegacyMobilePath(path) {
  const aliases = {
    '/m/main': '/main',
    '/m/login': '/login',
    '/m/register/step1': '/mainSignUp',
    '/m/register/step2': '/mainSignUp',
    '/m/register/step3': '/mainSignUp',
    '/m/idSearch': '/idSearch',
    '/m/pwdReset': '/pwdReset',
    '/m/cubici/infoIntegrated/tab1': '/cubici/integratedInfo/tab1',
    '/m/cubici/infoIntegrated/tab2': '/cubici/integratedInfo/tab2',
    '/m/cubici/infoIntegrated/tab3': '/cubici/integratedInfo/tab3',
    '/m/cubici/integratedInfo/tab1': '/cubici/integratedInfo/tab1',
    '/m/cubici/integratedInfo/tab2': '/cubici/integratedInfo/tab2',
    '/m/cubici/integratedInfo/tab3': '/cubici/integratedInfo/tab3',
    '/m/cubici/salesInfo/sales': '/cubici/salesInfo/sales',
    '/m/cubici/salesInfo/return': '/cubici/salesInfo/return',
    '/m/cubici/calculateInfo/details': '/cubici/calculateInfo/details',
    '/m/cubici/calculateInfo/calendar': '/cubici/calculateInfo/calendar',
    '/m/cubici/invento/index': '/cubici/invento/index',
    '/m/cubici/mypage/companyInfo': '/cubici/mypage/companyInfo',
    '/m/cubici/mypage/businessInfo': '/cubici/mypage/businessInfo',
    '/m/cubici/mypage/myAuth': '/cubici/mypage/myAuth',
    '/m/cubici/mypage/myCharge': '/cubici/mypage/myCharge',
    '/m/cubici/mypage/withdraw': '/cubici/mypage/withdraw',
    '/m/moneybank/advPay/intro': '/moneybank/intro/advpay',
    '/m/moneybank/advCalc/intro': '/moneybank/intro/advcalc',
    '/m/moneybank/creditPay/intro': '/moneybank/intro/creditpay',
    '/m/moneybank/advCalc/request': '/moneybank/advcalc/request',
    '/m/moneybank/advPay/evaluate': '/moneybank/advPay/evaluate',
    '/m/moneybank/advcalc/evaluate': '/moneybank/advcalc/evaluate',
    '/m/moneybank/advCalc/current': '/moneybank/current',
    '/m/moneybank/together/request': '/moneybank/request',
    '/m/moneybank/together/current': '/moneybank/current',
    '/m/board/notice/index': '/board/notice/index',
    '/m/board/qa/index': '/board/qa/index',
    '/m/board/qa/write': '/board/qa/index',
    '/m/board/faq/index': '/board/faq/index',
    '/m/chargeInfo': '/chargeInfo',
  };

  if (aliases[path]) return aliases[path];
  if (path.startsWith('/m/moneybank/advCalc/current/')) {
    return path.replace('/m/moneybank/advCalc/current/', '/moneybank/current/');
  }
  if (path.startsWith('/m/board/qa/')) {
    return path.replace('/m/board/qa/', '/board/qa/');
  }
  if (path.startsWith('/m/board/notice/')) {
    return path.replace('/m/board/notice/', '/board/notice/');
  }
  if (path.startsWith('/m/board/faq/')) {
    return path.replace('/m/board/faq/', '/board/faq/');
  }
  return path;
}
