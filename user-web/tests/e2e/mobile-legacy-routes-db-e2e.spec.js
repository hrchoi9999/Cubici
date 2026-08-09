import { expect, test } from '../../../admin-web/node_modules/@playwright/test/index.mjs';

test.skip(process.env.CUBICI_RUN_DB_E2E !== '1', 'set CUBICI_RUN_DB_E2E=1 to run local PostgreSQL UI E2E tests');

const authSession = {
  access_token: 'mobile-route-e2e-token',
  user: {
    user_no: 36,
    user_type: 'USER',
    email: 'mobile-route@cubici.local',
    name: '모바일 라우트 점검',
    phone: '01000000000',
    biz_name: '모바일 라우트 상사',
    biz_num: '0000000000',
  },
};

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript((session) => {
    window.localStorage.setItem('cubiciUserAuth', JSON.stringify(session));
  }, authSession);
});

test('legacy mobile user routes render mapped React pages with database API', async ({ page }) => {
  const routes = [
    ['/m/main', '온라인 쇼핑몰 통합관리 서비스'],
    ['/m/login', '로그인'],
    ['/m/register/step1', '회원가입'],
    ['/m/idSearch', '아이디 찾기'],
    ['/m/pwdReset', '비밀번호 찾기'],
    ['/m/cubici/infoIntegrated/tab1', '통합정보'],
    ['/m/cubici/infoIntegrated/tab2', '매출분석'],
    ['/m/cubici/infoIntegrated/tab3', '상품분석'],
    ['/m/cubici/salesInfo/sales', '판매현황'],
    ['/m/cubici/salesInfo/return', '반품/교환'],
    ['/m/cubici/calculateInfo/details', '정산 상세'],
    ['/m/cubici/calculateInfo/calendar', '정산 캘린더'],
    ['/m/cubici/invento/index', '상품/재고현황'],
    ['/m/cubici/mypage/companyInfo', '회사정보'],
    ['/m/cubici/mypage/businessInfo', '사업정보'],
    ['/m/cubici/mypage/myAuth', '인증정보'],
    ['/m/cubici/mypage/myCharge', '요금정보'],
    ['/m/cubici/mypage/withdraw', '회원탈퇴'],
    ['/m/moneybank/advPay/intro', '구매자금 선지급 서비스'],
    ['/m/moneybank/advCalc/intro', '매출 선정산 서비스'],
    ['/m/moneybank/creditPay/intro', '신용대출'],
    ['/m/moneybank/advCalc/request', '매출 선정산 신청'],
    ['/m/moneybank/advcalc/evaluate', '매출 선정산 검토 및 심사'],
    ['/m/moneybank/advCalc/current', '머니뱅크 현황'],
    ['/m/moneybank/together/request', '머니뱅크 신청'],
    ['/m/moneybank/together/current', '머니뱅크 현황'],
    ['/m/board/notice/index', '서비스 공지'],
    ['/m/board/qa/index', 'Q&A'],
    ['/m/board/qa/write', 'Q&A'],
    ['/m/board/faq/index', 'FAQ'],
    ['/m/chargeInfo', '요금안내'],
  ];

  for (const [route] of routes) {
    await page.goto(route);
    await expect(page.locator('main').first()).toBeVisible();
    await expect(page.getByText('준비 중입니다.')).toHaveCount(0);
    const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
    expect(horizontalOverflow, `${route} should not overflow horizontally at mobile width`).toBe(false);
  }
});
