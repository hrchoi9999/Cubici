import { expect, test } from '../../../admin-web/node_modules/@playwright/test/index.mjs';

const targetUrl = process.env.CUBICI_M1_LOGIN_URL ?? 'http://127.0.0.1:4310/login';

test('M1-3 verifies and captures the LV login screen on PC', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(targetUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  await expect(page.locator('.login-shell')).toBeVisible();
  await expect(page.locator('.pc-header .login-user-icon')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'LOGIN' })).toBeVisible();
  await expect(page.locator('.react-final-login-box')).toHaveCSS('width', '350px');
  await expect(page.getByRole('button', { name: '로그인' })).toBeVisible();
  await expect(page.getByRole('link', { name: '회원가입' })).toBeVisible();
  await expect(page.getByText('큐빅아이 고객지원')).toBeVisible();

  await page.screenshot({
    fullPage: true,
    path: '../docs/reference/lv-ui/work/USR-LOGIN-PC/candidate/candidate-react.png',
  });
});

test('M1-3 verifies and captures the responsive login screen on mobile', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 360, height: 640 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  await page.goto(targetUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  await expect(page.locator('.mobile-header')).toBeVisible();
  await expect(page.locator('.react-final-login-box')).toBeVisible();
  await expect(page.locator('.mobile-gnb-wrap')).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);

  await page.screenshot({
    fullPage: true,
    path: '../docs/reference/lv-ui/work/USR-LOGIN-MOBILE/candidate/candidate-react.png',
  });
  await context.close();
});

test('M1-3 submits the login payload and persists the saved login ID', async ({ page }) => {
  let requestPayload;
  await page.route('**/v1/api/accounts/login', async (route) => {
    requestPayload = route.request().postDataJSON();
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        access_token: 'focused-test-token',
        token_type: 'Bearer',
        user: { user_no: 7, email: 'member@cubici.test', name: '테스트 회원' },
      }),
      status: 200,
    });
  });

  await page.goto(`${targetUrl}?returnUrl=/`, { waitUntil: 'networkidle' });
  await page.locator('#userId').fill('member@cubici.test');
  await page.locator('#userPw').fill('test-password');
  await page.getByLabel('아이디 저장').check();
  await page.getByRole('button', { name: '로그인' }).click();
  await page.waitForURL((url) => url.pathname === '/');

  expect(requestPayload).toEqual({ email: 'member@cubici.test', password: 'test-password' });
  const storage = await page.evaluate(() => ({
    auth: JSON.parse(window.localStorage.getItem('cubiciUserAuth')),
    savedId: window.localStorage.getItem('cubiciSavedLoginId'),
  }));
  expect(storage.auth.access_token).toBe('focused-test-token');
  expect(storage.savedId).toBe('member@cubici.test');
});
