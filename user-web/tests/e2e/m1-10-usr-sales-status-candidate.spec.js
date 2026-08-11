import { expect, test } from '../../../admin-web/node_modules/@playwright/test/index.mjs';

const targetUrl = process.env.CUBICI_M1_SALES_STATUS_URL ?? 'http://127.0.0.1:4310/cubici/salesInfo/sales';
const session = {
  token_type: 'Bearer',
  access_token: 'm1-10-user-token',
  expires_in: 3600,
  user: { user_no: 110, email: 'sales-status@cubici.test', user_type: 'USER', name: 'LV 사용자' },
};

function saleItem(id, overrides = {}) {
  return {
    sales_id: id,
    shop_type: 'NAVER',
    shop_id: 'lv-sales',
    order_no: `20260808000${id}`,
    product_no: `7100702${id}`,
    status: 'ORDER_COMPLETE',
    ordered_date: '2026-08-08T09:00:00',
    paid_date: '2026-08-08T10:00:00',
    product_name: `LV 판매상품 ${id}`,
    option_name: '기본 옵션',
    quantity: id,
    payment_amount: 17600 * id,
    orderer_id: `miji${id}`,
    orderer_name: '권소정',
    ...overrides,
  };
}

async function installMocks(page) {
  await page.addInitScript((auth) => {
    window.localStorage.setItem('cubiciUserAuth', JSON.stringify(auth));
  }, session);
  await page.route('**/v1/api/**', async (route) => {
    const url = new URL(route.request().url());
    let body = {};
    if (url.pathname.endsWith('/accounts/me/shops')) {
      body = { total: 1, items: [{ id: 1, user_no: 110, shop_type: 'NAVER', shop_id: 'lv-sales', status: 'Y', del_yn: 'N' }] };
    } else if (url.pathname.endsWith('/sales/orders')) {
      const offset = Number(url.searchParams.get('offset') ?? 0);
      body = { limit: 10, offset, total: 12, items: offset ? [saleItem(12)] : [saleItem(1), saleItem(2), saleItem(3)] };
    }
    await route.fulfill({ contentType: 'application/json', status: 200, body: JSON.stringify(body) });
  });
}

test('M1-10 verifies LV sales status layout and retained functions on PC', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await installMocks(page);
  await page.goto(targetUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  await expect(page.locator('.commerce-shell')).toBeVisible();
  await expect(page.locator('.react-final-tabs .sub-nav > li').first()).toHaveClass(/active/);
  await expect(page.locator('.u10-sales-search')).toBeVisible();
  const expectedHeaders = ['결제일자', '쇼핑몰', '주문번호', '진행상태', '상품명', '쇼핑몰상품번호', '판매수량', '주문금액', '구매자명', '구매자ID'];
  await expect(page.locator('.final-commerce-page.c2p1 thead th')).toHaveText(expectedHeaders);
  await expect(page.locator('.u10-status-pill').first()).toHaveText('주문완료');
  await expect(page.locator('.u10-status-pill').first()).toHaveCSS('font-size', '12px');
  await expect(page.locator('.u10-status-pill').first()).toHaveCSS('height', '27px');
  await expect(page.locator('.u10-sales-summary')).toContainText('총 주문건수 합계');

  await page.screenshot({ fullPage: true, path: '../docs/reference/lv-ui/work/USR-SALES-STATUS-PC/candidate/candidate-react.png' });

  await page.getByLabel('진행상태').selectOption('ORDER_COMPLETE');
  await page.getByLabel('쇼핑몰').selectOption('NAVER');
  await page.getByLabel('제품명').fill('LV 판매상품');
  await page.getByLabel('시작일').fill('2026-08-01');
  await page.getByLabel('종료일').fill('2026-08-08');
  const filteredRequest = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return url.pathname.endsWith('/sales/orders') && url.searchParams.get('keyword') === 'LV 판매상품';
  });
  await page.getByRole('button', { name: /검색/ }).click();
  const filteredUrl = new URL((await filteredRequest).url());
  expect(filteredUrl.searchParams.get('status')).toBe('ORDER_COMPLETE');
  expect(filteredUrl.searchParams.get('shop_type')).toBe('NAVER');
  expect(filteredUrl.searchParams.get('from_date')).toBe('2026-08-01');
  expect(filteredUrl.searchParams.get('to_date')).toBe('2026-08-08');

  await page.getByRole('button', { name: /202608080001 상세 보기/ }).click();
  await expect(page.getByText('기본 옵션')).toBeVisible();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /엑셀 다운로드/ }).click();
  expect((await downloadPromise).suggestedFilename()).toBe('cubici-sales.csv');

  const nextRequest = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return url.pathname.endsWith('/sales/orders') && url.searchParams.get('offset') === '10';
  });
  await page.getByRole('button', { name: '다음' }).click();
  await nextRequest;
  await expect(page.getByText('2026080800012')).toBeVisible();
});

test('M1-10 captures responsive sales status with table-only overflow', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  await installMocks(page);
  await page.goto(targetUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  await expect(page.locator('.commerce-mobile-service-nav')).toBeVisible();
  await expect(page.locator('.commerce-mobile-service-nav a').nth(1)).toHaveClass(/active/);
  await expect(page.locator('.react-final-header')).toBeHidden();
  const tableOverflow = await page.locator('.u10-table-scroll').evaluate((element) => element.scrollWidth > element.clientWidth);
  expect(tableOverflow).toBeTruthy();
  const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(pageOverflow).toBeLessThanOrEqual(1);

  await page.screenshot({ fullPage: true, path: '../docs/reference/lv-ui/work/USR-SALES-STATUS-MOBILE/candidate/candidate-react.png' });
  await context.close();
});
