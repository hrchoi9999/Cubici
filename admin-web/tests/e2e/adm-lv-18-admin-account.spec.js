import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const candidateDir = path.resolve(
  __dirname,
  '../../../docs/reference/lv-ui/admin/ADM-LV-18-ADMIN-ACCOUNT/candidate',
);

fs.mkdirSync(candidateDir, { recursive: true });

const pendingAccount = {
  row_no: 1,
  admin_id: 'pending_admin',
  admin_type: '00',
  admin_type_label: '큐빅아이',
  admin_name: '승인대기자',
  admin_phone: '01011112222',
  admin_email: 'pending@example.com',
  admin_department: '운영팀',
  admin_grade: '02',
  admin_grade_label: '승인대기',
  approval_status: '대기',
  admin_reg_date: '2026-08-09T10:00:00',
  admin_approval_date: null,
  permission_scope_label: '승인 후 설정',
  audit_status_label: '승인 대기',
};

const approvedAccount = {
  row_no: 2,
  admin_id: 'approved_admin',
  admin_type: '00',
  admin_type_label: '큐빅아이',
  admin_name: '운영관리자',
  admin_phone: '01033334444',
  admin_email: 'approved@example.com',
  admin_department: '서비스운영팀',
  admin_grade: '00',
  admin_grade_label: '권한1',
  approval_status: '승인완료',
  admin_reg_date: '2026-08-01T09:00:00',
  admin_approval_date: '2026-08-02T09:00:00',
  permission_scope_label: '관리자 전체 메뉴',
  audit_status_label: '정상',
};

test.beforeEach(async ({ page }) => {
  await page.route('**/v1/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    let body;

    if (url.pathname.endsWith('/accounts/admin-me')) {
      body = { user_no: 1, email: 'admin@example.com', user_type: 'ADMIN_USER', name: '관리자' };
    } else if (url.pathname.endsWith('/preferences/admin-accounts/id-check')) {
      body = { admin_id: url.searchParams.get('admin_id'), exists: false };
    } else if (url.pathname.endsWith('/preferences/admin-accounts/request')) {
      body = { action: 'created', admin_id: 'requested_admin', account: { ...pendingAccount, admin_id: 'requested_admin' } };
    } else if (url.pathname.endsWith('/preferences/admin-accounts/pending_admin/approve')) {
      body = { action: 'approved', admin_id: 'approved_new', account: { ...approvedAccount, admin_id: 'approved_new' } };
    } else if (url.pathname.endsWith('/preferences/admin-accounts/approved_new')) {
      body = request.method() === 'DELETE'
        ? { action: 'deleted', admin_id: 'approved_new', account: null }
        : { action: 'updated', admin_id: 'approved_new', account: { ...approvedAccount, admin_id: 'approved_new', admin_department: '검증팀' } };
    } else if (url.pathname.endsWith('/preferences/admin-accounts/pending_admin')) {
      body = pendingAccount;
    } else if (url.pathname.endsWith('/preferences/admin-accounts/approved_admin')) {
      body = approvedAccount;
    } else if (url.pathname.endsWith('/preferences/admin-accounts')) {
      body = {
        limit: 20,
        offset: 0,
        counts: { total_count: 2, pending_count: 1, approved_count: 1 },
        items: [pendingAccount, approvedAccount],
      };
    } else {
      body = { items: [], total: 0 };
    }

    await route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) });
  });

  await page.addInitScript(() => {
    window.localStorage.setItem('cubiciAdminAuth', JSON.stringify({
      token_type: 'Bearer',
      access_token: 'adm-lv-18-token',
      user: { email: 'admin@example.com', user_type: 'ADMIN_USER' },
    }));
  });
});

test('ADM-LV-18 관리자 목록 PC·모바일 후보를 검증한다', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/admin/cubici/adminPreference/adminRegister_tab1');

  await expect(page.getByRole('cell', { name: '승인대기자' })).toBeVisible();
  await expect(page.getByRole('cell', { name: '운영관리자' })).toBeVisible();
  await expect(page.locator('.adminAccountLvTable thead th')).toHaveCount(11);
  await expect(page.getByRole('columnheader', { name: '권한범위' })).toHaveCount(0);
  await expect(page.locator('.adminAccountLvTotals')).toContainText('전체2명');
  expect(await bodyOverflow(page)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: path.join(candidateDir, 'ADM-LV-18-LIST-PC.png'), fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expectClosedNavigation(page);
  await expect(page.getByRole('cell', { name: '승인대기자' })).toBeVisible();
  await expect(page.locator('.adminAccountHorizontalScrollbar')).toBeVisible();
  const horizontalRange = page.getByRole('slider', { name: '관리자 목록 가로 스크롤' });
  expect(Number(await horizontalRange.getAttribute('max'))).toBeGreaterThan(0);
  expect(await bodyOverflow(page)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: path.join(candidateDir, 'ADM-LV-18-LIST-MOBILE.png'), fullPage: true });
});

test('ADM-LV-18 승인 상세 PC·모바일 후보를 검증한다', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/admin/cubici/adminPreference/adminRegister_tab1');
  await page.getByRole('row', { name: /승인대기자/ }).getByRole('button', { name: '보기' }).click();

  await expect(page.getByRole('heading', { name: '관리자 등록 승인' })).toBeVisible();
  await expect(page.locator('.adminAccountAuditSummary')).toContainText('승인 후 설정');
  await expect(page.locator('.adminAccountAuditSummary')).toContainText('승인 대기');
  await page.screenshot({ path: path.join(candidateDir, 'ADM-LV-18-APPROVAL-PC.png'), fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expectClosedNavigation(page);
  await page.getByRole('row', { name: /승인대기자/ }).getByRole('button', { name: '보기' }).click();
  await expect(page.getByRole('heading', { name: '관리자 등록 승인' })).toBeVisible();
  expect(await bodyOverflow(page)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: path.join(candidateDir, 'ADM-LV-18-APPROVAL-MOBILE.png'), fullPage: true });
});

test('ADM-LV-18 신청·승인·수정·해지 API 흐름을 유지한다', async ({ page }) => {
  await page.goto('/admin/cubici/adminPreference/adminRegister_tab1');

  await page.getByRole('button', { name: '신청 등록' }).click();
  const requestPanel = page.locator('.adminAccountPanel');
  await requestPanel.getByLabel('부서명').fill('신규운영팀');
  await requestPanel.getByLabel('이름').fill('신규관리자');
  const createRequest = page.waitForRequest((request) => request.method() === 'POST' && request.url().endsWith('/preferences/admin-accounts/request'));
  await requestPanel.getByRole('button', { name: '신청 등록' }).click();
  await createRequest;
  await expect(page.getByText('관리자 신청을 등록했습니다.')).toBeVisible();

  await page.getByRole('row', { name: /승인대기자/ }).getByRole('button', { name: '보기' }).click();
  const approvalPanel = page.locator('.adminAccountPanel');
  await approvalPanel.getByLabel('관리자 아이디').fill('approved_new');
  await approvalPanel.getByRole('button', { name: '중복확인' }).click();
  await expect(page.getByText('사용 가능한 아이디 입니다.')).toBeVisible();
  await approvalPanel.getByLabel('관리자 비밀번호').fill('test-password');
  const approveRequest = page.waitForRequest((request) => request.method() === 'POST' && request.url().endsWith('/preferences/admin-accounts/pending_admin/approve'));
  await approvalPanel.getByRole('button', { name: '등록 승인' }).click();
  await approveRequest;
  await expect(page.getByText('관리자를 승인했습니다.')).toBeVisible();

  await approvalPanel.getByLabel('부서명').fill('검증팀');
  const updateRequest = page.waitForRequest((request) => request.method() === 'PUT' && request.url().endsWith('/preferences/admin-accounts/approved_new'));
  await approvalPanel.getByRole('button', { name: '정보 수정' }).click();
  await updateRequest;
  await expect(page.getByText('관리자 정보를 수정했습니다.')).toBeVisible();

  const deleteRequest = page.waitForRequest((request) => request.method() === 'DELETE' && request.url().endsWith('/preferences/admin-accounts/approved_new'));
  await approvalPanel.getByRole('button', { name: '등록 해지' }).click();
  await deleteRequest;
  await expect(page.getByText('관리자 등록을 해지했습니다.')).toBeVisible();
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
