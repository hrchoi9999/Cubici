import { expect, test } from '../../../admin-web/node_modules/@playwright/test/index.mjs';

const baseUrl = process.env.CUBICI_M1_MYPAGE_URL ?? 'http://127.0.0.1:4310';
const sourceUrl = process.env.CUBICI_LV_SOURCE_URL ?? 'http://127.0.0.1:4311/c6p1.html';
const shopsPath = '/cubici/mypage/businessInfo';
const apiPath = '/cubici/mypage/myAuth';
const session = {
  token_type: 'Bearer',
  access_token: 'm1-23-user-token',
  expires_in: 3600,
  user: {
    user_no: 123,
    email: 'lv-shops@cubici.test',
    user_type: 'USER',
    name: '홍길동',
    phone: '010-1234-5678',
    biz_name: 'LV 온라인상사',
    biz_num: '123-45-67890',
  },
};

function initialItems() {
  return [
    {
      id: 11,
      user_no: 123,
      shop_type: 'STREET11',
      shop_id: 'lv-11st-seller',
      shop_account_id: 'lv-11st-login',
      vendor_id: 'vendor-11',
      settlement: '선정산 대상',
      status: 'Y',
      del_yn: 'N',
      reg_date: '2026-08-01T09:00:00',
    },
    {
      id: 12,
      user_no: 123,
      shop_type: 'NAVER',
      shop_id: 'lv-naver-seller',
      shop_account_id: 'lv-naver-login',
      vendor_id: null,
      settlement: null,
      status: 'Y',
      del_yn: 'N',
      reg_date: '2026-08-02T09:00:00',
    },
  ];
}

async function installMocks(page) {
  let items = initialItems();
  let nextId = 20;
  const calls = [];
  await page.addInitScript((auth) => {
    window.localStorage.setItem('cubiciUserAuth', JSON.stringify(auth));
  }, session);
  await page.route('**/v1/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (!url.pathname.includes('/accounts/me/shops')) {
      await route.fulfill({ contentType: 'application/json', status: 200, body: JSON.stringify({ total: 0, items: [] }) });
      return;
    }

    if (request.method() === 'GET') {
      await route.fulfill({ contentType: 'application/json', status: 200, body: JSON.stringify({ total: items.length, items }) });
      return;
    }

    const payload = request.postDataJSON?.() ?? {};
    if (request.method() === 'POST') {
      const item = { id: nextId++, user_no: 123, status: 'Y', del_yn: 'N', reg_date: '2026-08-09T09:00:00', ...payload };
      items = [item, ...items];
      calls.push({ method: 'POST', payload });
      await route.fulfill({ contentType: 'application/json', status: 200, body: JSON.stringify({ created: true, item }) });
      return;
    }

    const accountId = Number(url.pathname.split('/').pop());
    const current = items.find((item) => item.id === accountId);
    if (request.method() === 'PUT') {
      const item = { ...current, ...payload, modified_date: '2026-08-09T09:30:00' };
      items = items.map((entry) => (entry.id === accountId ? item : entry));
      calls.push({ method: 'PUT', accountId, payload });
      await route.fulfill({ contentType: 'application/json', status: 200, body: JSON.stringify({ action: 'updated', item }) });
      return;
    }

    if (request.method() === 'DELETE') {
      items = items.filter((item) => item.id !== accountId);
      calls.push({ method: 'DELETE', accountId });
      await route.fulfill({ contentType: 'application/json', status: 200, body: JSON.stringify({ action: 'deleted', item: current }) });
      return;
    }

    await route.abort();
  });
  return calls;
}

test('M1-23 captures the LV shop list and API modal references', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(sourceUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByRole('heading', { name: '쇼핑몰 등록' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '쇼핑몰 정보' })).toBeVisible();

  const sourceModal = page.locator('.modal-wrap.api');
  await expect(sourceModal).toBeVisible();
  await page.screenshot({
    fullPage: true,
    path: '../docs/reference/lv-ui/work/USR-MYPAGE-API-PC/reference/lv-reference-rendered.png',
  });
  await sourceModal.locator('.modal-close').click();
  await expect(sourceModal).toBeHidden();
  await page.screenshot({
    fullPage: true,
    path: '../docs/reference/lv-ui/work/USR-MYPAGE-SHOPS-PC/reference/lv-reference-rendered.png',
  });

  await page.setViewportSize({ width: 360, height: 640 });
  await page.reload({ waitUntil: 'networkidle' });
  if (await sourceModal.isVisible()) await sourceModal.locator('.modal-close').click();
  await page.screenshot({
    fullPage: true,
    path: '../docs/reference/lv-ui/work/USR-MYPAGE-SHOPS-MOBILE/reference/lv-reference-rendered.png',
  });
});

test('M1-23 restores the LV shop registration and preserves create', async ({ page }) => {
  const calls = await installMocks(page);
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(`${baseUrl}${shopsPath}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  const panel = page.getByRole('region', { name: '쇼핑몰 계정 연결' });
  await expect(panel.getByRole('heading', { name: '쇼핑몰 등록' })).toBeVisible();
  await expect(panel.getByRole('heading', { name: '쇼핑몰 정보' })).toBeVisible();
  await expect(panel.getByRole('row', { name: /lv-11st-seller/ })).toBeVisible();
  await page.screenshot({
    fullPage: true,
    path: '../docs/reference/lv-ui/work/USR-MYPAGE-SHOPS-PC/candidate/candidate-react.png',
  });

  const register = panel.locator('.u23-shop-register');
  await register.getByLabel('추가쇼핑몰').selectOption('COUPANG');
  await register.getByLabel('쇼핑몰ID').fill('lv-new-coupang');
  await register.getByRole('button', { name: '등록' }).click();
  await expect(panel.getByRole('cell', { name: 'lv-new-coupang' })).toBeVisible();
  expect(calls.find((call) => call.method === 'POST')?.payload).toEqual({ shop_type: 'COUPANG', shop_id: 'lv-new-coupang' });
});

test('M1-23 preserves edit, status, delete, and API connection payloads', async ({ page }) => {
  const calls = await installMocks(page);
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(`${baseUrl}${shopsPath}`, { waitUntil: 'networkidle' });
  const panel = page.getByRole('region', { name: '쇼핑몰 계정 연결' });

  const apiRow = panel.getByRole('row', { name: /lv-11st-seller/ });
  await apiRow.getByRole('button', { name: '연결' }).click();
  const dialog = page.getByRole('dialog', { name: 'API 인증 요청' });
  await expect(dialog).toBeVisible();
  await page.screenshot({ path: '../docs/reference/lv-ui/work/USR-MYPAGE-API-PC/candidate/candidate-react.png' });
  await dialog.getByLabel('엑세스 키').fill('masked-access-key');
  await dialog.getByLabel('쇼핑몰 계정 ID').fill('updated-11st-login');
  await dialog.getByLabel('쇼핑몰 계정 비밀번호').fill('masked-password');
  await dialog.getByText('추가 연동정보').click();
  await dialog.getByLabel('Vendor ID').fill('vendor-updated');
  await dialog.getByLabel('API Secret').fill('masked-secret');
  await dialog.getByLabel('선정산 설정').selectOption('선정산 대상');
  await dialog.getByRole('button', { name: '연동' }).click();
  await expect(dialog.getByText('API 연동정보가 저장되었습니다.')).toBeVisible();
  const apiCall = calls.find((call) => call.method === 'PUT' && call.payload.api_key === 'masked-access-key');
  expect(apiCall?.accountId).toBe(11);
  expect(apiCall?.payload.shop_account_id).toBe('updated-11st-login');
  expect(apiCall?.payload.api_secret_key).toBe('masked-secret');
  await dialog.getByRole('button', { name: '닫기' }).click();

  const naverRow = panel.getByRole('row', { name: /lv-naver-seller/ });
  await naverRow.getByRole('button', { name: '수정', exact: true }).click();
  const register = panel.locator('.u23-shop-register');
  await register.getByLabel('쇼핑몰ID').fill('lv-naver-updated');
  await register.getByRole('button', { name: '수정', exact: true }).click();
  await expect(panel.getByRole('cell', { name: 'lv-naver-updated' })).toBeVisible();
  const updatedRow = panel.getByRole('row', { name: /lv-naver-updated/ });
  await updatedRow.getByRole('button', { name: '비활성' }).click();
  await expect(panel.getByText('쇼핑몰 계정이 비활성화되었습니다.')).toBeVisible();
  await updatedRow.getByRole('button', { name: '삭제' }).click();
  await expect(panel.getByRole('cell', { name: 'lv-naver-updated' })).toHaveCount(0);
  expect(calls.some((call) => call.method === 'DELETE' && call.accountId === 12)).toBeTruthy();
});

test('M1-23 renders responsive shop and direct API views without overflow', async ({ page }) => {
  await installMocks(page);
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto(`${baseUrl}${shopsPath}`, { waitUntil: 'networkidle' });
  const panel = page.getByRole('region', { name: '쇼핑몰 계정 연결' });
  await expect(panel.getByText('lv-11st-seller')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  await page.screenshot({
    fullPage: true,
    path: '../docs/reference/lv-ui/work/USR-MYPAGE-SHOPS-MOBILE/candidate/candidate-react.png',
  });

  await page.goto(`${baseUrl}${apiPath}`, { waitUntil: 'networkidle' });
  const dialog = page.getByRole('dialog', { name: 'API 인증 요청' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: '닫기' })).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: '../docs/reference/lv-ui/work/USR-MYPAGE-API-MOBILE/candidate/candidate-react.png' });
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});
