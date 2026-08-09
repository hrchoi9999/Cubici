import { expect, test } from '@playwright/test';

import { installMockAdminAuth } from './helpers/mock-admin-auth.js';

const configRow = {
  row_no: 1,
  division: 1,
  division_label: 'Prizm',
  subject_no: 1,
  subject_name: '주제 1',
  item_no: 1,
  item_nm: '사업기간',
  item_definition: '사업자등록 기간',
  item_weight: '10',
  item_standard_low1: '0',
  item_standard_high1: '3',
  item_standard_low2: '3',
  item_standard_high2: '6',
  item_standard_low3: '6',
  item_standard_high3: '12',
  item_standard_low4: '12',
  item_standard_high4: '24',
  item_standard_low5: '24',
  item_standard_high5: null,
};

const updateRecord = {
  record_id: 1,
  division: 1,
  subject_no: 1,
  item_no: 1,
  item_name: '사업기간',
  admin_id: 'admin',
  update_memo: '초기 조정',
  before_payload: { item_weight: '9' },
  after_payload: { item_weight: '10' },
  reg_date: '2026-07-22T10:00:00',
};

test.beforeEach(async ({ page }) => {
  await installMockAdminAuth(page);
  await page.route('**/v1/api/preferences/prizm-config/items?**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        limit: 20,
        offset: 0,
        counts: {
          total_count: 1,
          prizm_count: 1,
          cra_count: 0,
        },
        items: [configRow],
      }),
    });
  });

  await page.route('**/v1/api/preferences/prizm-config/update-records?**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        limit: 5,
        offset: 0,
        total: 1,
        items: [updateRecord],
      }),
    });
  });

  await page.route('**/v1/api/preferences/prizm-config/items/1/1/1', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify(configRow),
      });
      return;
    }

    const payload = await route.request().postDataJSON();
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        action: 'updated',
        division: 1,
        subject_no: 1,
        item_no: 1,
        item: {
          ...configRow,
          item_definition: payload.item_definition,
          item_weight: payload.item_weight,
        },
      }),
    });
  });
});

test('prizm config list, detail, update, and records work with mock data', async ({ page }) => {
  await page.goto('/admin/cubici/adminPreference/prizmConfig');

  await expect(page.locator('.adminPageHeader h2', { hasText: '환경설정' })).toBeVisible();
  await expect(page.locator('.adminPageHeader p')).toContainText('Prism/CRA 평가 항목');
  await expect(page.getByRole('cell', { name: '사업기간', exact: true })).toBeVisible();
  await expect(page.getByText('변경이력 1건')).toBeVisible();

  await page.getByRole('button', { name: '선택' }).click();
  await expect(page.getByRole('heading', { name: '평가항목 수정' })).toBeVisible();

  const editor = page.locator('.prizmConfigPanel');
  await editor.getByLabel('지표정의').fill('사업자등록 기간 수정');
  await editor.getByLabel('가중치').fill('11');
  await editor.getByLabel('변경메모').fill('테스트 수정');
  await editor.getByRole('button', { name: '수정' }).click();
  await expect(page.getByText('Prism 설정을 수정했습니다.')).toBeVisible();
});
