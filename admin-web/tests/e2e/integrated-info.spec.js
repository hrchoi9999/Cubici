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

const managementOverviewPayload = {
  unit: 'day',
  summary: {
    standard_date: '2026-07-21',
    from_date: '2026-07-01',
    to_date: '2026-07-21',
    contract_total_count: 18,
    active_contract_count: 13,
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
      provision_amount: 10000000,
      repayment_amount: 3000000,
      settlement_amount: 5400000,
    },
    {
      bucket: '2026-07-21',
      contract_count: 2,
      provision_amount: 14000000,
      repayment_amount: 6800000,
      settlement_amount: 7900000,
    },
  ],
};

test('cubici integrated info renders member and payment summary', async ({ page }) => {
  await page.route('**/v1/api/management/member-summary?**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(memberSummaryPayload),
    });
  });
  await page.route('**/v1/api/management/member-payments?**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(memberPaymentPayload),
    });
  });

  await page.goto('/admin/cubici/infoIntegrated/cubici_tab1');

  await expect(page.locator('.adminPageHeader h2', { hasText: '통합정보' })).toBeVisible();
  await expect(page.locator('.legacyTabs a.active', { hasText: '큐빅아이' })).toBeVisible();
  await expect(page.getByText('PostgreSQL 직접집계')).toBeVisible();
  await expect(page.getByText('legacy procedure 대조 필요')).toBeVisible();
  await expect(page.getByText('shop grouping 대조 필요')).toBeVisible();
  await expect(page.locator('.integratedMetricGrid article').filter({ hasText: '큐빅아이 신규가입' }).getByText('누적 120명')).toBeVisible();
  await expect(page.locator('.integratedMetricGrid article').filter({ hasText: '결제금액' }).getByText('348,000')).toBeVisible();
  await expect(page.getByRole('heading', { name: '회원 추이' })).toBeVisible();
  await expect(page.getByRole('cell', { name: '2026-07-21' })).toBeVisible();
  await expect(page.getByRole('cell', { name: '37.5%' })).toBeVisible();
});

test('moneybank integrated info renders operating amount summary', async ({ page }) => {
  await page.route('**/v1/api/management/overview?**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(managementOverviewPayload),
    });
  });

  await page.goto('/admin/cubici/infoIntegrated/moneybank_tab1');

  await expect(page.locator('.adminPageHeader h2', { hasText: '통합정보' })).toBeVisible();
  await expect(page.locator('.legacyTabs a.active', { hasText: '머니뱅크' })).toBeVisible();
  await expect(page.getByText('PostgreSQL 직접집계')).toBeVisible();
  await expect(page.getByText('legacy procedure 대조 필요')).toBeVisible();
  await expect(page.getByText('검산일치')).toBeVisible();
  await expect(page.locator('.integratedMetricGrid article').filter({ hasText: '계약' }).getByText('활성 13건')).toBeVisible();
  await expect(page.locator('.integratedMetricGrid article').filter({ hasText: '선정산' }).getByText('24,000,000')).toBeVisible();
  await expect(page.locator('.integratedMetricGrid article').filter({ hasText: '잔액' }).getByText('14,200,000')).toBeVisible();
  await expect(page.getByRole('heading', { name: '머니뱅크 금액 추이' })).toBeVisible();
  await expect(page.getByRole('cell', { name: '7,900,000' })).toBeVisible();
});
