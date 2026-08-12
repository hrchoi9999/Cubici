import { expect, test } from '@playwright/test';

const MASTER_ADMIN_EMAIL = process.env.VITE_CUBICI_MASTER_ADMIN_EMAIL ?? process.env.CUBICI_MASTER_ADMIN_EMAIL ?? '';

const routes = [
  ['/admin/moneybank/request', ['.searchArea', '.requestTable', '.tableTotal']],
  ['/admin/moneybank/approval_tab1', ['.searchArea', '.approvalTable', '.tableTotal']],
  ['/admin/moneybank/approval_tab2', ['.searchArea', '.contractManagementTable', '.paging']],
  ['/admin/moneybank/settlement', ['.searchArea', '.settlementLvSummary', '.settlementTable', '.tableTotal']],
  ['/admin/moneybank/redemption', ['.searchArea', '.redemptionLvTableOptions', '.redemptionTable', '.paging']],
  ['/admin/moneybank/manage', ['.creditIndicatorTab', '.creditIndicatorMetricTable', '.creditIndicatorGradeTable', '.creditIndicatorActions']],
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

function indicatorPayload() {
  return {
    items: [
      {
        row_no: 1,
        division: 1,
        division_label: 'Prizm',
        subject_no: 1,
        subject_name: '주제 1',
        item_no: 1,
        item_nm: '사업기간',
        item_definition: '사업자등록 기간',
        item_weight: '21.2',
        item_standard_low1: null,
        item_standard_high1: '24',
        item_standard_low2: '24',
        item_standard_high2: '36',
        item_standard_low3: '36',
        item_standard_high3: '48',
        item_standard_low4: '48',
        item_standard_high4: '60',
        item_standard_low5: '60',
        item_standard_high5: null,
      },
      {
        row_no: 2,
        division: 1,
        division_label: 'Prizm',
        subject_no: 6,
        subject_name: '주제 6',
        item_no: 1,
        item_nm: '평가등급',
        item_definition: 'PCS 평가등급',
        item_weight: null,
        item_standard_low1: '320',
        item_standard_high1: null,
        item_standard_low2: '321',
        item_standard_high2: '500',
        item_standard_low3: '501',
        item_standard_high3: '700',
        item_standard_low4: '701',
        item_standard_high4: '879',
        item_standard_low5: '880',
        item_standard_high5: '1000',
      },
    ],
    total: 2,
    counts: { total_count: 2, prizm_count: 2, cra_count: 0 },
  };
}

function apiPayload(url) {
  if (url.includes('/v1/api/accounts/admin-me')) {
    return { user_no: 1, email: MASTER_ADMIN_EMAIL, user_type: 'ADMIN_USER', name: '관리자' };
  }
  if (url.includes('/v1/api/contracts')) return contractPayload();
  if (url.includes('/v1/api/settlements')) return settlementPayload();
  if (url.includes('/v1/api/redemptions')) return redemptionPayload();
  if (url.includes('/v1/api/risk-results')) return riskPayload();
  if (url.includes('/v1/api/preferences/prizm-config/items')) return indicatorPayload();
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
