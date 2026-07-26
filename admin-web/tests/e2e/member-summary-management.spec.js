import { expect, test } from '@playwright/test';

const memberSummaryPayload = {
  unit: 'day',
  partner_code: null,
  product_code: null,
  metrics: {
    standard_date: '2026-07-21',
    from_date: '2026-07-01',
    to_date: '2026-07-21',
    cubici_yesterday_count: 1,
    cubici_total_count: 42,
    moneybank_yesterday_count: 1,
    moneybank_total_count: 7,
    terminated_yesterday_count: 0,
    terminated_total_count: 2,
    partner_yesterday_count: 0,
    partner_total_count: 4,
  },
  series: [
    {
      bucket: '2026-07-20',
      cubici_count: 1,
      moneybank_count: 1,
      terminated_count: 0,
      cubici_cumulative: 41,
      moneybank_cumulative: 6,
      terminated_cumulative: 2,
      moneybank_ratio: 14.63,
    },
    {
      bucket: '2026-07-21',
      cubici_count: 1,
      moneybank_count: 1,
      terminated_count: 0,
      cubici_cumulative: 42,
      moneybank_cumulative: 7,
      terminated_cumulative: 2,
      moneybank_ratio: 16.67,
    },
  ],
};

test('member summary dashboard renders metrics and trend data', async ({ page }) => {
  await page.route('**/v1/api/management/member-summary?**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(memberSummaryPayload),
    });
  });

  await page.goto('/admin/cubici/manageMember/member_tab1');

  await expect(page.locator('.m-tab a').filter({ hasText: '회원 종합' })).toBeVisible();
  await expect(page.locator('.memberMetricGrid .colorBox').filter({ hasText: '큐빅아이' })).toBeVisible();
  await expect(page.getByText('누적 : 42명')).toBeVisible();
  await expect(page.getByRole('cell', { name: '2026-07-21' })).toBeVisible();
  await expect(page.getByRole('cell', { name: '16.67%' })).toBeVisible();
});
