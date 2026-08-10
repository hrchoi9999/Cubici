import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const candidateDir = path.resolve(
  __dirname,
  '../../../docs/reference/lv-ui/admin/ADM-LV-10-FUNDING-MANAGEMENT/candidate',
);
const adminRoot = path.resolve(__dirname, '../..');
const distRoot = path.join(adminRoot, 'dist');
const appUrl = 'http://lv10.local/admin/moneybank/funding';

fs.mkdirSync(candidateDir, { recursive: true });

const items = [
  {
    row_no: 1, fintech_id: 2, fintech_name: '큐빅아이', registered_date: '2023-12-01T00:00:00',
    repayment_period: 30, interest_rate: 13, funding_amount: 1265568, repayment_amount: 623456,
    outstanding_amount: 642112, request_count: 17,
    linked_request_count: 17, raw_repayment_amount: 623456, repayment_excess_amount: 0,
    calculation_status: 'MATCHED', configuration_status: 'READY',
  },
  {
    row_no: 2, fintech_id: 1, fintech_name: '헬로페이', registered_date: '2023-06-23T00:00:00',
    repayment_period: 30, interest_rate: 12, funding_amount: 20053220, repayment_amount: 20053220,
    outstanding_amount: 0, request_count: 142,
    linked_request_count: 141, raw_repayment_amount: 53638784, repayment_excess_amount: 33585564,
    calculation_status: 'LEGACY_SCOPE_MISMATCH', configuration_status: 'READY',
  },
];

const payload = {
  limit: 10,
  offset: 0,
  counts: {
    total_count: 2, funding_amount: 21318788, repayment_amount: 20676676,
    outstanding_amount: 642112, repayment_excess_amount: 34096268,
  },
  items,
};

async function installPageState(page, requestUrls) {
  const runtimePayload = structuredClone(payload);
  await page.route('http://lv10.local/**', async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.startsWith('/v1/api/')) {
      requestUrls.push(url.toString());
      if (url.pathname.includes('/accounts/admin-me')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user_no: 1, email: 'admin@example.com', user_type: 'ADMIN_USER', name: '관리자' }) });
        return;
      }
      if (url.pathname.endsWith('/fintech/funding-providers') && route.request().method() === 'POST') {
        const submitted = route.request().postDataJSON();
        const provider = {
          row_no: 1, fintech_id: 3, fintech_name: submitted.fintech_name,
          registered_date: '2026-08-10T10:00:00', repayment_period: submitted.repayment_period,
          interest_rate: submitted.interest_rate, funding_amount: 0, repayment_amount: 0,
          outstanding_amount: 0, request_count: 0, linked_request_count: 0,
          raw_repayment_amount: 0, repayment_excess_amount: 0,
          calculation_status: 'NO_FUNDING', configuration_status: 'BASIC_REGISTERED',
        };
        runtimePayload.items = [provider, ...items];
        runtimePayload.counts.total_count = 3;
        await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ action: 'created', fintech_id: 3, provider }) });
        return;
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(runtimePayload) });
      return;
    }

    const assetPath = url.pathname.startsWith('/assets/')
      ? path.join(distRoot, url.pathname.slice(1))
      : url.pathname.startsWith('/resources/')
        ? path.join(adminRoot, 'public', url.pathname.slice(1))
        : path.join(distRoot, 'index.html');
    if (!fs.existsSync(assetPath)) {
      await route.fulfill({ status: 404, body: 'not found' });
      return;
    }
    const extension = path.extname(assetPath).toLowerCase();
    const contentTypes = {
      '.css': 'text/css', '.html': 'text/html', '.js': 'application/javascript',
      '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml',
      '.woff': 'font/woff', '.woff2': 'font/woff2',
    };
    await route.fulfill({ status: 200, contentType: contentTypes[extension] ?? 'application/octet-stream', path: assetPath });
  });
  await page.addInitScript(() => {
    window.localStorage.setItem('cubiciAdminAuth', JSON.stringify({
      token_type: 'Bearer', access_token: 'adm-lv-10-token',
      user: { email: 'admin@example.com', user_type: 'ADMIN_USER' },
    }));
  });
}

test('ADM-LV-10 restores the LV funding-provider table and detail on PC', async ({ page }) => {
  const requestUrls = [];
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await installPageState(page, requestUrls);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(appUrl);

  await expect(page.locator('.subVisual h3')).toHaveText('자금조달관리');
  await expect(page.locator('.fundingTable thead')).toContainText('자금조달사명');
  await expect(page.locator('.fundingTable thead th')).toHaveCount(8);
  await expect(page.locator('.fundingTable tbody tr')).toHaveCount(2);
  await expect(page.getByRole('button', { name: '자금조달등록' })).toBeVisible();
  await expect.poll(() => requestUrls.some((url) => url.includes('/fintech/funding-summary?'))).toBe(true);

  await page.screenshot({ fullPage: true, path: path.join(candidateDir, 'ADM-LV-10-FUNDING-MANAGEMENT-PC.png') });

  await page.getByRole('button', { name: '큐빅아이' }).click();
  await expect(page.locator('.fundingLvDetailPanel')).toContainText('17건');
  await expect(page.locator('.fundingLvDetailPanel')).toContainText('642,112 원');
  await expect(page.locator('.fundingLvDetailPanel')).toContainText('검산일치');
  await page.locator('.fundingLvDetailHeader').getByRole('button', { name: '닫기' }).click();
  await page.getByRole('button', { name: '헬로페이' }).click();
  await expect(page.locator('.fundingLvDetailPanel')).toContainText('141 / 142건');
  await expect(page.locator('.fundingLvDetailPanel')).toContainText('이력범위 확인');
  await expect(page.locator('.fundingLvDetailPanel')).toContainText('33,585,564 원');
  await page.locator('.fundingLvDetailHeader').getByRole('button', { name: '닫기' }).click();

  await page.getByRole('button', { name: '자금조달등록' }).click();
  await page.getByLabel('자금조달사명').fill('신규자금사');
  await page.getByLabel('상환주기(일)').fill('45');
  await page.getByLabel('수익률(%)').fill('11.5');
  await page.screenshot({ fullPage: true, path: path.join(candidateDir, 'ADM-LV-10-FUNDING-REGISTRATION-PC.png') });
  await page.getByRole('button', { name: '등록', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('신규자금사 자금조달사가 기본등록되었습니다.');
  await expect(page.locator('.fundingTable tbody tr')).toHaveCount(3);
  await expect(page.locator('.fundingLvDetailPanel')).toContainText('조달내역 없음');
  expect(requestUrls.some((url) => url.endsWith('/fintech/funding-providers'))).toBe(true);
  expect(pageErrors).toEqual([]);
});

test('ADM-LV-10 remains responsive without moving table semantics on mobile', async ({ page }) => {
  const requestUrls = [];
  await installPageState(page, requestUrls);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(appUrl);

  await expect(page.locator('.fundingLvPage')).toBeVisible();
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);
  await expect(page.locator('.fundingTable')).toHaveCSS('min-width', '920px');
  await expect(page.locator('.fundingTable thead th').first()).toHaveText('No');

  await page.screenshot({ fullPage: true, path: path.join(candidateDir, 'ADM-LV-10-FUNDING-MANAGEMENT-MOBILE.png') });

  await page.getByRole('button', { name: '자금조달등록' }).click();
  await expect.poll(async () => (
    await page.locator('.fundingLvRegisterFields').evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length)
  )).toBe(1);
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);
  await page.screenshot({ fullPage: true, path: path.join(candidateDir, 'ADM-LV-10-FUNDING-REGISTRATION-MOBILE.png') });
});
