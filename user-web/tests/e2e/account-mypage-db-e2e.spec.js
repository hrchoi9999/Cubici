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
  await expect(page.getByRole('heading', { name: '아이디 찾기' })).toBeVisible();
  await page.getByRole('button', { name: '아이디 확인' }).click();
  await expect(page.getByText('대표자명, 휴대전화, 사업자등록번호를 입력해야 합니다.')).toBeVisible();

  await page.goto('/pwdReset');
  await expect(page.getByRole('heading', { name: '비밀번호 찾기' })).toBeVisible();
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

  const routes = [
    ['/cubici/mypage/companyInfo', '회사정보'],
    ['/cubici/mypage/businessInfo', '사업정보'],
    ['/cubici/mypage/myAuth', '인증정보'],
    ['/cubici/mypage/myCharge', '요금정보'],
    ['/cubici/mypage/withdraw', '회원탈퇴'],
  ];

  for (const [route, heading] of routes) {
    await page.goto(route);
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
  }
});

test('user signup and shop account registration persist through account API', async ({ page }) => {
  const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  createdEmail = `account-e2e-${suffix}@cubici.local`;
  const shopId = `account-e2e-shop-${suffix}`;
  const updatedShopLogin = `updated-${suffix}`;

  await page.goto('/mainSignUp');
  await page.getByLabel('아이디').fill(createdEmail);
  await page.getByLabel('비밀번호').fill('AccountE2e!123');
  await page.getByLabel('대표자명').fill('계정 E2E');
  await page.getByLabel('휴대전화').fill('01012345678');
  await page.getByLabel('상호').fill('계정 E2E 상사');
  await page.getByLabel('사업자등록번호').fill('1234567890');
  await page.getByLabel('개업일자').fill('20250101');
  await page.locator('.signup-term-header input').nth(0).check();
  await page.locator('.signup-term-header input').nth(1).check();
  await page.locator('.signup-term-header input').nth(2).check();
  await page.getByRole('button', { name: '가입 저장' }).click();

  await expect(page).toHaveURL(/\/cubici\/mypage\/profile$/);
  await page.goto('/cubici/mypage/companyInfo');
  const companyPanel = page.locator('section.form-panel').filter({ has: page.getByRole('heading', { name: '회사정보', exact: true }) });
  await companyPanel.getByLabel('대표자명').fill('계정 E2E 수정');
  await companyPanel.getByLabel('휴대전화').fill('01087654321');
  await companyPanel.getByLabel('상호').fill('계정 E2E 수정상사');
  await companyPanel.getByLabel('업종코드').fill('FOOD');
  await companyPanel.getByRole('button', { name: '회사정보 저장' }).click();
  await expect(companyPanel.getByText('회사정보가 저장되었습니다.')).toBeVisible();
  await expect(companyPanel.getByLabel('상호')).toHaveValue('계정 E2E 수정상사');

  await page.goto('/cubici/mypage/businessInfo');
  await expect(page.getByRole('heading', { name: '사업정보' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '쇼핑몰 계정 연결' })).toBeVisible();

  const shopPanel = page.locator('section.form-panel').filter({ has: page.getByRole('heading', { name: '쇼핑몰 계정 연결' }) });
  await shopPanel.locator('select').first().selectOption('NAVER');
  await shopPanel.getByLabel('상점 ID').fill(shopId);
  await shopPanel.getByLabel('계정 ID').fill(`login-${suffix}`);
  await shopPanel.getByLabel('계정 비밀번호').fill('shop-password-for-e2e');
  await shopPanel.getByLabel('Vendor ID').fill(`v-${suffix.slice(-16)}`);
  await shopPanel.getByLabel('API Key').fill(`api-key-${suffix}`);
  await shopPanel.getByLabel('API Secret').fill(`api-secret-${suffix}`);
  await shopPanel.getByLabel('정산 메모').fill('E2E 등록');
  const createShopResponsePromise = waitForApiResponse(page, '/v1/api/accounts/me/shops', 'POST');
  await shopPanel.getByRole('button', { name: '계정 연결' }).click();
  await expectApiResponse(createShopResponsePromise);

  await expect(page.getByRole('cell', { name: 'NAVER' })).toBeVisible();
  await expect(page.getByRole('cell', { name: shopId })).toBeVisible();
  await page.getByRole('row', { name: shopId }).getByRole('button', { name: '수정' }).click();
  await shopPanel.getByLabel('계정 ID').fill(updatedShopLogin);
  await shopPanel.getByLabel('정산 메모').fill('E2E 수정');
  const updateShopResponsePromise = page.waitForResponse((response) => (
    response.url().includes('/v1/api/accounts/me/shops/')
    && response.request().method() === 'PUT'
  ), { timeout: 30_000 });
  await shopPanel.getByRole('button', { name: '계정 수정 저장' }).click();
  await expectApiResponse(updateShopResponsePromise);
  await expect(shopPanel.getByText('쇼핑몰 계정이 수정되었습니다.')).toBeVisible();
  await expect(page.getByRole('cell', { name: updatedShopLogin })).toBeVisible();

  const disableShopResponsePromise = page.waitForResponse((response) => (
    response.url().includes('/v1/api/accounts/me/shops/')
    && response.request().method() === 'PUT'
  ), { timeout: 30_000 });
  await page.getByRole('row', { name: shopId }).getByRole('button', { name: '비활성' }).click();
  await expectApiResponse(disableShopResponsePromise);
  await expect(page.getByRole('row', { name: shopId }).getByRole('cell', { name: 'N', exact: true })).toBeVisible();

  const deleteShopResponsePromise = page.waitForResponse((response) => (
    response.url().includes('/v1/api/accounts/me/shops/')
    && response.request().method() === 'DELETE'
  ), { timeout: 30_000 });
  await page.getByRole('row', { name: shopId }).getByRole('button', { name: '삭제' }).click();
  await expectApiResponse(deleteShopResponsePromise);
  await expect(shopPanel.getByText('쇼핑몰 계정이 삭제되었습니다.')).toBeVisible();
  await expect(page.getByRole('cell', { name: shopId })).toHaveCount(0);
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
