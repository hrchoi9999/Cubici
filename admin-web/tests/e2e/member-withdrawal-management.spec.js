import { expect, test } from '@playwright/test';

const withdrawalPayload = {
  limit: 20,
  offset: 0,
  counts: {
    total_count: 3,
    terminated_count: 1,
    requested_count: 1,
    dormant_count: 1,
    moneybank_count: 2,
    cubici_count: 1,
  },
  items: [
    {
      user_no: 1,
      service_label: '머니뱅크',
      service_code: 'moneybank',
      withdrawal_status: 'terminated',
      withdrawal_status_label: '해지',
      withdrawal_request_date: '2026-07-10',
      withdrawal_date: '2026-07-20',
      event_date: '2026-07-20',
      user_name: '해지회원',
      firm_name: '해지상사',
      user_id: 'closed@cubici.co.kr',
      phone: '010-0000-0000',
      shop_count: 2,
      outstanding_balance: 0,
      product_code: 'MP',
      latest_contract_status: 'SELF_TERMINATION',
      last_login_date: '2026-07-01T10:00:00',
      partner_code: 'CBCI',
    },
    {
      user_no: 2,
      service_label: '머니뱅크',
      service_code: 'moneybank',
      withdrawal_status: 'requested',
      withdrawal_status_label: '해지 신청',
      withdrawal_request_date: '2026-07-19',
      withdrawal_date: null,
      event_date: '2026-07-19',
      user_name: '신청회원',
      firm_name: '신청상사',
      user_id: 'request@cubici.co.kr',
      phone: '010-1111-1111',
      shop_count: 1,
      outstanding_balance: 10000,
      product_code: 'MP',
      latest_contract_status: 'CONTRACT',
      last_login_date: '2026-07-02T10:00:00',
      partner_code: 'CBCI',
    },
    {
      user_no: 3,
      service_label: '큐빅아이',
      service_code: 'cubici',
      withdrawal_status: 'dormant',
      withdrawal_status_label: '휴면 후보',
      withdrawal_request_date: null,
      withdrawal_date: null,
      event_date: '2024-05-03',
      user_name: '휴면회원',
      firm_name: '휴면상사',
      user_id: 'dormant@cubici.co.kr',
      phone: '010-2222-2222',
      shop_count: 3,
      outstanding_balance: 0,
      product_code: null,
      latest_contract_status: null,
      last_login_date: '2024-05-03T10:00:00',
      partner_code: 'CBCI',
    },
  ],
};

test('member withdrawal list renders status counts and rows', async ({ page }) => {
  await page.route('**/v1/api/management/member-withdrawals?**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(withdrawalPayload),
    });
  });

  await page.goto('/admin/cubici/manageMember/member_tab3');

  await expect(page.locator('.m-tab a').filter({ hasText: '휴면/해지' })).toBeVisible();
  await expect(page.getByText('전체 3건')).toBeVisible();
  await expect(page.getByText('해지 신청 1명')).toBeVisible();
  await expect(page.getByRole('cell', { name: '해지회원' })).toBeVisible();
  await expect(page.getByRole('cell', { name: '휴면상사' })).toBeVisible();

  await page.getByLabel('구분', { exact: true }).selectOption('dormant');
  await page.getByRole('button', { name: '검색' }).click();
  await expect(page.getByRole('cell', { name: '휴면회원' })).toBeVisible();
});
