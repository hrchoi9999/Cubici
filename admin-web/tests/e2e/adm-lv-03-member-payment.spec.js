import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const candidateDir = path.resolve(
  __dirname,
  '../../../docs/reference/lv-ui/admin/ADM-LV-03-MEMBER-PAYMENT/candidate',
);

fs.mkdirSync(candidateDir, { recursive: true });

const payload = {
  limit: 20,
  offset: 0,
  counts: { total_count: 3, paid_count: 2 },
  sums: { amount: 167000, payment_fee: 5344, vat: 15182, profit: 146474 },
  items: [
    {
      seq: 103, row_no: 3, charge_name: '3개월', reg_date: '2024-05-02T09:30:00',
      user_id: 'member03@example.com', user_name: '김관리', firm_name: '한국상사',
      user_phone: '010-0000-0003', firm_tel: '02-0000-0003', shop_count: 4,
      firm_addr: '서울시 강동구', expire_date: '2024-08-02T00:00:00', payment_date: '2024-05-02T10:00:00',
      payment_status: 'PAID', payment_status_label: '결제완료', amount: 87000, payment_fee: 2784, vat: 7909, profit: 76307,
    },
    {
      seq: 102, row_no: 2, charge_name: '1개월', reg_date: '2024-04-18T11:00:00',
      user_id: 'member02@example.com', user_name: '이현황', firm_name: '큐빅유통',
      user_phone: '010-0000-0002', firm_tel: '02-0000-0002', shop_count: 2,
      firm_addr: '서울시 송파구', expire_date: '2024-05-18T00:00:00', payment_date: '2024-04-18T11:30:00',
      payment_status: 'PAID', payment_status_label: '결제완료', amount: 51000, payment_fee: 1632, vat: 4636, profit: 44732,
    },
    {
      seq: 101, row_no: 1, charge_name: '1개월', reg_date: '2024-04-06T10:00:00',
      user_id: 'member01@example.com', user_name: '박결제', firm_name: '아즈온',
      user_phone: '010-0000-0001', firm_tel: '02-0000-0001', shop_count: 1,
      firm_addr: '서울시 영등포구', expire_date: '2024-05-06T00:00:00', payment_date: '2024-04-06T12:00:00',
      payment_status: 'CANCELED', payment_status_label: '결제취소', amount: 29000, payment_fee: 928, vat: 2637, profit: 25435,
    },
  ],
};

async function installPageState(page) {
  await page.route('**/v1/api/**', async (route) => {
    const body = route.request().url().includes('/accounts/admin-me')
      ? { user_no: 1, email: 'admin@example.com', user_type: 'ADMIN_USER', name: '관리자' }
      : payload;
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
  await page.addInitScript(() => {
    window.localStorage.setItem('cubiciAdminAuth', JSON.stringify({
      token_type: 'Bearer',
      access_token: 'adm-lv-03-token',
      user: { email: 'admin@example.com', user_type: 'ADMIN_USER' },
    }));
  });
}

test.beforeEach(async ({ page }) => {
  await installPageState(page);
});

test('ADM-LV-03 restores the legacy payment layout and controls on PC', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/admin/cubici/manageMember/payment_tab1');

  await expect(page.locator('.paymentLvTabs li')).toHaveCount(2);
  await expect(page.locator('.paymentLvSearch input, .paymentLvSearch select')).toHaveCount(6);
  await expect(page.getByText('결제건수')).toBeVisible();
  await expect(page.getByText('167,000 원')).toBeVisible();
  await expect(page.locator('.memberPaymentTable tbody tr')).toHaveCount(3);
  await expect(page.getByRole('cell', { name: '결제취소' })).toBeVisible();

  await page.getByRole('button', { name: '항목 선택' }).click();
  await expect(page.locator('.paymentColumnMenu input')).toHaveCount(12);
  await page.getByRole('button', { name: '옵션 확인' }).click();

  expect(pageErrors).toEqual([]);
  await page.screenshot({
    fullPage: true,
    path: path.join(candidateDir, 'ADM-LV-03-MEMBER-PAYMENT-PC.png'),
  });
});

test('ADM-LV-03 keeps the payment table contained on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/admin/cubici/manageMember/payment_tab1');

  await expect(page.locator('.memberPaymentTable tbody tr')).toHaveCount(3);
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);
  await expect(page.locator('.paymentLvTableFrame .overflowBox')).toHaveJSProperty('scrollWidth', 1680);
  await page.screenshot({
    fullPage: true,
    path: path.join(candidateDir, 'ADM-LV-03-MEMBER-PAYMENT-MOBILE.png'),
  });
});

test('ADM-LV-03 renders the verified development DB zero state', async ({ page }) => {
  await page.route('**/v1/api/management/member-payments?**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        limit: 20,
        offset: 0,
        counts: { total_count: 0, paid_count: 0 },
        sums: { amount: 0, payment_fee: 0, vat: 0, profit: 0 },
        items: [],
      }),
    });
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/admin/cubici/manageMember/payment_tab1');

  await expect(page.getByText('조회된 결제 데이터가 없습니다.')).toBeVisible();
  await expect(page.locator('.paymentLvTotals li').nth(0)).toContainText('0 건');
  await expect(page.locator('.paymentLvTotals li').nth(1)).toContainText('0 원');
  await expect(page.getByRole('button', { name: '엑셀 다운로드' })).toBeDisabled();
});
