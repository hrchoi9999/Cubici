import { expect, test } from '../../../admin-web/node_modules/@playwright/test/index.mjs';

const targetUrl = process.env.CUBICI_M1_SIGNUP_URL ?? 'http://127.0.0.1:4310/mainSignUp';

test('M1-4 verifies and captures the LV signup terms screen on PC', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(targetUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  await expect(page.locator('.signup-shell')).toBeVisible();
  await expect(page.locator('.signup-visual .visual-tit')).toHaveText('회원가입');
  await expect(page.locator('.app-step .step > li')).toHaveCount(3);
  await expect(page.locator('.app-step .step > li').first()).toHaveClass(/active/);
  await expect(page.locator('.final-signup-terms-page iframe')).toHaveCount(3);
  await expect(page.locator('.final-signup-info-page')).toHaveCount(0);

  const nextButton = page.getByRole('button', { name: '다음' });
  await expect(nextButton).toBeDisabled();
  await page.screenshot({
    fullPage: true,
    path: '../docs/reference/lv-ui/work/USR-SIGNUP-TERMS-PC/candidate/candidate-react.png',
  });

  await page.getByLabel('이용약관 전체동의').check();
  await expect(page.locator('.policy-box input[type="checkbox"]:checked')).toHaveCount(3);
  await expect(nextButton).toBeEnabled();
  await nextButton.click();
  await expect(page.locator('.final-signup-info-page')).toBeVisible();
  await expect(page.getByRole('heading', { name: '기본정보' })).toBeVisible();
});

test('M1-4 verifies and captures the responsive signup terms screen on mobile', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 360, height: 640 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  await page.goto(targetUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  await expect(page.locator('.signup-visual')).toBeVisible();
  await expect(page.locator('.final-signup-terms-page iframe')).toHaveCount(3);
  await expect(page.getByText('3개월 무료 이용!')).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);

  await page.screenshot({
    fullPage: true,
    path: '../docs/reference/lv-ui/work/USR-SIGNUP-TERMS-MOBILE/candidate/candidate-react.png',
  });
  await context.close();
});
