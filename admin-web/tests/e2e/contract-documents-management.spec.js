import { expect, test } from '@playwright/test';

const mbid = 'MBID-DOC-E2E-001';

function contractFixture({ subComplete = 'N', fileCount = 0 } = {}) {
  return {
    mbid,
    user_no: 2001,
    user_email: 'docs-owner@example.test',
    user_name: '서류테스트',
    firm_name: '서류상사',
    fintech_id: 11,
    product_code: 'MONEYBANK',
    status: 'REQUESTED',
    request_date: '2026-07-20T10:00:00',
    approval_date: null,
    agree_date: null,
    contract_date: null,
    expire_date: null,
    cancel_request_date: null,
    reg_no_first: '000000',
    reg_no_second: '0000000',
    sales_amount: 1800000,
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
    sub_complete: subComplete,
    document_file_count: fileCount,
    prizm_score: 'C',
    contract_fee_count: 0,
    reg_date: '2026-07-20T10:00:00',
    modified_date: null,
  };
}

function contractDetailFixture({ subComplete = 'N', fileCount = 0 } = {}) {
  return {
    contract: contractFixture({ subComplete, fileCount }),
    shops: [],
    fees: [],
    certificate: null,
    document: {
      mbid,
      business_no: '000-00-00000',
      business_start_date: '2024-01-01',
      tax_type: 'GENERAL',
      cb_score_current: 690,
      cb_score_rank: 3,
      cb_score_past: 660,
      debt_status: '0',
      financial_disorder_status: '0',
      public_information_status: '0',
      overdue_status: '0',
      cb_check: '1',
      national_tax_full_payment: '1',
      local_tax_full_payment: '1',
      health_insurance_full_payment: '1',
      health_insurance_paid_amount: 90000,
      cb_confirm_admin: 'local-admin',
      final_confirm_admin: subComplete === 'Y' ? 'local-admin' : null,
      reg_date: '2026-07-20T10:10:00',
      modified_date: null,
    },
    redemption: null,
    risk_result: {
      mbid,
      user_no: 2001,
      pcs_no: 2,
      prizm_grade: 'C',
      prizm_score: 650,
      pms_no: 2,
      pms_grade: 'C',
      pms_score: 640,
    },
  };
}

function uploadedFileFixture() {
  return {
    uuid: 'doc-file-e2e-uuid',
    file_division: 'regNo',
    file_division_pk: mbid,
    origin_file_name: 'test-document',
    store_file_name: 'doc-file-e2e-uuid.pdf',
    file_ext: 'pdf',
    file_size: 13,
    file_path: 'mock-only',
    enc_type: 'N',
    input_date: '2026-07-20',
  };
}

test('contract document upload and confirm flow works with mock data', async ({ page }) => {
  let uploadedFiles = [];
  let subComplete = 'N';

  await page.route('**/v1/api/contracts?**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        limit: 20,
        offset: 0,
        total: 1,
        items: [contractFixture({ subComplete, fileCount: uploadedFiles.length })],
      }),
    });
  });

  await page.route(`**/v1/api/contracts/${mbid}/documents/files`, async (route) => {
    if (route.request().method() === 'POST') {
      expect(route.request().headers()['content-type']).toContain('multipart/form-data');
      const item = uploadedFileFixture();
      uploadedFiles = [item];
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          mbid,
          item,
        }),
      });
      return;
    }

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        mbid,
        total: uploadedFiles.length,
        items: uploadedFiles,
      }),
    });
  });

  await page.route(`**/v1/api/contracts/${mbid}/documents/confirm`, async (route) => {
    expect(route.request().method()).toBe('POST');
    subComplete = 'Y';
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        mbid,
        sub_complete: subComplete,
        final_confirm_admin: 'local-admin',
        document_file_count: uploadedFiles.length,
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

  await page.route(new RegExp(`/v1/api/contracts/${mbid}$`), async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(contractDetailFixture({ subComplete, fileCount: uploadedFiles.length })),
    });
  });

  await page.goto('/admin/moneybank/request');

  await expect(page.getByRole('heading', { name: '신청 접수' })).toBeVisible();
  await expect(page.getByText('서류테스트')).toBeVisible();

  await page.getByRole('button', { name: 'N (0건)' }).click();

  const detailPanel = page.locator('.detailPanel');
  await expect(detailPanel.getByText('서류 상세')).toBeVisible();
  await expect(detailPanel.getByText('등록된 제출서류 파일이 없습니다.')).toBeVisible();

  await detailPanel.getByLabel('제출서류 유형').selectOption('regNo');
  await detailPanel.locator('input[type="file"]').setInputFiles({
    name: 'test-document.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('mock document'),
  });
  await detailPanel.getByRole('button', { name: '업로드' }).click();

  await expect(detailPanel.getByText('제출서류 업로드가 완료되었습니다.')).toBeVisible();
  await expect(detailPanel.getByRole('cell', { name: 'test-document.pdf' })).toBeVisible();
  await expect(detailPanel.getByRole('link', { name: '다운로드' })).toHaveAttribute(
    'href',
    /\/v1\/api\/contracts\/MBID-DOC-E2E-001\/documents\/files\/doc-file-e2e-uuid\/download$/,
  );

  await detailPanel.getByRole('button', { name: '입력완료' }).click();

  await expect(detailPanel.getByText('제출서류 최종 확인이 완료되었습니다.')).toBeVisible();
  await expect(detailPanel.getByRole('cell', { name: 'Y (1건)' })).toBeVisible();
  await expect(detailPanel.getByRole('cell', { name: 'local-admin' }).first()).toBeVisible();
});
