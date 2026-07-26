import { expect, test } from '@playwright/test';

test('unknown admin route is not counted as an implemented page', async ({ page }) => {
  await page.goto('/admin/cubici/unmapped/legacyRoute');

  await expect(page.getByRole('heading', { name: 'Route 점검' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '미구현 경로' })).toBeVisible();
  await expect(page.getByRole('cell', { name: '미구현 또는 route alias 미매핑' })).toBeVisible();
  await expect(page.locator('#route-fallback-status').getByRole('cell', { name: '제외' })).toBeVisible();
  await expect(page.getByText('다른 구현 메뉴로 자동 대체하지 않고 미구현 경로로 표시합니다.')).toBeVisible();
});
