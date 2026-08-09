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

let createdEmail = '';

test.afterEach(() => {
  if (createdEmail) {
    cleanupAccountFixture(createdEmail);
    createdEmail = '';
  }
});

test('account recovery and mypage section routes render', async ({ page }) => {
  await page.goto('/idSearch');
  await expect(page.getByRole('heading', { name: 'ID SEARCH' })).toBeVisible();
  await page.getByRole('button', { name: '아이디 확인' }).click();
  await expect(page.getByText('대표자명, 휴대전화, 사업자등록번호를 입력해야 합니다.')).toBeVisible();

  await page.goto('/pwdReset');
  await expect(page.getByRole('heading', { name: 'PASSWORD' })).toBeVisible();
  await page.getByRole('button', { name: '재설정 요청' }).click();
  await expect(page.getByText('회원ID, 대표자명, 휴대전화를 입력해야 합니다.')).toBeVisible();

  await page.evaluate(() => {
    window.localStorage.setItem('cubiciUserAuth', JSON.stringify({
      access_token: 'route-smoke-token',
      user: {
        user_no: 36,
        user_type: 'USER',
        email: 'route-smoke@cubici.local',
        name: '라우트 점검',
        phone: '01000000000',
        biz_name: '라우트 점검 상사',
        biz_num: '0000000000',
      },
    }));
  });

  const routes = ['companyInfo', 'businessInfo', 'myAuth', 'myCharge', 'withdraw'];

  for (const section of routes) {
    await page.goto(`/cubici/mypage/${section}`);
    await expect(page.locator(`main.u22-${section}-page`)).toBeVisible();
  }
});

test('user signup and shop account registration persist through account API', async ({ page }) => {
  const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  createdEmail = `account-e2e-${suffix}@cubici.local`;
  const shopId = `account-e2e-shop-${suffix}`;
  const updatedShopId = `updated-${suffix}`;
  const bizNum = suffix.replace(/\D/g, '').slice(-10).padStart(10, '0');

  await page.goto('/mainSignUp');
  await page.getByLabel('이용약관 전체동의').check();
  await page.getByRole('button', { name: '다음' }).click();
  await page.getByLabel('회사명').fill('계정 E2E 상사');
  await page.getByLabel('사업자등록 번호').fill(bizNum);
  await page.getByLabel('설립연도').fill('20250101');
  await page.getByLabel('아이디').fill(createdEmail);
  await page.getByLabel('암호', { exact: true }).fill('AccountE2e!123');
  await page.getByLabel('암호확인').fill('AccountE2e!123');
  await page.getByLabel('대표자명').fill('계정 E2E');
  await page.getByLabel('대표자 핸드폰').fill('01012345678');
  await page.getByRole('button', { name: '회원가입 확인' }).click();

  await expect(page.getByRole('heading', { name: '큐빅아이 회원가입을 환영합니다!' })).toBeVisible();
  await page.goto('/cubici/mypage/companyInfo');
  const companyPanel = page.locator('section.u22-company-info');
  await companyPanel.getByLabel('등록핸드폰 변경').fill('01087654321');
  await companyPanel.getByRole('button', { name: '수정 확인' }).click();
  await expect(companyPanel.getByText('회사정보가 저장되었습니다.')).toBeVisible();
  await expect(companyPanel.getByLabel('등록핸드폰 변경')).toHaveValue('01087654321');

  await page.goto('/cubici/mypage/businessInfo');
  const shopPanel = page.getByRole('region', { name: '쇼핑몰 계정 연결' });
  await shopPanel.getByLabel('추가쇼핑몰').selectOption('NAVER');
  await shopPanel.getByLabel('쇼핑몰ID').fill(shopId);
  const createShopResponsePromise = waitForApiResponse(page, '/v1/api/accounts/me/shops', 'POST');
  await shopPanel.getByRole('button', { name: '등록' }).click();
  await expectApiResponse(createShopResponsePromise);

  await expect(page.getByRole('cell', { name: shopId })).toBeVisible();
  await page.getByRole('row', { name: shopId }).getByRole('button', { name: '수정' }).click();
  await shopPanel.getByLabel('쇼핑몰ID').fill(updatedShopId);
  const updateShopResponsePromise = page.waitForResponse((response) => (
    response.url().includes('/v1/api/accounts/me/shops/')
    && response.request().method() === 'PUT'
  ), { timeout: 30_000 });
  await shopPanel.locator('.u23-shop-register').getByRole('button', { name: '수정' }).click();
  await expectApiResponse(updateShopResponsePromise);
  await expect(shopPanel.getByText('쇼핑몰 정보가 수정되었습니다.')).toBeVisible();
  await expect(page.getByRole('cell', { name: updatedShopId })).toBeVisible();

  const disableShopResponsePromise = page.waitForResponse((response) => (
    response.url().includes('/v1/api/accounts/me/shops/')
    && response.request().method() === 'PUT'
  ), { timeout: 30_000 });
  await page.getByRole('row', { name: updatedShopId }).getByRole('button', { name: '비활성' }).click();
  await expectApiResponse(disableShopResponsePromise);
  await expect(page.getByRole('row', { name: updatedShopId }).getByRole('button', { name: '활성' })).toBeVisible();

  const deleteShopResponsePromise = page.waitForResponse((response) => (
    response.url().includes('/v1/api/accounts/me/shops/')
    && response.request().method() === 'DELETE'
  ), { timeout: 30_000 });
  await page.getByRole('row', { name: updatedShopId }).getByRole('button', { name: '삭제' }).click();
  await expectApiResponse(deleteShopResponsePromise);
  await expect(shopPanel.getByText('쇼핑몰 계정이 삭제되었습니다.')).toBeVisible();
  await expect(page.getByRole('cell', { name: updatedShopId })).toHaveCount(0);
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

function cleanupAccountFixture(email) {
  const script = `
from cubici_service.db.connection import get_connection
email = ${JSON.stringify(email)}
with get_connection() as connection:
    with connection.cursor() as cursor:
        cursor.execute("select user_no from users where lower(email) = lower(%s)", (email,))
        rows = cursor.fetchall()
        user_nos = [row[0] for row in rows]
        for user_no in user_nos:
            cursor.execute("delete from shop_accounts where user_no = %s", (user_no,))
        cursor.execute("delete from users where lower(email) = lower(%s)", (email,))
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
