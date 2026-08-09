import { expect, test } from '../../../admin-web/node_modules/@playwright/test/index.mjs';

const targetUrl = process.env.CUBICI_M1_SETTLEMENT_CALENDAR_URL ?? 'http://127.0.0.1:4310/cubici/calculateInfo/calendar';
const session = {
  token_type: 'Bearer',
  access_token: 'm1-12-user-token',
  expires_in: 3600,
  user: { user_no: 112, email: 'settlement-calendar@cubici.test', user_type: 'USER', name: 'LV 사용자' },
};

function settlementItem(id, date, amount, overrides = {}) {
  return {
    settlements_id: id,
    shop_type: 'NAVER',
    shop_id: 'lv-calendar',
    settlement_type: '일반정산',
    settlement_date: `${date}T10:00:00`,
    total_sale: amount + 12000,
    service_fee: 12000,
    settlement_target_amount: amount,
    settlement_amount: amount,
    pending_released_amount: 0,
    status: 'DONE',
    bank_name: '테스트은행',
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
      body = { total: 1, items: [{ id: 1, user_no: 112, shop_type: 'NAVER', shop_id: 'lv-calendar', status: 'Y', del_yn: 'N' }] };
    } else if (url.pathname.endsWith('/settlements')) {
      body = {
        limit: 100,
        offset: 0,
        total: 3,
        items: [
          settlementItem(1, '2026-08-05', 76000),
          settlementItem(2, '2026-08-05', 124000),
          settlementItem(3, '2026-08-15', 98000),
        ],
      };
    }
    await route.fulfill({ contentType: 'application/json', status: 200, body: JSON.stringify(body) });
  });
}

test('M1-12 verifies LV settlement calendar and retained functions on PC', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await installMocks(page);
  const initialRequest = page.waitForRequest((request) => new URL(request.url()).pathname.endsWith('/settlements'));
  await page.goto(targetUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  const initialUrl = new URL((await initialRequest).url());
  expect(initialUrl.searchParams.get('limit')).toBe('100');
  expect(initialUrl.searchParams.get('offset')).toBe('0');
  expect(initialUrl.searchParams.get('from_date')).toBe('2026-08-01');
  expect(initialUrl.searchParams.get('to_date')).toBe('2026-08-31');

  await expect(page.locator('.commerce-shell')).toBeVisible();
  await expect(page.locator('.react-final-tabs .sub-nav > li').first()).toHaveClass(/active/);
  await expect(page.locator('.u12-calendar-section')).toBeVisible();
  await expect(page.locator('.u12-calendar-heading')).toContainText('2026년 8월');
  await expect(page.locator('.u12-calendar-heading')).toContainText('298,000원');
  await expect(page.locator('.u12-calendar .calendar-header li')).toHaveText(['일', '월', '화', '수', '목', '금', '토']);
  await expect(page.getByText('정산 캘린더 요약')).toHaveCount(0);

  await page.screenshot({ fullPage: true, path: '../docs/reference/lv-ui/work/USR-SETTLEMENT-CALENDAR-PC/candidate/candidate-react.png' });

  const nextMonthRequest = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return url.pathname.endsWith('/settlements') && url.searchParams.get('from_date') === '2026-09-01';
  });
  await page.getByRole('button', { name: '다음 달' }).click();
  await nextMonthRequest;
  await expect(page.locator('.u12-calendar-heading')).toContainText('2026년 9월');

  const previousMonthRequest = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return url.pathname.endsWith('/settlements') && url.searchParams.get('from_date') === '2026-08-01';
  });
  await page.getByRole('button', { name: '이전 달' }).click();
  await previousMonthRequest;

  const shopRequest = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return url.pathname.endsWith('/settlements') && url.searchParams.get('shop_type') === 'NAVER';
  });
  await page.getByLabel('달력 쇼핑몰').selectOption('NAVER');
  await shopRequest;

  await page.getByRole('button', { name: '정산 캘린더 안내' }).click();
  await expect(page.getByRole('tooltip')).toContainText('정산일별 건수');

  await page.getByRole('button', { name: '2026-08-05 정산 상세' }).click();
  await expect(page.getByRole('dialog', { name: '일일 정산 상세내역' })).toBeVisible();
  await expect(page.getByRole('dialog').getByText('76,000원')).toBeVisible();
  await page.getByRole('button', { name: '닫기' }).click();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /엑셀 다운로드/ }).click();
  expect((await downloadPromise).suggestedFilename()).toBe('cubici-settlements.csv');
});

test('M1-12 captures responsive settlement calendar without page overflow', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  await installMocks(page);
  await page.goto(targetUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  await expect(page.locator('.commerce-mobile-service-nav')).toBeVisible();
  await expect(page.locator('.commerce-mobile-service-nav h2')).toHaveText('정산정보');
  await expect(page.locator('.commerce-mobile-service-nav a').nth(2)).toHaveClass(/active/);
  await expect(page.locator('.react-final-header')).toBeHidden();
  const calendarFits = await page.locator('.u12-calendar').evaluate((element) => element.scrollWidth <= element.clientWidth + 1);
  expect(calendarFits).toBeTruthy();
  const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(pageOverflow).toBeLessThanOrEqual(1);

  await page.screenshot({ fullPage: true, path: '../docs/reference/lv-ui/work/USR-SETTLEMENT-CALENDAR-MOBILE/candidate/candidate-react.png' });
  await context.close();
});
