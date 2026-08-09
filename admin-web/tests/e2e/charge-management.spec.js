import { expect, test } from '@playwright/test';

import { installMockAdminAuth } from './helpers/mock-admin-auth.js';

const charge = {
  row_no: 1,
  charge_code: 'B0101',
  charge_name: '1개월 기본요금',
  charge_type: 'B',
  status: '운영',
  start_date: '2023-01-01',
  expire_date: '2099-12-31',
  sub_id: 1,
  sales_count: '30',
  product_count: '10',
  amount: 29000,
  period: 1,
  period_unit: 'M',
  charge_detail: '기본 요금제',
  reg_date: '2023-03-27T10:18:50',
  update_date: null,
};

test.beforeEach(async ({ page }) => {
  await installMockAdminAuth(page);
  await page.route('**/v1/api/preferences/charges?**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        limit: 20,
        offset: 0,
        counts: {
          total_count: 1,
          operating_count: 1,
          ended_count: 0,
        },
        items: [charge],
      }),
    });
  });

  await page.route('**/v1/api/preferences/charges/B0101', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify(charge),
      });
      return;
    }

    if (route.request().method() === 'PUT') {
      const payload = await route.request().postDataJSON();
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          action: 'updated',
          charge_code: 'B0101',
          charge: {
            ...charge,
            charge_name: payload.charge_name,
            amount: payload.amount,
            update_date: '2026-07-22T12:00:00',
          },
        }),
      });
      return;
    }

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        action: 'deleted',
        charge_code: 'B0101',
        charge: null,
      }),
    });
  });
});

test('charge management list, edit, and delete work with mock data', async ({ page }) => {
  await page.goto('/admin/cubici/adminPreference/manageCharge');

  await expect(page.getByRole('heading', { name: '환경설정' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '요금제 관리' })).toBeVisible();
  await expect(page.getByText('전체 1건')).toBeVisible();
  await expect(page.getByRole('cell', { name: '1개월 기본요금' })).toBeVisible();
  await expect(page.getByRole('cell', { name: '29,000원' })).toBeVisible();

  await page.getByRole('button', { name: '보기' }).click();
  await expect(page.getByRole('heading', { name: '요금제 수정' })).toBeVisible();
  const editor = page.locator('.chargeEditorPanel');
  await editor.getByLabel('요금제명').fill('1개월 기본요금 수정');
  await editor.getByLabel('기준금액').fill('31000');
  await page.getByRole('button', { name: '수정' }).click();
  await expect(page.getByText('요금제를 수정했습니다.')).toBeVisible();

  await page.getByRole('button', { name: '삭제' }).click();
  await expect(page.getByText('요금제를 삭제했습니다.')).toBeVisible();
});
