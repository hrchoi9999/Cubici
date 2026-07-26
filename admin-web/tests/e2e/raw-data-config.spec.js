import { expect, test } from '@playwright/test';

const tables = [
  { table_name: 'sale_order', table_label: 'sale_order', table_type: '00' },
];

const columns = [
  { column_name: 'order_no', column_label: 'order_no', data_type: 'character varying' },
  { column_name: 'amount', column_label: 'amount', data_type: 'bigint' },
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
        rows: [{ order_no: 'A001', amount: 1000 }],
      }),
    });
  });
});

test('raw data config list, formula update, and preview work with mock data', async ({ page }) => {
  await page.goto('/admin/cubici/adminPreference/prizmRawData');

  await expect(page.locator('.adminPageHeader h2', { hasText: '환경설정' })).toBeVisible();
  await expect(page.getByText('Prism RawData 테이블')).toBeVisible();

  await page.getByRole('combobox').selectOption('sale_order');
  await expect(page.locator('.rawDataColumnList').getByText('amount', { exact: true })).toBeVisible();

  await page.locator('.rawDataColumnList input').first().check();
  await page.locator('.rawDataColumnList input').nth(1).check();
  await page.getByRole('button', { name: 'Preview' }).click();
  await expect(page.getByRole('cell', { name: 'A001' })).toBeVisible();
  await expect(page.getByRole('cell', { name: '1000' })).toBeVisible();

  await page.locator('.rawDataFormulaList button').first().click();
  const form = page.locator('.rawDataFormulaForm');
  await form.getByLabel('제목').fill('매출합계 수정');
  await form.getByLabel('계산식').fill('sum(amount) / count(*)');
  await form.getByRole('button', { name: '수정' }).click();
  await expect(page.getByText('계산식을 수정했습니다.')).toBeVisible();
});
