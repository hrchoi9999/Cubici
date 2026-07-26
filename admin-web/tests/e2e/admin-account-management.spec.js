import { expect, test } from '@playwright/test';

const pendingAccount = {
  row_no: 1,
  admin_id: 'temp_id_1',
  admin_type: '00',
  admin_type_label: '큐빅아이',
  admin_name: '운영관리자',
  admin_phone: '01000000000',
  admin_email: 'admin@example.com',
  admin_department: '운영팀',
  admin_grade: '02',
  admin_grade_label: '승인대기',
  approval_status: '대기',
  admin_reg_date: '2026-07-22T10:00:00',
  admin_approval_date: null,
  modified_date: null,
};

const approvedAccount = {
  ...pendingAccount,
  admin_id: 'admin01',
  admin_grade: '00',
  admin_grade_label: '권한1',
  approval_status: '승인완료',
  admin_approval_date: '2026-07-22T11:00:00',
};

test.beforeEach(async ({ page }) => {
  await page.route('**/v1/api/preferences/admin-accounts?**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        limit: 20,
        offset: 0,
        counts: {
          total_count: 1,
          pending_count: 1,
          approved_count: 0,
        },
        items: [pendingAccount],
      }),
    });
  });

  await page.route('**/v1/api/preferences/admin-accounts/id-check?**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ admin_id: 'admin01', exists: false }),
    });
  });

  await page.route('**/v1/api/preferences/admin-accounts/temp_id_1', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify(pendingAccount),
      });
      return;
    }

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        action: 'deleted',
        admin_id: 'temp_id_1',
        account: null,
      }),
    });
  });

  await page.route('**/v1/api/preferences/admin-accounts/temp_id_1/approve', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        action: 'approved',
        admin_id: 'admin01',
        account: approvedAccount,
      }),
    });
  });
});

test('admin account list and approval workflow work with mock data', async ({ page }) => {
  await page.goto('/admin/cubici/adminPreference/adminRegister_tab1');

  await expect(page.getByRole('heading', { name: '환경설정' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '관리자 등록' })).toBeVisible();
  await expect(page.getByText('전체 1명')).toBeVisible();
  await expect(page.getByRole('cell', { name: '운영관리자' })).toBeVisible();
  await expect(page.getByRole('cell', { name: '대기', exact: true })).toBeVisible();

  await page.getByRole('button', { name: '보기' }).click();
  await expect(page.getByRole('heading', { name: '관리자 등록 승인' })).toBeVisible();

  const panel = page.locator('.adminAccountPanel');
  await panel.getByLabel('관리자 아이디').fill('admin01');
  await panel.getByRole('button', { name: '중복확인' }).click();
  await expect(page.getByText('사용 가능한 아이디 입니다.')).toBeVisible();

  await panel.getByLabel('관리자 비밀번호').fill('test-password');
  await panel.getByLabel('접근등급').selectOption('00');
  await panel.getByRole('button', { name: '등록 승인' }).click();
  await expect(page.getByText('관리자를 승인했습니다.')).toBeVisible();
});
