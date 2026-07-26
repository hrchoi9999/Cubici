import { expect, test } from '@playwright/test';

const riskRow = {
  mbid: 'MPG2626001',
  user_no: 72,
  pcs_no: 11,
  prizm_grade: 'B',
  prizm_score: 78.5,
  business_period: 36,
  operating_period: 24,
  shop_count: 2,
  month_sales_value: 15000000,
  month_sales_quantity: 120,
  month_settlement_amount: 13000000,
  month_settlement_period: 4.5,
  month_settlement_to_sales_rate: 86.7,
  month_promotion_rate: 1.2,
  month_delivery_period: 2.1,
  month_return_rate: 0.8,
  cb_score_current: 720,
  cb_score_rank: 3,
  cb_score_change_rate: 1.5,
  pcs_reg_date: '2026-07-26T10:00:00',
  pms_no: 21,
  pms_grade: 'A',
  pms_score: 83.2,
  sales_total_score: 41.3,
  manage_total_score: 39.7,
  bsvc: 8.1,
  bsqc: 7.9,
  baupc: 8.2,
  bdsr: 7.8,
  bprc: 8,
  brrc: 7.5,
  bstsc: 8.4,
  bdltc: 7.6,
  pms_reg_date: '2026-07-26T10:05:00',
};

test.beforeEach(async ({ page }) => {
  await page.route('**/v1/api/risk-results?**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        limit: 20,
        offset: 0,
        total: 1,
        counts: {
          total_count: 1,
          pcs_count: 1,
          pms_count: 1,
          linked_count: 1,
          incomplete_count: 0,
          source_status_label: 'PCS/PMS 연결',
          policy_status_label: '조회 재현',
        },
        items: [riskRow],
      }),
    });
  });
});

test('prizm management risk result list, source status, and detail work with mock data', async ({ page }) => {
  await page.goto('/admin/moneybank/manage');

  await expect(page.getByRole('heading', { name: '프리즘 지표 관리' })).toBeVisible();
  await expect(page.getByText('전체 1건')).toBeVisible();
  await expect(page.getByText('PCS 1건')).toBeVisible();
  await expect(page.getByText('PMS 1건')).toBeVisible();
  await expect(page.getByText('상태 PCS/PMS 연결')).toBeVisible();
  await expect(page.getByText('재계산/Alt_CSM 실연동 2차')).toBeVisible();
  await expect(page.getByRole('cell', { name: 'MPG2626001' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'B', exact: true })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'A', exact: true })).toBeVisible();

  await page.getByRole('button', { name: '보기' }).click();
  await expect(page.getByRole('heading', { name: 'PCS 평가 결과' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'PMS 평가 결과' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'prizm_pms_result' })).toBeVisible();
});
