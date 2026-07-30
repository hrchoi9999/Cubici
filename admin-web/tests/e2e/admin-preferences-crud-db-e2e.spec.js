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
test.setTimeout(180_000);

let fixture = null;

test.afterEach(() => {
  if (fixture) {
    cleanupPreferenceFixture(fixture);
    fixture = null;
  }
});

test('admin account approval, update, and delete persist with real database through admin UI', async ({ page, request }) => {
  fixture = makeFixture();
  await createPreferenceFixture(request, fixture, ['admin']);

  await approveUpdateAndDeleteAdmin(page, fixture);
  expect(readPreferenceState(fixture)).toMatchObject({ admin_count: 0 });
});

test('charge update and delete persist with real database through admin UI', async ({ page, request }) => {
  fixture = makeFixture();
  await createPreferenceFixture(request, fixture, ['charge']);

  await updateAndDeleteCharge(page, fixture);
  expect(readPreferenceState(fixture)).toMatchObject({ charge_count: 0 });
});

test('partner update and delete persist with real database through admin UI', async ({ page, request }) => {
  fixture = makeFixture();
  await createPreferenceFixture(request, fixture, ['partner']);

  await updateAndDeletePartner(page, fixture);
  expect(readPreferenceState(fixture)).toMatchObject({
    partner_count: 0,
    partner_manager_count: 0,
  });
});

test('promotion update and delete persist with real database through admin UI', async ({ page, request }) => {
  fixture = makeFixture();
  await createPreferenceFixture(request, fixture, ['charge', 'promotion']);

  await updateAndDeletePromotion(page, fixture);
  expect(readPreferenceState(fixture)).toMatchObject({
    promotion_count: 0,
    promotion_charge_count: 0,
  });
});

test('moneybank product update persists with real database through admin UI', async ({ page, request }) => {
  fixture = makeFixture();
  await createPreferenceFixture(request, fixture, ['product']);

  await updateMoneybankProduct(page, fixture);
  expect(readPreferenceState(fixture)).toMatchObject({
    product_name: `선정산 테스트상품 수정 ${fixture.shortSuffix}`,
    firm_name: `머니뱅크 제휴사 수정 ${fixture.shortSuffix}`,
  });
});

async function approveUpdateAndDeleteAdmin(page, currentFixture) {
  await page.goto(`${adminBaseUrl}/admin/cubici/adminPreference/adminRegister_tab1`);
  const searchForm = page.locator('form.searchArea');
  await searchForm.getByLabel('이름').fill(currentFixture.adminName);
  await searchForm.getByRole('button', { name: '검색' }).click();

  const pendingRow = page.locator('tbody tr').filter({ hasText: currentFixture.adminName });
  await expect(pendingRow).toContainText('대기');
  await pendingRow.getByRole('button', { name: '보기' }).click();

  const panel = page.locator('.adminAccountPanel');
  await expect(panel.getByRole('heading', { name: '관리자 등록 승인' })).toBeVisible();
  await panel.getByLabel('관리자 아이디').fill(currentFixture.approvedAdminId);
  await panel.getByRole('button', { name: '중복확인' }).click();
  await expect(page.getByText('사용 가능한 아이디 입니다.')).toBeVisible();
  await panel.getByLabel('관리자 비밀번호').fill('local-db-admin-e2e-password');
  await panel.getByLabel('접근등급').selectOption('01');
  const approveResponsePromise = waitForApiResponse(page, `/v1/api/preferences/admin-accounts/${currentFixture.pendingAdminId}/approve`, 'POST');
  await panel.getByRole('button', { name: '등록 승인' }).click();
  await expectApiResponse(approveResponsePromise);
  await expect(page.getByText('관리자를 승인했습니다.')).toBeVisible();
  expect(readAdminState(currentFixture.approvedAdminId)).toMatchObject({
    admin_grade: '01',
    approved: true,
  });

  await panel.getByLabel('부서명').fill('검증팀수정');
  await expect(panel.getByRole('button', { name: '정보 수정' })).toBeEnabled();
  const updateResponsePromise = waitForApiResponse(page, `/v1/api/preferences/admin-accounts/${currentFixture.approvedAdminId}`, 'PUT');
  await panel.getByRole('button', { name: '정보 수정' }).click();
  await expectApiResponse(updateResponsePromise);
  await expect(page.getByText('관리자 정보를 수정했습니다.')).toBeVisible();
  expect(readAdminState(currentFixture.approvedAdminId)).toMatchObject({
    admin_department: '검증팀수정',
    modified: true,
  });

  const deleteResponsePromise = waitForApiResponse(page, `/v1/api/preferences/admin-accounts/${currentFixture.approvedAdminId}`, 'DELETE');
  await panel.getByRole('button', { name: '등록 해지' }).click();
  await expectApiResponse(deleteResponsePromise);
  await expect(page.getByText('관리자 등록을 해지했습니다.')).toBeVisible();
}

async function updateAndDeleteCharge(page, currentFixture) {
  await page.goto(`${adminBaseUrl}/admin/cubici/adminPreference/manageCharge`);
  const searchForm = page.locator('form.searchArea');
  await searchForm.getByLabel('요금제명').fill(currentFixture.chargeName);
  await searchForm.getByRole('button', { name: '검색' }).click();

  const chargeRow = page.locator('tbody tr').filter({ hasText: currentFixture.chargeCode });
  await expect(chargeRow).toContainText(currentFixture.chargeName);
  await chargeRow.getByRole('button', { name: '보기' }).click();

  const editor = page.locator('.chargeEditorPanel');
  await expect(editor.getByRole('heading', { name: '요금제 수정' })).toBeVisible();
  await expect(editor.getByLabel('요금제명')).toHaveValue(currentFixture.chargeName);
  await editor.getByLabel('요금제명').fill(`${currentFixture.chargeName} 수정`);
  await editor.getByLabel('기준금액').fill('31000');
  const updateResponsePromise = waitForApiResponse(page, `/v1/api/preferences/charges/${currentFixture.chargeCode}`, 'PUT');
  await editor.getByRole('button', { name: '수정' }).click();
  const updatePayload = await expectApiJsonResponse(updateResponsePromise);
  expect(updatePayload.charge).toMatchObject({
    charge_name: `${currentFixture.chargeName} 수정`,
    amount: 31000,
  });
  await expect(page.getByText('요금제를 수정했습니다.')).toBeVisible();
  expect(readChargeState(currentFixture.chargeCode)).toMatchObject({
    charge_name: `${currentFixture.chargeName} 수정`,
    amount: 31000,
  });

  const deleteResponsePromise = waitForApiResponse(page, `/v1/api/preferences/charges/${currentFixture.chargeCode}`, 'DELETE');
  await editor.getByRole('button', { name: '삭제' }).click();
  await expectApiResponse(deleteResponsePromise);
  await expect(page.getByText('요금제를 삭제했습니다.')).toBeVisible();
}

async function updateAndDeletePartner(page, currentFixture) {
  await page.goto(`${adminBaseUrl}/admin/cubici/adminPreference/managePartner`);
  const searchForm = page.locator('form.searchArea');
  await searchForm.getByLabel('회사명').fill(currentFixture.partnerName);
  await searchForm.getByRole('button', { name: '검색' }).click();

  const partnerRow = page.locator('tbody tr').filter({ hasText: currentFixture.partnerCode });
  await expect(partnerRow).toContainText(currentFixture.partnerName);
  await partnerRow.getByRole('button', { name: '상세보기' }).click();

  const editor = page.locator('.partnerEditorPanel');
  await expect(editor.getByRole('heading', { name: '협력사 상세' })).toBeVisible();
  await expect(editor.getByLabel('회사명')).toHaveValue(currentFixture.partnerName);
  await editor.getByLabel('회사명').fill(`${currentFixture.partnerName} 수정`);
  await editor.getByLabel('대표이사').fill('수정대표');
  const updateResponsePromise = waitForApiResponse(page, `/v1/api/preferences/partners/${currentFixture.partnerId}`, 'PUT');
  await editor.getByRole('button', { name: '수정' }).click();
  await expectApiResponse(updateResponsePromise);
  await expect(page.getByText('협력사를 수정했습니다.')).toBeVisible();
  expect(readPartnerState(currentFixture.partnerId)).toMatchObject({
    partner_name: `${currentFixture.partnerName} 수정`,
    rep_name: '수정대표',
    manager_count: 2,
  });

  const deleteResponsePromise = waitForApiResponse(page, `/v1/api/preferences/partners/${currentFixture.partnerId}`, 'DELETE');
  await editor.getByRole('button', { name: '삭제' }).click();
  await expectApiResponse(deleteResponsePromise);
  await expect(page.getByText('협력사를 삭제했습니다.')).toBeVisible();
}

async function updateAndDeletePromotion(page, currentFixture) {
  await page.goto(`${adminBaseUrl}/admin/cubici/adminPreference/managePromotion`);
  const searchForm = page.locator('form.searchArea');
  await searchForm.getByLabel('연계코드').fill(currentFixture.promoCode);
  await searchForm.getByRole('button', { name: '검색' }).click();

  const promotionRow = page.locator('tbody tr').filter({ hasText: currentFixture.promoCode });
  await expect(promotionRow).toContainText(currentFixture.promoName);
  await promotionRow.getByRole('button', { name: '상세보기' }).click();

  const editor = page.locator('.promotionEditorPanel');
  await expect(editor.getByRole('heading', { name: '연계코드 상세' })).toBeVisible();
  await expect(editor.getByLabel('연계코드명')).toHaveValue(currentFixture.promoName);
  await editor.getByLabel('연계코드명').fill(`${currentFixture.promoName} 수정`);
  await editor.getByLabel('% 할인').fill('15');
  const updateResponsePromise = waitForApiResponse(page, `/v1/api/preferences/promotions/${currentFixture.promoCode}`, 'PUT');
  await editor.getByRole('button', { name: '수정' }).click();
  await expectApiResponse(updateResponsePromise);
  await expect(page.getByText('연계코드를 수정했습니다.')).toBeVisible();
  expect(readPromotionState(currentFixture.promoCode)).toMatchObject({
    promo_name: `${currentFixture.promoName} 수정`,
    discount_rate: 15,
    promotion_charge_count: 1,
  });

  const deleteResponsePromise = waitForApiResponse(page, `/v1/api/preferences/promotions/${currentFixture.promoCode}`, 'DELETE');
  await editor.getByRole('button', { name: '삭제' }).click();
  await expectApiResponse(deleteResponsePromise);
  await expect(page.getByText('연계코드를 삭제했습니다.')).toBeVisible();
}

async function updateMoneybankProduct(page, currentFixture) {
  await page.goto(`${adminBaseUrl}/admin/cubici/adminPreference/manageMoneybank_tab1`);
  const searchForm = page.locator('form.legacySearchBox');
  await searchForm.locator('input[name="firmName"]').fill(currentFixture.firmName);
  await searchForm.getByRole('button', { name: '검색' }).click();

  const productRow = page.locator('tbody tr').filter({ hasText: currentFixture.firmName });
  await expect(productRow).toContainText(currentFixture.productName);
  await productRow.getByRole('button', { name: '보기' }).click();

  const editor = page.locator('.moneybankProductPanel');
  await expect(editor.getByRole('heading', { name: '상품 상세' })).toBeVisible();
  await expect(editor.getByLabel('상품명')).toHaveValue(currentFixture.productName);
  await editor.getByLabel('상품명').fill(`선정산 테스트상품 수정 ${currentFixture.shortSuffix}`);
  await editor.getByLabel('회사명').fill(`머니뱅크 제휴사 수정 ${currentFixture.shortSuffix}`);
  const updateResponsePromise = waitForApiResponse(page, `/v1/api/preferences/moneybank-products/${currentFixture.firmNo}`, 'PUT');
  await editor.getByRole('button', { name: '수정' }).click();
  await expectApiResponse(updateResponsePromise);
  await expect(page.getByText('머니뱅크 상품을 수정했습니다.')).toBeVisible();
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

async function expectApiJsonResponse(responsePromise) {
  const response = await responsePromise;
  const text = await response.text();
  expect(response.ok(), text).toBeTruthy();
  return text ? JSON.parse(text) : null;
}

function makeFixture() {
  const suffix = String(Date.now()).slice(-8);
  const shortSuffix = suffix.slice(-4);
  return {
    suffix,
    shortSuffix,
    pendingAdminId: null,
    approvedAdminId: `adm${suffix.slice(-6)}`,
    adminName: `관리자실DB${suffix}`,
    chargeCode: `C${shortSuffix}`,
    chargeName: `요금제실DB${shortSuffix}`,
    promoCode: `PROMO${suffix}`,
    promoName: `연계실DB${suffix}`,
    partnerId: `P${suffix.slice(-9)}`,
    partnerCode: `P${shortSuffix}`,
    partnerName: `협력사실DB${suffix}`,
    firmNo: null,
    firmId: `F${suffix}`,
    firmName: `머니뱅크 제휴사 ${suffix}`,
    productName: `선정산 테스트상품 ${suffix}`,
  };
}

async function createPreferenceFixture(request, currentFixture, scopes) {
  const scopeSet = new Set(scopes);

  if (scopeSet.has('admin')) {
    const adminResponse = await request.post(`${apiBaseUrl}/v1/api/preferences/admin-accounts/request`, {
      data: {
        admin_type: '00',
        admin_name: currentFixture.adminName,
        admin_phone: '01000000000',
        admin_email: `admin-pref-${currentFixture.suffix}@example.test`,
        admin_department: '검증팀',
      },
    });
    expect(adminResponse.ok()).toBeTruthy();
    currentFixture.pendingAdminId = (await adminResponse.json()).admin_id;
  }

  if (scopeSet.has('charge')) {
    await expectOk(request.post(`${apiBaseUrl}/v1/api/preferences/charges`, {
      data: {
        charge_code: currentFixture.chargeCode,
        charge_name: currentFixture.chargeName,
        charge_type: 'B',
        start_date: '2026-07-01',
        expire_date: '2099-12-31',
        sub_id: 1,
        sales_count: '30',
        product_count: '10',
        amount: 29000,
        period: 1,
        period_unit: 'M',
        charge_detail: '실DB 설정 E2E 요금제',
      },
    }));
  }

  if (scopeSet.has('partner')) {
    await expectOk(request.post(`${apiBaseUrl}/v1/api/preferences/partners`, {
      data: {
        partner_id: currentFixture.partnerId,
        partner_code: currentFixture.partnerCode,
        partner_name: currentFixture.partnerName,
        rep_name: '대표',
        partner_zip: '12345',
        partner_address: '서울',
        partner_status: '00',
        partner_type: 'BA',
        memo: '실DB 설정 E2E 협력사',
        managers: [
          {
            manager_type: '00',
            manager_name: '책임자',
            manager_rank: '팀장',
            manager_email: `partner-owner-${currentFixture.suffix}@example.test`,
            manager_phone: '01011112222',
          },
          {
            manager_type: '01',
            manager_name: '담당자',
            manager_rank: '매니저',
            manager_email: `partner-manager-${currentFixture.suffix}@example.test`,
            manager_phone: '01022223333',
          },
        ],
      },
    }));
  }

  if (scopeSet.has('promotion')) {
    await expectOk(request.post(`${apiBaseUrl}/v1/api/preferences/promotions`, {
      data: {
        promo_code: currentFixture.promoCode,
        promo_name: currentFixture.promoName,
        promo_target: 'N',
        partner_code: 'CBCI',
        charge_codes: [currentFixture.chargeCode],
        start_date: '2026-07-01',
        expire_date: '2099-12-31',
        sub_id: 1,
        discount_rate: 10,
        discount_amount: null,
        period: 1,
        period_unit: 'M',
        promo_detail: '실DB 설정 E2E 연계코드',
      },
    }));
  }

  if (scopeSet.has('product')) {
    const productResponse = await request.post(`${apiBaseUrl}/v1/api/preferences/moneybank-products`, {
      data: {
        firm_id: currentFixture.firmId,
        firm_name: currentFixture.firmName,
        rep_name: '대표',
        firm_zip: '12345',
        firm_address: '서울',
        manager_name: '담당자',
        manager_rank: '팀장',
        manager_phone: '01000000000',
        firm_tel: '0212345678',
        firm_email: `moneybank-product-${currentFixture.suffix}@example.test`,
        division: 'PREPAY',
        product_name: currentFixture.productName,
        product_status: '00',
        min_sales_amount: 1000000,
        min_calc_amount: 100000,
        amount_limit: 50000000,
        service_amount_min: 100000,
        service_amount_max: 5000000,
        execute_amount_min: 100000,
        execute_amount_max: 3000000,
        service_fee_min: 1.5,
        service_fee_max: 3,
        annual_fee_rate: 12,
        interest_min: 0.1,
        interest_max: 0.5,
        limit_change_yn: 'Y',
        service_repay_min: 7,
        service_repay_max: 30,
        extension_yn: 'N',
        launch_date: '2026-07-01',
        expire_date: '2099-12-31',
        repayment_count: 1,
        repay_amount: 1000000,
        mid_repay_yn: 'Y',
        product_type: 'STD',
      },
    });
    expect(productResponse.ok()).toBeTruthy();
    currentFixture.firmNo = (await productResponse.json()).firm_no;
  }
}

async function expectOk(responsePromise) {
  const response = await responsePromise;
  expect(response.ok()).toBeTruthy();
}

function readAdminState(adminId) {
  return JSON.parse(runPython(`
import json
import sys
from cubici_service.db.connection import get_connection

with get_connection() as conn:
    with conn.cursor() as cur:
        cur.execute(
            """
            select admin_department, admin_grade, admin_approval_date is not null, modified_date is not null
            from admin_account
            where admin_id = %s
            """,
            (sys.argv[1],),
        )
        row = cur.fetchone()

print(json.dumps({
    "admin_department": row[0] if row else None,
    "admin_grade": row[1] if row else None,
    "approved": row[2] if row else False,
    "modified": row[3] if row else False,
}, ensure_ascii=False))
  `, [adminId]));
}

function readChargeState(chargeCode) {
  return JSON.parse(runPython(`
import json
import sys
from cubici_service.db.connection import get_connection

with get_connection() as conn:
    with conn.cursor() as cur:
        cur.execute("select charge_name, amount from charge where charge_code = %s", (sys.argv[1],))
        row = cur.fetchone()

print(json.dumps({
    "charge_name": row[0] if row else None,
    "amount": row[1] if row else None,
}, ensure_ascii=False))
  `, [chargeCode]));
}

function readPartnerState(partnerId) {
  return JSON.parse(runPython(`
import json
import sys
from cubici_service.db.connection import get_connection

with get_connection() as conn:
    with conn.cursor() as cur:
        cur.execute(
            """
            select p.partner_name, p.rep_name, count(pm.manager_type)::int
            from partner p
            left join partner_manager pm on pm.partner_code = p.partner_code
            where p.partner_id = %s
            group by p.partner_name, p.rep_name
            """,
            (sys.argv[1],),
        )
        row = cur.fetchone()

print(json.dumps({
    "partner_name": row[0] if row else None,
    "rep_name": row[1] if row else None,
    "manager_count": row[2] if row else 0,
}, ensure_ascii=False))
  `, [partnerId]));
}

function readPromotionState(promoCode) {
  return JSON.parse(runPython(`
import json
import sys
from cubici_service.db.connection import get_connection

with get_connection() as conn:
    with conn.cursor() as cur:
        cur.execute(
            """
            select p.promo_name, p.discount_rate, count(pc.charge_code)::int
            from promotion p
            left join promotion_charge pc on pc.promo_code = p.promo_code
            where p.promo_code = %s
            group by p.promo_name, p.discount_rate
            """,
            (sys.argv[1],),
        )
        row = cur.fetchone()

print(json.dumps({
    "promo_name": row[0] if row else None,
    "discount_rate": row[1] if row else None,
    "promotion_charge_count": row[2] if row else 0,
}, ensure_ascii=False))
  `, [promoCode]));
}

function readPreferenceState(currentFixture) {
  return JSON.parse(runPython(`
import json
import sys
from cubici_service.db.connection import get_connection

pending_admin_id, approved_admin_id, charge_code, partner_id, partner_code, promo_code, firm_no = sys.argv[1:]
with get_connection() as conn:
    with conn.cursor() as cur:
        cur.execute("select count(*)::int from admin_account where admin_id in (%s, %s)", (pending_admin_id, approved_admin_id))
        admin_count = cur.fetchone()[0]
        cur.execute("select count(*)::int from charge where charge_code = %s", (charge_code,))
        charge_count = cur.fetchone()[0]
        cur.execute("select count(*)::int from partner where partner_id = %s", (partner_id,))
        partner_count = cur.fetchone()[0]
        cur.execute("select count(*)::int from partner_manager where partner_code = %s", (partner_code,))
        partner_manager_count = cur.fetchone()[0]
        cur.execute("select count(*)::int from promotion where promo_code = %s", (promo_code,))
        promotion_count = cur.fetchone()[0]
        cur.execute("select count(*)::int from promotion_charge where promo_code = %s", (promo_code,))
        promotion_charge_count = cur.fetchone()[0]
        cur.execute(
            """
            select mp.firm_name, mpp.product_name
            from moneybank_partner mp
            left join moneybank_product_preference mpp on mpp.firm_no = mp.firm_no
            where mp.firm_no = %s
            """,
            (int(firm_no),),
        )
        product_row = cur.fetchone()

print(json.dumps({
    "admin_count": admin_count,
    "charge_count": charge_count,
    "partner_count": partner_count,
    "partner_manager_count": partner_manager_count,
    "promotion_count": promotion_count,
    "promotion_charge_count": promotion_charge_count,
    "firm_name": product_row[0] if product_row else None,
    "product_name": product_row[1] if product_row else None,
}, ensure_ascii=False))
  `, [
    currentFixture.pendingAdminId ?? '',
    currentFixture.approvedAdminId,
    currentFixture.chargeCode,
    currentFixture.partnerId,
    currentFixture.partnerCode,
    currentFixture.promoCode,
    String(currentFixture.firmNo ?? 0),
  ]));
}

function cleanupPreferenceFixture(currentFixture) {
  runPython(`
import sys
from cubici_service.db.connection import get_connection

pending_admin_id, approved_admin_id, charge_code, partner_id, partner_code, promo_code, firm_no = sys.argv[1:]
with get_connection() as conn:
    with conn.cursor() as cur:
        cur.execute("delete from promotion_charge where promo_code = %s or charge_code = %s", (promo_code, charge_code))
        cur.execute("delete from promotion where promo_code = %s", (promo_code,))
        cur.execute("delete from partner_manager where partner_code = %s", (partner_code,))
        cur.execute("delete from partner where partner_id = %s", (partner_id,))
        cur.execute("delete from charge where charge_code = %s", (charge_code,))
        cur.execute("delete from admin_account where admin_id in (%s, %s)", (pending_admin_id, approved_admin_id))
        if firm_no and firm_no != 'null':
            cur.execute("delete from moneybank_product_preference where firm_no = %s", (int(firm_no),))
            cur.execute("delete from moneybank_partner where firm_no = %s", (int(firm_no),))
  `, [
    currentFixture.pendingAdminId ?? '',
    currentFixture.approvedAdminId,
    currentFixture.chargeCode,
    currentFixture.partnerId,
    currentFixture.partnerCode,
    currentFixture.promoCode,
    String(currentFixture.firmNo ?? 0),
  ]);
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
