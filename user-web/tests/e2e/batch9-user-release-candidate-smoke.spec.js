import { expect, test } from '../../../admin-web/node_modules/@playwright/test/index.mjs';

const session = {
  access_token: 'batch9-rc-token',
  token_type: 'Bearer',
  user: {
    user_no: 9009,
    email: 'batch9-rc@example.com',
    name: 'Batch9 RC',
    phone: '010-9009-9009',
    user_type: 'GENERAL',
    biz_name: '배포후보상사',
    biz_num: '000-00-09009',
    partner_code: 'RC',
    charge_code: 'BASIC',
  },
};

const contract = {
  mbid: 'RC-MBID-9009',
  status: 'ACTIVE',
  product_code: 'ADV_CALC',
  latest_payment_rate: 0.8,
  latest_fee_rate: 0.032,
  request_date: '2026-08-01',
  approval_date: '2026-08-02',
  agree_date: '2026-08-03',
  contract_date: '2026-08-04',
  sales_amount: 9009000,
  document_file_count: 1,
  prizm_score: 'A',
};

const desktopRoutes = [
  ['/', '.final-main-page'],
  ['/main', '.final-main-page'],
  ['/login', '.final-login-page'],
  ['/mainSignUp', '.final-signup-page'],
  ['/idSearch', '.final-auth-help-page'],
  ['/pwdReset', '.final-auth-help-page'],
  ['/cubici/integratedInfo/tab1', '.final-integrated-page'],
  ['/cubici/integratedInfo/tab2', '.final-integrated-page'],
  ['/cubici/integratedInfo/tab3', '.final-integrated-page'],
  ['/cubici/invento/index', '.final-inventory-page'],
  ['/cubici/salesInfo/sales', '.final-commerce-page'],
  ['/cubici/salesInfo/return', '.final-commerce-page'],
  ['/cubici/calculateInfo/calendar', '.final-commerce-page'],
  ['/cubici/calculateInfo/details', '.final-commerce-page'],
  ['/moneybank/intro/advpay', '.final-moneybank-intro-page'],
  ['/moneybank/intro/advcalc', '.final-moneybank-intro-page'],
  ['/moneybank/intro/creditpay', '.final-moneybank-intro-page'],
  ['/moneybank/request', '.final-moneybank-request-page'],
  ['/moneybank/advPay/request', '.final-moneybank-request-page'],
  ['/moneybank/advcalc/request', '.final-moneybank-request-page'],
  ['/moneybank/advPay/evaluate', '.final-moneybank-evaluate-page'],
  ['/moneybank/advcalc/evaluate', '.final-moneybank-evaluate-page'],
  ['/moneybank/current', '.final-moneybank-current-page'],
  ['/moneybank/current/RC-MBID-9009', '.final-moneybank-derived-page'],
  ['/moneybank/advcalc/request/clause-details/1', '.final-moneybank-derived-page'],
  ['/moneybank/together/depositTest', '.final-moneybank-derived-page'],
  ['/moneybank/advcalc/contract', '.final-moneybank-derived-page'],
  ['/cubici/mypage/profile', '.final-mypage-page'],
  ['/cubici/mypage/companyInfo', '.final-mypage-page'],
  ['/cubici/mypage/businessInfo', '.final-mypage-page'],
  ['/cubici/mypage/myAuth', '.final-mypage-page'],
  ['/cubici/mypage/myCharge', '.final-mypage-page'],
  ['/cubici/mypage/withdraw', '.final-mypage-page'],
  ['/board/notice/index', '.final-support-page'],
  ['/board/notice/NOTICE-1', '.final-support-detail-page'],
  ['/board/qa/index', '.final-support-page'],
  ['/board/qa/QNA-1', '.final-support-detail-page'],
  ['/board/faq/index', '.final-support-page'],
  ['/board/faq/FAQ-1', '.final-support-detail-page'],
  ['/chargeInfo', '.final-charge-page'],
  ['/chargeInfo/BASIC', '.final-charge-page'],
  ['/unknown-release-candidate', '.final-notfound-page'],
];

const mobileAliasRoutes = [
  ['/m/main', '.final-main-page'],
  ['/m/login', '.final-login-page'],
  ['/m/register/step1', '.final-signup-page'],
  ['/m/idSearch', '.final-auth-help-page'],
  ['/m/pwdReset', '.final-auth-help-page'],
  ['/m/cubici/integratedInfo/tab1', '.final-integrated-page'],
  ['/m/cubici/salesInfo/sales', '.final-commerce-page'],
  ['/m/cubici/calculateInfo/calendar', '.final-commerce-page'],
  ['/m/cubici/invento/index', '.final-inventory-page'],
  ['/m/moneybank/advPay/intro', '.final-moneybank-intro-page'],
  ['/m/moneybank/advCalc/request', '.final-moneybank-request-page'],
  ['/m/moneybank/together/current', '.final-moneybank-current-page'],
  ['/m/cubici/mypage/companyInfo', '.final-mypage-page'],
  ['/m/board/notice/index', '.final-support-page'],
  ['/m/board/qa/index', '.final-support-page'],
  ['/m/board/faq/index', '.final-support-page'],
  ['/m/chargeInfo', '.final-charge-page'],
];

test.beforeEach(async ({ page }) => {
  await page.route('**/v1/api/**', (route) => {
    const url = new URL(route.request().url());
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockApi(url)) });
  });
  await page.addInitScript((value) => {
    window.localStorage.setItem('cubiciUserAuth', JSON.stringify(value));
  }, session);
});

test('Batch 9 desktop release candidate routes render', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  for (const [path, selector] of desktopRoutes) {
    await page.goto(path);
    await expect(page.locator(selector).first(), `${path} -> ${selector}`).toBeVisible();
    await expect(page.locator('#wrap.user-web-wrap.final-ui-shell').first(), `${path} shell`).toBeVisible();
    await expect(page.locator('body'), `${path} visible text`).not.toHaveText(/undefinedundefined|NaN|Cannot read/i);
    await assertNoBrokenImages(page, path);
    await assertNoHorizontalPageOverflow(page, path);
  }
  await page.screenshot({ fullPage: true, path: '../docs/batch9_release_candidate_smoke/desktop_last_route_notfound.png' });
});

test('Batch 9 mobile legacy aliases render without page overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const [path, selector] of mobileAliasRoutes) {
    await page.goto(path);
    await expect(page.locator(selector).first(), `${path} -> ${selector}`).toBeVisible();
    await assertNoBrokenImages(page, path);
    await assertNoHorizontalPageOverflow(page, path);
  }
  await page.screenshot({ fullPage: true, path: '../docs/batch9_release_candidate_smoke/mobile_last_route_charge.png' });
});

async function assertNoBrokenImages(page, path) {
  const broken = await page.evaluate(() => Array.from(document.images)
    .filter((img) => img.complete && img.naturalWidth === 0)
    .map((img) => img.currentSrc || img.src));
  expect(broken, `${path} broken images`).toEqual([]);
}

async function assertNoHorizontalPageOverflow(page, path) {
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(metrics.scrollWidth, `${path} horizontal overflow`).toBeLessThanOrEqual(metrics.clientWidth + 2);
}

function mockApi(url) {
  const path = url.pathname;
  if (path.includes('/accounts/me/shops')) return { items: [{ id: 'SHOP-1', shop_type: 'SMARTSTORE', shop_id: 'rc-shop', status: 'ACTIVE' }] };
  if (path === '/v1/api/contracts') return { total: 1, items: [contract] };
  if (path.includes('/contracts/') && path.includes('/documents/files')) return { total: 1, items: [{ uuid: 'DOC-1', file_division: '사업자등록증', origin_file_name: '사업자등록증', file_ext: 'pdf', file_size: 12345, input_date: '2026-08-06' }] };
  if (path.includes('/contracts/') && !path.includes('/status') && !path.includes('/electronic-signature')) {
    return {
      contract,
      shops: [{ id: 'SHOP-1', contract_shop_type: 'SMARTSTORE', contract_shop_id: 'rc-shop', reg_date: '2026-08-01' }],
      fees: [{ id: 'FEE-1', payment_rate: 0.8, sales_limit_per_order: 1000000, max_outstanding_balance: 50000000, reg_date: '2026-08-01', rates: [{ id: 'RATE-1', fee_type: '정산수수료', fee_rate: 0.032 }] }],
      redemption: { latest_cumulative_provision_amount: 10000000, latest_cumulative_repayment_amount: 4000000, latest_outstanding_balance: 6000000, latest_history_date: '2026-08-06' },
    };
  }
  if (path.includes('/redemptions/') && path.includes('/operation-history')) return { total: 1, items: [{ id: 'OP-1', reg_date: '2026-08-06', operation_type: 'REPAYMENT', operation_code: 'RC-OP', new_cumulative_provision_amount: 10000000, new_cumulative_repayment_amount: 4000000, new_outstanding_balance: 6000000, status: 'DONE' }] };
  if (path.includes('/redemptions')) return { total: 1, items: [{ mbid: contract.mbid, latest_cumulative_provision_amount: 10000000, latest_cumulative_repayment_amount: 4000000, latest_outstanding_balance: 6000000, latest_history_date: '2026-08-06' }] };
  if (path.includes('/sales/orders')) return { total: 2, items: salesItems() };
  if (path.includes('/sales/returns')) return { total: 1, items: [{ product_name: '반품상품', payment_amount: 12000, request_date: '2026-08-06' }] };
  if (path.includes('/settlements')) return { total: 1, items: [{ settlement_amount: 88000, settlement_date: '2026-08-06', shop_type: 'SMARTSTORE', shop_id: 'rc-shop' }] };
  if (path.includes('/support/boards/notice/')) return boardDetail('NOTICE-1', '서비스 공지');
  if (path.includes('/support/boards/faq/')) return boardDetail('FAQ-1', 'FAQ');
  if (path.includes('/support/boards/notice')) return boardList('NOTICE');
  if (path.includes('/support/boards/faq')) return boardList('FAQ');
  if (path.includes('/support/inquiries/') && !path.endsWith('/support/inquiries')) return { ...boardDetail('QNA-1', 'Q&A'), qna_id: 'QNA-1', replies: [{ id: 'R-1', content: '답변 내용입니다.', created_by: '관리자', reg_date: '2026-08-06' }] };
  if (path.includes('/support/inquiries')) return { ...boardList('QNA'), answered_count: 1, waiting_count: 0 };
  if (path.includes('/preferences/charges/') && !path.endsWith('/charges')) return chargeDetail(decodeURIComponent(path.split('/').pop() ?? 'BASIC'));
  if (path.includes('/preferences/charges')) return { counts: { total_count: 1, operating_count: 1, ended_count: 0 }, items: [chargeDetail('BASIC')] };
  return { total: 0, items: [] };
}

function salesItems() {
  return [
    { product_name: '대표상품 A', product_no: 'P-001', quantity: 3, sales_amount: 30000, payment_amount: 28000, paid_date: '2026-08-06', shop_type: 'SMARTSTORE', shop_id: 'rc-shop' },
    { product_name: '대표상품 B', product_no: 'P-002', quantity: 2, sales_amount: 50000, payment_amount: 48000, paid_date: '2026-08-05', shop_type: 'SMARTSTORE', shop_id: 'rc-shop' },
  ];
}

function boardList(prefix) {
  return {
    total: 1,
    items: [{
      post_id: `${prefix}-1`,
      qna_id: `${prefix}-1`,
      type: 'CUBICI',
      type_label: '큐빅아이',
      title: `${prefix} 배포 후보 게시글`,
      content: '배포 후보 smoke 게시글 본문입니다.',
      answer_status: '답변완료',
      created_by: '관리자',
      reg_date: '2026-08-06',
      modified_date: '2026-08-06',
    }],
  };
}

function boardDetail(id, title) {
  return {
    post_id: id,
    qna_id: id,
    type: 'CUBICI',
    type_label: '큐빅아이',
    title: `${title} 상세`,
    content: `${title} 상세 본문입니다.`,
    answer_status: '답변완료',
    created_by: '관리자',
    reg_date: '2026-08-06',
    modified_date: '2026-08-06',
  };
}

function chargeDetail(code) {
  return {
    charge_code: code,
    charge_name: '기본 요금제',
    charge_type: 'B',
    status: '운영',
    amount: 99000,
    period: 1,
    period_unit: 'M',
    sales_count: '전체',
    product_count: '전체',
    start_date: '2026-08-01',
    expire_date: '2027-08-01',
    charge_detail: '기본 요금제 상세 조건입니다.',
  };
}
