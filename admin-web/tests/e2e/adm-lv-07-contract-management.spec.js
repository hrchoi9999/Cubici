import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const candidateDir = path.resolve(
  __dirname,
  '../../../docs/reference/lv-ui/admin/ADM-LV-07-CONTRACT-MANAGEMENT/candidate',
);

fs.mkdirSync(candidateDir, { recursive: true });

const items = [
  {
    mbid: 'MPK2723123', status: '06', product_code: 'MP', fintech_name: '큐빅아이',
    contract_date: '2023-11-28', user_email: 'hrchoi@cubici.co.kr', firm_name: '큐빅아이',
    user_name: '최영학', latest_payment_rate: 80, latest_sales_limit_per_order: 3000000,
    latest_max_outstanding_balance: 5000000, latest_outstanding_balance: 909988,
  },
  {
    mbid: 'MPK2723122', status: '05', product_code: 'MP', fintech_name: '큐빅아이',
    contract_date: '2023-11-28', user_email: 'rlukas8719@cubici.co.kr', firm_name: '라엘',
    user_name: '문정현', latest_payment_rate: 80, latest_sales_limit_per_order: 3000000,
    latest_max_outstanding_balance: 5000000, latest_outstanding_balance: 0,
  },
  {
    mbid: 'MPH0823122', status: '07', product_code: 'MP', fintech_name: '큐빅아이',
    contract_date: '2023-08-08', user_email: 'rlukas8719@cubici.co.kr', firm_name: '라엘',
    user_name: '문정현', latest_payment_rate: 80, latest_sales_limit_per_order: 3000000,
    latest_max_outstanding_balance: 5000000, latest_outstanding_balance: 3616,
  },
];

const payload = {
  limit: 10,
  offset: 0,
  total: 3,
  contract_summary: { total: 3, wait: 1, contract: 1, end: 1 },
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
      token_type: 'Bearer', access_token: 'adm-lv-07-token',
      user: { email: 'admin@example.com', user_type: 'ADMIN_USER' },
    }));
  });
}

test('ADM-LV-07 restores LV contract table and functions on PC', async ({ page }) => {
  const requestUrls = [];
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await installPageState(page, requestUrls);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/admin/moneybank/approval_tab2');

  await expect(page.locator('.subVisual h3')).toHaveText('계약/상환');
  await expect(page.locator('.contractLvTabs li.active')).toContainText('계약 관리');
  await expect(page.locator('.contractLvTabs')).toContainText('상환 관리');
  await expect(page.locator('.contractLvBaseDate')).toContainText('기준');
  await expect(page.locator('.contractManagementTable thead')).toContainText('지급그룹사');
  await expect(page.locator('.contractManagementTable thead')).toContainText('최대 미상환금');
  await expect(page.locator('.contractManagementTable tbody tr')).toHaveCount(3);
  await expect(page.locator('.contractManagementTable tbody tr').first()).toContainText('909,988 원');

  await page.screenshot({ fullPage: true, path: path.join(candidateDir, 'ADM-LV-07-CONTRACT-MANAGEMENT-PC.png') });

  await page.selectOption('#contractOrderBy', 'request_date_asc');
  await expect.poll(() => requestUrls.some((url) => url.includes('order_by=request_date_asc'))).toBe(true);
  await page.selectOption('#contractProductCode', 'MP');
  await page.selectOption('#contractStatus', 'contract');
  await page.getByRole('button', { name: '검색', exact: true }).click();
  await expect.poll(() => requestUrls.some((url) => (
    url.includes('/contracts?')
    && url.includes('contract_scope=true')
    && url.includes('contract_stage=contract')
    && url.includes('product_code=MP')
  ))).toBe(true);

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: '엑셀 다운로드' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^cubici-contracts-\d{4}-\d{2}-\d{2}\.csv$/);
  await expect(page.getByRole('status')).toContainText('3건을 내려받았습니다.');
  expect(pageErrors).toEqual([]);
});

test('ADM-LV-07 keeps the LV contract table responsive on mobile', async ({ page }) => {
  const requestUrls = [];
  await installPageState(page, requestUrls);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/admin/moneybank/approval_tab2');

  await expect(page.locator('.contractLvPage')).toBeVisible();
  await expect(page.locator('.contractLvSearch .inputBox')).toHaveCount(5);
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);
  await expect(page.locator('.contractManagementTable')).toHaveCSS('min-width', '1160px');

  await page.screenshot({ fullPage: true, path: path.join(candidateDir, 'ADM-LV-07-CONTRACT-MANAGEMENT-MOBILE.png') });
});
