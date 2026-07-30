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

let fixture = null;

test.afterEach(() => {
  if (fixture) {
    cleanupFullLifecycleFixture(fixture);
    fixture = null;
  }
});

test('moneybank request to account standby full lifecycle with user and admin screens', async ({ page }) => {
  fixture = createFullLifecycleFixture();
  fs.mkdirSync(tempRoot, { recursive: true });
  const regFile = path.join(tempRoot, `cubici-full-reg-${fixture.suffix}.pdf`);
  const cbFile = path.join(tempRoot, `cubici-full-cb-${fixture.suffix}.pdf`);
  fs.writeFileSync(regFile, '%PDF-1.4\n% cubici full lifecycle e2e business registration\n');
  fs.writeFileSync(cbFile, '%PDF-1.4\n% cubici full lifecycle e2e identity document\n');
  fixture.tempFiles = [regFile, cbFile];

  await page.addInitScript((session) => {
    window.localStorage.setItem('cubiciUserAuth', JSON.stringify(session));
  }, fixture.session);

  await submitUserRequest(page, fixture, regFile, cbFile);
  fixture.mbid = await latestContractMbid(fixture.userNo);
  await expectStatus(fixture.mbid, 'REQUEST');
  await expectUploadedDocumentCount(fixture.mbid, 2);
  await expectUserCurrentStatus(page, fixture, '신청접수');
  await expectAdminApprovalStatus(page, fixture, '신청접수');

  await presentTermsFromAdmin(page, fixture);
  await expectStatus(fixture.mbid, 'CONDITIONS_ACCEPT');
  await expectUserContractDetailStatus(page, fixture, '조건제시');

  await acceptTermsFromUser(page, fixture);
  await expectStatus(fixture.mbid, 'USE_AGREE');
  await expectUserCurrentStatus(page, fixture, '이용조건 동의');
  await expectAdminContractStatus(page, fixture, '이용조건 동의');

  await readyContractFromAdmin(page, fixture);
  await expectStatus(fixture.mbid, 'ACCOUNT_STANDBY');
  await expectAdminContractStatus(page, fixture, '계좌대기');

  await page.goto(`${userBaseUrl}/moneybank/current/${encodeURIComponent(fixture.mbid)}`);
  await expect(page.getByRole('heading', { name: '머니뱅크 계약 상세' })).toBeVisible();
  await expect(page.locator('input[value="계좌대기"]').first()).toBeVisible();
});

async function submitUserRequest(page, currentFixture, regFile, cbFile) {
  await page.goto(`${userBaseUrl}/moneybank/request`);

  await expect(page.getByRole('heading', { name: '머니뱅크 신청' })).toBeVisible();
  await expect(page.locator(`input[value="${currentFixture.userNo}"]`)).toBeVisible();
  await expect(page.locator(`input[value="${currentFixture.bizName}"]`)).toBeVisible();
  await expect(page.getByLabel('네이버')).toBeChecked();

  await page.getByLabel('사업자등록증').setInputFiles(regFile);
  await page.getByLabel('대표자 신분증').setInputFiles(cbFile);
  await page.getByLabel('본인확인 생년월일').fill('800101');
  await page.getByLabel('주민등록증 발급정보').fill('123456');
  await page.getByRole('button', { name: '본인확인 mock 실행' }).click();
  await expect(page.getByText(/주민등록증 진위확인 mock 완료/)).toBeVisible();
  await expect(page.getByLabel('본인확인을 완료했습니다.')).toBeChecked();
  await page.getByLabel('머니뱅크 신청 약관에 동의합니다.').check();
  await page.getByRole('button', { name: '서비스 신청' }).click();

  await expect(page.getByText(/신청 되었습니다!.*서류 2건 업로드 완료/)).toBeVisible({ timeout: 30_000 });
}

async function expectUserCurrentStatus(page, currentFixture, expectedLabel) {
  await page.goto(`${userBaseUrl}/moneybank/current`);
  await expect(page.getByRole('heading', { name: '머니뱅크 현황' })).toBeVisible();
  const currentRow = page.locator('tbody tr').filter({ hasText: currentFixture.mbid });
  await expect(currentRow).toContainText(expectedLabel);
}

async function expectUserContractDetailStatus(page, currentFixture, expectedLabel) {
  await page.goto(`${userBaseUrl}/moneybank/current/${encodeURIComponent(currentFixture.mbid)}`);
  await expect(page.getByRole('heading', { name: '머니뱅크 계약 상세' })).toBeVisible();
  await expect(page.locator(`input[value="${expectedLabel}"]`).first()).toBeVisible();
}

async function expectAdminApprovalStatus(page, currentFixture, expectedLabel) {
  await page.goto(`${adminBaseUrl}/admin/moneybank/approval_tab1`);
  await page.getByLabel('회원명').fill(currentFixture.userName);
  await page.getByRole('button', { name: '검색' }).click();
  const approvalRow = page.locator('tbody tr').filter({ hasText: currentFixture.userName });
  await expect(approvalRow).toContainText(currentFixture.bizName);
  await expect(approvalRow).toContainText(expectedLabel);
}

async function expectAdminContractStatus(page, currentFixture, expectedLabel) {
  await page.goto(`${adminBaseUrl}/admin/moneybank/approval_tab2`);
  await page.getByLabel('회원명').fill(currentFixture.userName);
  await page.getByRole('button', { name: '검색' }).click();
  const contractRow = page.locator('tbody tr').filter({ hasText: currentFixture.userName });
  await expect(contractRow).toContainText(currentFixture.bizName);
  await expect(contractRow).toContainText(expectedLabel);
}

async function presentTermsFromAdmin(page, currentFixture) {
  await page.goto(`${adminBaseUrl}/admin/moneybank/approval_tab1`);
  await page.getByLabel('회원명').fill(currentFixture.userName);
  await page.getByRole('button', { name: '검색' }).click();

  const reviewRow = page.locator('tbody tr').filter({ hasText: currentFixture.userName });
  await expect(reviewRow).toContainText(currentFixture.bizName);
  await reviewRow.getByRole('button', { name: '보기' }).click();

  await expect(page.getByRole('heading', { name: '심사 정보' })).toBeVisible();
  await page.getByLabel('지급율(%)').fill('80');
  await page.getByLabel('건당 주문한도').fill('700000');
  await page.getByLabel('최대 미상환잔액').fill('5000000');
  await page.getByLabel('조정사유').fill('full lifecycle e2e fee');
  await page.getByRole('button', { name: '수수료율 추가' }).click();
  await page.getByLabel('수수료 구분 1').fill('ADVANCE');
  await page.getByLabel('수수료율 1').fill('1.35');
  await page.getByRole('button', { name: '수수료율 추가' }).click();
  await page.getByLabel('수수료 구분 2').fill('REPAYMENT');
  await page.getByLabel('수수료율 2').fill('0.25');
  await page.getByRole('button', { name: '조건 저장' }).click();

  await expect(page.getByText('계약 조건 저장이 완료되었습니다.')).toBeVisible();
  await expect(page.getByRole('button', { name: '조건 제시' })).toBeEnabled();
  await page.getByRole('button', { name: '조건 제시' }).click();
  await expect(page.getByText('계약 상태 변경이 완료되었습니다.')).toBeVisible();
}

async function acceptTermsFromUser(page, currentFixture) {
  await page.goto(`${userBaseUrl}/moneybank/current/${encodeURIComponent(currentFixture.mbid)}`);

  await expect(page.getByRole('heading', { name: '머니뱅크 계약 상세' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '이용조건 확인' })).toBeVisible({ timeout: 15_000 });
  await expect(page.locator(`input[value="${currentFixture.mbid}"]`).first()).toBeVisible();
  await expect(page.locator('input[value="조건제시"]').first()).toBeVisible();
  await expect(page.getByText('80%')).toBeVisible();
  await expect(page.getByText('1.35%')).toBeVisible();

  await expect(page.getByRole('button', { name: '이용조건 동의' })).toBeEnabled();
  await page.getByRole('button', { name: '이용조건 동의' }).click();
  await expect(page.getByText('이용조건 동의가 저장되었습니다.')).toBeVisible();
}

async function readyContractFromAdmin(page, currentFixture) {
  await page.goto(`${adminBaseUrl}/admin/moneybank/approval_tab2`);
  await page.getByLabel('회원명').fill(currentFixture.userName);
  await page.getByRole('button', { name: '검색' }).click();

  const contractRow = page.locator('tbody tr').filter({ hasText: currentFixture.userName });
  await expect(contractRow).toContainText(currentFixture.bizName);
  await expect(contractRow).toContainText('동의');
  await contractRow.getByRole('button', { name: '보기' }).click();

  await expect(page.getByRole('heading', { name: '계약 정보' })).toBeVisible();
  await expect(page.getByRole('button', { name: '체결' })).toBeEnabled();
  await page.getByRole('button', { name: '체결' }).click();
  await expect(page.getByText('계약 상태 변경이 완료되었습니다.')).toBeVisible();
}

function createFullLifecycleFixture() {
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
        user_no = 7100000 + numeric_id
        shop_account_id = 8100000 + numeric_id
        email = f"local-db-full-e2e-{suffix}@example.test"
        user_name = f"FullUIUser{suffix}"
        biz_name = f"FullUIBiz{suffix}"
        biz_num = suffix.ljust(10, "0")[:10]
        cur.execute(
            """
            insert into users (
                user_no, email, password, user_type, name, phone, biz_num,
                biz_name, biz_setup_date, biz_type, sectors, fintech_id,
                reg_date, modified_date
            ) values (
                %s, %s, 'local-db-full-e2e', 'USER', %s, '01000000000',
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
                %s, %s, 'NAVER', %s, %s, 'local-db-full-e2e',
                'local-db-full-e2e', 'Y', 'N', now(), now()
            )
            """,
            (
                shop_account_id,
                user_no,
                f"local-db-full-e2e-shop-{suffix}",
                f"local-db-full-e2e-account-{suffix}",
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

async function latestContractMbid(userNo) {
  const response = await apiJson(`/v1/api/contracts?limit=1&offset=0&user_no=${encodeURIComponent(userNo)}`);
  expect(response.total).toBe(1);
  return response.items[0].mbid;
}

async function expectStatus(mbid, expectedStatus) {
  const detail = await apiJson(`/v1/api/contracts/${encodeURIComponent(mbid)}`);
  expect(detail.contract.status).toBe(expectedStatus);
}

async function expectUploadedDocumentCount(mbid, expectedCount) {
  const response = await apiJson(`/v1/api/contracts/${encodeURIComponent(mbid)}/documents/files`);
  expect(response.total).toBe(expectedCount);
  expect(response.items.map((item) => item.file_division).sort()).toEqual(['CBInfo', 'regNo']);
}

async function apiJson(pathname) {
  const response = await fetch(`${apiBaseUrl}${pathname}`, {
    headers: adminAuthHeaders(),
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

function cleanupFullLifecycleFixture(currentFixture) {
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
