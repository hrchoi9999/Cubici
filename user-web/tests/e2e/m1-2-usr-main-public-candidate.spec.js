import { expect, test } from '../../../admin-web/node_modules/@playwright/test/index.mjs';

const targetUrl = process.env.CUBICI_M1_PUBLIC_URL ?? 'http://127.0.0.1:4310/';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => window.localStorage.removeItem('cubiciUserAuth'));
});

test('M1-2 verifies and captures the public PC main screen', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(targetUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  await expect(page.locator('.auth-main-shell')).toHaveCount(0);
  await expect(page.locator('#mainSlide > .lv-main-track > .swiper-slide')).toHaveCount(4);
  await expect(page.locator('#mainSlide .swiper-pagination-bullet')).toHaveCount(4);
  await expect(page.locator('.lv-main-content .menu-list > li')).toHaveCount(4);
  await expect(page.getByRole('link', { name: '로그인' }).first()).toBeVisible();

  await page.screenshot({
    fullPage: true,
    path: '../docs/reference/lv-ui/work/USR-MAIN-PUBLIC-PC/candidate/candidate-react.png',
  });
});

test('M1-2 verifies and captures the public mobile main screen', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 360, height: 640 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  await page.addInitScript(() => window.localStorage.removeItem('cubiciUserAuth'));
  await page.goto(targetUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  await expect(page.locator('.final-mobile-logout')).toBeVisible();
  await expect(page.locator('.final-mobile-logout .login-box')).toBeVisible();
  await expect(page.locator('.lv-mobile-section-tabs a')).toHaveCount(4);
  await expect(page.locator('.mainContents.pc')).toBeHidden();
  await expect(page.locator('.mobile-gnb-wrap')).toBeVisible();

  await page.evaluate(() => window.scrollTo(0, 0));
  const layout = await page.evaluate(() => {
    const login = document.querySelector('.logout-content .login-box').getBoundingClientRect();
    const nav = document.querySelector('.mobile-gnb-wrap').getBoundingClientRect();
    return { loginHeight: login.height, navBottom: nav.bottom };
  });
  expect(layout.loginHeight).toBeLessThanOrEqual(240);
  expect(layout.navBottom).toBeLessThanOrEqual(642);
  await page.locator('.mobile-header').scrollIntoViewIfNeeded();
  await page.screenshot({
    fullPage: false,
    path: '../docs/reference/lv-ui/work/USR-MAIN-PUBLIC-MOBILE/candidate/candidate-react.png',
  });
  await context.close();
});
