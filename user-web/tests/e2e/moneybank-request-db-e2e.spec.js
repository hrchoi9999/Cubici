import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '../../../admin-web/node_modules/@playwright/test/index.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const userRoot = path.resolve(__dirname, '..', '..');
const cubiciRoot = path.resolve(userRoot, '..');
const workspaceRoot = path.resolve(cubiciRoot, '..');
const serviceApiRoot = path.join(cubiciRoot, 'service-api');
const pythonExe = path.join(workspaceRoot, '.venv', 'Scripts', 'python.exe');
const workspaceTmpRoot = path.join(workspaceRoot, '.tmp', 'cubici-user-web-e2e');
const apiBaseUrl = process.env.CUBICI_API_BASE_URL || process.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

test.skip(process.env.CUBICI_RUN_DB_E2E !== '1', 'set CUBICI_RUN_DB_E2E=1 to run local PostgreSQL UI E2E tests');

let fixture = null;

test.afterEach(() => {
  if (fixture) {
    cleanupRequestFixture(fixture);
    fixture = null;
  }
});

test('legacy moneybank clause detail routes render migrated full text markers', async ({ page }) => {
  const clauses = [
    ['/moneybank/advcalc/request/clause-details/1', '개인(신용)정보 수집·이용 동의서', '쇼핑몰 OPEN API key'],
    ['/moneybank/advcalc/request/clause-details/2', '개인(신용)정보 제공 동의서', '㈜하이픈코퍼레이션'],
    ['/moneybank/advcalc/request/clause-details/3', '개인(신용)정보 조회 동의서', '조회동의 효력 기간'],
    ['/moneybank/advcalc/request/clause-details/4', '선정산 서비스 약관', '이 약관은 2022년 1월 3일부터 효력을 발생합니다.'],
  ];

  for (const [route, title, marker] of clauses) {
    await page.goto(route);
    await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();
    await expect(page.getByText('전문 이관본')).toBeVisible();
    await expect(page.getByText(marker)).toBeVisible();
    await expect(page.getByText('운영 테스트용 요약본')).toHaveCount(0);
  }
});

test('user moneybank request screen creates contract and uploads required documents with database API', async ({ page }) => {
  fixture = createRequestFixture();
  fs.mkdirSync(workspaceTmpRoot, { recursive: true });
  const regFile = path.join(workspaceTmpRoot, `cubici-reg-${fixture.suffix}.pdf`);
  const cbFile = path.join(workspaceTmpRoot, `cubici-cb-${fixture.suffix}.pdf`);
  fs.writeFileSync(regFile, '%PDF-1.4\n% cubici request e2e business registration\n');
  fs.writeFileSync(cbFile, '%PDF-1.4\n% cubici request e2e identity document\n');
  fixture.tempFiles = [regFile, cbFile];

  await page.addInitScript((session) => {
    window.localStorage.setItem('cubiciUserAuth', JSON.stringify(session));
  }, fixture.session);

  await page.goto('/moneybank/request');

  await expect(page.getByRole('heading', { name: '머니뱅크 신청' })).toBeVisible();
  await expect(page.locator(`input[value="${fixture.userNo}"]`)).toBeVisible();
  await expect(page.locator(`input[value="${fixture.bizName}"]`)).toBeVisible();
  await expect(page.getByLabel('네이버')).toBeChecked();

  await page.getByLabel('사업자등록증').setInputFiles(regFile);
  await page.getByLabel('대표자 신분증').setInputFiles(cbFile);
  await page.getByLabel('본인확인 생년월일').fill('800101');
  await page.getByLabel('주민등록증 발급정보').fill('1234');
  await page.getByRole('button', { name: '본인확인 mock 실행' }).click();
  await expect(page.getByText('주민등록증 진위확인 mock 완료')).toBeVisible();
  await page.getByLabel('머니뱅크 신청 약관에 동의합니다.').check();
  await page.getByRole('button', { name: '서비스 신청' }).click();

  const mbid = await waitForLatestContractWithDocuments(fixture.userNo, 2);
  fixture.mbid = mbid;
  await expectContractCreated({ mbid, userNo: fixture.userNo });
  await expectUploadedDocumentCount(mbid, 2);
  await page.goto('/moneybank/processContinue');
  await expect(page).toHaveURL(/\/moneybank\/advcalc\/evaluate$/);
  await expect(page.getByRole('heading', { name: '매출 선정산 검토 및 심사' })).toBeVisible();
});

test('legacy advcalc request route stores account fields and required documents with database API', async ({ page }) => {
  fixture = createRequestFixture();
  fs.mkdirSync(workspaceTmpRoot, { recursive: true });
  const filePaths = {
    regNo: path.join(workspaceTmpRoot, `cubici-advcalc-reg-${fixture.suffix}.pdf`),
    cbInfo: path.join(workspaceTmpRoot, `cubici-advcalc-cb-${fixture.suffix}.pdf`),
    demandAccCopy: path.join(workspaceTmpRoot, `cubici-advcalc-demand-${fixture.suffix}.pdf`),
    mainAccCopy: path.join(workspaceTmpRoot, `cubici-advcalc-main-${fixture.suffix}.pdf`),
    transferConsent: path.join(workspaceTmpRoot, `cubici-advcalc-consent-${fixture.suffix}.pdf`),
  };
  for (const filePath of Object.values(filePaths)) {
    fs.writeFileSync(filePath, '%PDF-1.4\n% cubici advcalc request e2e document\n');
  }
  fixture.tempFiles = Object.values(filePaths);

  await page.addInitScript((session) => {
    window.localStorage.setItem('cubiciUserAuth', JSON.stringify(session));
  }, fixture.session);

  await page.goto('/moneybank/advcalc/request');

  await expect(page.getByRole('heading', { name: '매출 선정산 신청' })).toBeVisible();
  await expect(page.getByLabel('네이버')).toBeChecked();
  await page.getByLabel('정산계좌 예금주').fill('정산예금주');
  await page.getByLabel('정산계좌 번호').fill('1234567890');
  await page.getByLabel('주거래계좌 예금주').fill('주거래예금주');
  await page.getByLabel('주거래계좌 번호').fill('9876543210');
  await page.getByLabel('본인확인 방식').selectOption('driver_license');
  await page.getByLabel('본인확인 생년월일').fill('810202');
  await page.getByLabel('운전면허번호').fill('1212345678');
  await page.getByLabel('사업자등록증').setInputFiles(filePaths.regNo);
  await page.getByLabel('대표자 신분증').setInputFiles(filePaths.cbInfo);
  await page.getByLabel('정산계좌 통장사본').setInputFiles(filePaths.demandAccCopy);
  await page.getByLabel('주거래 통장사본').setInputFiles(filePaths.mainAccCopy);
  await page.getByLabel('출금이체 동의서').setInputFiles(filePaths.transferConsent);
  await page.getByRole('button', { name: '본인확인 mock 실행' }).click();
  await expect(page.getByText('운전면허 진위확인 mock 완료')).toBeVisible();
  await page.getByLabel('머니뱅크 신청 약관에 동의합니다.').check();
  await page.getByRole('button', { name: '선정산 신청' }).click();

  const mbid = await waitForLatestContractWithDocuments(fixture.userNo, 5);
  fixture.mbid = mbid;
  await expectContractCreated({ mbid, userNo: fixture.userNo });
  await expectContractAccountFields(mbid, fixture.userNo);
  await expectUploadedDocumentCount(mbid, 5);

  await page.goto('/moneybank/advcalc/request/clause-details/4');
  await expect(page.getByRole('heading', { level: 1, name: '선정산 서비스 약관' })).toBeVisible();
  await page.goto('/moneybank/advcalc/contractForm');
  await expect(page.getByRole('heading', { name: '매출 선정산 계약 체결' })).toBeVisible();
  await page.goto('/moneybank/processEnd');
  await expect(page).toHaveURL(/\/moneybank\/current$/);
  await page.goto('/cubici/moneybank/together/depositTest');
  await expect(page.getByRole('heading', { name: '투게더펀딩 입금 테스트' })).toBeVisible();
});

function createRequestFixture() {
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
        email = f"local-db-request-e2e-{suffix}@example.test"
        user_name = f"ReqUIUser{suffix}"
        biz_name = f"ReqUIBiz{suffix}"
        biz_num = suffix.ljust(10, "0")[:10]
        cur.execute(
            """
            insert into users (
                user_no, email, password, user_type, name, phone, biz_num,
                biz_name, biz_setup_date, biz_type, sectors, fintech_id,
                reg_date, modified_date
            ) values (
                %s, %s, 'local-db-request-e2e', 'USER', %s, '01000000000',
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
                %s, %s, 'NAVER', %s, %s, 'local-db-request-e2e',
                'local-db-request-e2e', 'Y', 'N', now(), now()
            )
            """,
            (
                shop_account_id,
                user_no,
                f"local-db-request-e2e-shop-{suffix}",
                f"local-db-request-e2e-account-{suffix}",
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

async function waitForLatestContractWithDocuments(userNo, expectedCount) {
  let mbid = '';
  await expect.poll(async () => {
    const response = await apiJson(`/v1/api/contracts?limit=1&offset=0&user_no=${encodeURIComponent(userNo)}`);
    if (response.total < 1) {
      return 0;
    }
    mbid = response.items[0].mbid;
    const documents = await apiJson(`/v1/api/contracts/${encodeURIComponent(mbid)}/documents/files`);
    return documents.total;
  }, { timeout: 30000 }).toBe(expectedCount);
  return mbid;
}

async function expectContractCreated({ mbid, userNo }) {
  const detail = await apiJson(`/v1/api/contracts/${encodeURIComponent(mbid)}?user_no=${encodeURIComponent(userNo)}`);
  expect(detail.contract.user_no).toBe(userNo);
  expect(detail.contract.status).toBe('REQUEST');
  expect(detail.contract.identity_verification_status).toBe('mock_verified');
  expect(detail.contract.identity_verification_reference).toMatch(/^MOCK-/);
  expect(detail.shops.map((shop) => shop.contract_shop_type)).toEqual(['NAVER']);
}

async function expectUploadedDocumentCount(mbid, expectedCount) {
  const response = await apiJson(`/v1/api/contracts/${encodeURIComponent(mbid)}/documents/files`);
  expect(response.total).toBe(expectedCount);
  const divisions = response.items.map((item) => item.file_division).sort();
  if (expectedCount === 2) {
    expect(divisions).toEqual(['CBInfo', 'regNo']);
  } else {
    expect(divisions).toEqual(['CBInfo', 'demandAccCopy', 'mainAccCopy', 'regNo', 'transferConsent']);
  }
}

async function expectContractAccountFields(mbid, userNo) {
  const detail = await apiJson(`/v1/api/contracts/${encodeURIComponent(mbid)}?user_no=${encodeURIComponent(userNo)}`);
  expect(detail.contract.demand_acc_bank_code).toBe('039');
  expect(detail.contract.demand_acc_holder).toBe('정산예금주');
  expect(detail.contract.demand_acc_number).toBe('1234567890');
  expect(detail.contract.main_acc_bank_code).toBe('039');
  expect(detail.contract.main_acc_holder).toBe('주거래예금주');
  expect(detail.contract.main_acc_number).toBe('9876543210');
}

async function apiJson(pathname) {
  let response;
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      response = await fetch(`${apiBaseUrl}${pathname}`);
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

function cleanupRequestFixture(currentFixture) {
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
