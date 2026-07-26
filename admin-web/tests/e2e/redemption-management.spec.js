import { expect, test } from '@playwright/test';

const mbid = 'TESTMBID01';
const redemptionSummary = {
  mbid,
  provision_count: 2,
  total_payment_amount: 120000,
  total_usage_fee: 2000,
  total_provision_amount: 118000,
  latest_provision_date: '2026-07-20T10:00:00',
  repayment_count: 1,
  total_repayment_amount: 40000,
  total_repayment_usage_fee: 0,
  total_remittance_fee: 0,
  total_balance_provision_amount: 0,
  latest_balance_provision_date: '2026-07-20T11:00:00',
  deposit_count: 1,
  total_deposit_amount: 40000,
  latest_deposit_date: '2026-07-20',
  sales_count: 2,
  sales_payment_amount: 120000,
  sales_usage_fee: 2000,
  sales_provision_amount: 118000,
  latest_sales_paid_date: '2026-07-20T10:00:00',
  latest_cumulative_provision_amount: 118000,
  latest_cumulative_repayment_amount: 40000,
  latest_outstanding_balance: 78000,
  latest_history_date: '2026-07-20T11:30:00',
};

const operationHistory = [
  {
    id: 11,
    mbid,
    operation_type: 'REPAYMENT',
    operation_code: 'RPTEST001',
    related_table: 'moneybank_redemption_repayment',
    related_id: 5,
    previous_cumulative_provision_amount: 118000,
    previous_cumulative_repayment_amount: 0,
    previous_outstanding_balance: 118000,
    new_cumulative_provision_amount: 118000,
    new_cumulative_repayment_amount: 40000,
    new_outstanding_balance: 78000,
    is_reversal: false,
    reversed_operation_history_id: null,
    canceled_by_operation_history_id: null,
    payload: { repayment_code: 'RPTEST001', repayment_amount: 40000 },
    operated_by: 'local-admin',
    reason: '상환 등록',
    reg_date: '2026-07-20T11:30:00',
  },
  {
    id: 10,
    mbid,
    operation_type: 'PROVISION',
    operation_code: 'PVTEST001',
    related_table: 'moneybank_redemption_provision',
    related_id: 4,
    previous_cumulative_provision_amount: 0,
    previous_cumulative_repayment_amount: 0,
    previous_outstanding_balance: 0,
    new_cumulative_provision_amount: 118000,
    new_cumulative_repayment_amount: 0,
    new_outstanding_balance: 118000,
    is_reversal: false,
    reversed_operation_history_id: null,
    canceled_by_operation_history_id: 12,
    payload: { provision_code: 'PVTEST001', total_provision_amount: 118000 },
    operated_by: 'local-admin',
    reason: '지급 등록',
    reg_date: '2026-07-20T10:30:00',
  },
  {
    id: 12,
    mbid,
    operation_type: 'PROVISION_CANCEL',
    operation_code: 'CXTEST001',
    related_table: 'moneybank_redemption_provision',
    related_id: 4,
    previous_cumulative_provision_amount: 118000,
    previous_cumulative_repayment_amount: 40000,
    previous_outstanding_balance: 78000,
    new_cumulative_provision_amount: 0,
    new_cumulative_repayment_amount: 40000,
    new_outstanding_balance: -40000,
    is_reversal: true,
    reversed_operation_history_id: 10,
    canceled_by_operation_history_id: null,
    payload: { cancel_code: 'CXTEST001', target_operation_code: 'PVTEST001' },
    operated_by: 'local-admin',
    reason: '지급 취소',
    reg_date: '2026-07-20T12:00:00',
  },
];

test.beforeEach(async ({ page }) => {
  await page.route('**/v1/api/redemptions?**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        limit: 20,
        offset: 0,
        total: 1,
        items: [redemptionSummary],
      }),
    });
  });

  await page.route(`**/v1/api/redemptions/${mbid}`, async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(redemptionSummary),
    });
  });

  await page.route(`**/v1/api/redemptions/${mbid}/operation-history?**`, async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        mbid,
        limit: 20,
        offset: 0,
        total: operationHistory.length,
        items: operationHistory,
      }),
    });
  });

  await page.route(`**/v1/api/redemptions/${mbid}/operations/*/cancel`, async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        mbid,
        operation_type: 'REPAYMENT_CANCEL',
        operation_code: 'CXMOCK001',
        related_id: 5,
        history_id: 30,
        operation_history_id: 31,
        cumulative_provision_amount: 118000,
        cumulative_repayment_amount: 0,
        outstanding_balance: 118000,
      }),
    });
  });
});

test('redemption history filters, payload detail, and cancel modal work with mock data', async ({ page }) => {
  await page.goto('/admin/moneybank/redemption');

  await expect(page.getByRole('heading', { name: '상환 관리' })).toBeVisible();
  await expect(page.getByText(mbid)).toBeVisible();

  await page.getByRole('button', { name: '보기' }).first().click();
  await expect(page.getByText('최근 작업 이력')).toBeVisible();
  await expect(page.getByText('RPTEST001')).toBeVisible();

  await page.getByLabel('상태').selectOption('취소이력');
  await expect(page.getByText('CXTEST001')).toBeVisible();
  await expect(page.getByText('RPTEST001')).toHaveCount(0);

  await page.getByRole('button', { name: '초기화' }).click();
  await expect(page.getByText('RPTEST001')).toBeVisible();

  await page.getByRole('button', { name: '보기' }).nth(1).click();
  await expect(page.getByRole('heading', { name: '작업 상세' })).toBeVisible();
  await expect(page.getByText('"repayment_code": "RPTEST001"')).toBeVisible();
  await page.getByRole('button', { name: '닫기' }).click();

  await page.getByRole('button', { name: '취소' }).first().click();
  await expect(page.getByRole('heading', { name: '작업 취소' })).toBeVisible();
  await page.getByLabel('취소사유').fill('E2E 취소 사유');
  await page.getByRole('button', { name: '취소 실행' }).click();
  await expect(page.getByText('상환 작업 취소 완료: CXMOCK001')).toBeVisible();
});
