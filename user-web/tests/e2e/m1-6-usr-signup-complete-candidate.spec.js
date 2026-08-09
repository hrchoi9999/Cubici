import { expect, test } from '../../../admin-web/node_modules/@playwright/test/index.mjs';

const targetUrl = process.env.CUBICI_M1_SIGNUP_URL ?? 'http://127.0.0.1:4310/mainSignUp';
const completedUser = {
  user_no: 106,
  email: 'lv-complete@cubici.test',
  user_type: 'USER',
  name: '큐빅아이 회원',
  phone: '01012345678',
  biz_num: '1234567890',
  biz_name: '큐빅아이 테스트',
  biz_setup_date: '20240130',
  biz_type: 'GENERAL',
  sectors: 'OTHER',
  partner_code: null,
  last_login_date: null,
};

async function mockSignupApi(page) {
  await page.route('**/v1/api/accounts/signup', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      status: 200,
      body: JSON.stringify({
        token_type: 'Bearer',
        access_token: 'm1-6-signup-token',
        expires_in: 3600,
        user: completedUser,
      }),
    });
  });
}

async function completeSignup(page) {
  await page.goto(targetUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.getByLabel('이용약관 전체동의').check();
  await page.getByRole('button', { name: '다음' }).click();
  await page.getByLabel('회사명').fill(completedUser.biz_name);
  await page.getByLabel('사업자등록 번호').fill(completedUser.biz_num);
  await page.getByLabel('대표자명').fill(completedUser.name);
  await page.getByLabel('설립연도').fill(completedUser.biz_setup_date);
  await page.getByLabel('아이디').fill(completedUser.email);
  await page.getByLabel('암호', { exact: true }).fill('signup-password');
  await page.getByLabel('암호확인').fill('signup-password');
  await page.getByLabel('대표자 핸드폰').fill(completedUser.phone);
  await page.getByRole('button', { name: '회원가입 확인' }).click();
  await expect(page.locator('.final-signup-complete-page')).toBeVisible();
}

test('M1-6 verifies and captures the LV signup completion screen on PC', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await mockSignupApi(page);
  await completeSignup(page);

  await expect(page.locator('.app-step .step > li').nth(2)).toHaveClass(/active/);
  await expect(page.getByRole('heading', { name: '큐빅아이 회원가입을 환영합니다!' })).toBeVisible();
  await expect(page.getByRole('img', { name: '회원가입 완료' })).toBeVisible();
  await expect(page.locator('.signup-complete-table')).toContainText(completedUser.name);
  await expect(page.locator('.signup-complete-table')).toContainText(completedUser.email);
  await expect(page.getByRole('link', { name: '확인' })).toHaveAttribute('href', '/cubici/mypage/businessInfo');
  const savedSession = await page.evaluate(() => JSON.parse(window.localStorage.getItem('cubiciUserAuth')));
  expect(savedSession.access_token).toBe('m1-6-signup-token');

  await page.screenshot({
    fullPage: true,
    path: '../docs/reference/lv-ui/work/USR-SIGNUP-COMPLETE-PC/candidate/candidate-react.png',
  });
});

test('M1-6 verifies and captures the responsive signup completion screen on mobile', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 360, height: 640 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  await mockSignupApi(page);
  await completeSignup(page);

  await expect(page.locator('.signup-complete-panel')).toBeVisible();
  await expect(page.locator('.signup-complete-table')).toContainText(completedUser.email);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);

  await page.screenshot({
    fullPage: true,
    path: '../docs/reference/lv-ui/work/USR-SIGNUP-COMPLETE-MOBILE/candidate/candidate-react.png',
  });
  await context.close();
});
