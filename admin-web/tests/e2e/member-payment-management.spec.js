import { expect, test } from '@playwright/test';

const memberPaymentPayload = {
  limit: 20,
  offset: 0,
  counts: {
    total_count: 1,
    paid_count: 1,
  },
  sums: {
    amount: 29000,
    payment_fee: 928,
    vat: 2636,
    profit: 25436,
  },
  items: [
    {
      seq: 101,
      row_no: 1,
      charge_name: '1개월',
      reg_date: '2023-04-06T10:00:00',
      user_id: 'cubici@cubici.co.kr',
      user_name: '최형락',
      firm_name: '아즈온',
      user_phone: '010-0000-0000',
      firm_tel: '-',
      shop_count: 2,
      firm_addr: '서울',
      expire_date: '2023-07-06T00:00:00',
      payment_date: '2023-04-06T12:00:00',
      amount: 29000,
      payment_fee: 928,
      vat: 2636,
      profit: 25436,
    },
  ],
};

test('member payment list renders legacy payment columns and sums', async ({ page }) => {
  await page.route('**/v1/api/management/member-payments?**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(memberPaymentPayload),
    });
  });

  await page.goto('/admin/cubici/manageMember/payment_tab1');

  await expect(page.locator('.m-tab a').filter({ hasText: '결제 현황' })).toBeVisible();
  await expect(page.getByText('결제건수 1건')).toBeVisible();
  await expect(page.getByText('결제금액 29,000원')).toBeVisible();
  await expect(page.getByText('결제수수료 928원')).toBeVisible();
  await expect(page.getByRole('columnheader', { name: '순수입' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'cubici@cubici.co.kr' })).toBeVisible();
  await expect(page.getByRole('cell', { name: '아즈온' })).toBeVisible();

  await page.getByLabel('회원명').fill('최형락');
  await page.getByRole('button', { name: '검색' }).click();
  await expect(page.getByRole('cell', { name: '최형락' })).toBeVisible();
});
