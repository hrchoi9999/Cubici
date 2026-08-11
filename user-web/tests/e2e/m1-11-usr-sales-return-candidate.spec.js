import { expect, test } from '../../../admin-web/node_modules/@playwright/test/index.mjs';

const targetUrl = process.env.CUBICI_M1_SALES_RETURN_URL ?? 'http://127.0.0.1:4310/cubici/salesInfo/return';
const session = {
  token_type: 'Bearer',
  access_token: 'm1-11-user-token',
  expires_in: 3600,
  user: { user_no: 111, email: 'sales-return@cubici.test', user_type: 'USER', name: 'LV 사용자' },
};

function returnItem(id, kind, overrides = {}) {
  return {
    returns_id: id,
    shop_type: 'COUPANG',
    shop_id: 'lv-return',
    order_no: `20260808010${id}`,
    product_no: `7100803${id}`,
    status: kind,
    claim_status: kind,
    receipt_type: kind,
    payment_amount: 19800 * id,
    receipt_no: `RCPT-${id}`,
    payment_no: `PAY-${id}`,
    total_cancel_count: id,
    cancel_count: id,
    order_count: id,
    return_delivery_no: `8434384780${id}`,
    request_date: '2026-08-08T11:00:00',
    claim_complete_date: '2026-08-09T16:00:00',
    reg_date: '2026-08-07T09:00:00',
    product_name: `LV 반품교환 상품 ${id}`,
    delivery_no: `6525260121${id}`,
    delivery_complete_date: '2026-08-07T18:00:00',
    orderer_name: '권소정',
    orderer_id: `miji${id}`,
    recipient_name: '권소정',
    redelivery_no: kind === 'EXCHANGE' ? `RE-${id}` : null,
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
      body = { total: 1, items: [{ id: 1, user_no: 111, shop_type: 'COUPANG', shop_id: 'lv-return', status: 'Y', del_yn: 'N' }] };
    } else if (url.pathname.endsWith('/sales/returns')) {
      const offset = Number(url.searchParams.get('offset') ?? 0);
      body = {
        limit: 10,
        offset,
        total: 12,
        items: offset ? [returnItem(12, 'RETURN')] : [returnItem(1, 'EXCHANGE'), returnItem(2, 'RETURN'), returnItem(3, 'RETURN')],
      };
    }
    await route.fulfill({ contentType: 'application/json', status: 200, body: JSON.stringify(body) });
  });
}

test('M1-11 verifies LV sales return layout and retained functions on PC', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await installMocks(page);
  await page.goto(targetUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  await expect(page.locator('.commerce-shell')).toBeVisible();
  await expect(page.locator('.react-final-tabs .sub-nav > li').nth(1)).toHaveClass(/active/);
  await expect(page.locator('.u11-return-search')).toBeVisible();
  const expectedHeaders = ['결제일자', '쇼핑몰', '주문번호', '진행상태', '상품명', '쇼핑몰상품번호', '송장번호', '배송완료일자', '구매자명', '구매자ID', '수령자', '주문금액', '판매수량', '(반품/교환)신청일', '수거송장번호', '재배송송장번호'];
  await expect(page.locator('.final-commerce-page.c2p2 thead th')).toHaveText(expectedHeaders);
  await expect(page.locator('.u11-status-pill.claim-exchange').first()).toHaveText('교환');
  await expect(page.locator('.u11-status-pill.claim-return').first()).toHaveText('반품');
  await expect(page.locator('.u11-status-pill.claim-exchange').first()).toHaveCSS('font-size', '12px');
  await expect(page.locator('.u11-status-pill.claim-exchange').first()).toHaveCSS('height', '27px');
  await expect(page.locator('.u11-return-summary')).toContainText('반품금액 합계');
  await expect(page.locator('.u11-return-summary')).toContainText('교환금액 합계');

  await page.screenshot({ fullPage: true, path: '../docs/reference/lv-ui/work/USR-SALES-RETURN-PC/candidate/candidate-react.png' });

  await page.getByLabel('진행상태').selectOption('EXCHANGE');
  await page.getByLabel('쇼핑몰').selectOption('COUPANG');
  await page.getByLabel('제품명').fill('LV 반품교환 상품');
  await page.getByLabel('시작일').fill('2026-08-01');
  await page.getByLabel('종료일').fill('2026-08-08');
  const filteredRequest = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return url.pathname.endsWith('/sales/returns') && url.searchParams.get('keyword') === 'LV 반품교환 상품';
  });
  await page.getByRole('button', { name: /검색/ }).click();
  const filteredUrl = new URL((await filteredRequest).url());
  expect(filteredUrl.searchParams.get('status')).toBe('EXCHANGE');
  expect(filteredUrl.searchParams.get('shop_type')).toBe('COUPANG');
  expect(filteredUrl.searchParams.get('from_date')).toBe('2026-08-01');
  expect(filteredUrl.searchParams.get('to_date')).toBe('2026-08-08');

  await page.getByRole('button', { name: /202608080101 상세 보기/ }).click();
  await expect(page.getByText('RCPT-1')).toBeVisible();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /엑셀 다운로드/ }).click();
  expect((await downloadPromise).suggestedFilename()).toBe('cubici-returns.csv');

  const nextRequest = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return url.pathname.endsWith('/sales/returns') && url.searchParams.get('offset') === '10';
  });
  await page.getByRole('button', { name: '다음' }).click();
  await nextRequest;
  await expect(page.getByText('2026080801012')).toBeVisible();
});

test('M1-11 captures responsive sales return with table-only overflow', async ({ browser }) => {
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

  await page.screenshot({ fullPage: true, path: '../docs/reference/lv-ui/work/USR-SALES-RETURN-MOBILE/candidate/candidate-react.png' });
  await context.close();
});
