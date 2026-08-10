import { expect, test } from '../../../admin-web/node_modules/@playwright/test/index.mjs';

const targetUrl = process.env.CUBICI_M1_INTEGRATED_PRODUCT_URL ?? 'http://127.0.0.1:4310/cubici/integratedInfo/tab3';
const session = {
  token_type: 'Bearer',
  access_token: 'm1-9-user-token',
  expires_in: 3600,
  user: { user_no: 109, email: 'product-analysis@cubici.test', user_type: 'USER', name: 'LV 사용자' },
};

async function installMocks(page) {
  await page.addInitScript((auth) => {
    window.localStorage.setItem('cubiciUserAuth', JSON.stringify(auth));
  }, session);
  await page.route('**/v1/api/**', async (route) => {
    const url = new URL(route.request().url());
    let body = {};
    if (url.pathname.endsWith('/accounts/me/shops')) {
      body = { total: 1, items: [{ id: 1, user_no: 109, shop_type: 'NAVER', shop_id: 'lv-product', status: 'Y', del_yn: 'N' }] };
    } else if (url.pathname.endsWith('/accounts/me/dashboard-summary')) {
      body = { sales_total_amount: 121100, settlement_total_amount: 0, moneybank_available_balance: 0, total_principal_amount: 0, total_repayment_amount: 0, activities: [] };
    } else if (url.pathname.endsWith('/sales/product-analysis')) {
      body = {
        shop_breakdown: [
          { shop_type: 'NAVER', sales_amount: 180000, payment_amount: 150000, discount_amount: 30000, quantity: 12, promotion_rate: 16.67 },
          { shop_type: 'COUPANG', sales_amount: 140000, payment_amount: 121100, discount_amount: 18900, quantity: 8, promotion_rate: 13.5 },
          { shop_type: 'STREET11', sales_amount: 90000, payment_amount: 78000, discount_amount: 12000, quantity: 5, promotion_rate: 13.33 },
        ],
        top_products: [
          { product_name: 'LV 상품 A', payment_amount: 171100, quantity: 10 },
          { product_name: 'LV 상품 B', payment_amount: 110000, quantity: 8 },
          { product_name: 'LV 상품 C', payment_amount: 68000, quantity: 7 },
        ],
      };
    } else if (url.pathname.endsWith('/sales/orders')) {
      body = { limit: 100, offset: 0, total: 1, items: [{ sales_id: 1, shop_type: 'NAVER', product_name: 'LV 상품', quantity: 1, payment_amount: 121100, paid_date: '2026-08-08' }] };
    } else if (url.pathname.endsWith('/sales/returns') || url.pathname.endsWith('/settlements')) {
      body = { limit: 100, offset: 0, total: 0, items: [] };
    }
    await route.fulfill({ contentType: 'application/json', status: 200, body: JSON.stringify(body) });
  });
}

test('M1-9 verifies the LV product analysis stack and API filters on PC', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await installMocks(page);
  await page.goto(targetUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  await expect(page.locator('.integrated-shell')).toBeVisible();
  await expect(page.locator('.react-final-tabs .sub-nav > li').nth(2)).toHaveClass(/active/);
  await expect(page.locator('.integrated-analysis-filter')).toBeVisible();
  await expect(page.locator('.u09-chart-stack .chart-wrap')).toHaveCount(3);
  await expect(page.getByRole('heading', { name: '쇼핑몰 결제 비중' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '쇼핑몰 가격할인 및 판촉' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'TOP 10 매출상품' })).toBeVisible();
  await expect(page.locator('.u09-chart-stack canvas')).toHaveCount(3);
  await expect(page.locator('.u09-chart-stack img')).toHaveCount(0);
  await expect(page.locator('.final-integrated-page .basic-table')).toHaveCount(0);
  const renderedCharts = await page.locator('.u09-chart-stack canvas').evaluateAll((canvases) => canvases.map((canvas) => canvas.toDataURL().length));
  expect(renderedCharts.every((length) => length > 5000)).toBe(true);

  await page.screenshot({ fullPage: true, path: '../docs/reference/lv-ui/work/USR-INTEGRATED-PRODUCT-PC/candidate/candidate-react.png' });

  await page.getByLabel('쇼핑몰', { exact: true }).selectOption('NAVER');
  await page.getByLabel('시작기간').fill('2026-08-01');
  await page.getByLabel('종료기간').fill('2026-08-08');
  const filteredOrdersRequest = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return url.pathname.endsWith('/sales/orders') && url.searchParams.get('shop_type') === 'NAVER';
  });
  const filteredAnalysisRequest = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return url.pathname.endsWith('/sales/product-analysis') && url.searchParams.get('shop_type') === 'NAVER';
  });
  await page.getByRole('button', { name: /검색/ }).click();
  const [ordersRequest, analysisRequest] = await Promise.all([filteredOrdersRequest, filteredAnalysisRequest]);
  const requestUrl = new URL(ordersRequest.url());
  expect(requestUrl.searchParams.get('from_date')).toBe('2026-08-01');
  expect(requestUrl.searchParams.get('to_date')).toBe('2026-08-08');
  expect(new URL(analysisRequest.url()).searchParams.get('from_date')).toBe('2026-08-01');
});

test('M1-9 captures responsive product analysis without page overflow', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  await installMocks(page);
  await page.goto(targetUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  await expect(page.locator('.u07-mobile-service-nav')).toBeVisible();
  await expect(page.locator('.react-final-header')).toBeHidden();
  await expect(page.locator('.u09-chart-stack .chart-wrap')).toHaveCount(3);
  await expect(page.locator('.u09-chart-stack canvas')).toHaveCount(3);
  const chartOverflow = await page.locator('.u09-chart-stack .chart-over').evaluateAll((elements) => elements.map((element) => element.scrollWidth > element.clientWidth));
  expect(chartOverflow).toEqual([false, true, true]);
  const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(pageOverflow).toBeLessThanOrEqual(1);

  await page.screenshot({ fullPage: true, path: '../docs/reference/lv-ui/work/USR-INTEGRATED-PRODUCT-MOBILE/candidate/candidate-react.png' });
  await context.close();
});
