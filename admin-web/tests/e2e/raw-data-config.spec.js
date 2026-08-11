import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';

const MASTER_ADMIN_EMAIL = process.env.CUBICI_MASTER_ADMIN_EMAIL ?? 'admin@example.com';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const candidateDir = path.resolve(
  __dirname,
  '../../../docs/reference/lv-ui/admin/ADM-D10-PRISM-RAWDATA/candidate',
);

fs.mkdirSync(candidateDir, { recursive: true });

const tables = [
  { table_name: 'sale_order', table_label: 'sale_order', table_type: '00' },
];

const columns = [
  { column_name: 'order_no', column_label: 'order_no', data_type: 'character varying' },
  { column_name: 'order_date', column_label: 'order_date', data_type: 'date' },
  { column_name: 'amount', column_label: 'amount', data_type: 'bigint' },
  { column_name: 'fee_amount', column_label: 'fee_amount', data_type: 'bigint' },
  { column_name: 'status', column_label: 'status', data_type: 'character varying' },
];

const formula = {
  raw_data_no: 1,
  raw_data_division: '05',
  raw_data_id: 'amount',
  raw_data_shop: 'sale_order',
  raw_data_title: '매출합계',
  raw_data_content: 'sum(amount)',
  reg_date: '2026-07-22T10:00:00',
  update_date: null,
};

test.beforeEach(async ({ page }) => {
  await page.route('**/v1/api/accounts/admin-me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user_no: 1,
        email: MASTER_ADMIN_EMAIL,
        user_type: 'ADMIN_USER',
        name: '관리자',
      }),
    });
  });
  await page.route('**/v1/api/preferences/raw-data/tables', async (route) => {
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify(tables) });
  });

  await page.route('**/v1/api/preferences/raw-data/tables/sale_order/columns', async (route) => {
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify(columns) });
  });

  await page.route('**/v1/api/preferences/raw-data/formulas?**', async (route) => {
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify([formula]) });
  });

  await page.route('**/v1/api/preferences/raw-data/formulas/1', async (route) => {
    if (route.request().method() === 'PUT') {
      const payload = await route.request().postDataJSON();
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          action: 'updated',
          raw_data_no: 1,
          formula: {
            ...formula,
            raw_data_title: payload.raw_data_title,
            raw_data_content: payload.raw_data_content,
          },
        }),
      });
      return;
    }

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ action: 'deleted', raw_data_no: 1, formula: null }),
    });
  });

  await page.route('**/v1/api/preferences/raw-data/preview', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        table_name: 'sale_order',
        columns,
        rows: [{
          order_no: 'TEST-ORDER-001',
          order_date: '2026-08-11',
          amount: 1000,
          fee_amount: 25,
          status: '정상',
        }],
      }),
    });
  });
  await page.addInitScript((masterAdminEmail) => {
    window.localStorage.setItem(
      'cubiciAdminAuth',
      JSON.stringify({
        token_type: 'Bearer',
        access_token: 'test-token',
        user: { email: masterAdminEmail, user_type: 'ADMIN_USER' },
      }),
    );
  }, MASTER_ADMIN_EMAIL);
});

test('raw data config restores legacy selector flow on PC', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/admin/cubici/adminPreference/prizmRawData');

  const activeTab = page.locator('.prizmLvTabs .active');
  await expect(activeTab).toHaveText('RawData');
  expect(await activeTab.evaluate((element) => Array.from(element.parentElement.children).indexOf(element))).toBe(2);
  await expect(page.getByLabel('시작 일자')).toBeDisabled();
  await expect(page.getByLabel('종료 일자')).toBeDisabled();
  await expect(page.getByRole('button', { name: '엑셀 다운로드' })).toBeDisabled();

  await page.getByLabel('테이블').selectOption('sale_order');
  await expect(page.locator('.rawDataColumnList').getByText('amount', { exact: true })).toBeVisible();

  const columnChecks = page.locator('.rawDataColumnList input');
  for (let index = 0; index < await columnChecks.count(); index += 1) {
    await columnChecks.nth(index).check();
  }
  await page.getByRole('button', { name: 'Preview', exact: true }).click();
  await expect(page.getByRole('cell', { name: 'TEST-ORDER-001' })).toBeVisible();
  await expect(page.getByRole('cell', { name: '1000' })).toBeVisible();

  await page.locator('.rawDataFormulaList button').first().click();
  const form = page.locator('.rawDataFormulaForm');
  await form.getByLabel('제목').fill('매출합계 수정');
  await form.getByLabel('계산식').fill('sum(amount) / count(*)');
  await form.getByRole('button', { name: '수정' }).click();
  await expect(page.getByText('계산식을 수정했습니다.')).toBeVisible();
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 1920);
  await page.screenshot({
    fullPage: true,
    path: path.join(candidateDir, 'ADM-D10-PRISM-RAWDATA-PC.png'),
  });
});

test('raw data config remains usable on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/admin/cubici/adminPreference/prizmRawData');

  const activeTab = page.locator('.prizmLvTabs .active');
  await expect(activeTab).toHaveText('RawData');
  expect(await activeTab.evaluate((element) => Array.from(element.parentElement.children).indexOf(element))).toBe(2);
  await page.getByLabel('테이블').selectOption('sale_order');
  await expect(page.locator('.rawDataColumnList').getByText('amount', { exact: true })).toBeVisible();

  const columnChecks = page.locator('.rawDataColumnList input');
  for (let index = 0; index < await columnChecks.count(); index += 1) {
    await columnChecks.nth(index).check();
  }
  await page.getByRole('button', { name: 'Preview', exact: true }).click();
  await expect(page.getByRole('cell', { name: 'TEST-ORDER-001' })).toBeVisible();
  await page.locator('.rawDataFormulaList button').first().click();
  await expect(page.locator('.rawDataFormulaForm').getByLabel('제목')).toHaveValue('매출합계');

  await expect(page.getByLabel('RawData Preview 좌우 스크롤')).toBeVisible();
  await page.getByLabel('RawData Preview 오른쪽으로 스크롤').click();
  await expect.poll(() => page.locator('.rawDataLvPreviewPanel .legacyTableWrap').evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
  await page.getByLabel('RawData Preview 왼쪽으로 스크롤').click();
  await expect.poll(() => page.locator('.rawDataLvPreviewPanel .legacyTableWrap').evaluate((element) => element.scrollLeft)).toBe(0);
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);
  await page.screenshot({
    fullPage: true,
    path: path.join(candidateDir, 'ADM-D10-PRISM-RAWDATA-MOBILE.png'),
  });
});
