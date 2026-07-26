import { expect, test } from '@playwright/test';

const settlementId = 2026072001;

const settlementDetail = {
  settlements_id: settlementId,
  shop_type: 'NAVER',
  shop_id: 'SHOP-SETTLE-01',
  settlement_type: 'WEEKLY',
  settlement_date: '2026-07-20T00:00:00',
  total_sale: 350000,
  service_fee: 7000,
  settlement_target_amount: 343000,
  settlement_amount: 300000,
  pending_released_amount: 43000,
  seller_discount_coupon: 1000,
  downloadable_coupon: 2000,
  seller_service_fee: 3000,
  store_fee_discount: 500,
  debt_of_last_week: 15000,
  bank_account_holder: '테스트상점',
  bank_name: '테스트은행',
  bank_account: '000-0000-0000',
  status: 'READY',
  reg_date: '2026-07-20T09:30:00',
  modified_date: null,
};

test.beforeEach(async ({ page }) => {
  await page.route('**/v1/api/settlements?**', async (route) => {
    const requestUrl = new URL(route.request().url());
    const shopType = requestUrl.searchParams.get('shop_type');

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        limit: Number(requestUrl.searchParams.get('limit') ?? 20),
        offset: Number(requestUrl.searchParams.get('offset') ?? 0),
        total: 1,
        items: [
          {
            ...settlementDetail,
            shop_type: shopType || settlementDetail.shop_type,
          },
        ],
      }),
    });
  });

  await page.route(`**/v1/api/settlements/${settlementId}`, async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(settlementDetail),
    });
  });
});

test('settlement list filters and detail panel work with mock data', async ({ page }) => {
  await page.goto('/admin/moneybank/settlement');

  await expect(page.getByRole('heading', { name: '정산 관리' })).toBeVisible();
  await expect(page.getByText('정산 관리 목록')).toBeVisible();
  await expect(page.getByText(String(settlementId))).toBeVisible();
  await expect(page.getByText('SHOP-SETTLE-01')).toBeVisible();
  await expect(page.getByText('343,000')).toBeVisible();

  await page.getByLabel('쇼핑몰').fill('COUPANG');
  await page.getByLabel('상점ID').fill('SHOP-SETTLE-01');
  await page.getByLabel('상태').fill('READY');
  await page.getByLabel('시작일').fill('2026-07-01');
  await page.getByLabel('종료일').fill('2026-07-31');
  await page.getByRole('button', { name: '검색' }).click();

  await expect(page.getByText('COUPANG')).toBeVisible();
  await expect(page.getByText('SHOP-SETTLE-01')).toBeVisible();

  await page.getByRole('button', { name: '보기' }).first().click();
  const detailPanel = page.locator('.detailPanel');
  await expect(detailPanel.getByText('정산 상세').first()).toBeVisible();
  await expect(detailPanel.getByRole('cell', { name: '테스트은행' })).toBeVisible();
  await expect(detailPanel.getByRole('cell', { name: '000-0000-0000' })).toBeVisible();
  await expect(detailPanel.getByRole('cell', { name: '15,000' })).toBeVisible();
});
