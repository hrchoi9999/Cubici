import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const candidateDir = path.resolve(
  __dirname,
  '../../../docs/reference/lv-ui/admin/ADM-LV-08-SETTLEMENT-MANAGEMENT/candidate',
);

fs.mkdirSync(candidateDir, { recursive: true });

const items = [
  {
    settlements_id: 240801, shop_type: 'NAVER', shop_id: 'CUBICI-01', settlement_type: 'DAILY',
    settlement_date: '2026-08-09', total_sale: 3000000, service_fee: 36000,
    settlement_target_amount: 2964000, settlement_amount: 2964000, pending_released_amount: 0,
    bank_name: '테스트은행', bank_account_holder: '테스트상점', bank_account: 'TEST-ACCOUNT-01',
    status: 'READY', settlement_check_status: 'OK', settlement_difference: 0,
  },
  {
    settlements_id: 240802, shop_type: 'COUPANG', shop_id: 'CUBICI-02', settlement_type: 'WEEKLY',
    settlement_date: '2026-08-08', total_sale: 5200000, service_fee: 78000,
    settlement_target_amount: 5122000, settlement_amount: 5100000, pending_released_amount: 0,
    bank_name: '테스트은행', bank_account_holder: '샘플상점', bank_account: 'TEST-ACCOUNT-02',
    status: 'HOLD', settlement_check_status: 'DIFF', settlement_difference: -22000,
  },
  {
    settlements_id: 240803, shop_type: 'STREET11', shop_id: 'CUBICI-03', settlement_type: 'MONTHLY',
    settlement_date: '2026-08-07', total_sale: 1800000, service_fee: 27000,
    settlement_target_amount: 1773000, settlement_amount: 1773000, pending_released_amount: 0,
    bank_name: '테스트은행', bank_account_holder: '예시상점', bank_account: 'TEST-ACCOUNT-03',
    status: 'DONE', settlement_check_status: 'OK', settlement_difference: 0,
  },
];

const payload = {
  limit: 10, offset: 0, total: 3,
  counts: {
    total_count: 3, ok_count: 2, source_reconciled_count: 0, diff_count: 1, legacy_batch_value_count: 0,
    unchecked_count: 0, total_difference: -22000, absolute_difference: 22000,
    check_status_label: '검산차이',
  },
  items,
};

async function installPageState(page, requestUrls) {
  await page.route('**/v1/api/**', async (route) => {
    const url = route.request().url();
    requestUrls.push(url);
    const body = url.includes('/accounts/admin-me')
      ? { user_no: 1, email: 'admin@example.com', user_type: 'ADMIN_USER', name: '관리자' }
      : payload;
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
  await page.addInitScript(() => {
    window.localStorage.setItem('cubiciAdminAuth', JSON.stringify({
      token_type: 'Bearer', access_token: 'adm-lv-08-token',
      user: { email: 'admin@example.com', user_type: 'ADMIN_USER' },
    }));
  });
}

test('ADM-LV-08 restores settlement list, reconcile summary and functions on PC', async ({ page }) => {
  const requestUrls = [];
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await installPageState(page, requestUrls);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/admin/moneybank/settlement');

  await expect(page.locator('.subVisual h3')).toHaveText('정산 관리');
  await expect(page.locator('.settlementLvTabs li.active')).toContainText('정산 관리');
  await expect(page.locator('.settlementLvBaseDate')).toContainText('기준');
  await expect(page.locator('.settlementLvSummary')).toContainText('검산차이');
  await expect(page.locator('.settlementLvSummary')).toContainText('전체3건');
  await expect(page.locator('.settlementTable thead')).toContainText('정산대상액');
  await expect(page.locator('.settlementTable tbody tr')).toHaveCount(3);

  await page.screenshot({ fullPage: true, path: path.join(candidateDir, 'ADM-LV-08-SETTLEMENT-MANAGEMENT-PC.png') });

  await page.selectOption('#settlementOrderBy', 'amount_desc');
  await expect.poll(() => requestUrls.some((url) => url.includes('order_by=amount_desc'))).toBe(true);
  await page.selectOption('#settlementShopType', 'COUPANG');
  await page.selectOption('#settlementStatus', 'HOLD');
  await page.getByRole('button', { name: '검색', exact: true }).click();
  await expect.poll(() => requestUrls.some((url) => (
    url.includes('/settlements?') && url.includes('shop_type=COUPANG') && url.includes('status=HOLD')
  ))).toBe(true);

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: '엑셀 다운로드' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^cubici-settlements-\d{4}-\d{2}-\d{2}\.csv$/);
  await expect(page.getByRole('status')).toContainText('3건을 내려받았습니다.');
  expect(pageErrors).toEqual([]);
});

test('ADM-LV-08 keeps settlement management responsive on mobile', async ({ page }) => {
  const requestUrls = [];
  await installPageState(page, requestUrls);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/admin/moneybank/settlement');

  await expect(page.locator('.settlementLvPage')).toBeVisible();
  await expect(page.locator('.settlementLvSearch .inputBox')).toHaveCount(5);
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);
  await expect(page.locator('.settlementTable')).toHaveCSS('min-width', '1180px');
  await expect(page.locator('.settlementLvSummary span')).toHaveCount(7);

  await page.screenshot({ fullPage: true, path: path.join(candidateDir, 'ADM-LV-08-SETTLEMENT-MANAGEMENT-MOBILE.png') });
});
