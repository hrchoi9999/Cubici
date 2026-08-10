import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const candidateDir = path.resolve(
  __dirname,
  '../../../docs/reference/lv-ui/admin/ADM-LV-02-CUBICI-INTEGRATED/candidate',
);

fs.mkdirSync(candidateDir, { recursive: true });

const periodMetric = { today: 3, current_month: 18, previous_month: 24, available: true };
const amountMetric = { today: 1500000, current_month: 12800000, previous_month: 35400000, available: true };
const unavailableMetric = { today: null, current_month: null, previous_month: null, available: false };

const payload = {
  unit: 'day',
  partner_code: null,
  product_code: null,
  metrics: {
    standard_date: '2026-08-09',
    from_date: '2026-07-10',
    to_date: '2026-08-09',
    new_members: periodMetric,
    withdrawn_members: { today: 0, current_month: 1, previous_month: 2, available: true },
    fee_income: amountMetric,
    dormant_members: periodMetric,
    sales_amount: amountMetric,
    sales_quantity: { today: 12, current_month: 98, previous_month: 210, available: true },
    settlement_amount: amountMetric,
    sku_count: { today: 4, current_month: 32, previous_month: 58, available: true },
    visitor_count: unavailableMetric,
    max_concurrent_users: unavailableMetric,
    average_usage_minutes: unavailableMetric,
    average_shop_count: { today: 2.4, current_month: 2.35, previous_month: 2.2, available: true },
  },
  partners: [{ value: 'PARTNER-A', label: '협력사 A' }],
  products: [{ value: 'MP', label: '선정산' }],
  channels: [
    { value: 'DIRECT', label: '큐빅아이' },
    { value: 'PARTNER-A', label: '협력사 A' },
  ],
  series: [
    {
      bucket: '2026-08-07', new_member_count: 1, withdrawn_member_count: 0,
      cumulative_member_count: 38, cubici_average_days: 210, moneybank_average_days: 84,
      channel_counts: { DIRECT: 1, 'PARTNER-A': 0 },
    },
    {
      bucket: '2026-08-08', new_member_count: 2, withdrawn_member_count: 1,
      cumulative_member_count: 39, cubici_average_days: 211, moneybank_average_days: 85,
      channel_counts: { DIRECT: 1, 'PARTNER-A': 1 },
    },
    {
      bucket: '2026-08-09', new_member_count: 3, withdrawn_member_count: 0,
      cumulative_member_count: 42, cubici_average_days: 212, moneybank_average_days: 86,
      channel_counts: { DIRECT: 2, 'PARTNER-A': 1 },
    },
  ],
};

async function installPageState(page) {
  await page.route('**/v1/api/**', async (route) => {
    const url = route.request().url();
    const body = url.includes('/accounts/admin-me')
      ? { user_no: 1, email: 'admin@example.com', user_type: 'ADMIN_USER', name: '관리자' }
      : payload;
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
  await page.addInitScript(() => {
    window.localStorage.setItem('cubiciAdminAuth', JSON.stringify({
      token_type: 'Bearer',
      access_token: 'adm-lv-02-token',
      user: { email: 'admin@example.com', user_type: 'ADMIN_USER' },
    }));
  });
}

async function expectRenderedCharts(page) {
  const canvases = page.locator('.integratedLvChartBox canvas');
  await expect(canvases).toHaveCount(3);
  for (let index = 0; index < 3; index += 1) {
    const canvas = canvases.nth(index);
    await expect(canvas).toBeVisible();
    await expect.poll(async () => canvas.evaluate((element) => {
      const pixels = element.getContext('2d').getImageData(0, 0, element.width, element.height).data;
      let coloredPixels = 0;
      for (let offset = 3; offset < pixels.length; offset += 4) {
        if (pixels[offset] > 0) coloredPixels += 1;
      }
      return coloredPixels;
    })).toBeGreaterThan(500);
  }
}

test.beforeEach(async ({ page }) => {
  await installPageState(page);
});

test('ADM-LV-02 restores all LV cards, graphs and filters on PC', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/admin/cubici/infoIntegrated/cubici_tab1');

  await expect(page.locator('.integratedLvTabs li')).toHaveCount(4);
  await expect(page.locator('.integratedLvMetricGrid article')).toHaveCount(12);
  await expect(page.getByText('미집계').first()).toBeVisible();
  await expect(page.locator('#integratedPartnerCode option')).toHaveCount(2);
  await expect(page.locator('#integratedProductCode option')).toHaveCount(2);
  await expectRenderedCharts(page);

  await page.locator('#integratedPartnerCode').selectOption('PARTNER-A');
  await page.locator('#integratedProductCode').selectOption('MP');
  await page.locator('#integratedUnit').selectOption('week');
  await Promise.all([
    page.waitForRequest((request) => (
      request.url().includes('/management/cubici-integrated')
      && request.url().includes('partner_code=PARTNER-A')
      && request.url().includes('product_code=MP')
      && request.url().includes('unit=week')
    )),
    page.locator('.integratedLvSearch button[type="submit"]').click(),
  ]);

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: '엑셀 다운로드' }).click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/^cubici-integrated-.*\.csv$/);
  expect(pageErrors).toEqual([]);
  await page.screenshot({
    fullPage: true,
    path: path.join(candidateDir, 'ADM-LV-02-CUBICI-INTEGRATED-PC.png'),
  });
});

test('ADM-LV-02 keeps the full LV dashboard responsive on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/admin/cubici/infoIntegrated/cubici_tab1');

  await expect(page.locator('.integratedLvMetricGrid article')).toHaveCount(12);
  await expectRenderedCharts(page);
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);
  await page.screenshot({
    fullPage: true,
    path: path.join(candidateDir, 'ADM-LV-02-CUBICI-INTEGRATED-MOBILE.png'),
  });
});
