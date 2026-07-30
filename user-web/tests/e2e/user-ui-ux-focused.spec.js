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

test.skip(process.env.CUBICI_RUN_DB_E2E !== '1', 'set CUBICI_RUN_DB_E2E=1 to run local PostgreSQL UI E2E tests');

const publicRoutes = [
  ['/', '온라인 쇼핑몰 통합관리 서비스'],
  ['/login', '로그인'],
  ['/mainSignUp', '회원가입'],
];

const authenticatedRoutes = [
  ['/cubici/integratedInfo/tab1', '통합정보'],
  ['/cubici/integratedInfo/tab2', '매출분석'],
  ['/cubici/integratedInfo/tab3', '상품분석'],
  ['/cubici/salesInfo/sales', '판매현황'],
  ['/cubici/salesInfo/return', '반품/교환'],
  ['/cubici/calculateInfo/details', '정산 상세'],
  ['/moneybank/request', '머니뱅크 신청'],
  ['/moneybank/current', '머니뱅크 현황'],
  ['/cubici/mypage/businessInfo', '사업정보'],
  ['/board/notice/index', '서비스 공지'],
  ['/board/qa/index', 'Q&A'],
  ['/board/faq/index', 'FAQ'],
  ['/chargeInfo', '요금안내'],
];

test.describe('user web UI/UX focused checks', () => {
  let fixture = null;

  test.afterEach(() => {
    if (fixture) {
      cleanupFixture(fixture);
      fixture = null;
    }
  });

  test('desktop public and authenticated pages render usable legacy-style layout', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });

    for (const [route, heading] of publicRoutes) {
      await page.goto(route);
      await expectUsablePage(page, heading);
      await expectNoSevereViewportOverflow(page, route);
    }

    fixture = createFixture();
    await signInAsFixtureUser(page, fixture.session);

    for (const [route, heading] of authenticatedRoutes) {
      await page.goto(route);
      await expectUsablePage(page, heading);
      await expectNoSevereViewportOverflow(page, route);
    }

    await page.goto('/cubici/integratedInfo/tab1');
    await page.getByRole('button', { name: '머니뱅크' }).hover();
    await expect(page.locator('.gnb-sub a[href="/moneybank/request"]')).toBeVisible();
  });

  test('mobile public and authenticated pages keep core content inside viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    const mobileRoutes = [
      ['/', '온라인 쇼핑몰 통합관리 서비스'],
      ['/login', '로그인'],
      ['/moneybank/request', '머니뱅크 신청'],
      ['/moneybank/current', '머니뱅크 현황'],
      ['/cubici/mypage/businessInfo', '사업정보'],
      ['/board/qa/index', 'Q&A'],
      ['/chargeInfo', '요금안내'],
    ];

    fixture = createFixture();
    await signInAsFixtureUser(page, fixture.session);

    for (const [route, heading] of mobileRoutes) {
      await page.goto(route);
      await expectUsablePage(page, heading);
      await expectNoSevereViewportOverflow(page, route);
      await expectReadableTouchTargets(page, route);
    }
  });
});

async function signInAsFixtureUser(page, session) {
  await page.addInitScript((session) => {
    window.localStorage.setItem('cubiciUserAuth', JSON.stringify(session));
  }, session);
}

async function expectUsablePage(page, heading) {
  await expect(page.locator('.user-header')).toBeVisible();
  await expect(page.locator('.logo img')).toBeVisible();
  await expect(page.locator('main')).toBeVisible();
  await expect(page.getByRole('heading', { name: heading, exact: true }).first()).toBeVisible();
  await expect(page.getByText('Migration 준비 화면')).toHaveCount(0);
  await expect(page.getByText('준비 중입니다.')).toHaveCount(0);
}

async function expectNoSevereViewportOverflow(page, route) {
  const offenders = await page.evaluate(() => {
    function hasScrollableAncestor(element) {
      let current = element;
      while (current && current !== document.body) {
        const style = window.getComputedStyle(current);
        if (/(auto|scroll)/.test(style.overflowX)) return true;
        current = current.parentElement;
      }
      return false;
    }

    return Array.from(document.querySelectorAll('body *'))
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.width < 1 || rect.height < 1) return false;
        if (hasScrollableAncestor(element)) return false;
        return rect.left < -2 || rect.right > window.innerWidth + 2;
      })
      .slice(0, 10)
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          tag: element.tagName,
          className: typeof element.className === 'string' ? element.className : '',
          text: element.textContent?.replace(/\s+/g, ' ').trim().slice(0, 40) ?? '',
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          viewport: window.innerWidth,
        };
      });
  });
  expect(offenders, `${route} should not have non-scrollable viewport overflow`).toEqual([]);
}

async function expectReadableTouchTargets(page, route) {
  const tooSmall = await page.evaluate(() => Array.from(document.querySelectorAll('main a, main button, main input, main select, main textarea'))
    .filter((element) => {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      if (style.visibility === 'hidden' || style.display === 'none') return false;
      if (element.tagName === 'INPUT' && ['checkbox', 'radio'].includes(element.type)) return false;
      if (rect.width < 1 || rect.height < 1) return false;
      return rect.height < 28 || rect.width < 28;
    })
    .slice(0, 10)
    .map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        tag: element.tagName,
        text: element.textContent?.replace(/\s+/g, ' ').trim().slice(0, 40) ?? '',
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      };
    }));
  expect(tooSmall, `${route} should not expose unusably small main controls`).toEqual([]);
}

function createFixture() {
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
        email = f"user-ui-ux-focused-{suffix}@example.test"
        name = f"UIUXUser{suffix}"
        biz_name = f"UIUXBiz{suffix}"
        biz_num = suffix.ljust(10, "0")[:10]
        cur.execute(
            """
            insert into users (
                user_no, email, password, user_type, name, phone, biz_num,
                biz_name, biz_setup_date, biz_type, sectors, fintech_id,
                reg_date, modified_date
            ) values (
                %s, %s, 'user-ui-ux-focused', 'USER', %s, '01000000000',
                %s, %s, '20180101', 'INDIVIDUAL', '01', 1, now(), now()
            )
            """,
            (user_no, email, name, biz_num, biz_name),
        )
        cur.execute(
            """
            insert into shop_accounts (
                id, user_no, shop_type, shop_id, shop_account_id,
                shop_account_password, api_secret_key, status, del_yn,
                reg_date, modified_date
            ) values (
                %s, %s, 'NAVER', %s, %s, 'user-ui-ux-focused',
                'user-ui-ux-focused', 'Y', 'N', now(), now()
            )
            """,
            (shop_account_id, user_no, f"uiux-shop-{suffix}", f"uiux-account-{suffix}"),
        )

user = AccountAuthUser(
    user_no=user_no,
    email=email,
    user_type="USER",
    name=name,
    phone="01000000000",
    biz_num=biz_num,
    biz_name=biz_name,
    biz_setup_date="20180101",
    biz_type="INDIVIDUAL",
    sectors="01",
    partner_code=None,
    last_login_date=None,
)
session = _build_auth_response(user).model_dump()
print(json.dumps({
    "userNo": user_no,
    "shopAccountId": shop_account_id,
    "session": session,
}, ensure_ascii=False, default=str))
  `, [suffix]));
}

function cleanupFixture(currentFixture) {
  runPython(`
import sys
from cubici_service.db.connection import get_connection

user_no = int(sys.argv[1])
shop_account_id = int(sys.argv[2])

with get_connection() as conn:
    with conn.cursor() as cur:
        cur.execute("delete from shop_accounts where id = %s", (shop_account_id,))
        cur.execute("delete from users where user_no = %s", (user_no,))
  `, [String(currentFixture.userNo), String(currentFixture.shopAccountId)]);
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
