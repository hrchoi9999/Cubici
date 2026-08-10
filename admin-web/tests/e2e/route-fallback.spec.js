import { expect, test } from '@playwright/test';

const MASTER_ADMIN_EMAIL = process.env.CUBICI_MASTER_ADMIN_EMAIL ?? 'admin@example.com';

test('admin-spa entry redirects to the implemented integrated dashboard', async ({ page }) => {
  await page.addInitScript((masterAdminEmail) => {
    window.localStorage.setItem('cubiciAdminAuth', JSON.stringify({
      access_token: 'admin-entry-route-token',
      token_type: 'Bearer',
      user: {
        email: masterAdminEmail,
        name: '관리자',
        user_type: 'ADMIN_USER',
      },
    }));
  }, MASTER_ADMIN_EMAIL);
  await page.route('**/v1/api/accounts/admin-me', (route) => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({
      email: MASTER_ADMIN_EMAIL,
      name: '관리자',
      user_type: 'ADMIN_USER',
    }),
  }));

  await page.goto('/admin-spa');

  await expect(page).toHaveURL(/\/admin\/cubici\/infoIntegrated\/cubici_tab1$/);
  await expect(page.getByRole('heading', { name: '쇼핑몰 통합' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '통합 현황' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '미구현 경로' })).toHaveCount(0);
});

test('unknown admin route is not counted as an implemented page', async ({ page }) => {
  await page.goto('/admin/cubici/unmapped/legacyRoute');

  await expect(page.getByRole('heading', { name: 'Route 점검' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '미구현 경로' })).toBeVisible();
  await expect(page.getByRole('cell', { name: '미구현 또는 route alias 미매핑' })).toBeVisible();
  await expect(page.locator('#route-fallback-status').getByRole('cell', { name: '제외' })).toBeVisible();
  await expect(page.getByText('다른 구현 메뉴로 자동 대체하지 않고 미구현 경로로 표시합니다.')).toBeVisible();
});
