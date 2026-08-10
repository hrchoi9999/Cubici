import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const candidateDir = path.resolve(
  __dirname,
  '../../../docs/reference/lv-ui/admin/ADM-LV-19-CHARGE-MANAGEMENT/candidate',
);

fs.mkdirSync(candidateDir, { recursive: true });

const charges = [
  {
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
  },
  {
    row_no: 2,
    charge_code: 'A0101',
    charge_name: '쇼핑몰 추가 요금제',
    charge_type: 'A',
    status: '운영',
    start_date: '2024-01-01',
    expire_date: '2099-12-31',
    sub_id: 5,
    sales_count: null,
    product_count: null,
    amount: 9900,
    period: 1,
    period_unit: 'M',
    charge_detail: '쇼핑몰 추가 연동',
    reg_date: '2024-01-02T09:00:00',
    update_date: null,
  },
  {
    row_no: 3,
    charge_code: 'F0101',
    charge_name: '체험 무료요금',
    charge_type: 'F',
    status: '종료',
    start_date: '2022-01-01',
    expire_date: '2022-12-31',
    sub_id: 99,
    sales_count: null,
    product_count: null,
    amount: 0,
    period: 1,
    period_unit: 'M',
    charge_detail: '체험 요금제',
    reg_date: '2022-01-01T09:00:00',
    update_date: null,
  },
];

test.beforeEach(async ({ page }) => {
  await page.route('**/v1/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    let body;

    if (url.pathname.endsWith('/accounts/admin-me')) {
      body = { user_no: 1, email: 'admin@example.com', user_type: 'ADMIN_USER', name: '관리자' };
    } else if (url.pathname.endsWith('/preferences/charges/B0101')) {
      if (request.method() === 'DELETE') {
        body = { action: 'deleted', charge_code: 'B0101', charge: null };
      } else if (request.method() === 'PUT') {
        const payload = await request.postDataJSON();
        body = { action: 'updated', charge_code: 'B0101', charge: { ...charges[0], ...payload, update_date: '2026-08-10T18:00:00' } };
      } else {
        body = charges[0];
      }
    } else if (url.pathname.endsWith('/preferences/charges')) {
      if (request.method() === 'POST') {
        const payload = await request.postDataJSON();
        body = { action: 'created', charge_code: payload.charge_code, charge: { ...charges[0], ...payload } };
      } else {
        body = {
          limit: 10,
          offset: 0,
          counts: { total_count: 3, operating_count: 2, ended_count: 1 },
          items: charges,
        };
      }
    } else {
      body = { items: [], total: 0 };
    }

    await route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) });
  });

  await page.addInitScript(() => {
    window.localStorage.setItem('cubiciAdminAuth', JSON.stringify({
      token_type: 'Bearer',
      access_token: 'adm-lv-19-token',
      user: { email: 'admin@example.com', user_type: 'ADMIN_USER' },
    }));
  });
});

test('ADM-LV-19 요금제 목록 PC·모바일 후보를 검증한다', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/admin/cubici/adminPreference/manageCharge');

  await expect(page.locator('.chargeLvTable thead th')).toHaveCount(7);
  await expect(page.getByRole('columnheader', { name: '상품 수' })).toHaveCount(0);
  await expect(page.getByRole('cell', { name: '1개월 기본요금' })).toBeVisible();
  await expect(page.locator('.chargeLvTotals')).toContainText('전체3개');
  expect(await bodyOverflow(page)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: path.join(candidateDir, 'ADM-LV-19-LIST-PC.png'), fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expectClosedNavigation(page);
  await expect(page.locator('.chargeHorizontalScrollbar')).toBeVisible();
  const horizontalRange = page.getByRole('slider', { name: '요금제 목록 가로 스크롤' });
  expect(Number(await horizontalRange.getAttribute('max'))).toBeGreaterThan(0);
  expect(await bodyOverflow(page)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: path.join(candidateDir, 'ADM-LV-19-LIST-MOBILE.png'), fullPage: true });
});

test('ADM-LV-19 요금제 상세 PC·모바일 후보를 검증한다', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/admin/cubici/adminPreference/manageCharge');
  await page.getByRole('row', { name: /1개월 기본요금/ }).getByRole('button', { name: '상세보기' }).click();

  await expect(page.getByRole('heading', { name: '요금제 수정' })).toBeVisible();
  await expect(page.locator('.chargeEditorPanel').getByLabel('요금제명')).toHaveValue('1개월 기본요금');
  await page.screenshot({ path: path.join(candidateDir, 'ADM-LV-19-DETAIL-PC.png'), fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expectClosedNavigation(page);
  await page.getByRole('row', { name: /1개월 기본요금/ }).getByRole('button', { name: '상세보기' }).click();
  await expect(page.getByRole('heading', { name: '요금제 수정' })).toBeVisible();
  expect(await bodyOverflow(page)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: path.join(candidateDir, 'ADM-LV-19-DETAIL-MOBILE.png'), fullPage: true });
});

test('ADM-LV-19 유형 검색과 등록·수정·삭제 API 흐름을 유지한다', async ({ page }) => {
  await page.goto('/admin/cubici/adminPreference/manageCharge');

  await page.getByLabel('요금제', { exact: true }).selectOption('B');
  const filterRequest = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return request.method() === 'GET'
      && url.pathname.endsWith('/preferences/charges')
      && url.searchParams.get('charge_type') === 'B';
  });
  await page.getByRole('button', { name: '검색' }).click();
  await filterRequest;

  await page.getByRole('button', { name: '요금제 추가' }).click();
  const editor = page.locator('.chargeEditorPanel');
  await editor.getByLabel('요금제명').fill('신규 기본요금');
  await editor.getByLabel('시작일').fill('2026-08-10');
  await editor.getByLabel('종료일').fill('2099-12-31');
  const createRequest = page.waitForRequest((request) => request.method() === 'POST' && request.url().endsWith('/preferences/charges'));
  await editor.getByRole('button', { name: '등록' }).click();
  await createRequest;
  await expect(page.getByText('요금제를 등록했습니다.')).toBeVisible();

  await page.getByRole('row', { name: /1개월 기본요금/ }).getByRole('button', { name: '상세보기' }).click();
  await editor.getByLabel('요금제명').fill('1개월 기본요금 수정');
  const updateRequest = page.waitForRequest((request) => request.method() === 'PUT' && request.url().endsWith('/preferences/charges/B0101'));
  await editor.getByRole('button', { name: '수정' }).click();
  await updateRequest;
  await expect(page.getByText('요금제를 수정했습니다.')).toBeVisible();

  const deleteRequest = page.waitForRequest((request) => request.method() === 'DELETE' && request.url().endsWith('/preferences/charges/B0101'));
  await editor.getByRole('button', { name: '삭제' }).click();
  await deleteRequest;
  await expect(page.getByText('요금제를 삭제했습니다.')).toBeVisible();
});

async function expectClosedNavigation(page) {
  await expect(page.locator('.adminNavigationToggle')).toBeVisible();
  await expect.poll(async () => {
    const box = await page.locator('#admin-navigation').boundingBox();
    return box?.x ?? 0;
  }).toBeLessThanOrEqual(-300);
}

function bodyOverflow(page) {
  return page.evaluate(() => document.body.scrollWidth - document.documentElement.clientWidth);
}
