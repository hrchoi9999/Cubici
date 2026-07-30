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
const adminBaseUrl = process.env.CUBICI_ADMIN_BASE_URL || 'http://127.0.0.1:5174';

test.skip(process.env.CUBICI_RUN_DB_E2E !== '1', 'set CUBICI_RUN_DB_E2E=1 to run local PostgreSQL UI E2E tests');
test.setTimeout(120_000);

let fixture = null;

test.afterEach(() => {
  if (fixture) {
    cleanupChargeChangeFixture(fixture);
    fixture = null;
  }
});

test('member charge change refund finish persists with real database through admin UI', async ({ page }) => {
  fixture = createChargeChangeFixture();

  await page.goto(`${adminBaseUrl}/admin/cubici/manageMember/payment_tab2`);
  await page.getByLabel('회원명').fill(fixture.userName);
  await page.getByRole('button', { name: '검색' }).click();

  const chargeRow = page.locator('tbody tr').filter({ hasText: fixture.userName }).filter({ hasText: '환급대기' });
  await expect(chargeRow).toContainText(fixture.email);
  await expect(chargeRow).toContainText('환급대기');
  await expect(chargeRow).toContainText('12,000원');
  await expect(page.getByText('환급대기 1건')).toBeVisible();

  await chargeRow.getByRole('button', { name: '환급' }).click();

  const refundPanel = page.locator('.refundDetailPanel');
  await expect(refundPanel.getByText('서비스 환급')).toBeVisible();
  await expect(refundPanel).toContainText(fixture.userName);
  await expect(refundPanel.getByText('차액 환급')).toBeVisible();
  await expect(refundPanel.getByText('12,000원')).toBeVisible();
  await expect(readRefundState(fixture)).toMatchObject({
    refund_status: 'RR',
    payment_status: 'RR',
    has_refund_date: false,
  });

  await refundPanel.getByRole('button', { name: '환급완료' }).click();
  await expect(refundPanel).toBeHidden();
  await expect(page.getByText('환급대기 0건')).toBeVisible();

  const completedRow = page.locator('tbody tr').filter({ hasText: fixture.userName });
  await expect(completedRow).toContainText('환급완료');
  await expect(completedRow.getByRole('button', { name: '환급' })).toHaveCount(0);
  await expect(readRefundState(fixture)).toMatchObject({
    refund_status: 'C',
    payment_status: 'RC',
    has_refund_date: true,
  });
});

function createChargeChangeFixture() {
  const suffix = String(Date.now()).slice(-9);
  return JSON.parse(runPython(`
import json
import sys
from cubici_service.db.connection import get_connection

suffix = sys.argv[1]
with get_connection() as conn:
    with conn.cursor() as cur:
        numeric_id = int(''.join(ch for ch in suffix if ch.isdigit())[-6:].ljust(6, "0"))
        user_no = 7800000 + numeric_id
        shop_account_id = 8800000 + numeric_id
        old_seq = 1780000000 + numeric_id * 2
        new_seq = old_seq + 1
        old_charge_code = f"O{suffix[-4:]}"
        new_charge_code = f"N{suffix[-4:]}"
        email = f"local-db-charge-refund-e2e-{suffix}@example.test"
        user_name = f"ChargeRefundUIUser{suffix}"
        biz_name = f"ChargeRefundUIBiz{suffix}"

        cur.execute(
            """
            insert into users (
                user_no, email, password, user_type, name, phone, biz_num,
                biz_name, biz_setup_date, biz_type, sectors, fintech_id,
                address, reg_date, modified_date
            ) values (
                %s, %s, 'local-db-charge-refund-e2e', 'USER', %s, '01000000000',
                %s, %s, '20180101', 'INDIVIDUAL', '01', 1, '서울',
                now(), now()
            )
            """,
            (user_no, email, user_name, suffix.ljust(10, "0")[:10], biz_name),
        )
        cur.execute(
            """
            insert into shop_accounts (
                id, user_no, shop_type, shop_id, shop_account_id,
                shop_account_password, api_secret_key, status, del_yn,
                reg_date, modified_date
            ) values (
                %s, %s, 'NAVER', %s, %s, 'local-db-charge-refund-e2e',
                'local-db-charge-refund-e2e', 'Y', 'N', now(), now()
            )
            """,
            (
                shop_account_id,
                user_no,
                f"local-db-charge-refund-e2e-shop-{suffix}",
                f"local-db-charge-refund-e2e-account-{suffix}",
            ),
        )
        cur.execute(
            """
            insert into charge (
                charge_code, charge_name, charge_type, amount, period,
                period_unit, charge_detail, reg_date
            ) values
                (%s, %s, 'B', 29000, 1, 'M', 'refund e2e old', now()),
                (%s, %s, 'B', 81000, 3, 'M', 'refund e2e new', now())
            """,
            (old_charge_code, f"기존요금{suffix}", new_charge_code, f"변경요금{suffix}"),
        )
        cur.execute(
            """
            insert into billing_payment_detail (
                seq, user_no, user_code, start_date, expire_date, rest_date,
                status, amount, vat, payment_base_amount, payment_base_vat,
                pg_id, imp_uid, pay_method, charge_code, payment_date,
                pay_confirm_date, change_date, upd_datetime
            ) values
                (
                    %s, %s, %s, current_date - interval '30 days',
                    current_date + interval '30 days', 10, 'CC',
                    31900, 3190, 10000, 2000,
                    'html5_inicis', %s, 'card', %s,
                    now() - interval '30 days', now() - interval '30 days',
                    null, now()
                ),
                (
                    %s, %s, %s, current_date, current_date + interval '90 days',
                    10, 'RR', 89100, 8910, 0, 0,
                    'html5_inicis', %s, 'card', %s,
                    now(), now(), now(), now()
                )
            """,
            (
                old_seq,
                user_no,
                email,
                f"imp-old-{suffix}",
                old_charge_code,
                new_seq,
                user_no,
                email,
                f"imp-new-{suffix}",
                new_charge_code,
            ),
        )
        cur.execute(
            """
            insert into billing_refund (
                seq, new_seq, user_no, user_code, refund_type, status,
                refund_user_name, refund_account, refund_bank,
                refund_amount, refund_card, request_date
            ) values (
                %s, %s, %s, %s, 'C', 'RR',
                %s, '1234567890', '국민',
                12000, '0', now()
            )
            """,
            (old_seq, new_seq, user_no, email, user_name),
        )

print(json.dumps({
    "userNo": user_no,
    "shopAccountId": shop_account_id,
    "oldSeq": old_seq,
    "newSeq": new_seq,
    "oldChargeCode": old_charge_code,
    "newChargeCode": new_charge_code,
    "suffix": suffix,
    "email": email,
    "userName": user_name,
    "bizName": biz_name,
}, ensure_ascii=False))
  `, [suffix]));
}

function readRefundState(currentFixture) {
  return JSON.parse(runPython(`
import json
import sys
from cubici_service.db.connection import get_connection

old_seq = int(sys.argv[1])
new_seq = int(sys.argv[2])
with get_connection() as conn:
    with conn.cursor() as cur:
        cur.execute(
            """
            select br.status, bp.status, br.refund_date is not null
            from billing_refund br
            left join billing_payment_detail bp on bp.seq = br.new_seq
            where br.seq = %s and br.new_seq = %s
            """,
            (old_seq, new_seq),
        )
        row = cur.fetchone()

print(json.dumps({
    "refund_status": row[0] if row else None,
    "payment_status": row[1] if row else None,
    "has_refund_date": row[2] if row else False,
}, ensure_ascii=False))
  `, [String(currentFixture.oldSeq), String(currentFixture.newSeq)]));
}

function cleanupChargeChangeFixture(currentFixture) {
  runPython(`
import sys
from cubici_service.db.connection import get_connection

user_no = int(sys.argv[1])
shop_account_id = int(sys.argv[2])
old_seq = int(sys.argv[3])
new_seq = int(sys.argv[4])
old_charge_code = sys.argv[5]
new_charge_code = sys.argv[6]

with get_connection() as conn:
    with conn.cursor() as cur:
        cur.execute("delete from billing_refund where seq = %s or new_seq = %s", (old_seq, new_seq))
        cur.execute("delete from billing_payment_detail where seq in (%s, %s)", (old_seq, new_seq))
        cur.execute("delete from shop_accounts where id = %s", (shop_account_id,))
        cur.execute("delete from charge where charge_code in (%s, %s)", (old_charge_code, new_charge_code))
        cur.execute("delete from users where user_no = %s", (user_no,))
  `, [
    String(currentFixture.userNo),
    String(currentFixture.shopAccountId),
    String(currentFixture.oldSeq),
    String(currentFixture.newSeq),
    currentFixture.oldChargeCode,
    currentFixture.newChargeCode,
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
