import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';

const MASTER_ADMIN_EMAIL = process.env.CUBICI_MASTER_ADMIN_EMAIL ?? 'admin@example.com';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const candidateDir = path.resolve(
  __dirname,
  '../../../docs/reference/lv-ui/admin/ADM-D02-MEMBER-WITHDRAWAL/candidate',
);

fs.mkdirSync(candidateDir, { recursive: true });

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
      user_name: '테스트회원A',
      firm_name: '샘플상사A',
      user_id: 'closed@example.test',
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
      user_name: '테스트회원B',
      firm_name: '샘플상사B',
      user_id: 'request@example.test',
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
      user_name: '테스트회원C',
      firm_name: '샘플상사C',
      user_id: 'dormant@example.test',
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

test.beforeEach(async ({ page }) => {
  await page.route('**/v1/api/accounts/admin-me', async (route) => {
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

test('member withdrawal list renders status counts and rows', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
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
  await expect(page.getByRole('cell', { name: '테스트회원A' })).toBeVisible();
  await expect(page.getByRole('cell', { name: '샘플상사C' })).toBeVisible();
  const statusBadge = page.locator('.memberWithdrawalTable span.sBtn.rBtn').first();
  await expect(statusBadge).toHaveCSS('font-size', '12px');
  await expect(statusBadge).toHaveCSS('height', '27px');
  await expect(statusBadge).toHaveCSS('line-height', '27px');

  await page.screenshot({
    fullPage: true,
    path: path.join(candidateDir, 'ADM-D02-MEMBER-WITHDRAWAL-PC.png'),
  });

  await page.getByLabel('구분', { exact: true }).selectOption('dormant');
  await page.getByRole('button', { name: '검색' }).click();
  await expect(page.getByRole('cell', { name: '테스트회원C' })).toBeVisible();
});

test('member withdrawal keeps its third tab and wide table usable on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('**/v1/api/management/member-withdrawals?**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(withdrawalPayload),
    });
  });

  await page.goto('/admin/cubici/manageMember/member_tab3');

  const activeTab = page.locator('.m-tab li.active');
  await expect(activeTab).toContainText('휴면/해지');
  expect(await activeTab.evaluate((element) => Array.from(element.parentElement.children).indexOf(element))).toBe(2);
  await expect(page.getByLabel('휴면 해지 목록 좌우 스크롤')).toBeVisible();
  await page.getByLabel('휴면 해지 목록 오른쪽으로 스크롤').click();
  await expect.poll(() => page.locator('.tableScroll').evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
  await page.getByLabel('휴면 해지 목록 왼쪽으로 스크롤').click();
  await expect.poll(() => page.locator('.tableScroll').evaluate((element) => element.scrollLeft)).toBe(0);
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);
  await page.screenshot({
    fullPage: true,
    path: path.join(candidateDir, 'ADM-D02-MEMBER-WITHDRAWAL-MOBILE.png'),
  });
});
