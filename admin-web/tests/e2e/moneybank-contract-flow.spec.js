import { expect, test } from '@playwright/test';

const mbid = 'MBID-FLOW-E2E-001';

function defaultFeeRows() {
  return [
    {
      id: 7,
      mbid,
      payment_rate: 80,
      sales_limit_per_order: 500000,
      max_outstanding_balance: 3000000,
      created_by: 'local-admin',
      reg_date: '2026-07-25T09:30:00',
      last_modified_by: null,
      modified_date: null,
      rates: [
        {
          id: 71,
          contract_fee_id: 7,
          fee_type: 'ADVANCE',
          fee_rate: 1.2,
          reg_date: '2026-07-25T09:30:00',
          modified_date: null,
        },
      ],
    },
  ];
}

function contractFixture(status, fees = defaultFeeRows()) {
  const latestFee = fees[0];
  const latestFeeRate = latestFee?.rates?.length
    ? latestFee.rates.reduce((sum, rate) => sum + Number(rate.fee_rate ?? 0), 0) / latestFee.rates.length
    : null;
  return {
    mbid,
    user_no: 4101,
    user_email: 'flow-owner@example.test',
    user_name: '흐름테스트',
    firm_name: '흐름상사',
    fintech_id: 10,
    product_code: 'MP',
    status,
    request_date: '2026-07-25T09:00:00',
    approval_date: ['CONDITIONS_ACCEPT', 'USE_AGREE', 'ACCOUNT_STANDBY'].includes(status) ? '2026-07-25T10:00:00' : null,
    agree_date: ['USE_AGREE', 'ACCOUNT_STANDBY'].includes(status) ? '2026-07-25T11:00:00' : null,
    contract_date: status === 'ACCOUNT_STANDBY' ? '2026-07-25T12:00:00' : null,
    expire_date: null,
    cancel_request_date: null,
    reg_no_first: '000000',
    reg_no_second: '0000000',
    sales_amount: 3200000,
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
    sub_complete: 'Y',
    document_file_count: 2,
    prizm_score: 'B',
    contract_fee_count: fees.length,
    latest_payment_rate: latestFee?.payment_rate ?? null,
    latest_fee_rate: latestFeeRate,
    reg_date: '2026-07-25T09:00:00',
    modified_date: '2026-07-25T09:00:00',
  };
}

function detailFixture(status, fees = defaultFeeRows()) {
  return {
    contract: contractFixture(status, fees),
    shops: [],
    fees,
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
      final_confirm_admin: 'local-admin',
      reg_date: '2026-07-25T09:30:00',
      modified_date: null,
    },
    redemption: null,
    risk_result: {
      mbid,
      user_no: 4101,
      pcs_no: 1,
      prizm_grade: 'B',
      prizm_score: 720,
      pms_no: 1,
      pms_grade: 'B',
      pms_score: 710,
    },
  };
}

async function routeContractApi(page, initialStatus, expectedAction, nextStatus, options = {}) {
  let currentStatus = initialStatus;
  let feeRows = options.initialFees ?? defaultFeeRows();

  await page.route('**/v1/api/contracts?**', async (route) => {
    const requestUrl = new URL(route.request().url());
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        limit: Number(requestUrl.searchParams.get('limit') ?? 20),
        offset: Number(requestUrl.searchParams.get('offset') ?? 0),
        total: 1,
        items: [contractFixture(currentStatus, feeRows)],
      }),
    });
  });

  await page.route(new RegExp(`/v1/api/contracts/${mbid}$`), async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(detailFixture(currentStatus, feeRows)),
    });
  });

  await page.route(`**/v1/api/contracts/${mbid}/fees/adjust`, async (route) => {
    const payload = await route.request().postDataJSON();
    expect(payload).toMatchObject({
      adjusted_by: 'local-admin',
      payment_rate: 82,
      sales_limit_per_order: 600000,
      max_outstanding_balance: 3500000,
      fee_rates: [{ fee_type: 'ADVANCE', fee_rate: 1.35 }],
    });
    feeRows = [
      {
        id: 8,
        mbid,
        payment_rate: payload.payment_rate,
        sales_limit_per_order: payload.sales_limit_per_order,
        max_outstanding_balance: payload.max_outstanding_balance,
        created_by: 'local-admin',
        reg_date: '2026-07-25T10:00:00',
        last_modified_by: 'local-admin',
        modified_date: '2026-07-25T10:00:00',
        rates: [
          {
            id: 81,
            contract_fee_id: 8,
            fee_type: 'ADVANCE',
            fee_rate: 1.35,
            reg_date: '2026-07-25T10:00:00',
            modified_date: '2026-07-25T10:00:00',
          },
        ],
      },
    ];
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        mbid,
        contract_fee_id: 8,
        adjusted_by: payload.adjusted_by,
        reason: payload.reason,
        history_id: 1,
        fee: feeRows[0],
      }),
    });
  });

  await page.route(`**/v1/api/contracts/${mbid}/status`, async (route) => {
    const payload = await route.request().postDataJSON();
    expect(payload.action).toBe(expectedAction);
    currentStatus = nextStatus;
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        mbid,
        previous_status: initialStatus,
        new_status: nextStatus,
        action: payload.action,
        changed_by: payload.changed_by,
        reason: payload.reason,
        approval_date: '2026-07-25T10:00:00',
        agree_date: nextStatus === 'ACCOUNT_STANDBY' ? '2026-07-25T11:00:00' : null,
        contract_date: nextStatus === 'ACCOUNT_STANDBY' ? '2026-07-25T12:00:00' : null,
        cancel_request_date: null,
        modified_date: '2026-07-25T12:00:00',
      }),
    });
  });
}

test('approval detail presents terms after review fee is ready', async ({ page }) => {
  await routeContractApi(page, 'REQUEST', 'present_terms', 'CONDITIONS_ACCEPT', { initialFees: [] });

  const listResponse = page.waitForResponse((response) => (
    response.url().includes('/v1/api/contracts?') && response.status() === 200
  ));
  await page.goto('/admin/moneybank/approval_tab1');
  await listResponse;

  await expect(page.getByText('흐름테스트')).toBeVisible();
  await page.getByRole('button', { name: '보기' }).click();

  const detailPanel = page.locator('.detailPanel');
  await expect(detailPanel.getByRole('button', { name: '조건 제시' })).toBeDisabled();
  await detailPanel.getByLabel('지급율(%)').fill('82');
  await detailPanel.getByLabel('건당 주문한도').fill('600000');
  await detailPanel.getByLabel('최대 미상환잔액').fill('3500000');
  await detailPanel.getByLabel('조정사유').fill('심사 조건 확정');
  await detailPanel.getByRole('button', { name: '수수료율 추가' }).click();
  await detailPanel.getByLabel('수수료 구분 1').fill('ADVANCE');
  await detailPanel.getByLabel('수수료율 1').fill('1.35');
  await detailPanel.getByRole('button', { name: '조건 저장' }).click();

  await expect(detailPanel.getByText('계약 조건 저장이 완료되었습니다.')).toBeVisible();
  await expect(detailPanel.getByRole('heading', { name: '조건 제시' })).toBeVisible();
  await detailPanel.getByRole('button', { name: '조건 제시' }).click();

  await expect(detailPanel.getByText('계약 상태 변경이 완료되었습니다.')).toBeVisible();
  await expect(detailPanel.getByRole('cell', { name: '조건제시' })).toBeVisible();
});

test('contract detail readies contract only after user terms agreement', async ({ page }) => {
  await routeContractApi(page, 'USE_AGREE', 'contract_ready', 'ACCOUNT_STANDBY');

  const listResponse = page.waitForResponse((response) => (
    response.url().includes('/v1/api/contracts?') && response.status() === 200
  ));
  await page.goto('/admin/moneybank/approval_tab2');
  await listResponse;

  await expect(page.getByText('흐름테스트')).toBeVisible();
  await page.getByRole('button', { name: '보기' }).click();

  const detailPanel = page.locator('.detailPanel');
  await expect(detailPanel.getByRole('cell', { name: '동의' })).toBeVisible();
  await detailPanel.getByRole('button', { name: '체결' }).click();

  await expect(detailPanel.getByText('계약 상태 변경이 완료되었습니다.')).toBeVisible();
  await expect(detailPanel.getByRole('cell', { name: '계좌대기' })).toBeVisible();
});
