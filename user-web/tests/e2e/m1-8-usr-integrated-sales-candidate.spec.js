import { expect, test } from '../../../admin-web/node_modules/@playwright/test/index.mjs';

const targetUrl = process.env.CUBICI_M1_INTEGRATED_SALES_URL ?? 'http://127.0.0.1:4310/cubici/integratedInfo/tab2';
const session = {
  token_type: 'Bearer',
  access_token: 'm1-8-user-token',
  expires_in: 3600,
  user: { user_no: 108, email: 'sales-analysis@cubici.test', user_type: 'USER', name: 'LV 사용자' },
};

async function installMocks(page) {
  await page.addInitScript((auth) => {
    window.localStorage.setItem('cubiciUserAuth', JSON.stringify(auth));
  }, session);
  await page.route('**/v1/api/**', async (route) => {
    const url = new URL(route.request().url());
    let body = {};
    if (url.pathname.endsWith('/accounts/me/shops')) {
      body = { total: 1, items: [{ id: 1, user_no: 108, shop_type: 'NAVER', shop_id: 'lv-sales', status: 'Y', del_yn: 'N' }] };
    } else if (url.pathname.endsWith('/accounts/me/dashboard-summary')) {
      body = { sales_total_amount: 370000, settlement_total_amount: 0, moneybank_available_balance: 0, total_principal_amount: 0, total_repayment_amount: 0, activities: [] };
    } else if (url.pathname.endsWith('/sales/orders')) {
      body = { limit: 100, offset: 0, total: 1, items: [{ sales_id: 1, shop_type: 'NAVER', payment_amount: 370000, paid_date: '2026-08-08' }] };
    } else if (url.pathname.endsWith('/sales/returns') || url.pathname.endsWith('/settlements')) {
      body = { limit: 100, offset: 0, total: 0, items: [] };
    }
    await route.fulfill({ contentType: 'application/json', status: 200, body: JSON.stringify(body) });
  });
}

test('M1-8 verifies LV sales analysis structure and API filters on PC', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await installMocks(page);
  await page.goto(targetUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  await expect(page.locator('.integrated-shell')).toBeVisible();
  await expect(page.locator('.react-final-tabs .sub-nav > li').nth(1)).toHaveClass(/active/);
  await expect(page.locator('.u08-sales-filter')).toBeVisible();
  await expect(page.getByRole('heading', { name: '쇼핑몰 결제 금액' })).toBeVisible();
  await expect(page.locator('.final-integrated-page .basic-table')).toHaveCount(0);

  await page.screenshot({ fullPage: true, path: '../docs/reference/lv-ui/work/USR-INTEGRATED-SALES-PC/candidate/candidate-react.png' });

  await page.getByLabel('쇼핑몰').selectOption('NAVER');
  await page.getByLabel('시작기간').fill('2026-08-01');
  await page.getByLabel('종료기간').fill('2026-08-08');
  const filteredRequest = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return url.pathname.endsWith('/sales/orders') && url.searchParams.get('shop_type') === 'NAVER';
  });
  await page.getByRole('button', { name: /검색/ }).click();
  const request = await filteredRequest;
  const url = new URL(request.url());
  expect(url.searchParams.get('from_date')).toBe('2026-08-01');
  expect(url.searchParams.get('to_date')).toBe('2026-08-08');
});

test('M1-8 captures responsive sales analysis without page overflow', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  await installMocks(page);
  await page.goto(targetUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  await expect(page.locator('.u07-mobile-service-nav')).toBeVisible();
  await expect(page.locator('.react-final-header')).toBeHidden();
  await expect(page.locator('.u08-sales-filter')).toBeVisible();
  const chartOverflow = await page.locator('.chart-over').evaluate((element) => element.scrollWidth > element.clientWidth);
  expect(chartOverflow).toBeTruthy();
  const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(pageOverflow).toBeLessThanOrEqual(1);

  await page.screenshot({ fullPage: true, path: '../docs/reference/lv-ui/work/USR-INTEGRATED-SALES-MOBILE/candidate/candidate-react.png' });
  await context.close();
});
