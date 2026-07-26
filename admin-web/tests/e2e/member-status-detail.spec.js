import { expect, test } from '@playwright/test';

const memberStatusPayload = {
  user: {
    user_no: 36,
    status_label: '머니뱅크',
    user_name: '문경남',
    user_id: 'rukas8710@cubici.co.kr',
    phone: '01037503803',
    firm_name: '리엠',
    business_no: '1914700771',
    biz_setup_date: '20220615',
    biz_type: 'SIMPLE',
    sectors: 'COMPREHENSIVEPRODUCTSELLER',
    zip_code: '10070',
    address: '경기도 김포시',
    reg_date: '2023-04-10',
    last_login_date: '2024-04-25T16:42:35',
    partner_code: 'CBCI',
    shop_count: 5,
    moneybank_contract_count: 2,
  },
  shops: [
    { id: 1, shop_type: '11', shop_id: 'shop-1', status: 'Y', settlement: 'Y', reg_date: '2023-04-10T10:00:00' },
  ],
  fees: [
    {
      mbid: 'MB2023001',
      payment_rate: 80,
      average_fee_rate: 2.5,
      sales_limit_per_order: 1000000,
      max_outstanding_balance: 5000000,
      reg_date: '2023-04-10T10:00:00',
    },
  ],
  contracts: [
    {
      mbid: 'MB2023001',
      status: 'CONTRACT',
      product_code: 'MP',
      request_date: '2023-04-10',
      approval_date: '2023-04-11',
      contract_date: '2023-04-12',
      expire_date: '2024-04-12',
      sales_amount: 10000000,
      outstanding_balance: 1000000,
      cumulative_provision_amount: 3000000,
      cumulative_repayment_amount: 2000000,
      fee_rate: 2.5,
      payment_rate: 80,
      cb_check: '1',
      national_tax_full_payment: '1',
      local_tax_full_payment: '0',
      health_insurance_full_payment: '1',
      certificate_expiration_date: '2026-01-01',
    },
  ],
  redemption_history: [
    {
      id: 1,
      mbid: 'MB2023001',
      cumulative_provision_amount: 3000000,
      cumulative_repayment_amount: 2000000,
      outstanding_balance: 1000000,
      reg_date: '2023-05-01T10:00:00',
    },
  ],
};

test('member status detail renders profile and tabs', async ({ page }) => {
  await page.route('**/v1/api/management/member-status/36', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(memberStatusPayload),
    });
  });

  await page.goto('/admin/cubici/manageMember/userstatus?code=36');

  await expect(page.locator('.m-tab a').filter({ hasText: '회원 상세정보' })).toBeVisible();
  await expect(page.getByText('문경남')).toBeVisible();
  await expect(page.getByText('rukas8710@cubici.co.kr')).toBeVisible();
  await expect(page.getByRole('cell', { name: 'shop-1' })).toBeVisible();
  await expect(page.getByRole('cell', { name: '80%' })).toBeVisible();

  await page.locator('.memberStatusTabs a').filter({ hasText: '머니뱅크' }).click();
  const moneybankPanel = page.locator('.memberStatusPanel').filter({ hasText: '머니뱅크 계약/상환' });
  await expect(moneybankPanel.getByRole('cell', { name: 'MB2023001' })).toBeVisible();
  await expect(moneybankPanel.getByRole('cell', { name: '1,000,000원' })).toBeVisible();

  await page.locator('.memberStatusTabs a').filter({ hasText: '추가서류' }).click();
  await expect(page.getByRole('cell', { name: '2026-01-01' })).toBeVisible();
});
