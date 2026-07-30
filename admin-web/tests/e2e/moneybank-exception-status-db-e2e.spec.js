import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const adminRoot = path.resolve(__dirname, '..', '..');
const cubiciRoot = path.resolve(adminRoot, '..');
const workspaceRoot = path.resolve(cubiciRoot, '..');
const serviceApiRoot = path.join(cubiciRoot, 'service-api');
const pythonExe = process.env.CUBICI_PYTHON_EXE || path.join(workspaceRoot, '.venv', 'Scripts', 'python.exe');
const tempRoot = path.join(workspaceRoot, '.tmp', 'cubici-e2e');
const apiBaseUrl = process.env.CUBICI_API_BASE_URL || 'http://127.0.0.1:8000';
const adminBaseUrl = process.env.CUBICI_ADMIN_BASE_URL || 'http://127.0.0.1:5174';
const userBaseUrl = process.env.CUBICI_USER_BASE_URL || 'http://127.0.0.1:4175';

test.skip(process.env.CUBICI_RUN_DB_E2E !== '1', 'set CUBICI_RUN_DB_E2E=1 to run local PostgreSQL UI E2E tests');
test.setTimeout(120_000);

let fixtures = [];

test.afterEach(() => {
  for (const fixture of fixtures.reverse()) {
    cleanupExceptionFixture(fixture);
  }
  fixtures = [];
});

test('admin reject and user terms refusal exception statuses are persisted and displayed', async ({ page }) => {
  fs.mkdirSync(tempRoot, { recursive: true });

  const rejected = createExceptionFixture('reject');
  fixtures.push(rejected);
  await page.addInitScript((session) => {
    window.localStorage.setItem('cubiciUserAuth', JSON.stringify(session));
  }, rejected.session);
  await createRequestFromUser(page, rejected);
  await rejectRequestFromAdmin(page, rejected);
  await expectStatus(rejected.mbid, 'REJECTED');
  await expectUserCurrentStatus(page, rejected, '거절');

  const refused = createExceptionFixture('refuse');
  fixtures.push(refused);
  await page.addInitScript((session) => {
    window.localStorage.setItem('cubiciUserAuth', JSON.stringify(session));
  }, refused.session);
  await createRequestFromUser(page, refused);
  await presentTermsByApi(refused.mbid);
  await expectStatus(refused.mbid, 'CONDITIONS_ACCEPT');
  await refuseTermsFromUser(page, refused);
  await expectStatus(refused.mbid, 'TERMS_REFUSED');
  await expectUserCurrentStatus(page, refused, '동의거부');
  await expectAdminApprovalStatus(page, refused, '동의거부');
});

async function createRequestFromUser(page, currentFixture) {
  const regFile = path.join(tempRoot, `cubici-ex-${currentFixture.kind}-reg-${currentFixture.suffix}.pdf`);
  const cbFile = path.join(tempRoot, `cubici-ex-${currentFixture.kind}-cb-${currentFixture.suffix}.pdf`);
  fs.writeFileSync(regFile, `%PDF-1.4\n% cubici exception ${currentFixture.kind} business registration\n`);
  fs.writeFileSync(cbFile, `%PDF-1.4\n% cubici exception ${currentFixture.kind} identity document\n`);
  currentFixture.tempFiles.push(regFile, cbFile);

  await setUserSession(page, currentFixture.session);
  await page.goto(`${userBaseUrl}/moneybank/request`);
  await expect(page.getByRole('heading', { name: '머니뱅크 신청' })).toBeVisible();
  await expect(page.locator(`input[value="${currentFixture.userNo}"]`)).toBeVisible();
  await expect(page.locator(`input[value="${currentFixture.bizName}"]`)).toBeVisible();
  await expect(page.getByText('연결 완료')).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('input[value="1개"]')).toBeVisible();
  await expect(page.getByLabel('네이버')).toBeChecked();

  await page.getByLabel('사업자등록증').setInputFiles(regFile);
  await page.getByLabel('대표자 신분증').setInputFiles(cbFile);
  await page.getByLabel('본인확인 생년월일').fill('800101');
  await page.getByLabel('주민등록증 발급정보').fill('123456');
  await page.getByRole('button', { name: '본인확인 mock 실행' }).click();
  await expect(page.getByText(/주민등록증 진위확인 mock 완료/)).toBeVisible();
  await expect(page.getByLabel('본인확인을 완료했습니다.')).toBeChecked();
  await page.getByLabel('머니뱅크 신청 약관에 동의합니다.').check();
  const requestResponsePromise = waitForApiResponse(page, '/v1/api/contracts/requests', 'POST');
  await page.getByRole('button', { name: '서비스 신청' }).click();
  await expectApiResponse(requestResponsePromise);
  await expect(page.getByText(/신청 되었습니다!.*서류 2건 업로드 완료/)).toBeVisible({ timeout: 30_000 });

  currentFixture.mbid = await latestContractMbid(currentFixture.userNo);
  await expectStatus(currentFixture.mbid, 'REQUEST');
}

async function setUserSession(page, session) {
  await page.goto(userBaseUrl);
  await page.evaluate((value) => {
    window.localStorage.setItem('cubiciUserAuth', JSON.stringify(value));
  }, session);
}

async function rejectRequestFromAdmin(page, currentFixture) {
  await page.goto(`${adminBaseUrl}/admin/moneybank/request`);
  await page.getByLabel('회원명').fill(currentFixture.userName);
  await page.getByRole('button', { name: '검색' }).click();

  const requestRow = page.locator('tbody tr').filter({ hasText: currentFixture.userName });
  await expect(requestRow).toContainText('신청접수');
  await requestRow.getByRole('button', { name: '신청접수' }).click();

  await expect(page.getByText('상태 상세')).toBeVisible();
  const statusResponsePromise = waitForApiResponse(page, `/v1/api/contracts/${currentFixture.mbid}/status`, 'PUT');
  await page.getByRole('button', { name: '거부' }).click();
  await expectApiResponse(statusResponsePromise);
  await expect(page.getByText('계약 상태 변경이 완료되었습니다.')).toBeVisible();
  await expect(page.locator('td').filter({ hasText: '거절' }).first()).toBeVisible();
}

async function refuseTermsFromUser(page, currentFixture) {
  await setUserSession(page, currentFixture.session);
  await page.goto(`${userBaseUrl}/moneybank/current/${encodeURIComponent(currentFixture.mbid)}`);
  await expect(page.getByRole('heading', { name: '머니뱅크 계약 상세' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '이용조건 확인' })).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('input[value="조건제시"]').first()).toBeVisible();
  const refuseResponsePromise = waitForApiResponse(page, `/v1/api/contracts/${currentFixture.mbid}/status`, 'PUT');
  await page.getByRole('button', { name: '동의하지 않습니다' }).click();
  await expectApiResponse(refuseResponsePromise);
  await expect(page.getByText('이용조건 거절이 저장되었습니다.')).toBeVisible();
}

async function expectUserCurrentStatus(page, currentFixture, expectedLabel) {
  await page.goto(`${userBaseUrl}/moneybank/current`);
  await expect(page.getByRole('heading', { name: '머니뱅크 현황' })).toBeVisible();
  const currentRow = page.locator('tbody tr').filter({ hasText: currentFixture.mbid });
  await expect(currentRow).toContainText(expectedLabel);
}

async function expectAdminApprovalStatus(page, currentFixture, expectedLabel) {
  await page.goto(`${adminBaseUrl}/admin/moneybank/approval_tab1`);
  await page.getByLabel('회원명').fill(currentFixture.userName);
  await page.getByRole('button', { name: '검색' }).click();
  const approvalRow = page.locator('tbody tr').filter({ hasText: currentFixture.userName });
  await expect(approvalRow).toContainText(currentFixture.bizName);
  await expect(approvalRow).toContainText(expectedLabel);
}

function createExceptionFixture(kind) {
  const suffix = `${kind}-${String(Date.now()).slice(-9)}`;
  const fixture = JSON.parse(runPython(`
import json
import sys
from cubici_service.accounts.repository import AccountAuthUser, _build_auth_response
from cubici_service.db.connection import get_connection

kind = sys.argv[1]
suffix = sys.argv[2]
with get_connection() as conn:
    with conn.cursor() as cur:
        numeric_part = ''.join(ch for ch in suffix if ch.isdigit())[-10:].ljust(10, "0")
        numeric_id = int(numeric_part[-6:])
        user_no = 7300000 + numeric_id
        shop_account_id = 8300000 + numeric_id
        email = f"local-db-ex-{suffix}@example.test"
        user_name = f"Ex{kind.capitalize()}User{numeric_part[-6:]}"
        biz_name = f"Ex{kind.capitalize()}Biz{numeric_part[-6:]}"
        cur.execute(
            """
            insert into users (
                user_no, email, password, user_type, name, phone, biz_num,
                biz_name, biz_setup_date, biz_type, sectors, fintech_id,
                reg_date, modified_date
            ) values (
                %s, %s, 'local-db-ex-e2e', 'USER', %s, '01000000000',
                %s, %s, '20180101', 'INDIVIDUAL', '01', 1, now(), now()
            )
            """,
            (user_no, email, user_name, numeric_part, biz_name),
        )
        cur.execute(
            """
            insert into shop_accounts (
                id, user_no, shop_type, shop_id, shop_account_id,
                shop_account_password, api_secret_key, status, del_yn,
                reg_date, modified_date
            ) values (
                %s, %s, 'NAVER', %s, %s, 'local-db-ex-e2e',
                'local-db-ex-e2e', 'Y', 'N', now(), now()
            )
            """,
            (
                shop_account_id,
                user_no,
                f"local-db-ex-shop-{suffix}",
                f"local-db-ex-account-{suffix}",
            ),
        )

user = AccountAuthUser(
    user_no=user_no,
    email=email,
    user_type="USER",
    name=user_name,
    phone="01000000000",
    biz_num=numeric_part,
    biz_name=biz_name,
    partner_code=None,
    last_login_date=None,
)
session = _build_auth_response(user).model_dump()
print(json.dumps({
    "kind": kind,
    "userNo": user_no,
    "shopAccountId": shop_account_id,
    "suffix": suffix,
    "email": email,
    "userName": user_name,
    "bizName": biz_name,
    "session": session,
}, ensure_ascii=False, default=str))
  `, [kind, suffix]));
  fixture.tempFiles = [];
  return fixture;
}

async function latestContractMbid(userNo) {
  const response = await apiJson(`/v1/api/contracts?limit=1&offset=0&user_no=${encodeURIComponent(userNo)}`);
  expect(response.total).toBe(1);
  return response.items[0].mbid;
}

async function expectStatus(mbid, expectedStatus) {
  const detail = await apiJson(`/v1/api/contracts/${encodeURIComponent(mbid)}`);
  expect(detail.contract.status).toBe(expectedStatus);
}

async function apiJson(pathname) {
  const response = await fetch(`${apiBaseUrl}${pathname}`, {
    headers: adminAuthHeaders(),
  });
  const text = await response.text();
  expect(response.ok, text).toBe(true);
  return text ? JSON.parse(text) : null;
}

async function apiJsonWithBody(pathname, options = {}) {
  const response = await fetch(`${apiBaseUrl}${pathname}`, {
    method: options.method || 'GET',
    headers: {
      ...adminAuthHeaders(),
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const text = await response.text();
  expect(response.ok, text).toBe(true);
  return text ? JSON.parse(text) : null;
}

function adminAuthHeaders() {
  const authorization = process.env.CUBICI_ADMIN_BEARER_TOKEN;
  expect(Boolean(authorization), 'CUBICI_ADMIN_BEARER_TOKEN is required for protected admin DB E2E API calls').toBe(true);
  return { Authorization: authorization };
}

async function presentTermsByApi(mbid) {
  await apiJsonWithBody(`/v1/api/contracts/${encodeURIComponent(mbid)}/fees/adjust`, {
    method: 'PUT',
    body: {
      adjusted_by: 'local-admin',
      reason: 'exception e2e fee setup',
      payment_rate: 80,
      sales_limit_per_order: 700000,
      max_outstanding_balance: 5000000,
      fee_rates: [
        {
          fee_type: 'ADVANCE',
          fee_rate: 1.35,
        },
      ],
    },
  });
  await apiJsonWithBody(`/v1/api/contracts/${encodeURIComponent(mbid)}/status`, {
    method: 'PUT',
    body: {
      action: 'present_terms',
      changed_by: 'local-admin',
      reason: 'terms presented by exception e2e setup',
    },
  });
}

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

function cleanupExceptionFixture(currentFixture) {
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
  for (const filePath of currentFixture.tempFiles || []) {
    fs.rmSync(filePath, { force: true });
  }
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
