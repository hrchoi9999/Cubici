import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '../../../admin-web/node_modules/@playwright/test/index.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const userRoot = path.resolve(__dirname, '..', '..');
const cubiciRoot = path.resolve(userRoot, '..');
const workspaceRoot = path.resolve(cubiciRoot, '..');
const serviceApiRoot = path.join(cubiciRoot, 'service-api');
const pythonExe = process.env.CUBICI_PYTHON_EXE || path.join(workspaceRoot, '.venv', 'Scripts', 'python.exe');
const apiBaseUrl = process.env.CUBICI_API_BASE_URL || process.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

test.skip(process.env.CUBICI_RUN_DB_E2E !== '1', 'set CUBICI_RUN_DB_E2E=1 to run local PostgreSQL UI E2E tests');

let fixture = null;

test.afterEach(() => {
  if (fixture) {
    cleanupContractFixture(fixture);
    fixture = null;
  }
});

test('user contract detail accepts presented terms with database API', async ({ page }) => {
  fixture = createUserFixture();
  const createdContract = await createContractRequest(fixture);
  fixture.mbid = createdContract.mbid;
  await adjustContractFee(fixture.mbid);
  await updateContractStatus(fixture.mbid, 'present_terms', 'present terms for user ui db e2e');
  await expectStatus(fixture.mbid, 'CONDITIONS_ACCEPT');

  await page.addInitScript((session) => {
    window.localStorage.setItem('cubiciUserAuth', JSON.stringify(session));
  }, fixture.session);

  await page.goto(`/moneybank/current/${encodeURIComponent(fixture.mbid)}`);

  await expect(page.getByRole('heading', { name: '머니뱅크 계약 상세' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '이용조건 확인' })).toBeVisible();
  await expect(page.locator(`input[value="${fixture.mbid}"]`).first()).toBeVisible();
  await expect(page.locator('input[value="조건제시"]').first()).toBeVisible();
  await expect(page.getByText('80%')).toBeVisible();
  await expect(page.getByText('1.35%')).toBeVisible();

  await expect(page.getByRole('button', { name: '이용조건 동의' })).toBeEnabled();
  await page.getByRole('button', { name: '이용조건 동의' }).click();

  await expect(page.getByText('이용조건 동의가 저장되었습니다.')).toBeVisible();
  await expect(page.getByText('현재 상태: 이용조건 동의')).toBeVisible();
  await expectStatus(fixture.mbid, 'USE_AGREE');

  await expect(page.getByRole('heading', { name: '공동인증 전자서명' })).toBeVisible();
  await expect(page.getByRole('button', { name: '공동인증 전자서명 mock' })).toBeEnabled();
  await page.getByRole('button', { name: '공동인증 전자서명 mock' }).click();

  await expect(page.getByText('전자서명 mock이 저장되었습니다.')).toBeVisible();
  await expectStatus(fixture.mbid, 'ACCOUNT_STANDBY');

  const detail = await apiJson(`/v1/api/contracts/${encodeURIComponent(fixture.mbid)}?user_no=${fixture.userNo}`);
  expect(detail.contract.electronic_signature_status).toBe('signed_mock');
  expect(detail.contract.electronic_signature_reference).toMatch(/^MOCK-SIGN-/);
});

function createUserFixture() {
  const suffix = String(Date.now()).slice(-9);
  return JSON.parse(runPython(`
import json
import sys
from cubici_service.accounts.repository import AccountAuthUser, _build_auth_response
from cubici_service.db.connection import get_connection

suffix = sys.argv[1]
with get_connection() as conn:
    with conn.cursor() as cur:
        cur.execute("select coalesce(max(user_no), 0) + 1 from users")
        user_no = int(cur.fetchone()[0])
        cur.execute("select coalesce(max(id), 0) + 1 from shop_accounts")
        shop_account_id = int(cur.fetchone()[0])
        email = f"local-db-user-e2e-{suffix}@example.test"
        user_name = f"UserUIUser{suffix}"
        biz_name = f"UserUIBiz{suffix}"
        biz_num = suffix.ljust(10, "0")[:10]
        cur.execute(
            """
            insert into users (
                user_no, email, password, user_type, name, phone, biz_num,
                biz_name, biz_setup_date, biz_type, sectors, fintech_id,
                reg_date, modified_date
            ) values (
                %s, %s, 'local-db-user-e2e', 'USER', %s, '01000000000',
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
                %s, %s, 'NAVER', %s, %s, 'local-db-user-e2e',
                'local-db-user-e2e', 'Y', 'N', now(), now()
            )
            """,
            (
                shop_account_id,
                user_no,
                f"local-db-user-e2e-shop-{suffix}",
                f"local-db-user-e2e-account-{suffix}",
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
    "bizNum": biz_num,
    "session": session,
}, ensure_ascii=False, default=str))
  `, [suffix]));
}

async function createContractRequest(currentFixture) {
  return apiJson('/v1/api/contracts/requests', {
    method: 'POST',
    body: {
      user_no: currentFixture.userNo,
      request_shop_types: ['NAVER'],
      product_code: 'MP',
      sales_amount: 2400000,
      representative_age: 42,
      identity_confirmed: true,
      identity_verification_method: 'id_card',
      identity_verification_status: 'mock_verified',
      identity_verification_reference: 'MOCK-ID-800101-1234',
      terms_agreed: true,
      submitted_document_types: ['CBInfo', 'regNo'],
      requested_by: 'db-user-e2e',
    },
  });
}

async function adjustContractFee(mbid) {
  return apiJson(`/v1/api/contracts/${encodeURIComponent(mbid)}/fees/adjust`, {
    method: 'PUT',
    body: {
      adjusted_by: 'db-user-e2e',
      reason: 'user terms ui db e2e fee',
      payment_rate: 80,
      sales_limit_per_order: 700000,
      max_outstanding_balance: 5000000,
      fee_rates: [
        { fee_type: 'ADVANCE', fee_rate: 1.35 },
        { fee_type: 'REPAYMENT', fee_rate: 0.25 },
      ],
    },
  });
}

async function updateContractStatus(mbid, action, reason) {
  return apiJson(`/v1/api/contracts/${encodeURIComponent(mbid)}/status`, {
    method: 'PUT',
    body: {
      action,
      changed_by: 'db-user-e2e',
      reason,
    },
  });
}

async function expectStatus(mbid, expectedStatus) {
  const detail = await apiJson(`/v1/api/contracts/${encodeURIComponent(mbid)}`);
  expect(detail.contract.status).toBe(expectedStatus);
}

async function apiJson(pathname, options = {}) {
  let response;
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      response = await fetch(`${apiBaseUrl}${pathname}`, {
        method: options.method || 'GET',
        headers: {
          ...adminAuthHeaders(),
          ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      });
      break;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
    }
  }
  if (!response) {
    throw lastError;
  }
  const text = await response.text();
  expect(response.ok, text).toBe(true);
  return text ? JSON.parse(text) : null;
}

function adminAuthHeaders() {
  const authorization = process.env.CUBICI_ADMIN_BEARER_TOKEN;
  expect(Boolean(authorization), 'CUBICI_ADMIN_BEARER_TOKEN is required for protected setup API calls').toBe(true);
  return { Authorization: authorization };
}

function cleanupContractFixture(currentFixture) {
  runPython(`
import sys
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
