import { expect, test } from '@playwright/test';

const MASTER_ADMIN_EMAIL = process.env.VITE_CUBICI_MASTER_ADMIN_EMAIL ?? process.env.CUBICI_MASTER_ADMIN_EMAIL ?? '';

const routes = [
  {
    path: '/admin/cubici/infoIntegrated/cubici_tab1',
    required: ['.integratedLvTabs', '.integratedLvMetricGrid', '.integratedLvSearch', '.integratedLvPanel'],
  },
  {
    path: '/admin/cubici/infoIntegrated/moneybank_tab1',
    required: ['.legacyTabs', '.integratedMetricGrid', '.legacySearchBox', '.integratedPanel'],
  },
  {
    path: '/admin/cubici/manageMember/member_tab1',
    required: ['.memberMetricGrid', '.searchArea', '.memberTrendPanel', '.memberSummaryChartBox canvas'],
  },
  {
    path: '/admin/cubici/supportMember/manageInquiry',
    required: ['.managementOptions', '.searchArea', '.inquirySummary', '.inquiryTable', '.inquiryDetail'],
  },
];

function memberSummaryPayload() {
  return {
    metrics: {
      standard_date: '2026-08-06',
      from_date: '2026-08-01',
      to_date: '2026-08-06',
      cubici_yesterday_count: 12,
      cubici_total_count: 1280,
      moneybank_yesterday_count: 4,
      moneybank_total_count: 320,
      terminated_yesterday_count: 1,
      terminated_total_count: 42,
      partner_yesterday_count: 2,
      partner_total_count: 19,
    },
    series: [
      {
        bucket: '2026-08-01',
        cubici_count: 7,
        moneybank_count: 2,
        terminated_count: 1,
        cubici_cumulative: 1200,
        moneybank_cumulative: 300,
        terminated_cumulative: 40,
        moneybank_ratio: 25,
      },
    ],
  };
}

function cubiciIntegratedPayload() {
  const metric = { today: 1, current_month: 2, previous_month: 3, available: true };
  const unavailable = { today: null, current_month: null, previous_month: null, available: false };
  return {
    metrics: {
      standard_date: '2026-08-06', from_date: '2026-08-01', to_date: '2026-08-06',
      new_members: metric, withdrawn_members: metric, fee_income: metric, dormant_members: metric,
      sales_amount: metric, sales_quantity: metric, settlement_amount: metric, sku_count: metric,
      visitor_count: unavailable, max_concurrent_users: unavailable,
      average_usage_minutes: unavailable, average_shop_count: metric,
    },
    partners: [], products: [], channels: [{ value: 'DIRECT', label: '큐빅아이' }],
    series: [{
      bucket: '2026-08-06', new_member_count: 1, withdrawn_member_count: 0,
      cumulative_member_count: 40, cubici_average_days: 200, moneybank_average_days: 80,
      channel_counts: { DIRECT: 1 },
    }],
  };
}

function managementOverviewPayload() {
  return {
    summary: {
      standard_date: '2026-08-06',
      from_date: '2026-08-01',
      to_date: '2026-08-06',
      contract_total_count: 12,
      active_contract_count: 8,
      provision_total_amount: 12000000,
      provision_total_count: 5,
      repayment_total_amount: 3000000,
      repayment_total_count: 2,
      outstanding_balance_amount: 9000000,
      outstanding_balance_count: 6,
      balance_reconcile_diff: 0,
    },
    series: [
      {
        bucket: '2026-08-01',
        contract_count: 3,
        provision_amount: 5000000,
        repayment_amount: 1200000,
        settlement_amount: 2400000,
      },
    ],
  };
}

function inquiriesPayload() {
  return {
    items: [
      {
        qna_id: 1,
        visibility_label: '공개',
        type_label: '큐빅아이',
        created_by: 'tester',
        title: '문의 제목',
        reg_date: '2026-08-06',
        latest_reply_date: null,
        answer_status: '답변대기',
        follow_up_status_label: '-',
        notification_status_label: '알림 미연동',
      },
    ],
    total: 1,
    answered_count: 0,
    waiting_count: 1,
    workflow_status_label: '운영',
    notification_pending_count: 1,
  };
}

function apiPayload(url) {
  if (url.includes('/v1/api/accounts/admin-me')) {
    return {
      user_no: 1,
      email: MASTER_ADMIN_EMAIL,
      user_type: 'ADMIN_USER',
      name: '관리자',
    };
  }
  if (url.includes('/v1/api/management/cubici-integrated')) return cubiciIntegratedPayload();
  if (url.includes('/v1/api/management/member-summary')) return memberSummaryPayload();
  if (url.includes('/v1/api/management/member-payments')) {
    return { items: [], counts: { paid_count: 3 }, sums: { amount: 450000 } };
  }
  if (url.includes('/v1/api/management/overview')) return managementOverviewPayload();
  if (url.includes('/v1/api/support/inquiries')) return inquiriesPayload();
  return { items: [], total: 0, metrics: {}, counts: {}, series: [] };
}

test.describe('batch 11-4 admin info/member/support UI smoke', () => {
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

  for (const routeConfig of routes) {
    test(`${routeConfig.path} renders refined representative UI`, async ({ page }) => {
      const pageErrors = [];
      page.on('pageerror', (error) => pageErrors.push(error.message));

      await page.goto(routeConfig.path);
      await expect(page.locator('#wrap.adminReactWrap')).toBeVisible();

      for (const selector of routeConfig.required) {
        await expect(page.locator(selector).first()).toBeVisible();
      }

      const metrics = await page.evaluate(() => ({
        bodyOverflow: document.body.scrollWidth - document.documentElement.clientWidth,
        cardCount: document.querySelectorAll('.integratedLvMetricGrid article, .integratedMetricGrid article, .memberMetricGrid article').length,
      }));

      expect(metrics.bodyOverflow).toBeLessThanOrEqual(120);
      expect(metrics.cardCount).toBeGreaterThanOrEqual(routeConfig.path.includes('supportMember') ? 0 : 4);
      expect(pageErrors).toEqual([]);
    });
  }
});
