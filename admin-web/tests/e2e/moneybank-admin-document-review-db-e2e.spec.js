import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const adminRoot = path.resolve(__dirname, '..', '..');
const cubiciRoot = path.resolve(adminRoot, '..');
const workspaceRoot = path.resolve(cubiciRoot, '..');
const serviceApiRoot = path.join(cubiciRoot, 'service-api');
const pythonExe = process.env.CUBICI_PYTHON_EXE || path.join(workspaceRoot, '.venv', 'Scripts', 'python.exe');
const apiBaseUrl = process.env.CUBICI_API_BASE_URL || 'http://127.0.0.1:8000';
const adminBaseUrl = process.env.CUBICI_ADMIN_BASE_URL || 'http://127.0.0.1:5174';

test.skip(process.env.CUBICI_RUN_DB_E2E !== '1', 'set CUBICI_RUN_DB_E2E=1 to run local PostgreSQL UI E2E tests');
test.setTimeout(120_000);

let fixture = null;

test.afterEach(() => {
  if (fixture) {
    cleanupDocumentReviewFixture(fixture);
    fixture = null;
  }
});

test('admin document upload, confirm, checks, review note, and download persist with real database', async ({ page }) => {
  fixture = createDocumentReviewFixture();
  const contract = await createContractRequest(fixture);
  fixture.mbid = contract.mbid;

  await page.goto(`${adminBaseUrl}/admin/moneybank/request`);
  await page.getByLabel('회원명').fill(fixture.userName);
  await page.getByRole('button', { name: '검색' }).click();

  const requestRow = page.locator('tbody tr').filter({ hasText: fixture.userName });
  await expect(requestRow).toContainText(fixture.userName);
  await expect(requestRow).toContainText('신청접수');
  await expect(requestRow.getByRole('button', { name: 'N (0건)' })).toBeVisible();
  await requestRow.getByRole('button', { name: 'N (0건)' }).click();

  const detailPanel = page.locator('.detailPanel');
  await expect(detailPanel.getByText('서류 상세')).toBeVisible();
  await expect(detailPanel.getByText('등록된 제출서류 파일이 없습니다.')).toBeVisible();

  await detailPanel.getByLabel('제출서류 유형').selectOption('regNo');
  await detailPanel.locator('input[type="file"]').setInputFiles({
    name: `admin-document-${fixture.suffix}.pdf`,
    mimeType: 'application/pdf',
    buffer: Buffer.from(`%PDF-1.4\n% cubici admin document review ${fixture.suffix}\n`),
  });
  await detailPanel.getByRole('button', { name: '업로드' }).click();

  await expect(detailPanel.getByText('제출서류 업로드가 완료되었습니다.')).toBeVisible();
  await expect(detailPanel.getByRole('cell', { name: `admin-document-${fixture.suffix}.pdf` })).toBeVisible();
  await expectUploadedDocumentCount(fixture.mbid, 1);

  const uploaded = await latestUploadedDocument(fixture.mbid);
  expect(uploaded.file_division).toBe('regNo');
  expect(uploaded.origin_file_name).toBe(`admin-document-${fixture.suffix}`);

  const downloadResponse = await fetch(`${apiBaseUrl}/v1/api/contracts/${encodeURIComponent(fixture.mbid)}/documents/files/${encodeURIComponent(uploaded.uuid)}/download`);
  expect(downloadResponse.ok).toBe(true);
  const downloadContent = Buffer.from(await downloadResponse.arrayBuffer()).toString('utf8');
  expect(downloadContent).toContain(`cubici admin document review ${fixture.suffix}`);

  const confirmResponsePromise = waitForApiResponse(page, `/v1/api/contracts/${fixture.mbid}/documents/confirm`, 'POST');
  await detailPanel.getByRole('button', { name: '입력완료' }).click();
  await expectApiResponse(confirmResponsePromise);
  await expect(detailPanel.getByText('제출서류 최종 확인이 완료되었습니다.')).toBeVisible();
  await expect(detailPanel.getByRole('cell', { name: 'Y (1건)' })).toBeVisible();

  await detailPanel.locator('input[name="cbScoreCurrent"]').fill('735');
  await detailPanel.locator('input[name="cbScoreRank"]').fill('2');
  await detailPanel.locator('input[name="cbScorePast"]').fill('710');
  await detailPanel.locator('select[name="debtStatus"]').selectOption('0');
  await detailPanel.locator('select[name="financialDisorderStatus"]').selectOption('0');
  await detailPanel.locator('select[name="publicInformationStatus"]').selectOption('0');
  await detailPanel.locator('select[name="overdueStatus"]').selectOption('0');
  await detailPanel.locator('select[name="nationalTaxFullPayment"]').selectOption('1');
  await detailPanel.locator('select[name="localTaxFullPayment"]').selectOption('1');
  await detailPanel.locator('select[name="healthInsuranceFullPayment"]').selectOption('1');
  await detailPanel.locator('input[name="healthInsurancePaidAmount"]').fill('130000');
  const checkResponsePromise = waitForApiResponse(page, `/v1/api/contracts/${fixture.mbid}/documents/checks`, 'PUT');
  await detailPanel.getByRole('button', { name: '확인값 저장' }).click();
  await expectApiResponse(checkResponsePromise);

  await expect(detailPanel.getByText('서류 확인값 저장이 완료되었습니다.')).toBeVisible();
  await expect(detailPanel.getByRole('cell', { name: '735' })).toBeVisible();
  await expect(detailPanel.getByRole('cell', { name: '130,000' })).toBeVisible();

  await detailPanel.locator('input[name="title"]').fill(`관리자 서류 확인 ${fixture.suffix}`);
  await detailPanel.locator('input[name="reviewer"]').fill('local-admin');
  await detailPanel.locator('input[name="detail"]').fill('실DB 서류 업로드와 확인값 저장 검증');
  const noteResponsePromise = waitForApiResponse(page, `/v1/api/contracts/${fixture.mbid}/review-notes`, 'POST');
  await detailPanel.getByRole('button', { name: '추가' }).click();
  await expectApiResponse(noteResponsePromise);

  await expect(detailPanel.getByText('심사 메모 등록이 완료되었습니다.')).toBeVisible();
  await expect(detailPanel.getByRole('cell', { name: `관리자 서류 확인 ${fixture.suffix}` })).toBeVisible();
  await expect(detailPanel.getByRole('cell', { name: '실DB 서류 업로드와 확인값 저장 검증' })).toBeVisible();

  expect(readPersistedDocumentReview(fixture.mbid)).toMatchObject({
    file_count: 1,
    note_count: 1,
    final_confirm_admin: 'local-admin',
    cb_confirm_admin: 'local-admin',
    cb_score_current: 735,
    cb_score_rank: 2,
    cb_score_past: 710,
    debt_status: '0',
    financial_disorder_status: '0',
    public_information_status: '0',
    overdue_status: '0',
    national_tax_full_payment: '1',
    local_tax_full_payment: '1',
    health_insurance_full_payment: '1',
    health_insurance_paid_amount: 130000,
    review_title: `관리자 서류 확인 ${fixture.suffix}`,
  });
});

function waitForApiResponse(page, pathname, method) {
  return page.waitForResponse((response) => (
    response.url().includes(pathname)
    && response.request().method() === method
  ), { timeout: 30_000 });
}

async function expectApiResponse(responsePromise) {
  const response = await responsePromise;
  expect(response.ok(), await response.text()).toBeTruthy();
}

function createDocumentReviewFixture() {
  const suffix = String(Date.now()).slice(-9);
  return JSON.parse(runPython(`
import json
import sys
from cubici_service.db.connection import get_connection

suffix = sys.argv[1]
with get_connection() as conn:
    with conn.cursor() as cur:
        numeric_id = int(''.join(ch for ch in suffix if ch.isdigit())[-6:].ljust(6, "0"))
        user_no = 7600000 + numeric_id
        shop_account_id = 8600000 + numeric_id
        user_name = f"DocReviewUIUser{suffix}"
        biz_name = f"DocReviewUIBiz{suffix}"
        cur.execute(
            """
            insert into users (
                user_no, email, password, user_type, name, phone, biz_num,
                biz_name, biz_setup_date, biz_type, sectors, fintech_id,
                reg_date, modified_date
            ) values (
                %s, %s, 'local-db-doc-review-e2e', 'USER', %s, '01000000000',
                %s, %s, '20180101', 'INDIVIDUAL', '01', 1, now(), now()
            )
            """,
            (
                user_no,
                f"local-db-doc-review-e2e-{suffix}@example.test",
                user_name,
                suffix.ljust(10, "0")[:10],
                biz_name,
            ),
        )
        cur.execute(
            """
            insert into shop_accounts (
                id, user_no, shop_type, shop_id, shop_account_id,
                shop_account_password, api_secret_key, status, del_yn,
                reg_date, modified_date
            ) values (
                %s, %s, 'NAVER', %s, %s, 'local-db-doc-review-e2e',
                'local-db-doc-review-e2e', 'Y', 'N', now(), now()
            )
            """,
            (
                shop_account_id,
                user_no,
                f"local-db-doc-review-e2e-shop-{suffix}",
                f"local-db-doc-review-e2e-account-{suffix}",
            ),
        )
print(json.dumps({
    "userNo": user_no,
    "shopAccountId": shop_account_id,
    "suffix": suffix,
    "userName": user_name,
    "bizName": biz_name,
}, ensure_ascii=False))
  `, [suffix]));
}

async function createContractRequest(currentFixture) {
  return apiJson('/v1/api/contracts/requests', {
    method: 'POST',
    body: {
      user_no: currentFixture.userNo,
      request_shop_types: ['NAVER'],
      product_code: 'MP',
      sales_amount: 2600000,
      representative_age: 43,
      identity_confirmed: true,
      identity_verification_method: 'mock',
      identity_verification_status: 'mock_verified',
      identity_verification_reference: `DOC-REVIEW-E2E-${currentFixture.suffix}`,
      terms_agreed: true,
      submitted_document_types: ['CBInfo', 'regNo'],
      requested_by: 'local-db-doc-review-e2e',
    },
  });
}

async function expectUploadedDocumentCount(mbid, expectedCount) {
  const response = await apiJson(`/v1/api/contracts/${encodeURIComponent(mbid)}/documents/files`);
  expect(response.total).toBe(expectedCount);
}

async function latestUploadedDocument(mbid) {
  const response = await apiJson(`/v1/api/contracts/${encodeURIComponent(mbid)}/documents/files`);
  expect(response.total).toBeGreaterThan(0);
  return response.items[0];
}

async function apiJson(pathname, options = {}) {
  const response = await fetch(`${apiBaseUrl}${pathname}`, {
    method: options.method || 'GET',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const text = await response.text();
  expect(response.ok, text).toBe(true);
  return text ? JSON.parse(text) : null;
}

function readPersistedDocumentReview(mbid) {
  return JSON.parse(runPython(`
import json
import sys
from cubici_service.db.connection import get_connection

mbid = sys.argv[1]
with get_connection() as conn:
    with conn.cursor() as cur:
        cur.execute(
            """
            select
                count(*)::int as file_count
            from "CBCI_FILE"
            where file_division_pk = %s
            """,
            (mbid,),
        )
        file_count = cur.fetchone()[0]
        cur.execute(
            """
            select
                cb_score_current,
                cb_score_rank,
                cb_score_past,
                debt_status::text,
                financial_disorder_status::text,
                public_information_status::text,
                overdue_status::text,
                national_tax_full_payment::text,
                local_tax_full_payment::text,
                health_insurance_full_payment::text,
                health_insurance_paid_amount,
                cb_confirm_admin,
                final_confirm_admin
            from moneybank_contract_document
            where mbid = %s
            """,
            (mbid,),
        )
        doc = cur.fetchone()
        cur.execute(
            """
            select count(*)::int, max(title)
            from contract_review_note
            where mbid = %s
            """,
            (mbid,),
        )
        note_count, review_title = cur.fetchone()

print(json.dumps({
    "file_count": file_count,
    "note_count": note_count,
    "cb_score_current": doc[0],
    "cb_score_rank": doc[1],
    "cb_score_past": doc[2],
    "debt_status": doc[3],
    "financial_disorder_status": doc[4],
    "public_information_status": doc[5],
    "overdue_status": doc[6],
    "national_tax_full_payment": doc[7],
    "local_tax_full_payment": doc[8],
    "health_insurance_full_payment": doc[9],
    "health_insurance_paid_amount": doc[10],
    "cb_confirm_admin": doc[11],
    "final_confirm_admin": doc[12],
    "review_title": review_title,
}, ensure_ascii=False, default=str))
  `, [mbid]));
}

function cleanupDocumentReviewFixture(currentFixture) {
  runPython(`
import sys
from pathlib import Path
from cubici_service.db.connection import get_connection

mbid = sys.argv[1] or None
user_no = int(sys.argv[2])
shop_account_id = int(sys.argv[3])

with get_connection() as conn:
    with conn.cursor() as cur:
        mbids = []
        if mbid:
            mbids.append(mbid)
        else:
            cur.execute("select mbid from moneybank_contract where user_no = %s", (user_no,))
            mbids.extend(row[0] for row in cur.fetchall())
        for target_mbid in mbids:
            cur.execute('select file_path from "CBCI_FILE" where file_division_pk = %s', (target_mbid,))
            for row in cur.fetchall():
                try:
                    Path(row[0]).unlink(missing_ok=True)
                except OSError:
                    pass
            cur.execute("delete from contract_review_note where mbid = %s", (target_mbid,))
            cur.execute('delete from "CBCI_FILE" where file_division_pk = %s', (target_mbid,))
            cur.execute("delete from contract_fee_adjustment_history where mbid = %s", (target_mbid,))
            cur.execute(
                """
                delete from moneybank_contract_fee_rates
                where contract_fee_id in (
                    select id from moneybank_contract_fee where mbid = %s
                )
                """,
                (target_mbid,),
            )
            cur.execute("delete from moneybank_contract_fee where mbid = %s", (target_mbid,))
            cur.execute("delete from contract_status_history where mbid = %s", (target_mbid,))
            cur.execute("delete from moneybank_contract_shop where mbid = %s", (target_mbid,))
            cur.execute("delete from moneybank_contract_document where mbid = %s", (target_mbid,))
            cur.execute("delete from moneybank_contract where mbid = %s", (target_mbid,))
        cur.execute("delete from shop_accounts where id = %s", (shop_account_id,))
        cur.execute("delete from users where user_no = %s", (user_no,))
  `, [currentFixture.mbid || '', String(currentFixture.userNo), String(currentFixture.shopAccountId)]);
}

function runPython(code, args = []) {
  return execFileSync(pythonExe, ['-c', code, ...args], {
    cwd: serviceApiRoot,
    env: {
      ...process.env,
      PYTHONPATH: path.join(serviceApiRoot, 'src'),
    },
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}
