import { expect, test } from '@playwright/test';


test('moneybank overview identifies the imported opening repayment', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('cubiciAdminAuth', JSON.stringify({
      token_type: 'Bearer', access_token: 'ledger-test-token',
      user: { email: 'admin@example.com', user_type: 'ADMIN_USER' },
    }));
  });

  await page.route('**/v1/api/accounts/admin-me', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ user_no: 1, email: 'admin@example.com', user_type: 'ADMIN_USER', name: '관리자' }),
    });
  });

  await page.route('**/v1/api/management/overview?**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        unit: 'day',
        summary: {
          standard_date: '2024-05-01', from_date: '2024-04-02', to_date: '2024-05-01',
          contract_total_count: 7, contract_today_count: 0, active_contract_count: 1,
          terminated_contract_count: 6, provision_today_amount: 0,
          provision_total_amount: 55686548, provision_total_count: 538,
          repayment_today_amount: 0, repayment_total_amount: 54772944,
          repayment_total_count: 339, repayment_fee_total_amount: 566016,
          opening_repayment_amount: 3616, opening_repayment_count: 1,
          reconciled_repayment_total_amount: 54776560,
          outstanding_balance_amount: 909988, outstanding_balance_count: 1,
          balance_reconcile_amount: 909988, balance_reconcile_diff: 0,
          balance_reconcile_status_label: '초기이관 포함 일치',
          settlement_total_amount: 181063, settlement_total_count: 469,
        },
        series: [], warnings: [],
      }),
    });
  });

  await page.goto('/admin/moneybank/cubici/management/info_tab1');
  await expect(page.getByText('초기이관 상환: 3,616원')).toBeVisible();
  await expect(page.getByText('검산차이')).toHaveCount(0);
});
