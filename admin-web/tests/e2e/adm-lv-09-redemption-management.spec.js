import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const candidateDir = path.resolve(
  __dirname,
  '../../../docs/reference/lv-ui/admin/ADM-LV-09-REDEMPTION-MANAGEMENT/candidate',
);
const adminRoot = path.resolve(__dirname, '../..');
const distRoot = path.join(adminRoot, 'dist');
const appUrl = 'http://lv09.local/admin/moneybank/redemption';

fs.mkdirSync(candidateDir, { recursive: true });

function item(overrides = {}) {
  return {
    mbid: 'MPK2701001', contract_status: 'CONTRACT', product_code: 'MP', fintech_name: '큐빅아이',
    contract_date: '2026-07-01T10:00:00', user_email: 'sample01@example.test', firm_name: '테스트상사',
    user_name: '홍길동', latest_max_outstanding_balance: 50000000, service_fee: 2286,
    provision_count: 2, total_payment_amount: 1000000, total_usage_fee: 2286,
    total_provision_amount: 997714, latest_provision_date: '2026-08-01T10:00:00',
    repayment_count: 1, total_repayment_amount: 897714, total_repayment_usage_fee: 0,
    total_remittance_fee: 0, total_balance_provision_amount: 0,
    latest_balance_provision_date: '2026-08-05T10:00:00', deposit_count: 1,
    total_deposit_amount: 897714, latest_deposit_date: '2026-08-05', sales_count: 2,
    sales_payment_amount: 1000000, sales_usage_fee: 2286, sales_provision_amount: 997714,
    latest_sales_paid_date: '2026-08-01T10:00:00', latest_cumulative_provision_amount: 997714,
    latest_cumulative_repayment_amount: 897714, latest_outstanding_balance: 100000,
    latest_history_date: '2026-08-05T10:00:00', latest_balance_check_amount: 100000,
    latest_balance_difference: 0, latest_balance_check_status: 'OK',
    ...overrides,
  };
}

const items = [
  item(),
  item({ mbid: 'MPK2701002', contract_date: '2026-06-20T10:00:00', user_email: 'sample02@example.test', firm_name: '샘플상점', user_name: '김하나', latest_outstanding_balance: 0, service_fee: 5245 }),
  item({ mbid: 'MPH2701003', contract_date: '2026-05-08T10:00:00', user_email: 'sample03@example.test', firm_name: '예시상회', user_name: '박둘', latest_outstanding_balance: 3616, service_fee: 0 }),
  item({ mbid: 'MPK2701004', contract_status: 'ACCOUNT_STANDBY', contract_date: '2026-04-01T10:00:00', user_email: 'sample04@example.test', firm_name: '테스트기업', user_name: '이셋', latest_outstanding_balance: 0, service_fee: 16800 }),
  item({ mbid: 'MPK2701005', contract_date: '2026-03-20T10:00:00', user_email: 'sample05@example.test', firm_name: '표본상사', user_name: '최넷', latest_outstanding_balance: 0, service_fee: 269105 }),
  item({ mbid: 'MPK2701006', contract_status: 'ACCOUNT_STANDBY', contract_date: '2026-03-10T10:00:00', user_email: 'sample06@example.test', firm_name: '가상기업', user_name: '정다섯', latest_outstanding_balance: 0, service_fee: 272580 }),
];

const payload = {
  limit: 10, offset: 0, total: items.length,
  counts: { total_count: items.length, ok_count: items.length, diff_count: 0, no_history_count: 0, outstanding_count: 2, total_balance_difference: 0, absolute_balance_difference: 0, check_status_label: '검산일치' },
  items,
};

async function installPageState(page, requestUrls) {
  await page.route('http://lv09.local/**', async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.startsWith('/v1/api/')) {
      requestUrls.push(url.toString());
      let body = payload;
      if (url.pathname.includes('/accounts/admin-me')) {
        body = { user_no: 1, email: 'admin@example.com', user_type: 'ADMIN_USER', name: '관리자' };
      } else if (url.pathname.endsWith('/operation-history')) {
        body = { mbid: items[0].mbid, limit: 20, offset: 0, total: 0, items: [] };
      } else if (url.pathname === `/v1/api/redemptions/${items[0].mbid}`) {
        body = items[0];
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
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
      token_type: 'Bearer', access_token: 'adm-lv-09-token',
      user: { email: 'admin@example.com', user_type: 'ADMIN_USER' },
    }));
  });
}

test('ADM-LV-09 restores LV repayment list and list functions on PC', async ({ page }) => {
  const requestUrls = [];
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await installPageState(page, requestUrls);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(appUrl);

  await expect(page.locator('.subVisual h3')).toHaveText('계약/상환');
  await expect(page.locator('.redemptionLvTabs li')).toHaveCount(2);
  await expect(page.locator('.redemptionLvTabs li.active')).toContainText('상환 현황');
  await expect(page.locator('.redemptionLvBaseDate')).toContainText('기준');
  await expect(page.locator('.redemptionTable thead')).toContainText('서비스 수수료');
  await expect(page.locator('.redemptionTable tbody tr')).toHaveCount(items.length);

  await page.screenshot({ fullPage: true, path: path.join(candidateDir, 'ADM-LV-09-REDEMPTION-MANAGEMENT-PC.png') });

  await page.getByRole('button', { name: items[0].mbid }).click();
  await expect(page.locator('.detailPanel')).toBeVisible();
  await expect(page.locator('.redemptionOperationForm')).toHaveCount(2);
  await expect(page.locator('.redemptionOperationHistory')).toBeVisible();

  await page.selectOption('#redemptionOrderBy', 'outstanding_desc');
  await expect.poll(() => requestUrls.some((url) => url.includes('order_by=outstanding_desc'))).toBe(true);
  await page.fill('#redemptionUserName', '홍길동');
  await page.selectOption('#redemptionProductCode', 'MP');
  await page.selectOption('#redemptionContractStage', 'active');
  await page.getByRole('button', { name: '검색', exact: true }).click();
  await expect.poll(() => requestUrls.some((url) => (
    url.includes('/redemptions?') && url.includes('user_name=') && url.includes('product_code=MP') && url.includes('contract_stage=active')
  ))).toBe(true);

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: '엑셀 다운로드' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^cubici-redemptions-\d{4}-\d{2}-\d{2}\.csv$/);
  await expect(page.getByRole('status')).toContainText('6건을 내려받았습니다.');
  expect(pageErrors).toEqual([]);
});

test('ADM-LV-09 keeps the active repayment tab in its original mobile position', async ({ page }) => {
  const requestUrls = [];
  await installPageState(page, requestUrls);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(appUrl);

  await expect(page.locator('.redemptionLvPage')).toBeVisible();
  await expect(page.locator('.redemptionLvSearch .inputBox')).toHaveCount(5);
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);
  await expect(page.locator('.redemptionTable')).toHaveCSS('min-width', '1160px');
  const firstTab = await page.locator('.redemptionLvTabs li').first().boundingBox();
  const activeTab = await page.locator('.redemptionLvTabs li.active').boundingBox();
  expect(activeTab.x).toBeGreaterThan(firstTab.x);

  await page.screenshot({ fullPage: true, path: path.join(candidateDir, 'ADM-LV-09-REDEMPTION-MANAGEMENT-MOBILE.png') });
});
