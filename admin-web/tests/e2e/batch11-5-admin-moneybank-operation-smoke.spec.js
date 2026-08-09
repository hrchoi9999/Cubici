import { expect, test } from '@playwright/test';

const MASTER_ADMIN_EMAIL = process.env.VITE_CUBICI_MASTER_ADMIN_EMAIL ?? process.env.CUBICI_MASTER_ADMIN_EMAIL ?? '';

const routes = [
  ['/admin/moneybank/request', ['.searchArea', '.requestTable', '.tableTotal']],
  ['/admin/moneybank/approval_tab1', ['.searchArea', '.approvalTable', '.tableTotal']],
  ['/admin/moneybank/approval_tab2', ['.searchArea', '.contractManagementTable', '.tableTotal']],
  ['/admin/moneybank/settlement', ['.searchArea', '.summaryPills', '.settlementTable', '.tableTotal']],
  ['/admin/moneybank/redemption', ['.searchArea', '.summaryPills', '.redemptionTable', '.tableTotal']],
  ['/admin/moneybank/manage', ['.searchArea', '.summaryPills', '.prizmTable', '.tableTotal']],
];

function contractPayload() {
  return {
    items: [
      {
        mbid: 'MB-001',
        status: 'REQUEST',
        request_date: '2026-08-06',
        approval_date: '2026-08-06',
        contract_date: '2026-08-06',
        user_name: '테스트',
        firm_name: '테스트상사',
        product_code: 'MONEYBANK',
        sales_amount: 1000000,
        prizm_score: 72,
        latest_fee_rate: 1.2,
        latest_payment_rate: 80,
        request_shop: 2,
      },
    ],
    total: 1,
  };
}

function settlementPayload() {
  return {
    items: [
      {
        settlements_id: 1,
        shop_type: 'SMART',
        shop_id: 'SHOP-1',
        settlement_type: 'DAILY',
        settlement_date: '2026-08-06',
        total_sale: 1000000,
        service_fee: 12000,
        settlement_target_amount: 988000,
        settlement_amount: 988000,
        pending_released_amount: 0,
        bank_name: '테스트은행',
        bank_account_holder: '테스트',
        bank_account: '000-000',
        status: 'READY',
        settlement_check_status: 'OK',
        settlement_difference: 0,
      },
    ],
    total: 1,
    counts: { ok_count: 1, diff_count: 0, check_status_label: '일치' },
  };
}

function redemptionPayload() {
  return {
    items: [
      {
        mbid: 'MB-001',
        provision_count: 1,
        total_provision_amount: 1000000,
        latest_provision_date: '2026-08-06',
        repayment_count: 0,
        total_repayment_amount: 0,
        deposit_count: 0,
        total_deposit_amount: 0,
        sales_count: 3,
        sales_payment_amount: 1000000,
        latest_outstanding_balance: 1000000,
        latest_balance_check_status: 'OK',
        latest_balance_difference: 0,
        latest_history_date: '2026-08-06',
      },
    ],
    total: 1,
    counts: { ok_count: 1, diff_count: 0, outstanding_count: 1, check_status_label: '일치' },
  };
}

function riskPayload() {
  return {
    items: [
      {
        source: {
          mbid: 'MB-001',
          user_name: '테스트',
          firm_name: '테스트상사',
          biz_num: '000-00-00000',
          reg_date: '2026-08-06',
        },
        pcs: { score: 72, grade: 'B' },
        pms: { score: 68, grade: 'B' },
      },
    ],
    total: 1,
    counts: { total_count: 1, source_status_label: 'mock', policy_status_label: '조회 재현' },
  };
}

function apiPayload(url) {
  if (url.includes('/v1/api/accounts/me')) {
    return { user_no: 1, email: MASTER_ADMIN_EMAIL, user_type: 'ADMIN_USER', name: '관리자' };
  }
  if (url.includes('/v1/api/contracts')) return contractPayload();
  if (url.includes('/v1/api/settlements')) return settlementPayload();
  if (url.includes('/v1/api/redemptions')) return redemptionPayload();
  if (url.includes('/v1/api/risk-results')) return riskPayload();
  return { items: [], total: 0, counts: {} };
}

test.describe('batch 11-5 admin moneybank operation UI smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/v1/api/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(apiPayload(route.request().url())),
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

  for (const [path, selectors] of routes) {
    test(`${path} renders moneybank operation UI`, async ({ page }) => {
      const pageErrors = [];
      page.on('pageerror', (error) => pageErrors.push(error.message));

      await page.goto(path);
      await expect(page.locator('#wrap.adminReactWrap')).toBeVisible();

      for (const selector of selectors) {
        await expect(page.locator(selector).first()).toBeVisible();
      }

      const bodyOverflow = await page.evaluate(() => document.body.scrollWidth - document.documentElement.clientWidth);
      expect(bodyOverflow).toBeLessThanOrEqual(140);
      expect(pageErrors).toEqual([]);
    });
  }
});
