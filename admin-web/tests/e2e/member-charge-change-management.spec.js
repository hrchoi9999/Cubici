import { expect, test } from '@playwright/test';

const listPayload = {
  limit: 20,
  offset: 0,
  counts: {
    total_count: 1,
    change_count: 1,
    termination_count: 0,
    refund_pending_count: 1,
  },
  sums: {
    add_amount: 0,
    refund_amount: 12000,
  },
  items: [
    {
      seq: 202,
      row_no: 1,
      status: '변경',
      charge_name: '3개월',
      start_date: '2023-04-06',
      user_id: 'cubici@cubici.co.kr',
      user_name: '최형락',
      firm_name: '아즈온',
      user_code: 'cubici@cubici.co.kr',
      user_phone: '01000000000',
      firm_tel: '-',
      shop_count: 2,
      firm_addr: '서울',
      change_date: '2023-04-07',
      before_charge: '1개월',
      pay_status: '환급',
      amount: 12000,
      refund_amount: 12000,
      refund_card: 0,
      refund_user_name: '최형락',
      refund_bank: '국민',
      refund_account: '123456',
      imp_uid: 'imp_202',
      refund_date: null,
      payment_date: '2023-04-07T12:00:00',
    },
  ],
};

const refundPayload = {
  status: 'RR',
  seq: 101,
  new_seq: 202,
  user_code: 'cubici@cubici.co.kr',
  rest_date: 10,
  user_name: '최형락',
  firm_name: '아즈온',
  user_phone: '01000000000',
  ex_charge_name: '1개월',
  charge_name: '3개월',
  ex_amount: 31900,
  new_amount: 89100,
  balance: 15000,
  expire_date: '2023-07-06',
  refund_amount: 12000,
  refund_card: 0,
  refund_cash: 12000,
  refund_user_name: '최형락',
  refund_bank: '국민',
  refund_account: '123456',
  imp_uid: 'imp_202',
};

test('member charge change list renders refund workflow', async ({ page }) => {
  await page.route('**/v1/api/management/member-charge-changes?**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(listPayload),
    });
  });
  await page.route('**/v1/api/management/member-charge-changes/202/refund', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(refundPayload),
    });
  });
  await page.route('**/v1/api/management/member-charge-changes/202/refund-finish', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ seq: 101, new_seq: 202, refund_status: 'C', payment_status: 'RC' }),
    });
  });

  await page.goto('/admin/cubici/manageMember/payment_tab2');

  await expect(page.locator('.m-tab a').filter({ hasText: '요금변경 관리' })).toBeVisible();
  await expect(page.getByText('전체 1건')).toBeVisible();
  await expect(page.getByText('환급대기 1건')).toBeVisible();
  await expect(page.getByRole('cell', { name: 'cubici@cubici.co.kr' })).toBeVisible();
  await expect(page.getByRole('cell', { name: '12,000원' })).toBeVisible();

  await page.getByRole('button', { name: '환급' }).click();
  await expect(page.getByText('서비스 환급')).toBeVisible();
  await expect(page.getByText('차액 환급')).toBeVisible();
  await expect(page.locator('.refundDetailPanel').getByText('12,000원')).toBeVisible();

  await page.getByRole('button', { name: '환급완료' }).click();
  await expect(page.getByText('서비스 환급')).toBeHidden();
});
