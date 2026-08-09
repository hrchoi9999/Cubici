import { expect, test } from '../../../admin-web/node_modules/@playwright/test/index.mjs';

const targetUrl = process.env.CUBICI_M1_SETTLEMENT_DETAIL_URL ?? 'http://127.0.0.1:4310/cubici/calculateInfo/details';
const session = {
  token_type: 'Bearer',
  access_token: 'm1-13-user-token',
  expires_in: 3600,
  user: { user_no: 113, email: 'settlement-detail@cubici.test', user_type: 'USER', name: 'LV 사용자' },
};

function settlementItem(id, overrides = {}) {
  return {
    settlements_id: id,
    shop_type: 'NAVER',
    shop_id: 'lv-settlement',
    settlement_type: '일반정산',
    settlement_date: '2026-08-21T10:00:00',
    reg_date: '2026-08-16T10:00:00',
    total_sale: 17600,
    service_fee: 348,
    settlement_target_amount: 17252,
    settlement_amount: 17252,
    pending_released_amount: 0,
    status: 'PENDING',
    bank_name: '테스트은행',
    product_name: '남성화 앞막힌 통슬리퍼',
    product_no: '7100702496',
    orderer_name: '배정례',
    orderer_id: 'bjr7-user',
    quantity: 1,
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
      body = { total: 1, items: [{ id: 1, user_no: 113, shop_type: 'NAVER', shop_id: 'lv-settlement', status: 'Y', del_yn: 'N' }] };
    } else if (url.pathname.endsWith('/settlements')) {
      body = {
        limit: 10,
        offset: Number(url.searchParams.get('offset') ?? 0),
        total: 13,
        items: [
          settlementItem(2023111612661261),
          settlementItem(2023111612661262, { settlement_amount: 28500, settlement_target_amount: 28500 }),
          settlementItem(2023111612661263, { status: 'COMPLETE', settlement_amount: 34120, settlement_target_amount: 34120 }),
        ],
      };
    }
    await route.fulfill({ contentType: 'application/json', status: 200, body: JSON.stringify(body) });
  });
}

test('M1-13 verifies LV settlement detail and retained functions on PC', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await installMocks(page);
  const initialRequest = page.waitForRequest((request) => new URL(request.url()).pathname.endsWith('/settlements'));
  await page.goto(targetUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  const initialUrl = new URL((await initialRequest).url());
  expect(initialUrl.searchParams.get('limit')).toBe('10');
  expect(initialUrl.searchParams.get('offset')).toBe('0');

  await expect(page.locator('.commerce-shell')).toBeVisible();
  await expect(page.locator('.react-final-tabs .sub-nav > li').nth(1)).toHaveClass(/active/);
  await expect(page.locator('.u13-settlement-search')).toBeVisible();
  await expect(page.locator('.final-commerce-page.c3p2 thead th')).toHaveCount(14);
  await expect(page.locator('.final-commerce-page.c3p2 thead th')).toHaveText([
    '결제일자', '쇼핑몰', '주문번호', '진행상태', '상품명', '상품번호', '구매자명', '구매자ID', '판매수량', '주문금액', '정산예정일', '정산예정액', '정산입금일', '정산입금액',
  ]);
  await expect(page.locator('.u13-status-pill').first()).toContainText('정산예정');
  await expect(page.locator('.u13-settlement-summary')).toContainText('13건');
  await expect(page.locator('.u13-settlement-summary')).toContainText('79,872원');
  expect(await page.locator('.final-commerce-page.c3p2 tbody td').nth(0).evaluate((element) => getComputedStyle(element).position)).toBe('sticky');

  await page.screenshot({ fullPage: true, path: '../docs/reference/lv-ui/work/USR-SETTLEMENT-DETAIL-PC/candidate/candidate-react.png' });

  const filterRequest = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return url.pathname.endsWith('/settlements') && url.searchParams.get('keyword') === '일반정산';
  });
  await page.getByLabel('제품명').fill('일반정산');
  await page.getByLabel('쇼핑몰').selectOption('NAVER');
  await page.getByLabel('시작일').fill('2026-08-01');
  await page.getByLabel('종료일').fill('2026-08-31');
  await page.getByRole('button', { name: /검색/ }).click();
  const filterUrl = new URL((await filterRequest).url());
  expect(filterUrl.searchParams.get('shop_type')).toBe('NAVER');
  expect(filterUrl.searchParams.get('from_date')).toBe('2026-08-01');
  expect(filterUrl.searchParams.get('to_date')).toBe('2026-08-31');

  await page.getByRole('button', { name: '2023111612661261 상세 보기' }).click();
  await expect(page.getByRole('dialog', { name: '정산 상세정보' })).toBeVisible();
  await expect(page.getByRole('dialog')).toContainText('17,252원');
  await page.getByRole('button', { name: '닫기' }).click();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /엑셀 다운로드/ }).click();
  expect((await downloadPromise).suggestedFilename()).toBe('cubici-settlements.csv');

  const nextRequest = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return url.pathname.endsWith('/settlements') && url.searchParams.get('offset') === '10';
  });
  await page.getByRole('button', { name: '다음' }).click();
  await nextRequest;
});

test('M1-13 captures responsive settlement detail with internal table scroll', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  await installMocks(page);
  await page.goto(targetUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  await expect(page.locator('.commerce-mobile-service-nav h2')).toHaveText('정산정보');
  await expect(page.locator('.commerce-mobile-service-nav a').nth(2)).toHaveClass(/active/);
  await expect(page.locator('.react-final-header')).toBeHidden();
  const tableScroll = await page.locator('.u10-table-scroll').evaluate((element) => element.scrollWidth > element.clientWidth);
  expect(tableScroll).toBeTruthy();
  const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(pageOverflow).toBeLessThanOrEqual(1);

  await page.screenshot({ fullPage: true, path: '../docs/reference/lv-ui/work/USR-SETTLEMENT-DETAIL-MOBILE/candidate/candidate-react.png' });
  await context.close();
});
