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
    cleanupRedemptionFixture(fixture);
    fixture = null;
  }
});

test('admin redemption provision, repayment, repayment cancel, and provision cancel persist with real database', async ({ page }) => {
  fixture = createRedemptionFixture();
  const contract = await createContractRequest(fixture);
  fixture.mbid = contract.mbid;

  await seedProvision(fixture, 'SD', 100_000);

  await page.goto(`${adminBaseUrl}/admin/moneybank/redemption`);
  await page.getByLabel('MBID').fill(fixture.mbid);
  await page.getByRole('button', { name: '검색' }).click();

  const listRow = page.locator('tbody tr').filter({ hasText: fixture.mbid }).first();
  await expect(listRow).toContainText('100,000');
  await listRow.getByRole('button', { name: '보기' }).click();

  const detailPanel = page.locator('.detailPanel');
  await expect(detailPanel.getByRole('link', { name: '상환 상세' })).toBeVisible();
  await expect(detailPanel.getByText('현재 미상환잔액: 100,000')).toBeVisible();

  const uiProvisionCode = `PV${fixture.codeSuffix}`;
  const provisionForm = redemptionForm(detailPanel, '지급 등록');
  await provisionForm.locator('input[name="provisionCode"]').fill(uiProvisionCode);
  await provisionForm.locator('input[name="requestCode"]').fill(`RQ${fixture.codeSuffix}`);
  await provisionForm.locator('input[name="totalPaymentAmount"]').fill('55000');
  await provisionForm.locator('input[name="totalUsageFee"]').fill('5000');
  await provisionForm.locator('input[name="totalProvisionAmount"]').fill('50000');
  await provisionForm.locator('input[name="salesCode"]').fill(`SL${fixture.codeSuffix}`);
  await provisionForm.locator('input[name="orderNo"]').fill(`ORD${fixture.codeSuffix}`);
  await provisionForm.locator('input[name="classCode"]').fill('NAVER');
  await provisionForm.locator('input[name="operatedBy"]').fill('local-admin');
  await provisionForm.locator('input[name="reason"]').fill('실DB 지급 생성 E2E');
  await provisionForm.getByRole('button', { name: '지급 등록' }).click();

  await expect(detailPanel.getByText(`지급 등록 완료: ${uiProvisionCode}`)).toBeVisible();
  await expect(detailPanel.locator('tr').filter({ hasText: uiProvisionCode })).toContainText('정상');
  await expectLatestAmounts(fixture.mbid, { provision: 150_000, repayment: 0, balance: 150_000 });

  const uiRepaymentCode = `RP${fixture.codeSuffix}`;
  const repaymentForm = redemptionForm(detailPanel, '상환 등록');
  await repaymentForm.locator('input[name="repaymentCode"]').fill(uiRepaymentCode);
  await repaymentForm.locator('input[name="repaymentAmount"]').fill('70000');
  await repaymentForm.locator('input[name="repaymentUsageFee"]').fill('1000');
  await repaymentForm.locator('input[name="remittanceFee"]').fill('500');
  await repaymentForm.locator('input[name="balanceProvisionAmount"]').fill('80000');
  await repaymentForm.locator('input[name="depositCode"]').fill(`DP${fixture.codeSuffix}`);
  await repaymentForm.locator('input[name="depositAmount"]').fill('70000');
  await repaymentForm.locator('input[name="operatedBy"]').fill('local-admin');
  await repaymentForm.locator('input[name="reason"]').fill('실DB 상환 생성 E2E');
  await repaymentForm.getByRole('button', { name: '상환 등록' }).click();

  await expect(detailPanel.getByText(`상환 등록 완료: ${uiRepaymentCode}`)).toBeVisible();
  await expect(detailPanel.locator('tr').filter({ hasText: uiRepaymentCode })).toContainText('정상');
  await expectLatestAmounts(fixture.mbid, { provision: 150_000, repayment: 70_000, balance: 80_000 });

  await cancelOperation(page, detailPanel, uiRepaymentCode, `CXRP${fixture.codeSuffix}`, '실DB 상환 취소 E2E');
  await expect(detailPanel.getByText(`상환 작업 취소 완료: CXRP${fixture.codeSuffix}`)).toBeVisible();
  await expect(operationHistoryRow(detailPanel, uiRepaymentCode)).toContainText('취소됨');
  await expectLatestAmounts(fixture.mbid, { provision: 150_000, repayment: 0, balance: 150_000 });

  await cancelOperation(page, detailPanel, uiProvisionCode, `CXPV${fixture.codeSuffix}`, '실DB 지급 취소 E2E');
  await expect(detailPanel.getByText(`상환 작업 취소 완료: CXPV${fixture.codeSuffix}`)).toBeVisible();
  await expect(operationHistoryRow(detailPanel, uiProvisionCode)).toContainText('취소됨');
  await expectLatestAmounts(fixture.mbid, { provision: 100_000, repayment: 0, balance: 100_000 });

  expect(readPersistedOperations(fixture.mbid, fixture.codeSuffix)).toMatchObject({
    provision_count: 2,
    repayment_count: 1,
    sales_count: 1,
    deposit_count: 1,
    operation_count: 5,
    canceled_original_count: 2,
    reversal_count: 2,
    latest_provision: 100_000,
    latest_repayment: 0,
    latest_balance: 100_000,
  });
});

function redemptionForm(root, title) {
  return root.locator('.redemptionOperationForm').filter({
    hasText: title,
  });
}

async function cancelOperation(page, detailPanel, operationCode, cancelCode, reason) {
  const operationRow = operationHistoryRow(detailPanel, operationCode);
  await expect(operationRow).toContainText('정상');
  await operationRow.getByRole('button', { name: '취소' }).click();

  const modal = page.getByRole('dialog', { name: '작업 취소' });
  await expect(modal).toBeVisible();
  await expect(modal).toContainText(operationCode);
  await modal.locator('input[name="cancelCode"]').fill(cancelCode);
  await modal.locator('input[name="operatedBy"]').fill('local-admin');
  await modal.locator('input[name="reason"]').fill(reason);
  await modal.getByRole('button', { name: '취소 실행' }).click();
  await expect(modal).toBeHidden();
}

function operationHistoryRow(root, operationCode) {
  return root.locator(
    `xpath=.//table[contains(@class, "redemptionOperationHistoryTable")]//tbody/tr[td[3][normalize-space(.)="${operationCode}"]]`,
  );
}

function createRedemptionFixture() {
  const suffix = String(Date.now()).slice(-9);
  const codeSuffix = suffix.slice(-8);
  return JSON.parse(runPython(`
import json
import sys
from cubici_service.db.connection import get_connection

suffix = sys.argv[1]
code_suffix = sys.argv[2]
with get_connection() as conn:
    with conn.cursor() as cur:
        numeric_id = int(''.join(ch for ch in suffix if ch.isdigit())[-6:].ljust(6, "0"))
        user_no = 7700000 + numeric_id
        shop_account_id = 8700000 + numeric_id
        user_name = f"RedemptionUIUser{suffix}"
        biz_name = f"RedemptionUIBiz{suffix}"
        cur.execute(
            """
            insert into users (
                user_no, email, password, user_type, name, phone, biz_num,
                biz_name, biz_setup_date, biz_type, sectors, fintech_id,
                reg_date, modified_date
            ) values (
                %s, %s, 'local-db-redemption-e2e', 'USER', %s, '01000000000',
                %s, %s, '20180101', 'INDIVIDUAL', '01', 1, now(), now()
            )
            """,
            (
                user_no,
                f"local-db-redemption-e2e-{suffix}@example.test",
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
                %s, %s, 'NAVER', %s, %s, 'local-db-redemption-e2e',
                'local-db-redemption-e2e', 'Y', 'N', now(), now()
            )
            """,
            (
                shop_account_id,
                user_no,
                f"local-db-redemption-e2e-shop-{suffix}",
                f"local-db-redemption-e2e-account-{suffix}",
            ),
        )
print(json.dumps({
    "userNo": user_no,
    "shopAccountId": shop_account_id,
    "suffix": suffix,
    "codeSuffix": code_suffix,
    "userName": user_name,
    "bizName": biz_name,
}, ensure_ascii=False))
  `, [suffix, codeSuffix]));
}

async function createContractRequest(currentFixture) {
  return apiJson('/v1/api/contracts/requests', {
    method: 'POST',
    body: {
      user_no: currentFixture.userNo,
      request_shop_types: ['NAVER'],
      product_code: 'MP',
      sales_amount: 3200000,
      representative_age: 45,
      identity_confirmed: true,
      identity_verification_method: 'mock',
      identity_verification_status: 'mock_verified',
      identity_verification_reference: `REDEMPTION-E2E-${currentFixture.suffix}`,
      terms_agreed: true,
      submitted_document_types: ['CBInfo', 'regNo'],
      requested_by: 'local-db-redemption-e2e',
    },
  });
}

async function seedProvision(currentFixture, prefix, amount) {
  const code = `${prefix}${currentFixture.codeSuffix}`;
  await apiJson(`/v1/api/redemptions/${encodeURIComponent(currentFixture.mbid)}/provisions`, {
    method: 'POST',
    body: {
      request_code: `RQ${prefix}${currentFixture.codeSuffix}`,
      provision_code: code,
      total_payment_amount: amount,
      total_usage_fee: 0,
      total_provision_amount: amount,
      status: 'PROVISION',
      operated_by: 'local-admin',
      reason: '실DB 상환 UI E2E seed',
      sales: [],
    },
  });
}

async function expectLatestAmounts(mbid, expected) {
  expect(readLatestAmounts(mbid)).toMatchObject(expected);
}

async function apiJson(pathname, options = {}) {
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

function readLatestAmounts(mbid) {
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
                coalesce(cumulative_provision_amount, 0),
                coalesce(cumulative_repayment_amount, 0),
                coalesce(outstanding_balance, 0)
            from moneybank_redemption_history
            where mbid = %s
            order by reg_date desc nulls last, id desc
            limit 1
            """,
            (mbid,),
        )
        row = cur.fetchone()

print(json.dumps({
    "provision": row[0] if row else 0,
    "repayment": row[1] if row else 0,
    "balance": row[2] if row else 0,
}, ensure_ascii=False))
  `, [mbid]));
}

function readPersistedOperations(mbid, codeSuffix) {
  return JSON.parse(runPython(`
import json
import sys
from cubici_service.db.connection import get_connection

mbid = sys.argv[1]
code_suffix = sys.argv[2]
with get_connection() as conn:
    with conn.cursor() as cur:
        cur.execute("select count(*) from moneybank_redemption_provision where mbid = %s", (mbid,))
        provision_count = cur.fetchone()[0]
        cur.execute("select count(*) from moneybank_redemption_repayment where mbid = %s", (mbid,))
        repayment_count = cur.fetchone()[0]
        cur.execute("select count(*) from moneybank_redemption_sales where mbid = %s", (mbid,))
        sales_count = cur.fetchone()[0]
        cur.execute("select count(*) from moneybank_redemption_deposit where mbid = %s", (mbid,))
        deposit_count = cur.fetchone()[0]
        cur.execute("select count(*) from moneybank_redemption_operation_history where mbid = %s", (mbid,))
        operation_count = cur.fetchone()[0]
        cur.execute(
            """
            select count(*)
            from moneybank_redemption_operation_history
            where mbid = %s and canceled_by_operation_history_id is not null
            """,
            (mbid,),
        )
        canceled_original_count = cur.fetchone()[0]
        cur.execute(
            """
            select count(*)
            from moneybank_redemption_operation_history
            where mbid = %s and is_reversal is true
            """,
            (mbid,),
        )
        reversal_count = cur.fetchone()[0]
        cur.execute(
            """
            select
                coalesce(cumulative_provision_amount, 0),
                coalesce(cumulative_repayment_amount, 0),
                coalesce(outstanding_balance, 0)
            from moneybank_redemption_history
            where mbid = %s
            order by reg_date desc nulls last, id desc
            limit 1
            """,
            (mbid,),
        )
        latest = cur.fetchone()

print(json.dumps({
    "provision_count": provision_count,
    "repayment_count": repayment_count,
    "sales_count": sales_count,
    "deposit_count": deposit_count,
    "operation_count": operation_count,
    "canceled_original_count": canceled_original_count,
    "reversal_count": reversal_count,
    "latest_provision": latest[0],
    "latest_repayment": latest[1],
    "latest_balance": latest[2],
}, ensure_ascii=False))
  `, [mbid, codeSuffix]));
}

function cleanupRedemptionFixture(currentFixture) {
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
            cur.execute("delete from moneybank_redemption_operation_history where mbid = %s", (target_mbid,))
            cur.execute("delete from moneybank_redemption_history where mbid = %s", (target_mbid,))
            cur.execute("delete from moneybank_redemption_deposit where mbid = %s", (target_mbid,))
            cur.execute("delete from moneybank_redemption_sales where mbid = %s", (target_mbid,))
            cur.execute("delete from moneybank_redemption_repayment where mbid = %s", (target_mbid,))
            cur.execute("delete from moneybank_redemption_provision where mbid = %s", (target_mbid,))
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
