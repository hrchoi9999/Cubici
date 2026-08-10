import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const candidateDir = path.resolve(
  __dirname,
  '../../../docs/reference/lv-ui/admin/ADM-LV-06-APPROVAL-MANAGEMENT/candidate',
);

fs.mkdirSync(candidateDir, { recursive: true });

const items = [
  {
    mbid: 'MB00000011', status: '03', request_date: '2026-08-09', user_name: '홍길동',
    firm_name: '한국상사', product_code: 'MP', biz_setup_date: '20180315', sales_amount: 3000000,
    prizm_score: 'B+', prizm_score_value: 720, latest_fee_rate: 1.2, latest_payment_rate: 80,
    fee_adjusted: false,
  },
  {
    mbid: 'MB00000012', status: '04', request_date: '2026-08-08', user_name: '김대표',
    firm_name: '큐빅커머스', product_code: 'MP', biz_setup_date: '20200120', sales_amount: 8500000,
    prizm_score: 'B', prizm_score_value: 660, latest_fee_rate: 1.35, latest_payment_rate: 82,
    fee_adjusted: false,
  },
  {
    mbid: 'MB00000013', status: '05', request_date: '2026-08-07', user_name: '이사업',
    firm_name: '한빛유통', product_code: 'MP', biz_setup_date: '20161201', sales_amount: 12500000,
    prizm_score: 'B', prizm_score_value: 610, latest_fee_rate: 1.5, latest_payment_rate: 78,
    fee_adjusted: true,
  },
  {
    mbid: 'MB00000014', status: '41', request_date: '2026-08-06', user_name: '박상점',
    firm_name: '서울마켓', product_code: 'MP', biz_setup_date: '20220412', sales_amount: 2600000,
    prizm_score: 'C', prizm_score_value: 480, latest_fee_rate: null, latest_payment_rate: null,
    fee_adjusted: false,
  },
];

const payload = {
  limit: 10,
  offset: 0,
  total: 4,
  approval_summary: {
    total: 4, wait: 1, complete: 3, accept: 1, adjust: 1, refuse: 1, refuse_rate: 33.3,
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
      token_type: 'Bearer', access_token: 'adm-lv-06-token',
      user: { email: 'admin@example.com', user_type: 'ADMIN_USER' },
    }));
  });
}

test('ADM-LV-06 restores approval list, summaries, filters and export on PC', async ({ page }) => {
  const requestUrls = [];
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await installPageState(page, requestUrls);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/admin/moneybank/approval_tab1');

  await expect(page.locator('.subVisual h3')).toHaveText('심사 승인');
  await expect(page.locator('.approvalLvTabs li.active')).toContainText('심사 승인');
  await expect(page.locator('.approvalLvBaseDate')).toContainText('기준');
  await expect(page.locator('.approvalTable thead')).toContainText('프리즘 추천');
  await expect(page.locator('.approvalTable thead')).toContainText('월결제액(천원)');
  await expect(page.locator('.approvalTable tbody tr')).toHaveCount(4);
  await expect(page.locator('.approvalTable tbody tr').nth(1)).toContainText('승인');
  await expect(page.locator('.approvalTable tbody tr').nth(2)).toContainText('조정');
  await expect(page.getByText('거부율 :').locator('..')).toContainText('33.3%');

  await page.screenshot({ fullPage: true, path: path.join(candidateDir, 'ADM-LV-06-APPROVAL-MANAGEMENT-PC.png') });

  await page.selectOption('#approvalOrderBy', 'sales_amount_desc');
  await expect.poll(() => requestUrls.some((url) => url.includes('order_by=sales_amount_desc'))).toBe(true);
  await page.selectOption('#approvalProductCode', 'MP');
  await page.selectOption('#approvalStatus', 'adjust');
  await page.getByRole('button', { name: '검색', exact: true }).click();
  await expect.poll(() => requestUrls.some((url) => (
    url.includes('/contracts?')
    && url.includes('approval_scope=true')
    && url.includes('approval_stage=adjust')
    && url.includes('product_code=MP')
  ))).toBe(true);

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: '엑셀 다운로드' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^cubici-moneybank-approvals-\d{4}-\d{2}-\d{2}\.csv$/);
  await expect(page.getByRole('status')).toContainText('4건을 내려받았습니다.');
  expect(pageErrors).toEqual([]);
});

test('ADM-LV-06 keeps approval management responsive on mobile', async ({ page }) => {
  const requestUrls = [];
  await installPageState(page, requestUrls);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/admin/moneybank/approval_tab1');

  await expect(page.locator('.approvalLvPage')).toBeVisible();
  await expect(page.locator('.approvalLvSearch .inputBox')).toHaveCount(6);
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);
  await expect(page.locator('.approvalTable')).toHaveCSS('min-width', '1180px');

  await page.screenshot({ fullPage: true, path: path.join(candidateDir, 'ADM-LV-06-APPROVAL-MANAGEMENT-MOBILE.png') });
});
