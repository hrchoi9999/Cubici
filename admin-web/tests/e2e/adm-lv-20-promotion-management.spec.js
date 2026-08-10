import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const candidateDir = path.resolve(
  __dirname,
  '../../../docs/reference/lv-ui/admin/ADM-LV-20-PROMOTION-MANAGEMENT/candidate',
);

fs.mkdirSync(candidateDir, { recursive: true });

const promotions = [
  {
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
    sub_id_label: '1개',
    promo_detail: '신규 회원 할인',
    reg_date: '2026-07-22T10:00:00',
    update_date: null,
  },
  {
    row_no: 2,
    promo_code: 'CFI33',
    promo_name: '금융 제휴 프로모션',
    promo_target: 'C',
    promo_target_label: '큐빅회원',
    partner_code: 'FI33',
    partner_name: '금융 제휴사',
    status: 'Y',
    status_label: '운영',
    start_date: '2026-06-01',
    expire_date: '2026-11-30',
    charge_codes: ['B0101', 'B0301'],
    charge_names: ['1개월 기본요금', '3개월 기본요금'],
    discount_rate: null,
    discount_amount: 5000,
    period: null,
    period_unit: null,
    period_unit_label: '-',
    sub_id: 5,
    sub_id_label: '5개',
    promo_detail: '제휴 고객 금액 할인',
    reg_date: '2026-06-01T09:00:00',
    update_date: null,
  },
  {
    row_no: 3,
    promo_code: 'LCBCI',
    promo_name: '휴면회원 복귀 혜택',
    promo_target: 'L',
    promo_target_label: '휴면회원',
    partner_code: 'CBCI',
    partner_name: '자체',
    status: 'N',
    status_label: '종료',
    start_date: '2025-01-01',
    expire_date: '2025-12-31',
    charge_codes: ['B0101'],
    charge_names: ['1개월 기본요금'],
    discount_rate: null,
    discount_amount: null,
    period: 2,
    period_unit: 'W',
    period_unit_label: '주',
    sub_id: 99,
    sub_id_label: '무제한',
    promo_detail: '복귀 고객 무료 기간',
    reg_date: '2025-01-01T09:00:00',
    update_date: null,
  },
];

const options = {
  targets: [
    { value: 'N', label: '신규' },
    { value: 'C', label: '큐빅회원' },
    { value: 'L', label: '휴면회원' },
  ],
  partner_divisions: [{ value: 'CBCI', label: '자체' }],
  partners: [],
  charges: [
    { value: 'B0101', label: '1개월 기본요금' },
    { value: 'B0301', label: '3개월 기본요금' },
  ],
};

test.beforeEach(async ({ page }) => {
  await page.route('**/v1/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    let body;

    if (url.pathname.endsWith('/accounts/admin-me')) {
      body = { user_no: 1, email: 'admin@example.com', user_type: 'ADMIN_USER', name: '관리자' };
    } else if (url.pathname.endsWith('/preferences/promotions/options')) {
      body = options;
    } else if (url.pathname.endsWith('/preferences/promotions/NCBCI')) {
      if (request.method() === 'DELETE') {
        body = { action: 'deleted', promo_code: 'NCBCI', promotion: null };
      } else if (request.method() === 'PUT') {
        const payload = await request.postDataJSON();
        body = { action: 'updated', promo_code: 'NCBCI', promotion: { ...promotions[0], ...payload, status_label: '운영' } };
      } else {
        body = promotions[0];
      }
    } else if (url.pathname.endsWith('/preferences/promotions')) {
      if (request.method() === 'POST') {
        const payload = await request.postDataJSON();
        body = { action: 'created', promo_code: payload.promo_code, promotion: { ...promotions[0], ...payload } };
      } else {
        body = {
          limit: 10,
          offset: 0,
          counts: { total_count: 3, operating_count: 2, ended_count: 1 },
          items: promotions,
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
      access_token: 'adm-lv-20-token',
      user: { email: 'admin@example.com', user_type: 'ADMIN_USER' },
    }));
  });
});

test('ADM-LV-20 연계코드 목록 PC·모바일 후보를 검증한다', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/admin/cubici/adminPreference/managePromotion');

  await expect(page.locator('.promotionLvTable thead tr')).toHaveCount(2);
  await expect(page.getByRole('columnheader', { name: '혜택조건' })).toHaveAttribute('colspan', '2');
  await expect(page.getByRole('columnheader', { name: '무료기간' })).toHaveAttribute('colspan', '2');
  await expect(page.getByRole('cell', { name: '신규 자체 프로모션' })).toBeVisible();
  await expect(page.locator('.promotionLvTotals')).toContainText('전체3개');
  expect(await bodyOverflow(page)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: path.join(candidateDir, 'ADM-LV-20-LIST-PC.png'), fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expectClosedNavigation(page);
  await expect(page.locator('.promotionHorizontalScrollbar')).toBeVisible();
  const horizontalRange = page.getByRole('slider', { name: '연계코드 목록 가로 스크롤' });
  expect(Number(await horizontalRange.getAttribute('max'))).toBeGreaterThan(0);
  expect(await bodyOverflow(page)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: path.join(candidateDir, 'ADM-LV-20-LIST-MOBILE.png'), fullPage: true });
});

test('ADM-LV-20 연계코드 상세 PC·모바일 후보를 검증한다', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/admin/cubici/adminPreference/managePromotion');
  await page.getByRole('row', { name: /신규 자체 프로모션/ }).getByRole('button', { name: '상세보기' }).click();

  await expect(page.getByRole('heading', { name: '연계코드 상세' })).toBeVisible();
  await expect(page.locator('.promotionEditorPanel').getByLabel('연계코드명')).toHaveValue('신규 자체 프로모션');
  await page.screenshot({ path: path.join(candidateDir, 'ADM-LV-20-DETAIL-PC.png'), fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expectClosedNavigation(page);
  await page.getByRole('row', { name: /신규 자체 프로모션/ }).getByRole('button', { name: '상세보기' }).click();
  await expect(page.getByRole('heading', { name: '연계코드 상세' })).toBeVisible();
  expect(await bodyOverflow(page)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: path.join(candidateDir, 'ADM-LV-20-DETAIL-MOBILE.png'), fullPage: true });
});

test('ADM-LV-20 검색과 등록·수정·삭제 API 흐름을 유지한다', async ({ page }) => {
  await page.goto('/admin/cubici/adminPreference/managePromotion');

  await page.getByLabel('연계코드', { exact: true }).first().fill('NC');
  const filterRequest = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return request.method() === 'GET'
      && url.pathname.endsWith('/preferences/promotions')
      && url.searchParams.get('promo_code') === 'NC';
  });
  await page.getByRole('button', { name: '검색' }).click();
  await filterRequest;

  await page.getByRole('button', { name: '연계코드 추가' }).click();
  const editor = page.locator('.promotionEditorPanel');
  await editor.getByLabel('연계코드명').fill('신규 연계 혜택');
  await editor.getByLabel('시작일자').fill('2026-08-10');
  await editor.getByLabel('종료일자').fill('2026-12-31');
  await editor.getByLabel('1개월 기본요금').check();
  const createRequest = page.waitForRequest((request) => request.method() === 'POST' && request.url().endsWith('/preferences/promotions'));
  await editor.getByRole('button', { name: '등록' }).click();
  await createRequest;
  await expect(page.getByText('연계코드를 등록했습니다.')).toBeVisible();

  await page.getByRole('row', { name: /신규 자체 프로모션/ }).getByRole('button', { name: '상세보기' }).click();
  await editor.getByLabel('연계코드명').fill('신규 자체 프로모션 수정');
  const updateRequest = page.waitForRequest((request) => request.method() === 'PUT' && request.url().endsWith('/preferences/promotions/NCBCI'));
  await editor.getByRole('button', { name: '수정' }).click();
  await updateRequest;
  await expect(page.getByText('연계코드를 수정했습니다.')).toBeVisible();

  const deleteRequest = page.waitForRequest((request) => request.method() === 'DELETE' && request.url().endsWith('/preferences/promotions/NCBCI'));
  await editor.getByRole('button', { name: '삭제' }).click();
  await deleteRequest;
  await expect(page.getByText('연계코드를 삭제했습니다.')).toBeVisible();
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
