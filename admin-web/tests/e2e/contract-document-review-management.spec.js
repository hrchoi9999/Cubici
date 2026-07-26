import { expect, test } from '@playwright/test';

const mbid = 'MBID-REVIEW-E2E-001';

function contractFixture() {
  return {
    mbid,
    user_no: 3001,
    user_email: 'review-owner@example.test',
    user_name: '심사테스트',
    firm_name: '심사상사',
    fintech_id: 12,
    product_code: 'MONEYBANK',
    status: 'REQUESTED',
    request_date: '2026-07-20T10:30:00',
    approval_date: null,
    agree_date: null,
    contract_date: null,
    expire_date: null,
    cancel_request_date: null,
    reg_no_first: '000000',
    reg_no_second: '0000000',
    sales_amount: 2100000,
    payer_number: null,
    payer_status: null,
    demand_acc_bank_code: null,
    demand_acc_holder: null,
    demand_acc_number: null,
    main_acc_bank_code: null,
    main_acc_holder: null,
    main_acc_number: null,
    contract_shop_count: 1,
    request_shop: 1,
    sub_complete: 'N',
    document_file_count: 0,
    prizm_score: 'B',
    contract_fee_count: 0,
    reg_date: '2026-07-20T10:30:00',
    modified_date: null,
  };
}

function contractDetailFixture(documentState) {
  return {
    contract: contractFixture(),
    shops: [],
    fees: [],
    certificate: null,
    document: {
      mbid,
      business_no: '000-00-00000',
      business_start_date: '2024-01-01',
      tax_type: 'GENERAL',
      cb_score_current: documentState.cb_score_current,
      cb_score_rank: documentState.cb_score_rank,
      cb_score_past: documentState.cb_score_past,
      debt_status: documentState.debt_status,
      financial_disorder_status: documentState.financial_disorder_status,
      public_information_status: documentState.public_information_status,
      overdue_status: documentState.overdue_status,
      cb_check: '1',
      national_tax_full_payment: documentState.national_tax_full_payment,
      local_tax_full_payment: documentState.local_tax_full_payment,
      health_insurance_full_payment: documentState.health_insurance_full_payment,
      health_insurance_paid_amount: documentState.health_insurance_paid_amount,
      cb_confirm_admin: 'local-admin',
      final_confirm_admin: null,
      reg_date: '2026-07-20T10:40:00',
      modified_date: null,
    },
    redemption: null,
    risk_result: {
      mbid,
      user_no: 3001,
      pcs_no: 3,
      prizm_grade: 'B',
      prizm_score: 700,
      pms_no: 3,
      pms_grade: 'B',
      pms_score: 690,
    },
  };
}

test('contract document check save and review note create work with mock data', async ({ page }) => {
  const documentState = {
    cb_score_current: 690,
    cb_score_rank: 3,
    cb_score_past: 660,
    debt_status: '0',
    financial_disorder_status: '0',
    public_information_status: '0',
    overdue_status: '0',
    national_tax_full_payment: '1',
    local_tax_full_payment: '1',
    health_insurance_full_payment: '1',
    health_insurance_paid_amount: 90000,
  };
  let reviewNotes = [];

  await page.route('**/v1/api/contracts?**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        limit: 20,
        offset: 0,
        total: 1,
        items: [contractFixture()],
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

  await page.route(`**/v1/api/contracts/${mbid}/documents/checks`, async (route) => {
    expect(route.request().method()).toBe('PUT');
    const payload = await route.request().postDataJSON();
    expect(payload).toMatchObject({
      updated_by: 'local-admin',
      cb_score_current: 720,
      cb_score_rank: 1,
      cb_score_past: 700,
      debt_status: '0',
      financial_disorder_status: '0',
      public_information_status: '0',
      overdue_status: '0',
      national_tax_full_payment: '1',
      local_tax_full_payment: '1',
      health_insurance_full_payment: '1',
      health_insurance_paid_amount: 125000,
    });

    Object.assign(documentState, {
      cb_score_current: payload.cb_score_current,
      cb_score_rank: payload.cb_score_rank,
      cb_score_past: payload.cb_score_past,
      debt_status: payload.debt_status,
      financial_disorder_status: payload.financial_disorder_status,
      public_information_status: payload.public_information_status,
      overdue_status: payload.overdue_status,
      national_tax_full_payment: payload.national_tax_full_payment,
      local_tax_full_payment: payload.local_tax_full_payment,
      health_insurance_full_payment: payload.health_insurance_full_payment,
      health_insurance_paid_amount: payload.health_insurance_paid_amount,
    });

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        mbid,
        cb_check: '1',
        cb_confirm_admin: 'local-admin',
        national_tax_full_payment: documentState.national_tax_full_payment,
        local_tax_full_payment: documentState.local_tax_full_payment,
        health_insurance_full_payment: documentState.health_insurance_full_payment,
        health_insurance_paid_amount: documentState.health_insurance_paid_amount,
      }),
    });
  });

  await page.route(`**/v1/api/contracts/${mbid}/review-notes`, async (route) => {
    if (route.request().method() === 'POST') {
      const payload = await route.request().postDataJSON();
      expect(payload).toMatchObject({
        reviewer: 'local-admin',
        title: '추가 확인',
        detail: '전화 확인 완료',
      });
      reviewNotes = [
        {
          id: 1,
          mbid,
          eval_subject: 'contract',
          reviewer: payload.reviewer,
          title: payload.title,
          detail: payload.detail,
          reg_date: '2026-07-20T12:00:00',
          modified_date: null,
        },
      ];
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          mbid,
          item: reviewNotes[0],
        }),
      });
      return;
    }

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        mbid,
        total: reviewNotes.length,
        items: reviewNotes,
      }),
    });
  });

  await page.route(new RegExp(`/v1/api/contracts/${mbid}$`), async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(contractDetailFixture(documentState)),
    });
  });

  await page.goto('/admin/moneybank/request');

  await expect(page.getByRole('heading', { name: '신청 접수' })).toBeVisible();
  await expect(page.getByText('심사테스트')).toBeVisible();

  await page.getByRole('button', { name: 'N (0건)' }).click();

  const detailPanel = page.locator('.detailPanel');
  await expect(detailPanel.getByText('서류 상세')).toBeVisible();

  await detailPanel.locator('input[name="cbScoreCurrent"]').fill('720');
  await detailPanel.locator('input[name="cbScoreRank"]').fill('1');
  await detailPanel.locator('input[name="cbScorePast"]').fill('700');
  await detailPanel.locator('select[name="debtStatus"]').selectOption('0');
  await detailPanel.locator('select[name="financialDisorderStatus"]').selectOption('0');
  await detailPanel.locator('select[name="publicInformationStatus"]').selectOption('0');
  await detailPanel.locator('select[name="overdueStatus"]').selectOption('0');
  await detailPanel.locator('select[name="nationalTaxFullPayment"]').selectOption('1');
  await detailPanel.locator('select[name="localTaxFullPayment"]').selectOption('1');
  await detailPanel.locator('select[name="healthInsuranceFullPayment"]').selectOption('1');
  await detailPanel.locator('input[name="healthInsurancePaidAmount"]').fill('125000');
  await detailPanel.getByRole('button', { name: '확인값 저장' }).click();

  await expect(detailPanel.getByText('서류 확인값 저장이 완료되었습니다.')).toBeVisible();
  await expect(detailPanel.getByRole('cell', { name: '720' })).toBeVisible();
  await expect(detailPanel.getByRole('cell', { name: '125,000' })).toBeVisible();

  await detailPanel.locator('input[name="title"]').fill('추가 확인');
  await detailPanel.locator('input[name="reviewer"]').fill('local-admin');
  await detailPanel.locator('input[name="detail"]').fill('전화 확인 완료');
  await detailPanel.getByRole('button', { name: '추가' }).click();

  await expect(detailPanel.getByText('심사 메모 등록이 완료되었습니다.')).toBeVisible();
  await expect(detailPanel.getByRole('cell', { name: '추가 확인' })).toBeVisible();
  await expect(detailPanel.getByRole('cell', { name: '전화 확인 완료' })).toBeVisible();
});
