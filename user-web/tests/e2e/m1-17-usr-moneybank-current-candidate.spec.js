import { expect, test } from '../../../admin-web/node_modules/@playwright/test/index.mjs';

const baseUrl = process.env.CUBICI_M1_MONEYBANK_CURRENT_URL ?? 'http://127.0.0.1:4310';
const routePath = '/moneybank/current';
const session = {
  token_type: 'Bearer',
  access_token: 'm1-17-user-token',
  expires_in: 3600,
  user: {
    user_no: 117,
    email: 'lv-current@cubici.test',
    user_type: 'USER',
    name: 'LV 대표자',
    biz_name: 'LV 온라인상사',
    biz_num: '123-45-67890',
    reg_date: '2025-05-15T09:00:00',
  },
};

const contract = {
  mbid: 'MB-20260808-0117',
  user_no: 117,
  user_email: 'lv-current@cubici.test',
  user_name: 'LV 대표자',
  firm_name: 'LV 온라인상사',
  product_code: 'MP',
  status: 'CONTRACT',
  request_date: '2026-07-01T10:00:00',
  approval_date: '2026-07-02T09:00:00',
  contract_date: '2026-07-03T09:00:00',
  expire_date: '2027-07-02T23:59:59',
  demand_acc_bank_code: '경남은행',
  demand_acc_holder: 'LV 대표자',
  demand_acc_number: '111222333444',
  main_acc_bank_code: '신한은행',
  main_acc_holder: 'LV 대표자',
  main_acc_number: '555666777888',
  contract_shop_count: 3,
  request_shop: 3,
  latest_payment_rate: 90,
  latest_fee_rate: 1.2,
};

const shops = [
  { id: 1, mall_type: 'NAVER', mall_id: 'lv-naver', contract_shop_type: 'NAVER', contract_shop_id: 'lv-naver' },
  { id: 2, mall_type: 'COUPANG', mall_id: 'lv-coupang', contract_shop_type: 'COUPANG', contract_shop_id: 'lv-coupang' },
  { id: 3, mall_type: 'STREET11', mall_id: 'lv-11st', contract_shop_type: 'STREET11', contract_shop_id: 'lv-11st' },
];

const contractDetail = {
  contract,
  shops,
  fees: [{
    id: 1,
    mbid: contract.mbid,
    payment_rate: 90,
    sales_limit_per_order: 3000000,
    max_outstanding_balance: 30000000,
    rates: [
      { id: 1, fee_type: 'NAVER', fee_rate: 0.6 },
      { id: 2, fee_type: 'COUPANG', fee_rate: 1.6 },
      { id: 3, fee_type: 'STREET11', fee_rate: 0.8 },
    ],
  }],
  certificate: null,
  document: null,
  redemption: null,
  risk_result: null,
};

const settlementRows = [
  { settlements_id: 1, shop_type: 'NAVER', settlement_date: '2026-08-01', settlement_amount: 8100000, service_fee: 48600 },
  { settlements_id: 2, shop_type: 'COUPANG', settlement_date: '2026-08-03', settlement_amount: 7200000, service_fee: 115200 },
  { settlements_id: 3, shop_type: 'STREET11', settlement_date: '2026-08-05', settlement_amount: 5400000, service_fee: 43200 },
];

const redemptionRows = [
  {
    mbid: contract.mbid,
    latest_history_date: '2026-08-04',
    total_deposit_amount: 9100000,
    latest_cumulative_provision_amount: 20700000,
    latest_cumulative_repayment_amount: 16300000,
    latest_outstanding_balance: 4400000,
    total_usage_fee: 207000,
    total_repayment_usage_fee: 59000,
    total_balance_provision_amount: 34000,
  },
  {
    mbid: 'MB-20260701-0102',
    latest_history_date: '2026-07-28',
    total_deposit_amount: 6200000,
    latest_cumulative_provision_amount: 14200000,
    latest_cumulative_repayment_amount: 14200000,
    latest_outstanding_balance: 0,
    total_usage_fee: 131000,
    total_repayment_usage_fee: 41000,
    total_balance_provision_amount: 18000,
  },
];

async function installMocks(page) {
  await page.addInitScript((auth) => {
    window.localStorage.setItem('cubiciUserAuth', JSON.stringify(auth));
  }, session);
  await page.route('**/v1/api/**', async (route) => {
    const url = new URL(route.request().url());
    let body;

    if (url.pathname.endsWith('/accounts/me/shops')) {
      body = { limit: 10, offset: 0, total: shops.length, items: shops };
    } else if (url.pathname.endsWith(`/contracts/${contract.mbid}`)) {
      body = contractDetail;
    } else if (url.pathname.endsWith('/contracts')) {
      body = { limit: 5, offset: 0, total: 1, items: [contract] };
    } else if (url.pathname.endsWith('/settlements')) {
      body = { limit: 5, offset: 0, total: settlementRows.length, items: settlementRows };
    } else if (url.pathname.endsWith('/redemptions')) {
      body = { limit: 5, offset: 0, total: redemptionRows.length, items: redemptionRows };
    } else {
      body = { limit: 5, offset: 0, total: 0, items: [] };
    }
    await route.fulfill({ contentType: 'application/json', status: 200, body: JSON.stringify(body) });
  });
}

test('M1-17 restores LV conditions, payout and repayment sections on PC', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await installMocks(page);
  await page.goto(`${baseUrl}${routePath}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  await expect(page.locator('.moneybank-shell')).toBeVisible();
  await expect(page.locator('.react-final-sub-visual .visual-tit')).toHaveText('머니뱅크');
  await expect(page.locator('.react-final-tabs .sub-nav > li').nth(2)).toHaveClass(/active/);
  await expect(page.locator('.u17-condition-grid label')).toHaveCount(15);
  await expect(page.locator('.u17-shop-row span')).toHaveCount(3);
  expect(await page.locator('.u17-shop-row img').evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0))).toBe(true);
  await expect(page.locator('.u17-condition-grid').getByLabel('지급율', { exact: true })).toHaveValue('90%');
  await expect(page.locator('.u17-payout-table tbody tr')).toHaveCount(3);
  await expect(page.locator('.u17-repayment-table tbody tr')).toHaveCount(2);
  await expect(page.locator('.u17-contract-links a')).toHaveAttribute('href', `/moneybank/current/${contract.mbid}`);

  const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(pageOverflow).toBeLessThanOrEqual(1);
  await page.screenshot({
    fullPage: true,
    path: '../docs/reference/lv-ui/work/USR-MONEYBANK-CURRENT-PC/candidate/candidate-react.png',
  });

  await page.getByLabel('지급현황 쇼핑몰').selectOption('NAVER');
  await expect(page.locator('.u17-payout-table tbody tr')).toHaveCount(1);
  await expect(page.locator('.u17-payout-table tbody')).toContainText('네이버');
  await page.getByLabel('상환 시작일').fill('2026-08-01');
  await expect(page.locator('.u17-repayment-table tbody tr')).toHaveCount(1);
  await expect(page.locator('.u17-repayment-table tbody')).toContainText('2026-08-04');
});

test('M1-17 keeps the mobile page fluid and tables independently scrollable', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  await installMocks(page);
  await page.goto(`${baseUrl}${routePath}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  await expect(page.locator('.mobile-header')).toBeVisible();
  await expect(page.locator('.mobile-gnb li').nth(4)).toHaveClass(/active/);
  await expect(page.locator('.u17-condition-grid label')).toHaveCount(15);
  await expect(page.locator('.u17-payout-table tbody tr')).toHaveCount(3);
  await expect(page.locator('.u17-repayment-table tbody tr')).toHaveCount(2);
  const tableOverflow = await page.locator('.u17-repayment-table').evaluate((element) => element.scrollWidth - element.clientWidth);
  expect(tableOverflow).toBeGreaterThan(0);
  const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(pageOverflow).toBeLessThanOrEqual(1);

  await page.screenshot({
    fullPage: true,
    path: '../docs/reference/lv-ui/work/USR-MONEYBANK-CURRENT-MOBILE/candidate/candidate-react.png',
  });
  await context.close();
});
