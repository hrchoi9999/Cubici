import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '../../../admin-web/node_modules/@playwright/test/index.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const userRoot = path.resolve(__dirname, '..', '..');
const cubiciRoot = path.resolve(userRoot, '..');
const workspaceRoot = path.resolve(cubiciRoot, '..');
const serviceApiRoot = path.join(cubiciRoot, 'service-api');
const pythonExe = path.join(workspaceRoot, '.venv', 'Scripts', 'python.exe');

test.skip(process.env.CUBICI_RUN_DB_E2E !== '1', 'set CUBICI_RUN_DB_E2E=1 to run local PostgreSQL UI E2E tests');

let fixture = null;

test.afterEach(() => {
  if (fixture) {
    cleanupFixture(fixture);
    fixture = null;
  }
});

test('user commerce pages filter paginate expand export and render settlement calendar', async ({ page }) => {
  fixture = createFixture();
  await page.addInitScript((session) => {
    window.localStorage.setItem('cubiciUserAuth', JSON.stringify(session));
  }, fixture.session);

  await page.goto('/cubici/salesInfo/sales');
  await expect(page.getByRole('heading', { name: '판매현황' })).toBeVisible();
  await expect(page.getByText(fixture.firstOrderNo)).toBeVisible();
  await expect(page.getByRole('button', { name: '다음' })).toBeEnabled();
  await page.getByRole('button', { name: '다음' }).click();
  await expect(page.getByText(fixture.lastOrderNo)).toBeVisible();

  await page.getByLabel('검색어').fill(fixture.firstOrderNo);
  await expect(page.getByText(fixture.firstOrderNo)).toBeVisible();
  await page.getByRole('button', { name: '보기' }).first().click();
  await expect(page.getByText('E2E 판매 상품')).toBeVisible();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'CSV 다운로드' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('cubici-sales.csv');

  await page.goto('/cubici/salesInfo/return');
  await expect(page.getByRole('heading', { name: '반품/교환' })).toBeVisible();
  await page.getByLabel('검색어').fill(fixture.returnOrderNo);
  await expect(page.getByText(fixture.returnOrderNo)).toBeVisible();
  await page.getByRole('button', { name: '보기' }).first().click();
  await expect(page.getByText(fixture.returnDeliveryNo)).toBeVisible();

  await page.goto('/cubici/calculateInfo/details');
  await expect(page.getByRole('heading', { name: '정산 상세' })).toBeVisible();
  await page.getByLabel('검색어').fill(String(fixture.settlementId));
  await expect(page.getByText(String(fixture.settlementId))).toBeVisible();
  await page.getByRole('button', { name: '보기' }).first().click();
  await expect(page.getByText('테스트은행')).toBeVisible();

  await page.goto('/cubici/calculateInfo/calendar');
  await expect(page.getByRole('heading', { name: '정산 캘린더', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: '정산 캘린더 요약' })).toBeVisible();
  await expect(page.getByText('2026-07-15')).toBeVisible();
  await expect(page.getByText('111,000원')).toBeVisible();

  await page.goto('/cubici/integratedInfo/tab1');
  await expect(page.getByRole('heading', { name: '통합정보' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '당월현황' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: '판매금액' })).toHaveValue('1,440,000원');
  await expect(page.getByRole('textbox', { name: '판매수량' })).toHaveValue('12개');

  await page.goto('/cubici/integratedInfo/tab2');
  await expect(page.getByRole('heading', { name: '매출분석' })).toBeVisible();
  await expect(page.getByRole('cell', { name: '판매' })).toBeVisible();
  await expect(page.getByRole('cell', { name: '반품/교환' })).toBeVisible();

  await page.goto('/cubici/integratedInfo/tab3');
  await expect(page.getByRole('heading', { name: '상품분석' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'E2E 판매 상품' })).toBeVisible();
  await expect(page.getByRole('cell', { name: '1,320,000원' })).toBeVisible();

  await page.goto('/cubici/invento/index');
  await expect(page.getByRole('heading', { name: '상품/재고현황' })).toBeVisible();
  await page.getByLabel('상품 검색어').fill('E2E 판매 상품');
  await expect(page.getByRole('cell', { name: 'E2E 판매 상품' })).toBeVisible();
  await expect(page.getByRole('cell', { name: '12', exact: true })).toBeVisible();
});

function createFixture() {
  const suffix = String(Date.now()).slice(-8);
  const script = `
import json
from cubici_service.accounts.repository import AccountAuthUser, _build_auth_response
from cubici_service.db.connection import get_connection

suffix = ${JSON.stringify(suffix)}
shop_id = f"ce2e-{suffix}"
first_order_no = f"CE2E-{suffix}-11"
last_order_no = f"CE2E-{suffix}-00"
return_order_no = f"RTE2E-{suffix}"
return_delivery_no = f"DLV-{suffix}"
with get_connection() as conn:
    with conn.cursor() as cur:
        cur.execute("select coalesce(max(user_no), 0) + 1 from users")
        user_no = int(cur.fetchone()[0])
        cur.execute("select coalesce(max(id), 0) + 1 from shop_accounts")
        shop_account_id = int(cur.fetchone()[0])
        cur.execute("select coalesce(max(sales_id), 0) + 1 from sale")
        sales_id = int(cur.fetchone()[0])
        cur.execute("select coalesce(max(returns_id), 0) + 1 from sale_return")
        returns_id = int(cur.fetchone()[0])
        cur.execute("select coalesce(max(settlements_id), 0) + 1 from settlement")
        settlements_id = int(cur.fetchone()[0])
        cur.execute(
            """
            insert into users (
                user_no, email, password, user_type, name, phone, biz_num,
                biz_name, biz_setup_date, biz_type, sectors, fintech_id,
                reg_date, modified_date
            ) values (
                %s, %s, 'commerce-e2e', 'USER', %s, '01000000000',
                %s, %s, '20180101', 'INDIVIDUAL', '01', 1, now(), now()
            )
            """,
            (user_no, f"commerce-e2e-{suffix}@example.test", f"CommerceUser{suffix}", suffix.ljust(10, "0")[:10], f"CommerceBiz{suffix}"),
        )
        cur.execute(
            """
            insert into shop_accounts (
                id, user_no, shop_type, shop_id, shop_account_id,
                shop_account_password, api_secret_key, status, del_yn,
                reg_date, modified_date
            ) values (
                %s, %s, 'NAVER', %s, %s, 'commerce-e2e',
                'commerce-e2e', 'Y', 'N', now(), now()
            )
            """,
            (shop_account_id, user_no, shop_id, f"ce2eacc-{suffix}"),
        )
        for index in range(12):
            cur.execute(
                """
                insert into sale (
                    sales_id, shop_type, shop_id, order_no, product_no, option_no, status,
                    ordered_date, paid_date, confirm_date, settle_estimate_date, settle_complete_date,
                    product_name, option_name, quantity, sales_amount, discount_amount, payment_amount,
                    settle_estimate_amount, settlement_amount, canceled, orderer_id, orderer_name,
                    reg_date, modified_date
                ) values (
                    %s, 'NAVER', %s, %s, %s, %s, 'PAID',
                    '2026-07-01'::timestamp + (%s || ' days')::interval,
                    '2026-07-01'::timestamp + (%s || ' days')::interval,
                    '2026-07-03'::timestamp + (%s || ' days')::interval,
                    '2026-07-08'::timestamp + (%s || ' days')::interval,
                    '2026-07-15'::timestamp + (%s || ' days')::interval,
                    'E2E 판매 상품', '기본옵션', 1, 120000, 10000, 110000,
                    100000, 99000, 'N', 'commerce-buyer', '테스트구매자',
                    now(), now()
                )
                """,
                (
                    sales_id + index,
                    shop_id,
                    f"CE2E-{suffix}-{index:02d}",
                    f"PROD-{suffix}",
                    f"OPT-{index}",
                    index,
                    index,
                    index,
                    index,
                    index,
                ),
            )
        cur.execute(
            """
            insert into sale_return (
                returns_id, shop_type, shop_id, order_no, product_no, option_no, status,
                payment_amount, receipt_no, claim_status, payment_no, receipt_type,
                total_cancel_count, return_delivery_no, release_stop_status, pre_refund,
                complete_confirm_type, cancel_count, order_count, release_status, reason_code,
                request_date, claim_complete_date, reg_date, modified_date
            ) values (
                %s, 'NAVER', %s, %s, 'RETURN-PROD', 'RETURN-OPT', 'REQUEST',
                110000, %s, 'RETURN_REQUEST', %s, 'RETURN',
                1, %s, 'N', 'N', 'AUTO', 1, 1, 'STOP', 'R01',
                '2026-07-12', '2026-07-13', now(), now()
            )
            """,
            (returns_id, shop_id, return_order_no, f"RCPT-{suffix}", f"PAY-{suffix}", return_delivery_no),
        )
        cur.execute(
            """
            insert into settlement (
                settlements_id, shop_type, shop_id, settlement_type, settlement_date,
                total_sale, service_fee, settlement_target_amount, settlement_amount,
                pending_released_amount, seller_discount_coupon, downloadable_coupon,
                seller_service_fee, store_fee_discount, debt_of_last_week,
                bank_account_holder, bank_name, bank_account, status, reg_date, modified_date
            ) values (
                %s, 'NAVER', %s, 'NORMAL', '2026-07-15',
                120000, 3000, 114000, 111000,
                0, 1000, 2000, 1000, 0, 0,
                    '테스트예금주', '테스트은행', '0000000000', 'DONE', now(), now()
            )
            """,
            (settlements_id, shop_id),
        )

    auth = _build_auth_response(AccountAuthUser(
        user_no=user_no,
        user_type="USER",
        email=f"commerce-e2e-{suffix}@example.test",
        name=f"CommerceUser{suffix}",
        phone="01000000000",
        biz_name=f"CommerceBiz{suffix}",
        biz_num=suffix.ljust(10, "0")[:10],
        partner_code=None,
        last_login_date=None,
    ))
    result = {
        "suffix": suffix,
        "userNo": user_no,
        "shopId": shop_id,
    "firstOrderNo": first_order_no,
    "lastOrderNo": last_order_no,
    "returnOrderNo": return_order_no,
    "returnDeliveryNo": return_delivery_no,
    "settlementId": settlements_id,
        "session": auth.model_dump(),
    }
    print(json.dumps(result, ensure_ascii=False, default=str))
`;
  const output = execFileSync(pythonExe, ['-c', script], {
    cwd: serviceApiRoot,
    env: {
      ...process.env,
      PYTHONPATH: path.join(serviceApiRoot, 'src'),
    },
    encoding: 'utf8',
  });
  return JSON.parse(output);
}

function cleanupFixture(target) {
  const script = `
from cubici_service.db.connection import get_connection
user_no = ${Number(target.userNo)}
shop_id = ${JSON.stringify(target.shopId)}
with get_connection() as conn:
    with conn.cursor() as cur:
        cur.execute("delete from settlement where shop_type = 'NAVER' and shop_id = %s", (shop_id,))
        cur.execute("delete from sale_return where shop_type = 'NAVER' and shop_id = %s", (shop_id,))
        cur.execute("delete from sale where shop_type = 'NAVER' and shop_id = %s", (shop_id,))
        cur.execute("delete from shop_accounts where user_no = %s", (user_no,))
        cur.execute("delete from users where user_no = %s", (user_no,))
`;
  execFileSync(pythonExe, ['-c', script], {
    cwd: serviceApiRoot,
    env: {
      ...process.env,
      PYTHONPATH: path.join(serviceApiRoot, 'src'),
    },
    stdio: 'ignore',
  });
}
