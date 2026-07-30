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

test.skip(process.env.CUBICI_RUN_DB_E2E !== '1', 'set CUBICI_RUN_DB_E2E=1 to run local PostgreSQL UI E2E tests');
test.setTimeout(120_000);

let created = null;

test.afterEach(() => {
  if (created) {
    cleanupContractFixture(created);
    created = null;
  }
});

test('admin review screen presents terms and contract screen readies accepted contract with database API', async ({ page }) => {
  created = createContractFixture();
  const contract = await createContractRequest(created);
  created.mbid = contract.mbid;

  await page.goto('/admin/moneybank/approval_tab1');
  await page.getByLabel('회원명').fill(created.userName);
  await page.getByRole('button', { name: '검색' }).click();

  const reviewRow = page.locator('tbody tr').filter({ hasText: created.userName });
  await expect(reviewRow).toContainText(created.bizName);
  await reviewRow.getByRole('button', { name: '보기' }).click();

  await expect(page.getByRole('heading', { name: '심사 정보' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '계약 조건 조정' })).toBeVisible();
  await page.getByLabel('지급율(%)').fill('80');
  await page.getByLabel('건당 주문한도').fill('700000');
  await page.getByLabel('최대 미상환잔액').fill('5000000');
  await page.getByLabel('조정사유').fill('local db ui e2e fee');
  await page.getByRole('button', { name: '수수료율 추가' }).click();
  await page.getByLabel('수수료 구분 1').fill('ADVANCE');
  await page.getByLabel('수수료율 1').fill('1.35');
  const feeResponsePromise = waitForApiResponse(page, `/v1/api/contracts/${created.mbid}/fees/adjust`, 'PUT');
  await page.getByRole('button', { name: '조건 저장' }).click();
  await expectApiResponse(feeResponsePromise);

  await expect(page.getByText('계약 조건 저장이 완료되었습니다.')).toBeVisible();
  await expect(page.getByRole('button', { name: '조건 제시' })).toBeEnabled();
  const conditionResponsePromise = waitForApiResponse(page, `/v1/api/contracts/${created.mbid}/status`, 'PUT');
  await page.getByRole('button', { name: '조건 제시' }).click();
  await expectApiResponse(conditionResponsePromise);
  await expect(page.getByText('계약 상태 변경이 완료되었습니다.')).toBeVisible();
  await expectStatus(created.mbid, 'CONDITIONS_ACCEPT');

  await updateContractStatus(created.mbid, 'agree_terms', 'user accepted terms through db e2e setup');
  await expectStatus(created.mbid, 'USE_AGREE');

  await page.goto('/admin/moneybank/approval_tab2');
  await page.getByLabel('회원명').fill(created.userName);
  await page.getByRole('button', { name: '검색' }).click();

  const contractRow = page.locator('tbody tr').filter({ hasText: created.userName });
  await expect(contractRow).toContainText(created.bizName);
  await expect(contractRow).toContainText('동의');
  await contractRow.getByRole('button', { name: '보기' }).click();

  await expect(page.getByRole('heading', { name: '계약 정보' })).toBeVisible();
  await expect(page.getByRole('button', { name: '체결' })).toBeEnabled();
  const contractResponsePromise = waitForApiResponse(page, `/v1/api/contracts/${created.mbid}/status`, 'PUT');
  await page.getByRole('button', { name: '체결' }).click();
  await expectApiResponse(contractResponsePromise);
  await expect(page.getByText('계약 상태 변경이 완료되었습니다.')).toBeVisible();
  await expectStatus(created.mbid, 'ACCOUNT_STANDBY');
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

function createContractFixture() {
  const suffix = String(Date.now()).slice(-9);
  return JSON.parse(runPython(`
import json
import sys
from cubici_service.db.connection import get_connection

suffix = sys.argv[1]
with get_connection() as conn:
    with conn.cursor() as cur:
        numeric_id = int(''.join(ch for ch in suffix if ch.isdigit())[-6:].ljust(6, "0"))
        user_no = 7500000 + numeric_id
        shop_id = 8500000 + numeric_id
        user_name = f"DBUIUser{suffix}"
        biz_name = f"DBUIBiz{suffix}"
        cur.execute(
            """
            insert into users (
                user_no, email, password, user_type, name, phone, biz_num,
                biz_name, biz_setup_date, biz_type, sectors, fintech_id,
                reg_date, modified_date
            ) values (
                %s, %s, 'local-db-ui-e2e', 'USER', %s, '01000000000',
                %s, %s, '20180101', 'INDIVIDUAL', '01', 1, now(), now()
            )
            """,
            (
                user_no,
                f"local-db-ui-e2e-{suffix}@example.test",
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
                %s, %s, 'NAVER', %s, %s, 'local-db-ui-e2e',
                'local-db-ui-e2e', 'Y', 'N', now(), now()
            )
            """,
            (
                shop_id,
                user_no,
                f"local-db-ui-e2e-shop-{suffix}",
                f"local-db-ui-e2e-account-{suffix}",
            ),
        )
print(json.dumps({
    "userNo": user_no,
    "shopAccountId": shop_id,
    "suffix": suffix,
    "userName": user_name,
    "bizName": biz_name,
}, ensure_ascii=False))
  `, [suffix]));
}

async function createContractRequest(fixture) {
  return apiJson('/v1/api/contracts/requests', {
    method: 'POST',
    body: {
      user_no: fixture.userNo,
      request_shop_types: ['NAVER'],
      product_code: 'MP',
      sales_amount: 2400000,
      representative_age: 42,
      identity_confirmed: true,
      identity_verification_method: 'mock',
      identity_verification_status: 'mock_verified',
      identity_verification_reference: `E2E-ID-${fixture.suffix}`,
      terms_agreed: true,
      submitted_document_types: ['CBInfo', 'regNo'],
      requested_by: 'local-db-ui-e2e',
    },
  });
}

async function updateContractStatus(mbid, action, reason) {
  return apiJson(`/v1/api/contracts/${encodeURIComponent(mbid)}/status`, {
    method: 'PUT',
    body: {
      action,
      changed_by: 'local-db-ui-e2e',
      reason,
    },
  });
}

async function expectStatus(mbid, expectedStatus) {
  const detail = await apiJson(`/v1/api/contracts/${encodeURIComponent(mbid)}`);
  expect(detail.contract.status).toBe(expectedStatus);
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

function cleanupContractFixture(fixture) {
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
  `, [fixture.mbid || '', String(fixture.userNo), String(fixture.shopAccountId)]);
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
