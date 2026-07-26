import { expect, test } from '@playwright/test';

const mbid = 'MBID-E2E-001';

function contractFixture(status = 'REQUEST') {
  return {
    mbid,
    user_no: 1001,
    user_email: 'owner@example.test',
    user_name: '테스트대표',
    firm_name: '테스트상사',
    fintech_id: 10,
    product_code: 'MONEYBANK',
    status,
    request_date: '2026-07-20T09:00:00',
    approval_date: null,
    agree_date: null,
    contract_date: null,
    expire_date: null,
    cancel_request_date: null,
    reg_no_first: '000000',
    reg_no_second: '0000000',
    sales_amount: 2500000,
    payer_number: null,
    payer_status: null,
    demand_acc_bank_code: null,
    demand_acc_holder: null,
    demand_acc_number: null,
    main_acc_bank_code: null,
    main_acc_holder: null,
    main_acc_number: null,
    contract_shop_count: 2,
    request_shop: 2,
    sub_complete: 'N',
    document_file_count: 1,
    prizm_score: 'B',
    contract_fee_count: 1,
    reg_date: '2026-07-20T09:00:00',
    modified_date: status === 'PENDING_REVIEW' ? '2026-07-20T11:00:00' : null,
  };
}

function contractDetailFixture(status = 'REQUEST') {
  return {
    contract: contractFixture(status),
    shops: [
      {
        id: 1,
        mbid,
        contract_shop_type: 'NAVER',
        contract_shop_id: 'SHOP-REQ-01',
        reg_date: '2026-07-20T09:10:00',
        modified_date: null,
      },
    ],
    fees: [
      {
        id: 3,
        mbid,
        payment_rate: 80,
        sales_limit_per_order: 500000,
        max_outstanding_balance: 2000000,
        created_by: 'local-admin',
        reg_date: '2026-07-20T09:20:00',
        last_modified_by: null,
        modified_date: null,
        rates: [
          {
            id: 30,
            contract_fee_id: 3,
            fee_type: 'ADVANCE',
            fee_rate: 1.2,
            reg_date: '2026-07-20T09:20:00',
            modified_date: null,
          },
        ],
      },
    ],
    certificate: null,
    document: {
      mbid,
      business_no: '000-00-00000',
      business_start_date: '2024-01-01',
      tax_type: 'GENERAL',
      cb_score_current: 700,
      cb_score_rank: 2,
      cb_score_past: 680,
      debt_status: '0',
      financial_disorder_status: '0',
      public_information_status: '0',
      overdue_status: '0',
      cb_check: '1',
      national_tax_full_payment: '1',
      local_tax_full_payment: '1',
      health_insurance_full_payment: '1',
      health_insurance_paid_amount: 120000,
      cb_confirm_admin: 'local-admin',
      final_confirm_admin: null,
      reg_date: '2026-07-20T09:30:00',
      modified_date: null,
    },
    redemption: {
      mbid,
      sales_count: 3,
      latest_outstanding_balance: 150000,
    },
    risk_result: {
      mbid,
      user_no: 1001,
      pcs_no: 1,
      prizm_grade: 'B',
      prizm_score: 720,
      pms_no: 1,
      pms_grade: 'B',
      pms_score: 710,
    },
  };
}

test('contract request list, filters, detail, and approve action work with mock data', async ({ page }) => {
  let currentStatus = 'REQUEST';

  await page.route('**/v1/api/contracts?**', async (route) => {
    const requestUrl = new URL(route.request().url());
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        limit: Number(requestUrl.searchParams.get('limit') ?? 20),
        offset: Number(requestUrl.searchParams.get('offset') ?? 0),
        total: 1,
        items: [contractFixture(currentStatus)],
      }),
    });
  });

  await page.route(`**/v1/api/contracts/${mbid}/documents/files`, async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        mbid,
        total: 0,
        items: [],
      }),
    });
  });

  await page.route(`**/v1/api/contracts/${mbid}/review-notes`, async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        mbid,
        total: 0,
        items: [],
      }),
    });
  });

  await page.route(`**/v1/api/contracts/${mbid}/status`, async (route) => {
    const payload = await route.request().postDataJSON();
    expect(payload.action).toBe('approve');
    currentStatus = 'PENDING_REVIEW';
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        mbid,
        previous_status: 'REQUEST',
        new_status: currentStatus,
        action: 'approve',
        changed_by: payload.changed_by,
        reason: payload.reason,
        approval_date: null,
        cancel_request_date: null,
        modified_date: '2026-07-20T11:00:00',
      }),
    });
  });

  await page.route(new RegExp(`/v1/api/contracts/${mbid}$`), async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(contractDetailFixture(currentStatus)),
    });
  });

  await page.goto('/admin/moneybank/request');

  await expect(page.getByRole('heading', { name: '신청 접수' })).toBeVisible();
  await expect(page.getByText('신청 접수 목록')).toBeVisible();
  await expect(page.getByText('테스트대표')).toBeVisible();
  await expect(page.getByText('2,500,000')).toBeVisible();

  await page.getByLabel('회원명').fill('테스트대표');
  await page.getByLabel('회사명').fill('테스트상사');
  await page.getByLabel('신청상태').fill('REQUEST');
  await page.getByLabel('정렬').selectOption('sales_amount_desc');
  await page.getByRole('button', { name: '검색' }).click();

  await expect(page.getByText('owner@example.test')).toBeVisible();
  await page.getByRole('button', { name: '신청접수' }).click();

  const detailPanel = page.locator('.detailPanel');
  await expect(detailPanel.getByText('상태 상세')).toBeVisible();
  await expect(detailPanel.getByRole('cell', { name: '테스트상사' })).toBeVisible();
  await expect(detailPanel.getByRole('cell', { name: '150,000' })).toBeVisible();

  await detailPanel.getByRole('button', { name: '심사대기 전환' }).click();
  await expect(detailPanel.getByText('계약 상태 변경이 완료되었습니다.')).toBeVisible();
  await expect(detailPanel.getByRole('cell', { name: '심사대기' })).toBeVisible();
});
