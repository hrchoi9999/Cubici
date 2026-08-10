import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const candidateDir = path.resolve(
  __dirname,
  '../../../docs/reference/lv-ui/admin/ADM-LV-24-MANAGEMENT-USAGE/candidate',
);

fs.mkdirSync(candidateDir, { recursive: true });

const usageItem = {
  mbid: 'MB-20260809-01',
  status: 'CONTRACT',
  usage_status: '상환',
  request_date: '2026-08-01',
  contract_date: '2026-08-02',
  expire_date: '2029-08-02',
  user_no: 37,
  user_email: 'member@example.com',
  user_name: '홍길동',
  firm_name: '한국상사',
  product_code: 'MP',
  fintech_name: '큐빅파트너스',
  fee_rate: 1.2,
  payment_rate: 80,
  sales_amount: 3750000,
  provision_amount: 3000000,
  repayment_amount: 1000000,
  outstanding_balance: 2000000,
  prizm_grade: 'B',
  prizm_score: 742,
};

const usageList = {
  limit: 20,
  offset: 0,
  total: 1,
  counts: {
    total: 1,
    request_count: 0,
    review_count: 0,
    rejected_count: 0,
    repayment_count: 1,
    expired_count: 0,
  },
  sums: {
    sales_amount: 3750000,
    provision_amount: 3000000,
    repayment_amount: 1000000,
    outstanding_balance: 2000000,
  },
  items: [usageItem],
};

const usageDetail = {
  mbid: usageItem.mbid,
  usage: usageItem,
  user: {
    user_no: 37,
    user_email: 'member@example.com',
    user_name: '홍길동',
    phone: '010-1234-5678',
    firm_name: '한국상사',
    biz_num: '123-45-67890',
    biz_setup_date: '2018',
    biz_type: '법인사업자',
    sectors: '전자상거래업',
    zip_code: '05329',
    address: '서울시 강동구 올림픽로 752, 5층',
    user_reg_date: '2024-01-30T09:00:00',
  },
  shops: [
    { id: 1, shop_type: '쿠팡', shop_id: 'korea-store', reg_date: '2024-01-30T09:00:00' },
    { id: 2, shop_type: '스마트스토어', shop_id: 'korea-smart', reg_date: '2024-01-30T09:00:00' },
  ],
  document: {
    mbid: usageItem.mbid,
    business_no: '123-45-67890',
    cb_check: 'Y',
    national_tax_full_payment: 'Y',
    local_tax_full_payment: 'Y',
    health_insurance_full_payment: 'Y',
    health_insurance_paid_amount: 680000,
    final_confirm_admin: '관리자',
    file_count: 4,
  },
  contract_history: [
    {
      mbid: usageItem.mbid,
      contract_date: '2026-08-02',
      product_code: 'MP',
      provision_amount: 3000000,
      expire_date: '2029-08-02',
      service_days: 1096,
      fee_rate: 1.2,
      prizm_grade: 'B',
      pms_grade: 'A',
    },
  ],
  redemption_history: [
    {
      id: 1,
      mbid: usageItem.mbid,
      cumulative_provision_amount: 3000000,
      cumulative_repayment_amount: 1000000,
      outstanding_balance: 2000000,
      reg_date: '2026-08-09T15:20:00',
    },
  ],
};

test.beforeEach(async ({ page }) => {
  await page.route('**/v1/api/**', async (route) => {
    const pathname = new URL(route.request().url()).pathname;
    let body = usageList;
    if (pathname.endsWith('/accounts/admin-me')) {
      body = { user_no: 1, email: 'admin@example.com', user_type: 'ADMIN_USER', name: '관리자' };
    } else if (pathname.endsWith(`/management/usage/${usageItem.mbid}`)) {
      body = usageDetail;
    }
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) });
  });
  await page.addInitScript(() => {
    window.localStorage.setItem('cubiciAdminAuth', JSON.stringify({
      token_type: 'Bearer',
      access_token: 'adm-lv-24-token',
      user: { email: 'admin@example.com', user_type: 'ADMIN_USER' },
    }));
  });
});

test('ADM-LV-24 이용상세 목록 PC·모바일과 legacy 목록 기능을 검증한다', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/admin/moneybank/management/usageList');

  await expect(page.locator('.managementUsageTable tbody tr')).toHaveCount(1);
  await expect(page.locator('.managementUsageHorizontalScrollbar')).toBeVisible();
  await expect(page.locator('.fixBottom')).toContainText('상환잔액');

  await page.getByLabel('회사명').fill('한국상사');
  const searchRequest = page.waitForRequest((request) => new URL(request.url()).searchParams.get('firm_name') === '한국상사');
  await page.getByRole('button', { name: '검색' }).click();
  await searchRequest;

  await page.getByRole('button', { name: '항목 선택' }).click();
  await page.getByLabel('PCS').uncheck();
  await expect(page.locator('.managementUsageTable thead')).not.toContainText('PCS');
  await page.getByRole('button', { name: '적용' }).click();

  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: '엑셀 다운로드' }).click();
  await expect.poll(async () => (await download).suggestedFilename()).toContain('cubici-management-usage');
  expect(await bodyOverflow(page)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: path.join(candidateDir, 'ADM-LV-24-LIST-PC.png'), fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expectClosedNavigation(page);
  await expect(page.locator('.managementUsageHorizontalScrollbar')).toBeVisible();
  expect(await bodyOverflow(page)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: path.join(candidateDir, 'ADM-LV-24-LIST-MOBILE.png'), fullPage: true });
});

test('ADM-LV-24 이용상세 탭 PC·모바일 후보를 검증한다', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`/admin/moneybank/management/usageDetail?mbid=${usageItem.mbid}`);

  await expect(page.getByText('회원 상세정보')).toBeVisible();
  await expect(page.locator('.managementUsageLvSummary')).toContainText('한국상사');
  await page.getByRole('button', { name: '머니뱅크', exact: true }).click();
  await expect(page.getByRole('heading', { name: '머니뱅크 이용 현황' })).toBeVisible();
  await page.getByRole('button', { name: '추가서류', exact: true }).click();
  await expect(page.getByRole('heading', { name: '사업자 증빙서류' })).toBeVisible();
  await page.getByRole('button', { name: '상환이력', exact: true }).click();
  await expect(page.getByRole('heading', { name: '상환 이력' })).toBeVisible();
  await page.getByRole('button', { name: '기본정보', exact: true }).click();
  expect(await bodyOverflow(page)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: path.join(candidateDir, 'ADM-LV-24-DETAIL-PC.png'), fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expectClosedNavigation(page);
  await expect(page.locator('.managementUsageLvDetailTabs li')).toHaveCount(4);
  expect(await bodyOverflow(page)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: path.join(candidateDir, 'ADM-LV-24-DETAIL-MOBILE.png'), fullPage: true });
});

async function expectClosedNavigation(page) {
  await expect(page.locator('.adminNavigationToggle')).toBeVisible();
  await expect.poll(async () => {
    const box = await page.locator('#admin-navigation').boundingBox();
    return box?.x ?? 0;
  }).toBeLessThanOrEqual(-300);
}

function bodyOverflow(page) {
  return page.evaluate(() => document.body.scrollWidth - document.documentElement.clientWidth);
}
