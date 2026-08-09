import { expect, test } from '@playwright/test';

import { installMockAdminAuth } from './helpers/mock-admin-auth.js';

const promotion = {
  row_no: 1,
  promo_code: 'NCBCI',
  promo_name: '신규 자체 프로모션',
  promo_target: 'N',
  promo_target_label: '신규',
  partner_code: 'CBCI',
  partner_name: '자체',
  status: 'Y',
  status_label: '운영',
  start_date: '2026-07-01',
  expire_date: '2026-12-31',
  charge_codes: ['B0101'],
  charge_names: ['1개월 기본요금'],
  discount_rate: 10,
  discount_amount: null,
  period: 1,
  period_unit: 'M',
  period_unit_label: '개월',
  sub_id: 1,
  sub_id_label: '1',
  promo_detail: '테스트 혜택',
  reg_date: '2026-07-22T10:00:00',
  update_date: null,
};

const options = {
  targets: [
    { value: 'N', label: '신규' },
    { value: 'C', label: '큐빅회원' },
  ],
  partner_divisions: [
    { value: 'CBCI', label: '자체' },
  ],
  partners: [],
  charges: [
    { value: 'B0101', label: '1개월 기본요금' },
    { value: 'B0301', label: '3개월 기본요금' },
  ],
};

test.beforeEach(async ({ page }) => {
  await installMockAdminAuth(page);
  await page.route('**/v1/api/preferences/promotions?**', async (route) => {
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
        items: [promotion],
      }),
    });
  });

  await page.route('**/v1/api/preferences/promotions/options?**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(options),
    });
  });

  await page.route('**/v1/api/preferences/promotions/NCBCI', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify(promotion),
      });
      return;
    }

    if (route.request().method() === 'PUT') {
      const payload = await route.request().postDataJSON();
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          action: 'updated',
          promo_code: 'NCBCI',
          promotion: {
            ...promotion,
            promo_name: payload.promo_name,
            discount_rate: payload.discount_rate,
          },
        }),
      });
      return;
    }

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        action: 'deleted',
        promo_code: 'NCBCI',
        promotion: null,
      }),
    });
  });
});

test('promotion list, detail, update, and delete work with mock data', async ({ page }) => {
  await page.goto('/admin/cubici/adminPreference/managePromotion');

  await expect(page.getByRole('heading', { name: '환경설정' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '연계코드 관리' })).toBeVisible();
  await expect(page.getByText('전체 : 1개')).toBeVisible();
  await expect(page.getByRole('cell', { name: '신규 자체 프로모션' })).toBeVisible();
  await expect(page.getByRole('cell', { name: '1개월 기본요금' })).toBeVisible();

  await page.getByRole('button', { name: '상세보기' }).click();
  await expect(page.getByRole('heading', { name: '연계코드 상세' })).toBeVisible();

  const editor = page.locator('.promotionEditorPanel');
  await editor.getByLabel('연계코드명').fill('신규 자체 프로모션 수정');
  await editor.getByLabel('% 할인').fill('15');
  await editor.getByRole('button', { name: '수정' }).click();
  await expect(page.getByText('연계코드를 수정했습니다.')).toBeVisible();

  await editor.getByRole('button', { name: '삭제' }).click();
  await expect(page.getByText('연계코드를 삭제했습니다.')).toBeVisible();
});
