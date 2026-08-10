import { expect, test } from '../../../admin-web/node_modules/@playwright/test/index.mjs';

test('expired user session redirects to login instead of showing zero dashboard amounts', async ({ page }) => {
  await page.addInitScript(() => {
    if (window.sessionStorage.getItem('expiry-test-seeded')) return;
    window.sessionStorage.setItem('expiry-test-seeded', 'true');
    window.localStorage.setItem('cubiciUserAuth', JSON.stringify({
      access_token: 'expired-user-token',
      token_type: 'Bearer',
      user: {
        user_no: 1,
        email: 'user@example.com',
        name: '사용자',
        user_type: 'USER',
      },
    }));
  });
  await page.route('**/v1/api/accounts/me/dashboard-summary', (route) => route.fulfill({
    status: 401,
    contentType: 'application/json',
    body: JSON.stringify({ detail: 'token expired' }),
  }));

  await page.goto('/');

  await expect(page).toHaveURL(/\/login\?returnUrl=%2F$/);
  await expect(page.getByRole('heading', { name: 'LOGIN' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem('cubiciUserAuth'))).toBeNull();
});
