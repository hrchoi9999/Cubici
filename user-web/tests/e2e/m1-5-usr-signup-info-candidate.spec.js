import { expect, test } from '../../../admin-web/node_modules/@playwright/test/index.mjs';

const targetUrl = process.env.CUBICI_M1_SIGNUP_URL ?? 'http://127.0.0.1:4310/mainSignUp';

async function openBasicInfoStep(page) {
  await page.goto(targetUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.getByLabel('이용약관 전체동의').check();
  await page.getByRole('button', { name: '다음' }).click();
  await expect(page.locator('.final-signup-info-page')).toBeVisible();
}

test('M1-5 verifies, captures, and submits the LV signup basic information screen on PC', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.route('**/v1/api/accounts/signup', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      status: 200,
      body: JSON.stringify({
        token_type: 'Bearer',
        access_token: 'm1-5-signup-token',
        expires_in: 3600,
        user: {
          user_no: 105,
          email: 'lv-signup@cubici.test',
          user_type: 'USER',
          name: '큐빅아이',
          phone: '01012345678',
          biz_num: '1234567890',
          biz_name: '큐빅아이 테스트',
          biz_setup_date: '20240130',
          biz_type: 'GENERAL',
          sectors: 'OTHER',
          partner_code: null,
          last_login_date: null,
        },
      }),
    });
  });

  await openBasicInfoStep(page);

  await expect(page.locator('.app-step .step > li').nth(1)).toHaveClass(/active/);
  await expect(page.getByRole('heading', { name: '기본정보' })).toBeVisible();
  await expect(page.getByLabel('회사명')).toBeVisible();
  await expect(page.getByLabel('주소', { exact: true })).toBeVisible();
  await expect(page.getByLabel('암호확인')).toBeVisible();
  await expect(page.getByLabel('협력사 (선택)')).toBeVisible();
  await expect(page.getByRole('button', { name: '이메일 인증' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'SMS 인증' })).toBeVisible();

  await page.screenshot({
    fullPage: true,
    path: '../docs/reference/lv-ui/work/USR-SIGNUP-INFO-PC/candidate/candidate-react.png',
  });

  await page.getByRole('button', { name: '이전' }).click();
  await expect(page.locator('.final-signup-terms-page')).toBeVisible();
  await expect(page.getByLabel('이용약관 전체동의')).toBeChecked();
  await page.getByRole('button', { name: '다음' }).click();

  await page.getByLabel('회사명').fill('큐빅아이 테스트');
  await page.getByLabel('사업자등록 번호').fill('1234567890');
  await page.getByLabel('대표자명').fill('큐빅아이');
  await page.getByLabel('아이디').fill('lv-signup@cubici.test');
  await page.getByLabel('암호', { exact: true }).fill('signup-password');
  await page.getByLabel('암호확인').fill('different-password');
  await page.getByRole('button', { name: '회원가입 확인' }).click();
  await expect(page.getByText('암호와 암호확인이 일치하지 않습니다.')).toBeVisible();

  await page.getByLabel('암호확인').fill('signup-password');
  const signupRequest = page.waitForRequest('**/v1/api/accounts/signup');
  await page.getByRole('button', { name: '회원가입 확인' }).click();
  const payload = (await signupRequest).postDataJSON();
  expect(payload).toMatchObject({
    email: 'lv-signup@cubici.test',
    name: '큐빅아이',
    biz_name: '큐빅아이 테스트',
    biz_num: '1234567890',
  });
  expect(payload).not.toHaveProperty('passwordConfirm');
  expect(payload).not.toHaveProperty('email_code');
});

test('M1-5 verifies and captures the responsive signup basic information screen on mobile', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 360, height: 640 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  await openBasicInfoStep(page);

  await expect(page.getByLabel('회사명')).toBeVisible();
  await expect(page.getByLabel('SMS 인증번호')).toBeDisabled();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);

  await page.screenshot({
    fullPage: true,
    path: '../docs/reference/lv-ui/work/USR-SIGNUP-INFO-MOBILE/candidate/candidate-react.png',
  });
  await context.close();
});
