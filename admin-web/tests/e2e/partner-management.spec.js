import { expect, test } from '@playwright/test';

import { installMockAdminAuth } from './helpers/mock-admin-auth.js';

const partnerRow = {
  row_no: 1,
  partner_id: '1234567890',
  partner_code: 'BAAZ',
  partner_name: '아즈온',
  rep_name: '대표',
  partner_zip: '12345',
  partner_address: '서울',
  partner_status: '00',
  partner_status_label: '운영',
  partner_type: 'BA',
  partner_type_label: 'BA',
  memo: '테스트',
  manager_name: '담당자',
  manager_phone: '01000000000',
  reg_date: '2026-07-22T10:00:00',
  update_date: null,
};

const partnerDetail = {
  partner: partnerRow,
  managers: [
    {
      manager_type: '00',
      manager_name: '책임자',
      manager_rank: '팀장',
      manager_email: 'sup@example.com',
      manager_phone: '01011112222',
    },
    {
      manager_type: '01',
      manager_name: '담당자',
      manager_rank: '매니저',
      manager_email: 'manager@example.com',
      manager_phone: '01000000000',
    },
  ],
};

test.beforeEach(async ({ page }) => {
  await installMockAdminAuth(page);
  await page.route('**/v1/api/preferences/partners?**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        limit: 20,
        offset: 0,
        counts: {
          total_count: 1,
          operating_count: 1,
          ended_count: 0,
          type_ba_count: 1,
          type_bb_count: 0,
          type_co_count: 0,
          type_fi_count: 0,
          type_mn_count: 0,
          type_th_count: 0,
        },
        items: [partnerRow],
      }),
    });
  });

  await page.route('**/v1/api/preferences/partners/1234567890', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify(partnerDetail),
      });
      return;
    }

    if (route.request().method() === 'PUT') {
      const payload = await route.request().postDataJSON();
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          action: 'updated',
          partner_id: '1234567890',
          partner: {
            ...partnerDetail,
            partner: {
              ...partnerRow,
              partner_name: payload.partner_name,
              rep_name: payload.rep_name,
            },
          },
        }),
      });
      return;
    }

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        action: 'deleted',
        partner_id: '1234567890',
        partner: null,
      }),
    });
  });
});

test('partner list, detail, update, and delete work with mock data', async ({ page }) => {
  await page.goto('/admin/cubici/adminPreference/managePartner');

  await expect(page.getByRole('heading', { name: '환경설정' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '협력사 관리' })).toBeVisible();
  await expect(page.getByText('전체 1개')).toBeVisible();
  await expect(page.getByRole('cell', { name: '아즈온' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'BAAZ' })).toBeVisible();

  await page.getByRole('button', { name: '상세보기' }).click();
  await expect(page.getByRole('heading', { name: '협력사 상세' })).toBeVisible();

  const editor = page.locator('.partnerEditorPanel');
  await editor.getByLabel('회사명').fill('아즈온 수정');
  await editor.getByLabel('대표이사').fill('수정대표');
  await editor.getByRole('button', { name: '수정' }).click();
  await expect(page.getByText('협력사를 수정했습니다.')).toBeVisible();

  await editor.getByRole('button', { name: '삭제' }).click();
  await expect(page.getByText('협력사를 삭제했습니다.')).toBeVisible();
});
