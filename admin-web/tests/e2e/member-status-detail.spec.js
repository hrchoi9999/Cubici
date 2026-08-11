import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';

const MASTER_ADMIN_EMAIL = process.env.CUBICI_MASTER_ADMIN_EMAIL ?? 'admin@example.com';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const candidateDir = path.resolve(
  __dirname,
  '../../../docs/reference/lv-ui/admin/ADM-D04-MEMBER-STATUS/candidate',
);

fs.mkdirSync(candidateDir, { recursive: true });

const memberStatusPayload = {
  user: {
    user_no: 36,
    status_label: '머니뱅크',
    user_name: '테스트회원A',
    user_id: 'member-a@example.test',
    phone: '01000000000',
    firm_name: '샘플상사A',
    business_no: '0000000000',
    biz_setup_date: '20220615',
    biz_type: 'SIMPLE',
    sectors: 'COMPREHENSIVEPRODUCTSELLER',
    zip_code: '10070',
    address: '샘플시 테스트로 1',
    reg_date: '2023-04-10',
    last_login_date: '2024-04-25T16:42:35',
    partner_code: 'CBCI',
    shop_count: 5,
    moneybank_contract_count: 2,
  },
  shops: [
    { id: 1, shop_type: '11번가', shop_id: 'sample-shop-a', status: 'Y', settlement: 'Y', reg_date: '2023-04-10T10:00:00' },
  ],
  fees: [
    {
      mbid: 'MB-TEST-001',
      payment_rate: 80,
      average_fee_rate: 2.5,
      sales_limit_per_order: 1000000,
      max_outstanding_balance: 5000000,
      reg_date: '2023-04-10T10:00:00',
    },
  ],
  contracts: [
    {
      mbid: 'MB-TEST-001',
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
      mbid: 'MB-TEST-001',
      cumulative_provision_amount: 3000000,
      cumulative_repayment_amount: 2000000,
      outstanding_balance: 1000000,
      reg_date: '2023-05-01T10:00:00',
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
  await page.route('**/v1/api/management/member-status/36', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(memberStatusPayload),
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

async function expectActiveTab(page, name, index) {
  const activeTab = page.locator('.memberStatusTabs li.active');
  await expect(activeTab).toContainText(name);
  expect(await activeTab.evaluate((element) => Array.from(element.parentElement.children).indexOf(element))).toBe(index);
}

async function capture(page, name, viewport) {
  await page.screenshot({
    fullPage: true,
    path: path.join(candidateDir, `ADM-D04-MEMBER-STATUS-${name}-${viewport}.png`),
  });
}

test('member status detail restores four legacy tabs on PC', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/admin/cubici/manageMember/userstatus?code=36');

  await expect(page.locator('.m-tab a').filter({ hasText: '회원 상세정보' })).toBeVisible();
  await expect(page.getByText('테스트회원A')).toBeVisible();
  await expect(page.getByText('member-a@example.test')).toBeVisible();
  await expectActiveTab(page, '기본정보', 0);
  await expect(page.getByRole('cell', { name: 'sample-shop-a' })).toBeVisible();
  await capture(page, 'BASIC', 'PC');

  await page.locator('.memberStatusTabs a').filter({ hasText: '결제현황' }).click();
  await expectActiveTab(page, '결제현황', 1);
  await expect(page.getByRole('cell', { name: '80%' })).toBeVisible();
  await capture(page, 'PAYMENT', 'PC');

  await page.locator('.memberStatusTabs a').filter({ hasText: '머니뱅크' }).click();
  await expectActiveTab(page, '머니뱅크', 2);
  const moneybankPanel = page.locator('.memberStatusPanel').filter({ hasText: '머니뱅크 계약/상환' });
  await expect(moneybankPanel.getByRole('cell', { name: 'MB-TEST-001' })).toBeVisible();
  await expect(moneybankPanel.getByRole('cell', { name: '1,000,000원' })).toBeVisible();
  await expect(page.getByText('최근 상환 이력')).toBeVisible();
  await capture(page, 'MONEYBANK', 'PC');

  await page.locator('.memberStatusTabs a').filter({ hasText: '추가서류' }).click();
  await expectActiveTab(page, '추가서류', 3);
  await expect(page.getByRole('cell', { name: '2026-01-01' })).toBeVisible();
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 1920);
  await capture(page, 'DOCUMENTS', 'PC');
});

test('member status detail keeps tab positions and tables usable on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/admin/cubici/manageMember/userstatus?code=36');

  await expectActiveTab(page, '기본정보', 0);
  await expect(page.getByLabel('운영 쇼핑몰 목록 좌우 스크롤')).toBeVisible();
  await page.getByLabel('운영 쇼핑몰 목록 오른쪽으로 스크롤').click();
  await expect.poll(() => page.locator('.tableScroll').evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
  await page.getByLabel('운영 쇼핑몰 목록 왼쪽으로 스크롤').click();
  await expect.poll(() => page.locator('.tableScroll').evaluate((element) => element.scrollLeft)).toBe(0);
  await capture(page, 'BASIC', 'MOBILE');

  await page.locator('.memberStatusTabs a').filter({ hasText: '결제현황' }).click();
  await expectActiveTab(page, '결제현황', 1);
  await expect(page.getByLabel('요금 수수료 목록 좌우 스크롤')).toBeVisible();
  await capture(page, 'PAYMENT', 'MOBILE');

  await page.locator('.memberStatusTabs a').filter({ hasText: '머니뱅크' }).click();
  await expectActiveTab(page, '머니뱅크', 2);
  await expect(page.getByLabel('머니뱅크 계약 목록 좌우 스크롤')).toBeVisible();
  await expect(page.getByLabel('최근 상환 이력 목록 좌우 스크롤')).toBeVisible();
  await capture(page, 'MONEYBANK', 'MOBILE');

  await page.locator('.memberStatusTabs a').filter({ hasText: '추가서류' }).click();
  await expectActiveTab(page, '추가서류', 3);
  await expect(page.getByLabel('추가서류 목록 좌우 스크롤')).toBeVisible();
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);
  await capture(page, 'DOCUMENTS', 'MOBILE');
});
