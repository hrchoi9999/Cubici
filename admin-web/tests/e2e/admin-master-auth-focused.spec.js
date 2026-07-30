import { expect, test } from '@playwright/test';

test.skip(process.env.CUBICI_RUN_DB_E2E !== '1', 'set CUBICI_RUN_DB_E2E=1 to run local PostgreSQL UI E2E tests');
test.skip(!process.env.CUBICI_MASTER_ADMIN_PASSWORD, 'set CUBICI_MASTER_ADMIN_PASSWORD to run master admin auth focused test');

const MASTER_ADMIN_EMAIL = process.env.CUBICI_MASTER_ADMIN_EMAIL ?? 'admin@example.com';

test('admin pages require master admin login and logout clears access', async ({ page }) => {
  await page.goto('/admin/cubici/infoIntegrated/cubici_tab1');
  await expect(page.getByRole('heading', { name: '관리자 로그인' })).toBeVisible();
  await expect(page.getByLabel('관리자 계정')).toHaveValue(MASTER_ADMIN_EMAIL);
  await expect(page.getByText('큐빅아이')).toHaveCount(0);

  await page.getByLabel('비밀번호').fill(process.env.CUBICI_MASTER_ADMIN_PASSWORD);
  await page.getByRole('button', { name: '로그인' }).click();

  await expect(page.getByText(`${MASTER_ADMIN_EMAIL} 님, 안녕하세요!`)).toBeVisible();
  await expect(page.getByRole('heading', { name: '통합정보' }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: '큐빅아이' }).first()).toBeVisible();

  await page.getByRole('link', { name: '로그아웃' }).click();
  await expect(page.getByRole('heading', { name: '관리자 로그인' })).toBeVisible();

  await page.goto('/admin/moneybank/request');
  await expect(page.getByRole('heading', { name: '관리자 로그인' })).toBeVisible();
  await expect(page.getByText('신청 접수')).toHaveCount(0);
});

test('forged master admin local storage session is rejected by server verification', async ({ page }) => {
  await page.addInitScript((masterAdminEmail) => {
    window.localStorage.setItem(
      'cubiciAdminAuth',
      JSON.stringify({
        token_type: 'Bearer',
        access_token: 'invalid-token',
        user: {
          email: masterAdminEmail,
          user_type: 'ADMIN_USER',
        },
      }),
    );
  }, MASTER_ADMIN_EMAIL);

  await page.goto('/admin/moneybank/request');
  await expect(page.getByRole('heading', { name: '관리자 로그인' })).toBeVisible();
  await expect(page.getByText('신청 접수')).toHaveCount(0);
});
