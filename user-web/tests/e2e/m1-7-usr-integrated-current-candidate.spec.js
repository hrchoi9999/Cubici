import { expect, test } from '../../../admin-web/node_modules/@playwright/test/index.mjs';

const targetUrl = process.env.CUBICI_M1_INTEGRATED_URL ?? 'http://127.0.0.1:4310/cubici/integratedInfo/tab1';
const session = {
  token_type: 'Bearer',
  access_token: 'm1-7-user-token',
  expires_in: 3600,
  user: {
    user_no: 107,
    email: 'integrated@cubici.test',
    user_type: 'USER',
    name: '너브레이어',
  },
};

const monthlySummary = {
  sales_total_amount: 9596450,
  settlement_total_amount: 5363821,
  current_sales_amount: 2634460,
  current_order_count: 92,
  current_settlement_amount: 5363656,
  current_product_count: 0,
  previous_sales_amount: 6961990,
  previous_order_count: 165,
  previous_settlement_amount: 165,
  previous_product_count: 0,
  moneybank_available_balance: 0,
  total_principal_amount: 0,
  total_repayment_amount: 0,
  activities: [],
};

async function installIntegratedMocks(page) {
  await page.addInitScript((auth) => {
    window.localStorage.setItem('cubiciUserAuth', JSON.stringify(auth));
  }, session);
  await page.route('**/v1/api/**', async (route) => {
    const url = new URL(route.request().url());
    let body;
    if (url.pathname.endsWith('/accounts/me/shops')) {
      body = {
        total: 1,
        items: [{ id: 1, user_no: 107, shop_type: 'SMARTSTORE', shop_id: 'lv-shop', status: 'Y', del_yn: 'N' }],
      };
    } else if (url.pathname.endsWith('/accounts/me/dashboard-summary')) {
      body = monthlySummary;
    } else if (url.pathname.endsWith('/sales/orders') || url.pathname.endsWith('/sales/returns') || url.pathname.endsWith('/settlements')) {
      body = { limit: 100, offset: 0, total: 0, items: [] };
    } else {
      body = {};
    }
    await route.fulfill({ contentType: 'application/json', status: 200, body: JSON.stringify(body) });
  });
}

test('M1-7 verifies and captures the LV integrated current status screen on PC', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await installIntegratedMocks(page);
  const summaryRequest = page.waitForRequest('**/v1/api/accounts/me/dashboard-summary');
  await page.goto(targetUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await summaryRequest;

  await expect(page.locator('.integrated-shell')).toBeVisible();
  await expect(page.locator('.react-final-sub-visual .visual-tit')).toHaveText('통합정보');
  await expect(page.locator('.react-final-tabs .sub-nav > li')).toHaveCount(3);
  await expect(page.locator('.react-final-tabs .sub-nav > li').first()).toHaveClass(/active/);
  const table = page.locator('.final-integrated-page .trans-table');
  await expect(table).toContainText('당월');
  await expect(table).toContainText('전월 동기');
  await expect(table).toContainText('증감');
  await expect(table).toContainText('2,634,460');
  await expect(table).toContainText('6,961,990');
  await expect(table).toContainText('-4,327,530');
  await expect(page.getByRole('heading', { name: '결제추이 비교' })).toBeVisible();

  await page.screenshot({
    fullPage: true,
    path: '../docs/reference/lv-ui/work/USR-INTEGRATED-CURRENT-PC/candidate/candidate-react.png',
  });
});

test('M1-7 verifies and captures the responsive integrated current status screen on mobile', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 360, height: 640 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  await installIntegratedMocks(page);
  await page.goto(targetUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  await expect(page.locator('.u07-mobile-service-nav')).toBeVisible();
  await expect(page.locator('.u07-mobile-service-nav a')).toHaveCount(4);
  await expect(page.locator('.u07-mobile-service-nav a').first()).toHaveClass(/active/);
  await expect(page.locator('.react-final-sub-visual')).toBeHidden();
  await expect(page.locator('.react-final-header')).toBeHidden();
  const table = page.locator('.final-integrated-page .trans-table');
  await expect(table).toContainText('전월 동기');
  await expect(table).toContainText('-4,327,530');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);

  await page.screenshot({
    fullPage: true,
    path: '../docs/reference/lv-ui/work/USR-INTEGRATED-CURRENT-MOBILE/candidate/candidate-react.png',
  });
  await context.close();
});
