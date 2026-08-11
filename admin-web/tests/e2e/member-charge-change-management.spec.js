import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';

const MASTER_ADMIN_EMAIL = process.env.CUBICI_MASTER_ADMIN_EMAIL ?? 'admin@example.com';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const candidateDir = path.resolve(
  __dirname,
  '../../../docs/reference/lv-ui/admin/ADM-D03-MEMBER-CHARGE-CHANGE/candidate',
);

fs.mkdirSync(candidateDir, { recursive: true });

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
      user_id: 'member-a@example.test',
      user_name: '테스트회원A',
      firm_name: '샘플상사A',
      user_code: 'member-a@example.test',
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
      refund_user_name: '테스트회원A',
      refund_bank: '테스트은행',
      refund_account: '0000000000',
      imp_uid: 'imp_test_202',
      refund_date: null,
      payment_date: '2023-04-07T12:00:00',
    },
  ],
};

const refundPayload = {
  status: 'RR',
  seq: 101,
  new_seq: 202,
  user_code: 'member-a@example.test',
  rest_date: 10,
  user_name: '테스트회원A',
  firm_name: '샘플상사A',
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
  refund_user_name: '테스트회원A',
  refund_bank: '테스트은행',
  refund_account: '0000000000',
  imp_uid: 'imp_test_202',
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

test('member charge change list renders refund workflow', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
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
  await expect(page.getByRole('cell', { name: 'member-a@example.test' })).toBeVisible();
  await expect(page.getByRole('cell', { name: '12,000원' })).toBeVisible();
  const refundButtonHeight = await page.getByRole('button', { name: '환급' }).evaluate(
    (element) => window.getComputedStyle(element).height,
  );
  expect(refundButtonHeight).not.toBe('27px');

  await page.screenshot({
    fullPage: true,
    path: path.join(candidateDir, 'ADM-D03-MEMBER-CHARGE-CHANGE-PC.png'),
  });

  await page.getByRole('button', { name: '환급' }).click();
  await expect(page.getByText('서비스 환급')).toBeVisible();
  await expect(page.getByText('차액 환급')).toBeVisible();
  await expect(page.locator('.refundDetailPanel').getByText('12,000원')).toBeVisible();

  await page.getByRole('button', { name: '환급완료' }).click();
  await expect(page.getByText('서비스 환급')).toBeHidden();
});

test('member charge change keeps its second tab and wide table usable on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('**/v1/api/management/member-charge-changes?**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(listPayload),
    });
  });

  await page.goto('/admin/cubici/manageMember/payment_tab2');

  const activeTab = page.locator('.m-tab li.active');
  await expect(activeTab).toContainText('요금변경 관리');
  expect(await activeTab.evaluate((element) => Array.from(element.parentElement.children).indexOf(element))).toBe(1);
  await expect(page.getByLabel('요금변경 목록 좌우 스크롤')).toBeVisible();
  await page.getByLabel('요금변경 목록 오른쪽으로 스크롤').click();
  await expect.poll(() => page.locator('.tableScroll').evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
  await page.getByLabel('요금변경 목록 왼쪽으로 스크롤').click();
  await expect.poll(() => page.locator('.tableScroll').evaluate((element) => element.scrollLeft)).toBe(0);
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);
  await page.screenshot({
    fullPage: true,
    path: path.join(candidateDir, 'ADM-D03-MEMBER-CHARGE-CHANGE-MOBILE.png'),
  });
});
