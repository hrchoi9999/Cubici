import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const candidateDir = path.resolve(
  __dirname,
  '../../../docs/reference/lv-ui/admin/ADM-LV-23-MONEYBANK-INTEGRATED/candidate',
);

fs.mkdirSync(candidateDir, { recursive: true });

const payload = {
  unit: 'day',
  summary: {
    standard_date: '2026-08-09',
    from_date: '2026-08-01',
    to_date: '2026-08-09',
    contract_total_count: 18,
    contract_today_count: 3,
    review_today_count: 2,
    approved_today_count: 2,
    terminated_today_count: 1,
    active_contract_count: 13,
    terminated_contract_count: 5,
    provision_today_amount: 14000000,
    provision_total_amount: 36000000,
    provision_total_count: 12,
    repayment_today_amount: 6800000,
    repayment_total_amount: 12800000,
    repayment_total_count: 6,
    repayment_fee_total_amount: 640000,
    outstanding_balance_amount: 23200000,
    outstanding_balance_count: 7,
    settlement_total_amount: 13300000,
    settlement_total_count: 5,
    balance_reconcile_amount: 23200000,
    balance_reconcile_diff: 0,
    balance_reconcile_status_label: '검산일치',
  },
  series: [
    { bucket: '2026-08-07', contract_count: 2, review_count: 1, approved_count: 1, terminated_count: 0, request_amount: 9000000, review_amount: 8000000, approved_amount: 7000000, provision_amount: 10000000, provision_count: 3, repayment_amount: 3000000, repayment_fee: 150000, settlement_amount: 5400000, outstanding_balance: 7000000 },
    { bucket: '2026-08-08', contract_count: 3, review_count: 2, approved_count: 2, terminated_count: 0, request_amount: 12000000, review_amount: 10000000, approved_amount: 9000000, provision_amount: 12000000, provision_count: 4, repayment_amount: 3000000, repayment_fee: 150000, settlement_amount: 7900000, outstanding_balance: 16000000 },
    { bucket: '2026-08-09', contract_count: 3, review_count: 2, approved_count: 2, terminated_count: 1, request_amount: 14000000, review_amount: 11000000, approved_amount: 10000000, provision_amount: 14000000, provision_count: 5, repayment_amount: 6800000, repayment_fee: 340000, settlement_amount: 0, outstanding_balance: 23200000 },
  ],
};

test.beforeEach(async ({ page }) => {
  await page.route('**/v1/api/**', async (route) => {
    const url = new URL(route.request().url());
    const body = url.pathname.endsWith('/accounts/admin-me')
      ? { user_no: 1, email: 'admin@example.com', user_type: 'ADMIN_USER', name: '관리자' }
      : payload;
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) });
  });
  await page.addInitScript(() => {
    window.localStorage.setItem('cubiciAdminAuth', JSON.stringify({
      token_type: 'Bearer',
      access_token: 'adm-lv-23-token',
      user: { email: 'admin@example.com', user_type: 'ADMIN_USER' },
    }));
  });
});

test('ADM-LV-23 현황 종합 PC·모바일 후보를 검증한다', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/admin/cubici/infoIntegrated/moneybank_tab1');

  await expect(page.locator('.moneybankLvTabs li.active')).toContainText('현황 종합');
  await expect(page.locator('.moneybankLvMetricGrid article')).toHaveCount(4);
  await expect(page.locator('.moneybankLvChartBox canvas')).toHaveCount(3);
  await expect.poll(() => canvasHasInk(page)).toBe(true);
  expect(await bodyOverflow(page)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: path.join(candidateDir, 'ADM-LV-23-OVERVIEW-PC.png'), fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expectClosedNavigation(page);
  expect(await bodyOverflow(page)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: path.join(candidateDir, 'ADM-LV-23-OVERVIEW-MOBILE.png'), fullPage: true });
});

test('ADM-LV-23 운영지표 PC·모바일 후보와 검색·엑셀을 검증한다', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/admin/cubici/infoIntegrated/moneybank_tab2');

  await expect(page.getByRole('heading', { name: '서비스 현황' })).toBeVisible();
  await expect(page.locator('.moneybankLvTabs li.active')).toContainText('운영지표');
  await expect(page.getByRole('heading', { name: '신청/심사/계약' })).toBeVisible();
  await expect(page.locator('.moneybankLvChartBox canvas')).toHaveCount(3);
  await expect.poll(() => canvasHasInk(page)).toBe(true);

  await page.getByLabel('분석단위').selectOption('week');
  const request = page.waitForRequest((item) => new URL(item.url()).searchParams.get('unit') === 'week');
  await page.getByRole('button', { name: '검색' }).click();
  await request;

  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: '엑셀 다운로드' }).click();
  await expect.poll(async () => (await download).suggestedFilename()).toContain('moneybank-operations');
  expect(await bodyOverflow(page)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: path.join(candidateDir, 'ADM-LV-23-OPERATIONS-PC.png'), fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expectClosedNavigation(page);
  expect(await bodyOverflow(page)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: path.join(candidateDir, 'ADM-LV-23-OPERATIONS-MOBILE.png'), fullPage: true });
});

async function canvasHasInk(page) {
  return page.locator('.moneybankLvChartBox canvas').first().evaluate((canvas) => {
    const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
    for (let index = 3; index < data.length; index += 4) {
      if (data[index] !== 0) return true;
    }
    return false;
  });
}

async function expectClosedNavigation(page) {
  await expect(page.locator('.adminNavigationToggle')).toBeVisible();
  await expect.poll(async () => {
    const box = await page.locator('#admin-navigation').boundingBox();
    return box?.x ?? 0;
  }).toBeLessThanOrEqual(-300);
}

function bodyOverflow(page) {
  return page.evaluate(() => document.body.scrollWidth - document.documentElement.clientWidth);
}
