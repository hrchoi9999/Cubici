import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const candidateDir = path.resolve(
  __dirname,
  '../../../docs/reference/lv-ui/admin/ADM-LV-01-MEMBER-SUMMARY/candidate',
);

fs.mkdirSync(candidateDir, { recursive: true });

const memberSummary = {
  unit: 'day',
  partner_code: null,
  product_code: null,
  metrics: {
    standard_date: '2026-08-09',
    from_date: '2026-07-10',
    to_date: '2026-08-09',
    cubici_yesterday_count: 3,
    cubici_total_count: 42,
    moneybank_yesterday_count: 1,
    moneybank_total_count: 8,
    terminated_yesterday_count: 0,
    terminated_total_count: 2,
    partner_yesterday_count: 0,
    partner_total_count: 4,
  },
  series: [
    {
      bucket: '2026-08-07', cubici_count: 1, moneybank_count: 0, terminated_count: 0,
      cubici_cumulative: 38, moneybank_cumulative: 6, terminated_cumulative: 2, moneybank_ratio: 15.79,
    },
    {
      bucket: '2026-08-08', cubici_count: 1, moneybank_count: 1, terminated_count: 0,
      cubici_cumulative: 39, moneybank_cumulative: 7, terminated_cumulative: 2, moneybank_ratio: 17.95,
    },
    {
      bucket: '2026-08-09', cubici_count: 3, moneybank_count: 1, terminated_count: 0,
      cubici_cumulative: 42, moneybank_cumulative: 8, terminated_cumulative: 2, moneybank_ratio: 19.05,
    },
  ],
};

function apiPayload(url) {
  if (url.includes('/accounts/admin-me')) {
    return { user_no: 1, email: 'admin@example.com', user_type: 'ADMIN_USER', name: '관리자' };
  }
  if (url.includes('/management/member-summary/options')) {
    return {
      partners: [{ value: 'PARTNER-A', label: '협력사 A' }],
      products: [{ value: 'MP', label: '선정산' }],
    };
  }
  if (url.includes('/management/member-summary')) return memberSummary;
  return { items: [], total: 0, counts: {}, metrics: {}, series: [] };
}

async function installPageState(page) {
  await page.route('**/v1/api/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(apiPayload(route.request().url())),
    });
  });
  await page.addInitScript(() => {
    window.localStorage.setItem('cubiciAdminAuth', JSON.stringify({
      token_type: 'Bearer',
      access_token: 'adm-lv-01-token',
      user: { email: 'admin@example.com', user_type: 'ADMIN_USER' },
    }));
  });
}

async function expectRenderedChart(page) {
  const canvas = page.locator('.memberSummaryChartBox canvas');
  await expect(canvas).toBeVisible();
  await expect.poll(async () => canvas.evaluate((element) => {
    const context = element.getContext('2d');
    const pixels = context.getImageData(0, 0, element.width, element.height).data;
    let coloredPixels = 0;
    for (let index = 3; index < pixels.length; index += 4) {
      if (pixels[index] > 0) coloredPixels += 1;
    }
    return coloredPixels;
  })).toBeGreaterThan(500);
}

test.beforeEach(async ({ page }) => {
  await installPageState(page);
});

test('ADM-LV-01 restores the PC member summary graph and query controls', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/admin/cubici/manageMember/member_tab1');

  await expect(page.getByText('• 누적 : 42명')).toBeVisible();
  await expect(page.locator('#memberPartnerCode')).toHaveValue('');
  await expect(page.locator('#memberPartnerCode option')).toHaveCount(2);
  await expect(page.locator('#memberProductCode option')).toHaveCount(2);
  await expectRenderedChart(page);

  await page.locator('#memberPartnerCode').selectOption('PARTNER-A');
  await page.locator('#memberProductCode').selectOption('MP');
  await page.locator('#memberUnit').selectOption('week');
  await Promise.all([
    page.waitForRequest((request) => (
      request.url().includes('/management/member-summary')
      && request.url().includes('partner_code=PARTNER-A')
      && request.url().includes('product_code=MP')
      && request.url().includes('unit=week')
    )),
    page.locator('form.searchArea button[type="submit"]').click(),
  ]);

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: '엑셀 다운로드' }).click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/^cubici-member-summary-.*\.csv$/);
  expect(pageErrors).toEqual([]);
  await page.screenshot({
    fullPage: true,
    path: path.join(candidateDir, 'ADM-LV-01-MEMBER-SUMMARY-PC.png'),
  });
});

test('ADM-LV-01 keeps the member summary graph responsive on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/admin/cubici/manageMember/member_tab1');

  await expectRenderedChart(page);
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);
  await page.screenshot({
    fullPage: true,
    path: path.join(candidateDir, 'ADM-LV-01-MEMBER-SUMMARY-MOBILE.png'),
  });
});
