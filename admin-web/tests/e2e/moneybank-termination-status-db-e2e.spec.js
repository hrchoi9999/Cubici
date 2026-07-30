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
const userBaseUrl = process.env.CUBICI_USER_BASE_URL || 'http://127.0.0.1:4175';

test.skip(process.env.CUBICI_RUN_DB_E2E !== '1', 'set CUBICI_RUN_DB_E2E=1 to run local PostgreSQL UI E2E tests');
test.setTimeout(120_000);

let fixture = null;

test.afterEach(() => {
  if (fixture) {
    cleanupTerminationFixture(fixture);
    fixture = null;
  }
});

test('admin termination changes account standby contract to self termination and member withdrawal list', async ({ page }) => {
  fixture = createTerminationFixture();
  await page.addInitScript((session) => {
    window.localStorage.setItem('cubiciUserAuth', JSON.stringify(session));
  }, fixture.session);

  fixture.mbid = await createAccountStandbyContract(fixture);
  await expectStatus(fixture.mbid, 'ACCOUNT_STANDBY');
  await terminateFromAdminRequestStatus(page, fixture);
  await expectStatus(fixture.mbid, 'SELF_TERMINATION');
  await expectCancelRequestDate(fixture.mbid);
  await expectUserCurrentStatus(page, fixture, '해지');
  await expectMemberWithdrawalRow(page, fixture);
});

async function createAccountStandbyContract(currentFixture) {
  const created = await apiJson('/v1/api/contracts/requests', {
    method: 'POST',
    body: {
      user_no: currentFixture.userNo,
      request_shop_types: ['NAVER'],
      product_code: 'MP',
      sales_amount: 0,
      identity_confirmed: true,
      identity_verification_method: 'mock',
      identity_verification_status: 'mock_verified',
      identity_verification_reference: `E2E-ID-${currentFixture.suffix}`,
      terms_agreed: true,
      submitted_document_types: ['regNo', 'CBInfo'],
      requested_by: 'termination-e2e',
    },
  });
  await apiJson(`/v1/api/contracts/${encodeURIComponent(created.mbid)}/status`, {
    method: 'PUT',
    body: {
      action: 'present_terms',
      changed_by: 'local-admin',
      reason: 'termination e2e terms presented',
    },
  });
  await apiJson(`/v1/api/contracts/${encodeURIComponent(created.mbid)}/status`, {
    method: 'PUT',
    body: {
      action: 'agree_terms',
      changed_by: 'local-user',
      reason: 'termination e2e terms agreed',
    },
  });
  await apiJson(`/v1/api/contracts/${encodeURIComponent(created.mbid)}/status`, {
    method: 'PUT',
    body: {
      action: 'contract_ready',
      changed_by: 'local-admin',
      reason: 'termination e2e contract ready',
    },
  });
  return created.mbid;
}

async function terminateFromAdminRequestStatus(page, currentFixture) {
  await page.goto(`${adminBaseUrl}/admin/moneybank/request`);
  await page.getByLabel('회원명').fill(currentFixture.userName);
  await page.getByRole('button', { name: '검색' }).click();

  const requestRow = page.locator('tbody tr').filter({ hasText: currentFixture.userName });
  await expect(requestRow).toContainText('계좌대기');
  await requestRow.getByRole('button', { name: '계좌대기' }).click();

  await expect(page.getByText('상태 상세')).toBeVisible();
  await page.getByRole('button', { name: '해지' }).click();
  await expect(page.getByText('계약 상태 변경이 완료되었습니다.')).toBeVisible();
  await expect(page.locator('td').filter({ hasText: '해지' }).first()).toBeVisible();
}

async function expectUserCurrentStatus(page, currentFixture, expectedLabel) {
  await page.goto(`${userBaseUrl}/moneybank/current`);
  await expect(page.getByRole('heading', { name: '머니뱅크 현황' })).toBeVisible();
  const currentRow = page.locator('tbody tr').filter({ hasText: currentFixture.mbid });
  await expect(currentRow).toContainText(expectedLabel);
}

async function expectMemberWithdrawalRow(page, currentFixture) {
  await page.goto(`${adminBaseUrl}/admin/cubici/manageMember/member_tab3`);
  await expect(page.getByRole('link', { name: '휴면/해지' })).toBeVisible();
  await page.getByLabel('회원명').fill(currentFixture.userName);
  await page.getByRole('button', { name: '검색' }).click();

  const withdrawalRow = page.locator('tbody tr').filter({ hasText: currentFixture.userName });
  await expect(withdrawalRow).toContainText(currentFixture.bizName);
  await expect(withdrawalRow).toContainText('머니뱅크');
  await expect(withdrawalRow).toContainText('해지');
}

function createTerminationFixture() {
  const suffix = String(Date.now()).slice(-9);
  return JSON.parse(runPython(`
import json
import sys
from cubici_service.accounts.repository import AccountAuthUser, _build_auth_response
from cubici_service.db.connection import get_connection

suffix = sys.argv[1]
with get_connection() as conn:
    with conn.cursor() as cur:
        numeric_id = int(''.join(ch for ch in suffix if ch.isdigit())[-6:].ljust(6, "0"))
        user_no = 7400000 + numeric_id
        shop_account_id = 8400000 + numeric_id
        email = f"local-db-term-e2e-{suffix}@example.test"
        user_name = f"TermUIUser{suffix}"
        biz_name = f"TermUIBiz{suffix}"
        biz_num = suffix.ljust(10, "0")[:10]
        cur.execute(
            """
            insert into users (
                user_no, email, password, user_type, name, phone, biz_num,
                biz_name, biz_setup_date, biz_type, sectors, fintech_id,
                reg_date, modified_date
            ) values (
                %s, %s, 'local-db-term-e2e', 'USER', %s, '01000000000',
                %s, %s, '20180101', 'INDIVIDUAL', '01', 1, now(), now()
            )
            """,
            (user_no, email, user_name, biz_num, biz_name),
        )
        cur.execute(
            """
            insert into shop_accounts (
                id, user_no, shop_type, shop_id, shop_account_id,
                shop_account_password, api_secret_key, status, del_yn,
                reg_date, modified_date
            ) values (
                %s, %s, 'NAVER', %s, %s, 'local-db-term-e2e',
                'local-db-term-e2e', 'Y', 'N', now(), now()
            )
            """,
            (
                shop_account_id,
                user_no,
                f"local-db-term-e2e-shop-{suffix}",
                f"local-db-term-e2e-account-{suffix}",
            ),
        )

user = AccountAuthUser(
    user_no=user_no,
    email=email,
    user_type="USER",
    name=user_name,
    phone="01000000000",
    biz_num=biz_num,
    biz_name=biz_name,
    partner_code=None,
    last_login_date=None,
)
session = _build_auth_response(user).model_dump()
print(json.dumps({
    "userNo": user_no,
    "shopAccountId": shop_account_id,
    "suffix": suffix,
    "email": email,
    "userName": user_name,
    "bizName": biz_name,
    "session": session,
}, ensure_ascii=False, default=str))
  `, [suffix]));
}

async function expectStatus(mbid, expectedStatus) {
  const detail = await apiJson(`/v1/api/contracts/${encodeURIComponent(mbid)}`);
  expect(detail.contract.status).toBe(expectedStatus);
}

async function expectCancelRequestDate(mbid) {
  const detail = await apiJson(`/v1/api/contracts/${encodeURIComponent(mbid)}`);
  expect(detail.contract.cancel_request_date).toBeTruthy();
}

async function apiJson(pathname, options = {}) {
  const response = await fetch(`${apiBaseUrl}${pathname}`, {
    method: options.method ?? 'GET',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const text = await response.text();
  expect(response.ok, text).toBe(true);
  return text ? JSON.parse(text) : null;
}

function cleanupTerminationFixture(currentFixture) {
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
