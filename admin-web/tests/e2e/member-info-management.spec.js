import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';

const MASTER_ADMIN_EMAIL = process.env.CUBICI_MASTER_ADMIN_EMAIL ?? 'admin@example.com';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const candidateDir = path.resolve(
  __dirname,
  '../../../docs/reference/lv-ui/admin/ADM-D01-MEMBER-INFO/candidate',
);

fs.mkdirSync(candidateDir, { recursive: true });

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
      user_id: 'member-a@example.test',
      user_name: '테스트회원A',
      firm_name: '샘플상사A',
      phone: '010-0000-0000',
      firm_tel: '-',
      shop_count: 2,
      address: '서울시 중구',
      partner_code: 'CBCI',
      moneybank_contract_count: 0,
      latest_contract_status: null,
    },
    {
      user_no: 2,
      service_label: '머니뱅크',
      service_code: 'moneybank',
      reg_date: '2023-11-27',
      user_id: 'member-b@example.test',
      user_name: '테스트회원B',
      firm_name: '샘플상사B',
      phone: '010-1111-1111',
      firm_tel: '-',
      shop_count: 1,
      address: '부산시 중구',
      partner_code: 'CBCI',
      moneybank_contract_count: 1,
      latest_contract_status: 'CONTRACT',
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

test('member info list renders filters, counts, and rows', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
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
  await expect(page.getByRole('cell', { name: 'member-a@example.test' })).toBeVisible();
  await expect(page.getByRole('cell', { name: '샘플상사B' })).toBeVisible();
  await expect(page.getByLabel('가입 시작')).toHaveValue('');
  await expect(page.getByLabel('가입 종료')).toHaveValue('');
  expect(new URL(requestUrls[0]).searchParams.has('from_date')).toBeFalsy();
  expect(new URL(requestUrls[0]).searchParams.has('to_date')).toBeFalsy();

  await page.screenshot({
    fullPage: true,
    path: path.join(candidateDir, 'ADM-D01-MEMBER-INFO-PC.png'),
  });

  await page.getByLabel('회원명').fill('회원B');
  await page.getByRole('button', { name: '검색' }).click();
  await expect(page.getByRole('cell', { name: '테스트회원B' })).toBeVisible();
});

test('member info keeps the LV table usable on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('**/v1/api/management/member-info?**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(memberInfoPayload),
    });
  });

  await page.goto('/admin/cubici/manageMember/member_tab2');

  await expect(page.locator('.m-tab a').filter({ hasText: '회원 정보' })).toBeVisible();
  await expect(page.getByText('전체 2건')).toBeVisible();
  await expect(page.locator('.memberInfoTable')).toBeVisible();
  await expect(page.getByLabel('회원정보 목록 좌우 스크롤')).toBeVisible();
  await page.getByLabel('회원정보 목록 오른쪽으로 스크롤').click();
  await expect.poll(() => page.locator('.tableScroll').evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
  await page.getByLabel('회원정보 목록 왼쪽으로 스크롤').click();
  await expect.poll(() => page.locator('.tableScroll').evaluate((element) => element.scrollLeft)).toBe(0);
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);
  await page.screenshot({
    fullPage: true,
    path: path.join(candidateDir, 'ADM-D01-MEMBER-INFO-MOBILE.png'),
  });
});
