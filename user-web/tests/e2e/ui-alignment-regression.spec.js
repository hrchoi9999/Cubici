import { expect, test } from '../../../admin-web/node_modules/@playwright/test/index.mjs';

if (process.env.PLAYWRIGHT_EXECUTABLE_PATH) {
  test.use({ launchOptions: { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } });
}

// All API responses and authentication here are synthetic; no backend is used.
async function prepare(page, authenticated, baseURL) {
  const failures = [];
  page.on('pageerror', (error) => failures.push(error.message));
  await page.addInitScript((enabled) => {
    window.localStorage.removeItem('cubiciUserAuth');
    if (enabled) window.localStorage.setItem('cubiciUserAuth', JSON.stringify({
      access_token: 'ui-alignment-test-only',
      token_type: 'Bearer',
      user: { user_no: 1, email: 'layout@example.test', name: 'UI Test', user_type: 'USER' },
    }));
  }, authenticated);
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.origin !== new URL(baseURL).origin) {
      failures.push(`Unexpected external request: ${url.origin}`);
      return route.abort();
    }
    if (!url.pathname.startsWith('/v1/api/')) return route.continue();
    const responses = {
      '/v1/api/accounts/me/dashboard-summary': {
        sales_total_amount: 123500000, settlement_total_amount: 123500000,
        moneybank_available_balance: 123500000, total_principal_amount: 123500000,
        total_repayment_amount: 123500000, activities: [],
      },
      '/v1/api/accounts/me/shops': {
        total: 1, items: [{ id: 1, user_no: 1, shop_type: 'NAVER', shop_id: 'ui-test', status: 'Y', del_yn: 'N' }],
      },
      '/v1/api/sales/orders': { total: 1, limit: 10, offset: 0, items: [{
        sales_id: 1, shop_type: 'NAVER', shop_id: 'ui-test', order_no: 'TEST-1',
        status: 'ORDER_COMPLETE', product_name: 'Layout fixture', quantity: 1, payment_amount: 10000,
      }] },
      '/v1/api/sales/returns': { total: 1, limit: 10, offset: 0, items: [{
        sales_id: 1, shop_type: 'NAVER', shop_id: 'ui-test', order_no: 'TEST-RETURN-1',
        status: 'RETURN_COMPLETE', product_name: 'Layout fixture', quantity: 1, payment_amount: 10000,
      }] },
      '/v1/api/settlements': { total: 1, limit: 10, offset: 0, items: [{
        settlements_id: 1, shop_type: 'NAVER', shop_id: 'ui-test',
        status: 'PENDING', product_name: 'Layout fixture', settlement_amount: 9000,
      }] },
    };
    const body = responses[url.pathname];
    if (!body || route.request().method() !== 'GET') {
      failures.push(`Unexpected API request: ${route.request().method()} ${url.pathname}`);
      return route.abort();
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
  return failures;
}

async function finish(page, testInfo, failures) {
  const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  await page.screenshot({ path: testInfo.outputPath('viewport.png'), fullPage: false });
  const outliers = pageOverflow > 1 ? await page.locator('header, footer, .inner, main, section').evaluateAll((elements) => elements.map((element) => ({
    tag: element.tagName, classes: element.className, width: element.getBoundingClientRect().width,
    right: element.getBoundingClientRect().right, minWidth: getComputedStyle(element).minWidth,
  })).filter((item) => item.right > window.innerWidth)) : [];
  expect(pageOverflow, JSON.stringify(outliers)).toBeLessThanOrEqual(1);
  expect(failures).toEqual([]);
}

for (const width of [360, 390, 767, 768, 1023, 1024, 1119, 1120, 1366]) {
  test.describe(`UI alignment ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });

    for (const authenticated of [false, true]) {
      test(`main ${authenticated ? 'authenticated' : 'public'}`, async ({ page, baseURL }, testInfo) => {
        const failures = await prepare(page, authenticated, baseURL);
        await page.goto('/', { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        await expect(page.locator(authenticated ? '.auth-main-shell' : '.public-main-shell')).toBeVisible();
        const publicPanel = page.locator('.final-mobile-logout');
        if (authenticated) {
          await expect(publicPanel).toHaveCount(0);
          await expect(page.locator('.lv-auth-dashboard')).toBeVisible();
          await expect(page.locator('.lv-auth-dashboard')).toContainText('123,500,000');
          for (const item of await page.locator('.bank-item.item-1 .inner-item, .bank-item.item-2 .inner-item').all()) {
            const title = await item.locator('.tit').boundingBox();
            const value = await item.locator('.data-wrap').boundingBox();
            expect(title.x + title.width).toBeLessThanOrEqual(value.x + 1);
            if (width < 1024) expect(value.x + value.width).toBeLessThanOrEqual(width);
          }
        } else if (width < 1024) {
          await expect(publicPanel).toBeVisible();
          const links = publicPanel.locator('.lv-mobile-section-tabs a');
          await expect(links).toHaveCount(4);
          const boxes = await links.evaluateAll((elements) => elements.map((element) => {
            const box = element.getBoundingClientRect();
            return { left: box.left, right: box.right };
          }));
          for (let index = 1; index < boxes.length; index += 1) {
            expect(boxes[index].left).toBeGreaterThan(boxes[index - 1].right);
          }
          for (const link of await publicPanel.locator('.login-box a').all()) {
            await expect(link).toBeVisible();
            const box = await link.boundingBox();
            expect(box.x).toBeGreaterThanOrEqual(0);
            expect(box.x + box.width).toBeLessThanOrEqual(width);
          }
        } else {
          await expect(publicPanel).toBeHidden();
        }
        await finish(page, testInfo, failures);
      });
    }

    for (const [name, route] of [
      ['sales', '/cubici/salesInfo/sales'],
      ['returns', '/cubici/salesInfo/return'],
      ['settlement', '/cubici/calculateInfo/details'],
    ]) {
      test(`${name} toolbar`, async ({ page, baseURL }, testInfo) => {
        const failures = await prepare(page, true, baseURL);
        await page.goto(route, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        const toolbar = page.locator('.u10-table-controls');
        await expect(toolbar).toBeVisible();
        await expect(page.locator('tbody')).toContainText('Layout fixture');
        const dimensions = await toolbar.evaluate((element) => ({
          height: element.clientHeight, scrollHeight: element.scrollHeight,
          width: element.clientWidth, scrollWidth: element.scrollWidth,
        }));
        expect(dimensions.scrollHeight).toBeLessThanOrEqual(dimensions.height);
        expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.width);
        await expect(toolbar.locator('label')).toHaveCount(2);
        await expect(toolbar.locator('select')).toHaveCount(2);
        const boxes = [];
        for (const label of await toolbar.locator('label').all()) {
          await expect(label).toHaveCSS('white-space', 'nowrap');
          const outer = await label.boundingBox();
          const inner = await label.locator('select').boundingBox();
          boxes.push(outer);
          expect(outer.height).toBe(40);
          expect(inner.height).toBe(38);
          expect(inner.y).toBeGreaterThanOrEqual(outer.y);
          expect(inner.y + inner.height).toBeLessThanOrEqual(outer.y + outer.height);
          expect(outer.x).toBeGreaterThanOrEqual(0);
          expect(outer.x + outer.width).toBeLessThanOrEqual(width);
        }
        expect(boxes[0].x + boxes[0].width <= boxes[1].x + 1
          || boxes[0].y + boxes[0].height <= boxes[1].y + 1).toBe(true);
        if (width < 1024) {
          expect(await page.locator('.u10-table-scroll').evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
        }
        await finish(page, testInfo, failures);
      });
    }
  });
}
