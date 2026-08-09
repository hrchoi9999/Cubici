import { expect, test } from '../../../admin-web/node_modules/@playwright/test/index.mjs';

const session = {
  access_token: 'batch7-smoke-token',
  token_type: 'Bearer',
  user: {
    user_no: 7007,
    email: 'batch7-smoke@example.com',
    name: 'Batch7 Smoke',
    phone: '010-0000-0000',
    user_type: 'GENERAL',
    biz_name: '스모크상사',
    biz_num: '000-00-00000',
    partner_code: 'SMOKE',
  },
};

const routes = [
  ['/board/notice/index', '.final-support-page'],
  ['/board/qa/index', '.final-support-page'],
  ['/board/faq/index', '.final-support-page'],
  ['/chargeInfo', '.final-charge-page'],
  ['/chargeInfo/BASIC', '.final-charge-page'],
  ['/cubici/mypage/profile', '.final-mypage-page'],
  ['/cubici/mypage/companyInfo', '.final-mypage-page'],
  ['/cubici/mypage/businessInfo', '.final-mypage-page'],
  ['/cubici/mypage/myAuth', '.final-mypage-page'],
  ['/cubici/mypage/myCharge', '.final-mypage-page'],
  ['/cubici/mypage/withdraw', '.final-mypage-page'],
  ['/cubici/moneybank/together/current/SMOKE-MBID', '.final-moneybank-derived-page'],
  ['/cubici/moneybank/clauseDetails/details1', '.final-moneybank-derived-page'],
  ['/cubici/moneybank/together/depositTest', '.final-moneybank-derived-page'],
  ['/moneybank/advcalc/contract', '.final-moneybank-derived-page'],
  ['/not-found-batch7-smoke', '.final-notfound-page'],
];

test.beforeEach(async ({ page }) => {
  await page.route('**/v1/api/**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: [], total: 0 }),
    });
  });
  await page.addInitScript((value) => {
    window.localStorage.setItem('cubiciUserAuth', JSON.stringify(value));
  }, session);
});

for (const [path, selector] of routes) {
  test(`Batch 7 desktop route ${path}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto(path);
    await expect(page.locator(selector).first()).toBeVisible();
    await expect(page.locator('.react-final-header').first()).toBeVisible();
    const missingAssets = await page.evaluate(() => Array.from(document.images).filter((img) => img.complete && img.naturalWidth === 0).map((img) => img.currentSrc || img.src));
    expect(missingAssets).toEqual([]);
    await page.screenshot({ fullPage: true, path: `../docs/batch7_support_mypage_smoke/${testInfo.title.replace(/[^a-z0-9]+/gi, '_')}.png` });
  });
}

test('Batch 7 mobile layout has no horizontal overflow on representative pages', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ['/board/qa/index', '/cubici/mypage/companyInfo', '/chargeInfo', '/cubici/moneybank/clauseDetails/details1']) {
    await page.goto(path);
    const metrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 2);
  }
});
