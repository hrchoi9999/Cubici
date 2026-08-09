import { expect, test } from '@playwright/test';

const MASTER_ADMIN_EMAIL = process.env.CUBICI_MASTER_ADMIN_EMAIL ?? 'admin@example.com';

const memberInfoPayload = {
  limit: 20,
  offset: 0,
  counts: {
    total_count: 2,
    cubici_count: 1,
    moneybank_count: 1,
  },
  items: [
    {
      user_no: 1,
      service_label: '큐빅아이',
      service_code: 'cubici',
      reg_date: '2023-04-06',
      user_id: 'cubici@cubici.co.kr',
      user_name: '최형락',
      firm_name: '아즈온',
      phone: '010-0000-0000',
      firm_tel: '-',
      shop_count: 2,
      address: '서울',
      partner_code: 'CBCI',
      moneybank_contract_count: 0,
      latest_contract_status: null,
    },
    {
      user_no: 2,
      service_label: '머니뱅크',
      service_code: 'moneybank',
      reg_date: '2023-11-27',
      user_id: 'money@cubici.co.kr',
      user_name: '머니회원',
      firm_name: '머니상사',
      phone: '010-1111-1111',
      firm_tel: '-',
      shop_count: 1,
      address: '부산',
      partner_code: 'CBCI',
      moneybank_contract_count: 1,
      latest_contract_status: 'CONTRACT',
    },
  ],
};

test.beforeEach(async ({ page }) => {
  await page.route('**/v1/api/accounts/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user_no: 1,
        email: MASTER_ADMIN_EMAIL,
        user_type: 'ADMIN_USER',
        name: '관리자',
      }),
    });
  });
  await page.addInitScript((masterAdminEmail) => {
    window.localStorage.setItem(
      'cubiciAdminAuth',
      JSON.stringify({
        token_type: 'Bearer',
        access_token: 'test-token',
        user: { email: masterAdminEmail, user_type: 'ADMIN_USER' },
      }),
    );
  }, MASTER_ADMIN_EMAIL);
});

test('member info list renders filters, counts, and rows', async ({ page }) => {
  const requestUrls = [];
  await page.route('**/v1/api/management/member-info?**', async (route) => {
    requestUrls.push(route.request().url());
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(memberInfoPayload),
    });
  });

  await page.goto('/admin/cubici/manageMember/member_tab2');

  await expect(page.locator('.m-tab a').filter({ hasText: '회원 정보' })).toBeVisible();
  await expect(page.getByText('전체 2건')).toBeVisible();
  await expect(page.getByText('큐빅아이 회원 1명')).toBeVisible();
  await expect(page.getByRole('cell', { name: 'cubici@cubici.co.kr' })).toBeVisible();
  await expect(page.getByRole('cell', { name: '머니상사' })).toBeVisible();
  await expect(page.getByLabel('가입 시작')).toHaveValue('');
  await expect(page.getByLabel('가입 종료')).toHaveValue('');
  expect(new URL(requestUrls[0]).searchParams.has('from_date')).toBeFalsy();
  expect(new URL(requestUrls[0]).searchParams.has('to_date')).toBeFalsy();

  await page.getByLabel('회원명').fill('머니');
  await page.getByRole('button', { name: '검색' }).click();
  await expect(page.getByRole('cell', { name: '머니회원' })).toBeVisible();
});
