import { expect, test } from '@playwright/test';


test('settlement page displays Coupang source reconciliation without a false difference', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.route('**/v1/api/**', async (route) => {
    const body = route.request().url().includes('/accounts/admin-me')
      ? { user_no: 1, email: 'admin@example.com', user_type: 'ADMIN_USER', name: '관리자' }
      : {
          limit: 10,
          offset: 0,
          total: 1,
          counts: {
            total_count: 1,
            ok_count: 0,
            source_reconciled_count: 1,
            diff_count: 0,
            legacy_batch_value_count: 0,
            unchecked_count: 0,
            total_difference: -1,
            absolute_difference: 1,
            check_status_label: '원천검산일치',
          },
          items: [{
            settlements_id: 1,
            shop_type: 'COUPANG',
            shop_id: 'TEST-SHOP',
            settlement_type: 'WEEKLY',
            settlement_date: '2026-08-12',
            total_sale: 120000,
            service_fee: 10000,
            settlement_target_amount: 110000,
            settlement_amount: 76999,
            pending_released_amount: 0,
            status: 'DONE',
            settlement_check_amount: 77000,
            settlement_difference: -1,
            settlement_check_status: 'SOURCE_RECONCILED',
          }],
        };
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
  await page.addInitScript(() => {
    window.localStorage.setItem('cubiciAdminAuth', JSON.stringify({
      token_type: 'Bearer',
      access_token: 'settlement-source-test-token',
      user: { email: 'admin@example.com', user_type: 'ADMIN_USER' },
    }));
  });

  await page.goto('/admin/moneybank/settlement');

  await expect(page.locator('.settlementLvSummary')).toContainText('원천검산일치');
  await expect(page.locator('.settlementLvSummary')).toContainText('원천일치1건');
  await expect(page.locator('.settlementTable tbody')).toContainText('원천일치 (-1)');
  await expect(page.locator('.settlementLvSummary')).toContainText('차이0건');
  expect(pageErrors).toEqual([]);
});
