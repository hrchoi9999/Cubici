import { expect, test } from '@playwright/test';

const memberSummaryPayload = {
  unit: 'day',
  metrics: {
    standard_date: '2026-07-21',
    from_date: '2026-07-01',
    to_date: '2026-07-21',
    data_source_label: 'PostgreSQL 직접집계',
    aggregation_status_label: 'legacy procedure 대조 필요',
    shop_grouping_status_label: 'shop grouping 대조 필요',
    cubici_yesterday_count: 3,
    cubici_total_count: 120,
    moneybank_yesterday_count: 2,
    moneybank_total_count: 45,
    terminated_yesterday_count: 1,
    terminated_total_count: 8,
  },
  series: [
    {
      bucket: '2026-07-20',
      cubici_count: 2,
      moneybank_count: 1,
      terminated_count: 0,
      moneybank_ratio: 36.73,
    },
    {
      bucket: '2026-07-21',
      cubici_count: 3,
      moneybank_count: 2,
      terminated_count: 1,
      moneybank_ratio: 37.5,
    },
  ],
};

const memberPaymentPayload = {
  limit: 1,
  offset: 0,
  counts: {
    total_count: 9,
    paid_count: 7,
  },
  sums: {
    amount: 348000,
    payment_fee: 12180,
    vat: 31636,
    profit: 304184,
  },
  items: [],
};

const integratedMetric = { today: 1, current_month: 3, previous_month: 5, available: true };
const cubiciIntegratedPayload = {
  unit: 'day',
  metrics: {
    standard_date: '2026-07-21',
    from_date: '2026-07-01',
    to_date: '2026-07-21',
    new_members: integratedMetric,
    withdrawn_members: integratedMetric,
    fee_income: integratedMetric,
    dormant_members: integratedMetric,
    sales_amount: integratedMetric,
    sales_quantity: integratedMetric,
    settlement_amount: integratedMetric,
    sku_count: integratedMetric,
    visitor_count: { today: null, current_month: null, previous_month: null, available: false },
    max_concurrent_users: { today: null, current_month: null, previous_month: null, available: false },
    average_usage_minutes: { today: null, current_month: null, previous_month: null, available: false },
    average_shop_count: integratedMetric,
  },
  partners: [{ value: 'PARTNER-A', label: '협력사 A' }],
  products: [{ value: 'MP', label: '선정산' }],
  channels: [{ value: 'DIRECT', label: '큐빅아이' }],
  series: [{
    bucket: '2026-07-21',
    new_member_count: 1,
    withdrawn_member_count: 0,
    cumulative_member_count: 120,
    cubici_average_days: 200,
    moneybank_average_days: 80,
    channel_counts: { DIRECT: 1 },
  }],
};

const managementOverviewPayload = {
  unit: 'day',
  summary: {
    standard_date: '2026-07-21',
    from_date: '2026-07-01',
    to_date: '2026-07-21',
    contract_total_count: 18,
    active_contract_count: 13,
    contract_today_count: 2,
    review_today_count: 1,
    approved_today_count: 1,
    terminated_today_count: 0,
    provision_total_amount: 24000000,
    provision_total_count: 12,
    repayment_total_amount: 9800000,
    repayment_total_count: 6,
    settlement_total_amount: 13300000,
    settlement_total_count: 5,
    outstanding_balance_amount: 14200000,
    outstanding_balance_count: 7,
    data_source_label: 'PostgreSQL 직접집계',
    aggregation_status_label: 'legacy procedure 대조 필요',
    shop_grouping_status_label: 'shop grouping 대조 필요',
    balance_reconcile_amount: 14200000,
    balance_reconcile_diff: 0,
    balance_reconcile_status_label: '검산일치',
  },
  series: [
    {
      bucket: '2026-07-20',
      contract_count: 1,
      review_count: 1,
      approved_count: 1,
      terminated_count: 0,
      request_amount: 6200000,
      review_amount: 5400000,
      approved_amount: 5000000,
      provision_amount: 10000000,
      provision_count: 2,
      repayment_amount: 3000000,
      repayment_fee: 150000,
      settlement_amount: 5400000,
      outstanding_balance: 7000000,
    },
    {
      bucket: '2026-07-21',
      contract_count: 2,
      review_count: 1,
      approved_count: 1,
      terminated_count: 0,
      request_amount: 8200000,
      review_amount: 7200000,
      approved_amount: 6800000,
      provision_amount: 14000000,
      provision_count: 3,
      repayment_amount: 6800000,
      repayment_fee: 340000,
      settlement_amount: 7900000,
      outstanding_balance: 14200000,
    },
  ],
};

test.beforeEach(async ({ page }) => {
  await page.route('**/v1/api/accounts/admin-me', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        user_no: 1,
        email: 'admin@example.com',
        user_type: 'ADMIN_USER',
        name: '관리자',
      }),
    });
  });
  await page.addInitScript(() => {
    window.localStorage.setItem('cubiciAdminAuth', JSON.stringify({
      token_type: 'Bearer',
      access_token: 'integrated-info-token',
      user: { email: 'admin@example.com', user_type: 'ADMIN_USER' },
    }));
  });
});

test('cubici integrated info renders the LV cards and graphs', async ({ page }) => {
  await page.route('**/v1/api/management/cubici-integrated?**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(cubiciIntegratedPayload),
    });
  });

  await page.goto('/admin/cubici/infoIntegrated/cubici_tab1');

  await expect(page.locator('.integratedLvTabs li')).toHaveCount(4);
  await expect(page.locator('.integratedLvMetricGrid article')).toHaveCount(12);
  await expect(page.getByRole('heading', { name: '회원가입' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '가입 기간' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '가입 채널' })).toBeVisible();
  await expect(page.locator('.integratedLvChartBox canvas')).toHaveCount(3);
});

test('moneybank integrated info renders operating amount summary', async ({ page }) => {
  await page.route('**/v1/api/management/overview?**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(managementOverviewPayload),
    });
  });

  await page.goto('/admin/cubici/infoIntegrated/moneybank_tab1');

  await expect(page.locator('.moneybankLvTabs li.active', { hasText: '현황 종합' })).toBeVisible();
  await expect(page.getByText('검산일치')).toBeVisible();
  await expect(page.locator('.moneybankLvMetricGrid article')).toHaveCount(4);
  await expect(page.getByRole('heading', { name: '머니뱅크 가입승인' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '회원 현황' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '이용 현황' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '서비스 이용률' })).toBeVisible();
  await expect(page.locator('.moneybankLvChartBox canvas')).toHaveCount(3);
});

test('moneybank operations tab renders legacy metrics and charts', async ({ page }) => {
  await page.route('**/v1/api/management/overview?**', async (route) => {
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify(managementOverviewPayload) });
  });

  await page.goto('/admin/cubici/infoIntegrated/moneybank_tab2');

  await expect(page.getByRole('heading', { name: '서비스 현황' })).toBeVisible();
  await expect(page.locator('.moneybankLvTabs li.active', { hasText: '운영지표' })).toBeVisible();
  await expect(page.locator('.moneybankLvMetricGrid article')).toHaveCount(4);
  await expect(page.getByRole('heading', { name: '신규 신청' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '신청/심사/계약' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '계약/상환/잔액' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '머니뱅크 수수료' })).toBeVisible();
  await expect(page.locator('.moneybankLvChartBox canvas')).toHaveCount(3);
});
