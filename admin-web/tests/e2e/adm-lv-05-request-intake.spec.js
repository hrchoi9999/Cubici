import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const candidateDir = path.resolve(
  __dirname,
  '../../../docs/reference/lv-ui/admin/ADM-LV-05-REQUEST-INTAKE/candidate',
);

fs.mkdirSync(candidateDir, { recursive: true });

const contractItems = [
  {
    mbid: 'MB00000001', user_no: 72, user_email: 'hrchoi@cubici.co.kr', user_name: '최현록',
    firm_name: '큐빅아이', product_code: 'MP', status: '01', request_date: '2024-04-17',
    sales_amount: 18500000, request_shop: 3, sub_complete: 'N', document_file_count: 2,
    prizm_score: 'B+', contract_fee_count: 0, use_count: 0,
  },
  {
    mbid: 'MB00000002', user_no: 81, user_email: 'owner@example.com', user_name: '김대표',
    firm_name: '한국상사', product_code: 'MP', status: '07', request_date: '2024-04-16',
    sales_amount: 42000000, request_shop: 2, sub_complete: 'Y', document_file_count: 4,
    prizm_score: 'A', contract_fee_count: 1, use_count: 1,
  },
];

const payload = {
  limit: 10,
  offset: 0,
  total: 2,
  request_summary: { total: 2, progress: 1, complete: 1 },
  items: contractItems,
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
      token_type: 'Bearer', access_token: 'adm-lv-05-token',
      user: { email: 'admin@example.com', user_type: 'ADMIN_USER' },
    }));
  });
}

test('ADM-LV-05 restores request intake structure and functions on PC', async ({ page }) => {
  const requestUrls = [];
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await installPageState(page, requestUrls);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/admin/moneybank/request');

  await expect(page.locator('.subVisual h3')).toHaveText('신청/승인');
  await expect(page.locator('.requestLvPage .m-tab li.active')).toContainText('신청 현황');
  await expect(page.locator('.requestLvBaseDate')).toContainText('기준');
  await expect(page.getByText('총 신청 접수').locator('..')).toContainText('2 건');
  await expect(page.getByText('신청 진행').locator('..')).toContainText('1 건');
  await expect(page.getByText('신청 완료').locator('..')).toContainText('1 건');
  await expect(page.locator('.requestTable thead')).toContainText('월결제액(천원)');
  await expect(page.locator('.requestTable tbody tr')).toHaveCount(2);
  await expect(page.locator('.requestTable tbody tr').first()).toContainText('18,500');

  await page.screenshot({ fullPage: true, path: path.join(candidateDir, 'ADM-LV-05-REQUEST-INTAKE-PC.png') });

  await page.selectOption('#orderBy', 'sales_amount_desc');
  await expect.poll(() => requestUrls.some((url) => url.includes('order_by=sales_amount_desc'))).toBe(true);
  await page.selectOption('#productCode', 'MP');
  await page.selectOption('#selectStatus', 'progress');
  await page.getByRole('button', { name: '검색', exact: true }).click();
  await expect.poll(() => requestUrls.some((url) => (
    url.includes('/contracts?')
    && url.includes('request_scope=true')
    && url.includes('request_stage=progress')
    && url.includes('product_code=MP')
  ))).toBe(true);

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: '엑셀 다운로드' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^cubici-moneybank-requests-\d{4}-\d{2}-\d{2}\.csv$/);
  await expect(page.getByRole('status')).toContainText('2건을 내려받았습니다.');
  expect(pageErrors).toEqual([]);
});

test('ADM-LV-05 keeps request intake responsive on mobile', async ({ page }) => {
  const requestUrls = [];
  await installPageState(page, requestUrls);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/admin/moneybank/request');

  await expect(page.locator('.requestLvPage')).toBeVisible();
  await expect(page.locator('.requestLvSearch .inputBox')).toHaveCount(7);
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);
  await expect(page.locator('.requestTable')).toHaveCSS('min-width', '960px');

  await page.screenshot({ fullPage: true, path: path.join(candidateDir, 'ADM-LV-05-REQUEST-INTAKE-MOBILE.png') });
});
