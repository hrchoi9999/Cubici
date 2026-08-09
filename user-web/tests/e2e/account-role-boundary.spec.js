import { expect, test } from '../../../admin-web/node_modules/@playwright/test/index.mjs';


test('admin session is removed from the user service', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('cubiciUserAuth', JSON.stringify({
      access_token: 'admin-token',
      token_type: 'Bearer',
      user: {
        user_no: 2,
        email: 'master-admin@example.com',
        user_type: 'ADMIN_USER',
      },
    }));
  });

  await page.goto('/cubici/mypage/profile');

  await expect(page).toHaveURL(/\/login\?returnUrl=/);
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem('cubiciUserAuth'))).toBeNull();
});


test('user login refuses an admin account response', async ({ page }) => {
  await page.route('**/v1/api/accounts/login', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      access_token: 'admin-token',
      token_type: 'Bearer',
      expires_in: 28800,
      user: {
        user_no: 2,
        email: 'master-admin@example.com',
        user_type: 'ADMIN_USER',
      },
    }),
  }));

  await page.goto('/login');
  await page.getByPlaceholder('아이디').fill('master-admin@example.com');
  await page.getByPlaceholder('비밀번호').fill('test-password');
  await page.getByRole('button', { name: '로그인' }).click();

  await expect(page.getByText('사용자 계정만 사용자 서비스에 접속할 수 있습니다.')).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem('cubiciUserAuth'))).toBeNull();
});
