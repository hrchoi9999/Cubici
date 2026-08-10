import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const candidateDir = path.resolve(
  __dirname,
  '../../../docs/reference/lv-ui/admin/ADM-LV-04-MONEYBANK-OVERVIEW/candidate',
);

fs.mkdirSync(candidateDir, { recursive: true });

const payload = {
  unit: 'day',
  summary: {
    standard_date: '2024-04-17', from_date: '2024-03-18', to_date: '2024-04-17',
    data_source_label: 'PostgreSQL 직접집계', aggregation_status_label: 'legacy procedure 대조 필요',
    contract_total_count: 7, contract_today_count: 0, review_today_count: 0,
    approved_today_count: 0, terminated_today_count: 0, active_contract_count: 4,
    terminated_contract_count: 2, provision_today_amount: 0, provision_total_amount: 55686548,
    provision_total_count: 538, repayment_today_amount: 104000, repayment_total_amount: 54772944,
    repayment_total_count: 339, repayment_fee_total_amount: 566016,
    outstanding_balance_amount: 909988, outstanding_balance_count: 1,
    balance_reconcile_amount: 913604, balance_reconcile_diff: -3616,
    balance_reconcile_status_label: '검산차이', settlement_total_amount: 181063,
    settlement_total_count: 28,
  },
  warnings: [{
    mbid: 'MB00000001', user_name: '홍길동', firm_name: '큐빅아이',
    provision_amount: 55686548, repayment_amount: 54772944,
    outstanding_balance: 913604, signal: '미상환잔액', prizm_grade: 'B',
  }],
  series: [
    { bucket: '2024-04-13', contract_count: 1, review_count: 1, approved_count: 0, terminated_count: 0, request_amount: 2500000, review_amount: 2500000, approved_amount: 0, provision_amount: 5000000, provision_count: 2, repayment_amount: 320000, repayment_fee: 4100, settlement_amount: 50000, outstanding_balance: 0 },
    { bucket: '2024-04-14', contract_count: 0, review_count: 0, approved_count: 1, terminated_count: 0, request_amount: 0, review_amount: 0, approved_amount: 2500000, provision_amount: 4200000, provision_count: 1, repayment_amount: 480000, repayment_fee: 6200, settlement_amount: 45000, outstanding_balance: 913604 },
    { bucket: '2024-04-15', contract_count: 2, review_count: 1, approved_count: 1, terminated_count: 0, request_amount: 6200000, review_amount: 3100000, approved_amount: 3000000, provision_amount: 6800000, provision_count: 3, repayment_amount: 1200000, repayment_fee: 12100, settlement_amount: 36000, outstanding_balance: 913604 },
    { bucket: '2024-04-16', contract_count: 0, review_count: 0, approved_count: 0, terminated_count: 1, request_amount: 0, review_amount: 0, approved_amount: 0, provision_amount: 3000000, provision_count: 1, repayment_amount: 900000, repayment_fee: 8900, settlement_amount: 50000, outstanding_balance: 913604 },
    { bucket: '2024-04-17', contract_count: 0, review_count: 0, approved_count: 0, terminated_count: 0, request_amount: 0, review_amount: 0, approved_amount: 0, provision_amount: 0, provision_count: 0, repayment_amount: 104000, repayment_fee: 1300, settlement_amount: 0, outstanding_balance: 913604 },
  ],
};

async function installPageState(page) {
  await page.route('**/v1/api/**', async (route) => {
    const body = route.request().url().includes('/accounts/admin-me')
      ? { user_no: 1, email: 'admin@example.com', user_type: 'ADMIN_USER', name: '관리자' }
      : payload;
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
  await page.addInitScript(() => {
    window.localStorage.setItem('cubiciAdminAuth', JSON.stringify({
      token_type: 'Bearer', access_token: 'adm-lv-04-token',
      user: { email: 'admin@example.com', user_type: 'ADMIN_USER' },
    }));
  });
}

async function expectRenderedCharts(page) {
  const canvases = page.locator('.managementLvChartBox canvas');
  await expect(canvases).toHaveCount(3);
  for (let index = 0; index < 3; index += 1) {
    const canvas = canvases.nth(index);
    await expect(canvas).toBeVisible();
    await expect.poll(async () => canvas.evaluate((element) => {
      const pixels = element.getContext('2d').getImageData(0, 0, element.width, element.height).data;
      let painted = 0;
      for (let offset = 3; offset < pixels.length; offset += 4) {
        if (pixels[offset] > 0) painted += 1;
      }
      return painted;
    })).toBeGreaterThan(500);
  }
}

test.beforeEach(async ({ page }) => {
  await installPageState(page);
});

test('ADM-LV-04 restores the LV overview tab and three charts on PC', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/admin/moneybank/cubici/management/info_tab1');

  await expect(page.locator('.managementLvTabs li.active')).toContainText('현황 종합');
  await expect(page.locator('.managementLvKpiGrid article')).toHaveCount(4);
  await expect(page.getByText('55.7 / 538건')).toBeVisible();
  await expect(page.locator('.managementWarningTable tbody tr')).toHaveCount(1);
  await expectRenderedCharts(page);
  expect(pageErrors).toEqual([]);
  await page.screenshot({ fullPage: true, path: path.join(candidateDir, 'ADM-LV-04-MONEYBANK-OVERVIEW-PC.png') });
});

test('ADM-LV-04 restores the LV operation tab and migrated totals on PC', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/admin/moneybank/cubici/management/info_tab2');

  await expect(page.locator('.subVisual h3')).toHaveText('통합 현황');
  await expect(page.locator('.managementLvTabs li.active')).toContainText('운영지표');
  await expect(page.locator('.managementLvKpiGrid article')).toHaveCount(8);
  await expect(page.getByText('54,772,944원')).toBeVisible();
  await expect(page.getByText('913,604원')).toBeVisible();
  await expect(page.getByText('566,016원')).toBeVisible();
  await expectRenderedCharts(page);
  await page.screenshot({ fullPage: true, path: path.join(candidateDir, 'ADM-LV-04-MONEYBANK-OPERATION-PC.png') });
});

for (const tab of [
  { path: 'info_tab1', name: 'OVERVIEW' },
  { path: 'info_tab2', name: 'OPERATION' },
]) {
  test(`ADM-LV-04 keeps ${tab.name.toLowerCase()} responsive on mobile`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/admin/moneybank/cubici/management/${tab.path}`);
    await expectRenderedCharts(page);
    await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);
    await page.screenshot({ fullPage: true, path: path.join(candidateDir, `ADM-LV-04-MONEYBANK-${tab.name}-MOBILE.png`) });
  });
}
