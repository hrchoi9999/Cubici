import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const candidateDir = path.resolve(
  __dirname,
  '../../../docs/reference/lv-ui/admin/ADM-LV-21-PARTNER-MANAGEMENT/candidate',
);

fs.mkdirSync(candidateDir, { recursive: true });

const partners = [
  {
    row_no: 1,
    partner_id: '1234567890',
    partner_code: 'BB01',
    partner_name: '아즈온',
    rep_name: '김대표',
    partner_zip: '07236',
    partner_address: '서울 영등포구',
    partner_status: '00',
    partner_status_label: '운영',
    partner_type: 'BB',
    partner_type_label: 'B2B도매',
    memo: '온라인 판매 연계 협력사',
    manager_name: '이담당',
    manager_phone: '01012345678',
    manager_status_label: '담당자 등록',
    reg_date: '2026-08-09T10:00:00',
    update_date: null,
  },
  {
    row_no: 2,
    partner_id: '2345678901',
    partner_code: 'FI32',
    partner_name: '금융 제휴사',
    rep_name: '박대표',
    partner_zip: '04524',
    partner_address: '서울 중구',
    partner_status: '00',
    partner_status_label: '운영',
    partner_type: 'FI',
    partner_type_label: '금융',
    memo: '금융 서비스 연계',
    manager_name: '최담당',
    manager_phone: '01022223333',
    manager_status_label: '담당자 등록',
    reg_date: '2026-07-18T09:00:00',
    update_date: null,
  },
  {
    row_no: 3,
    partner_id: '3456789012',
    partner_code: 'BA02',
    partner_name: '정산 은행',
    rep_name: '윤대표',
    partner_zip: '03154',
    partner_address: '서울 종로구',
    partner_status: '01',
    partner_status_label: '종료',
    partner_type: 'BA',
    partner_type_label: '은행',
    memo: '정산 계좌 연계',
    manager_name: null,
    manager_phone: null,
    manager_status_label: '담당자 미지정',
    reg_date: '2025-12-01T09:00:00',
    update_date: null,
  },
];

const detail = {
  partner: partners[0],
  managers: [
    { manager_type: '00', manager_name: '정책임', manager_rank: '팀장', manager_email: 'supervisor@example.com', manager_phone: '01011112222' },
    { manager_type: '01', manager_name: '이담당', manager_rank: '매니저', manager_email: 'manager@example.com', manager_phone: '01012345678' },
  ],
};

test.beforeEach(async ({ page }) => {
  await page.route('**/v1/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    let body;

    if (url.pathname.endsWith('/accounts/admin-me')) {
      body = { user_no: 1, email: 'admin@example.com', user_type: 'ADMIN_USER', name: '관리자' };
    } else if (url.pathname.endsWith('/preferences/partners/id-check')) {
      body = { value: url.searchParams.get('partner_id'), exists: false };
    } else if (url.pathname.endsWith('/preferences/partners/code-check')) {
      body = { value: url.searchParams.get('partner_code'), exists: false };
    } else if (url.pathname.endsWith('/preferences/partners/1234567890')) {
      if (request.method() === 'DELETE') {
        body = { action: 'deleted', partner_id: '1234567890', partner: null };
      } else if (request.method() === 'PUT') {
        const payload = await request.postDataJSON();
        body = {
          action: 'updated',
          partner_id: '1234567890',
          partner: { partner: { ...partners[0], ...payload }, managers: payload.managers },
        };
      } else {
        body = detail;
      }
    } else if (url.pathname.endsWith('/preferences/partners')) {
      if (request.method() === 'POST') {
        const payload = await request.postDataJSON();
        body = {
          action: 'created',
          partner_id: payload.partner_id,
          partner: { partner: { ...partners[0], ...payload }, managers: payload.managers },
        };
      } else {
        body = {
          limit: 10,
          offset: 0,
          counts: {
            total_count: 3,
            operating_count: 2,
            ended_count: 1,
            type_ba_count: 1,
            type_bb_count: 1,
            type_co_count: 0,
            type_fi_count: 1,
            type_mn_count: 0,
            type_th_count: 0,
            missing_manager_count: 1,
          },
          items: partners,
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
      access_token: 'adm-lv-21-token',
      user: { email: 'admin@example.com', user_type: 'ADMIN_USER' },
    }));
  });
});

test('ADM-LV-21 협력사 목록 PC·모바일 후보를 검증한다', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/admin/cubici/adminPreference/managePartner');

  await expect(page.locator('.partnerLvTable thead tr')).toHaveCount(2);
  await expect(page.getByRole('columnheader', { name: '담당자', exact: true })).toHaveAttribute('colspan', '2');
  await expect(page.getByRole('cell', { name: '아즈온' })).toBeVisible();
  await expect(page.locator('.partnerLvTotals')).toContainText('전체3개');
  await expect(page.locator('.partnerLvTotals')).toContainText('B2B도매1개');
  expect(await bodyOverflow(page)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: path.join(candidateDir, 'ADM-LV-21-LIST-PC.png'), fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expectClosedNavigation(page);
  await expect(page.locator('.partnerHorizontalScrollbar')).toBeVisible();
  const horizontalRange = page.getByRole('slider', { name: '협력사 목록 가로 스크롤' });
  expect(Number(await horizontalRange.getAttribute('max'))).toBeGreaterThan(0);
  expect(await bodyOverflow(page)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: path.join(candidateDir, 'ADM-LV-21-LIST-MOBILE.png'), fullPage: true });
});

test('ADM-LV-21 협력사 상세 PC·모바일 후보를 검증한다', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/admin/cubici/adminPreference/managePartner');
  await page.getByRole('row', { name: /아즈온/ }).getByRole('button', { name: '상세보기' }).click();

  await expect(page.getByRole('heading', { name: '협력사 상세' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '기본정보' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '연락처 정보' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '연계내역' })).toBeVisible();
  await expect(page.locator('.partnerEditorPanel').getByLabel('회사명')).toHaveValue('아즈온');
  expect(await bodyOverflow(page)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: path.join(candidateDir, 'ADM-LV-21-DETAIL-PC.png'), fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expectClosedNavigation(page);
  await page.getByRole('row', { name: /아즈온/ }).getByRole('button', { name: '상세보기' }).click();
  await expect(page.getByRole('heading', { name: '협력사 상세' })).toBeVisible();
  expect(await bodyOverflow(page)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: path.join(candidateDir, 'ADM-LV-21-DETAIL-MOBILE.png'), fullPage: true });
});

test('ADM-LV-21 검색과 중복확인·등록·수정·삭제 API 흐름을 유지한다', async ({ page }) => {
  await page.goto('/admin/cubici/adminPreference/managePartner');

  await page.getByLabel('회사명').first().fill('아즈온');
  const filterRequest = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return request.method() === 'GET'
      && url.pathname.endsWith('/preferences/partners')
      && url.searchParams.get('partner_name') === '아즈온';
  });
  await page.getByRole('button', { name: '검색' }).click();
  await filterRequest;

  await page.getByRole('button', { name: '기업 추가' }).click();
  const editor = page.locator('.partnerEditorPanel');
  await editor.getByLabel('회사명').fill('신규 협력사');
  await editor.getByLabel('사업자 번호').fill('1234567890');
  await editor.getByRole('button', { name: '확인', exact: true }).click();
  await expect(page.getByText('사업자 등록번호 형식이 올바르지 않습니다.')).toBeVisible();
  await editor.getByLabel('사업자 번호').fill('5678800419');
  await editor.getByRole('button', { name: '확인', exact: true }).click();
  await expect(page.getByText('사용 가능한 사업자번호입니다.')).toBeVisible();
  await editor.getByLabel('대표이사').fill('신규대표');
  await editor.getByLabel('주소 우편번호').fill('05200');
  await editor.getByLabel('주소', { exact: true }).fill('서울 강동구');
  await editor.getByLabel('구분코드').fill('03');
  await editor.getByRole('button', { name: '중복확인' }).click();
  await expect(page.getByText('사용 가능한 코드입니다.')).toBeVisible();
  const createRequest = page.waitForRequest((request) => request.method() === 'POST' && request.url().endsWith('/preferences/partners'));
  await editor.getByRole('button', { name: '등록' }).click();
  await createRequest;
  await expect(page.getByText('협력사를 등록했습니다.')).toBeVisible();

  await page.getByRole('row', { name: /아즈온/ }).getByRole('button', { name: '상세보기' }).click();
  await editor.getByLabel('회사명').fill('아즈온 수정');
  const updateRequest = page.waitForRequest((request) => request.method() === 'PUT' && request.url().endsWith('/preferences/partners/1234567890'));
  await editor.getByRole('button', { name: '수정' }).click();
  await updateRequest;
  await expect(page.getByText('협력사를 수정했습니다.')).toBeVisible();

  const deleteRequest = page.waitForRequest((request) => request.method() === 'DELETE' && request.url().endsWith('/preferences/partners/1234567890'));
  await editor.getByRole('button', { name: '삭제' }).click();
  await deleteRequest;
  await expect(page.getByText('협력사를 삭제했습니다.')).toBeVisible();
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
