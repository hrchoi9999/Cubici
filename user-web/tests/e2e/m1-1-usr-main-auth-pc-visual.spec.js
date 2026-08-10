import { expect, test } from '../../../admin-web/node_modules/@playwright/test/index.mjs';

const targetUrl = process.env.CUBICI_M1_CURRENT_URL ?? 'https://a2d9e106.cubici.pages.dev/';

test('M1-1 captures the current authenticated PC main screen', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.addInitScript(() => {
    window.localStorage.setItem('cubiciUserAuth', JSON.stringify({
      access_token: 'visual-reference-token',
      token_type: 'Bearer',
      user: {
        user_no: 1,
        email: 'visual-reference@cubici.local',
        name: '홍길동',
        user_type: 'USER',
      },
    }));
  });

  await page.goto(targetUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('.final-main-page')).toBeVisible();
  await page.screenshot({
    fullPage: true,
    path: '../docs/reference/lv-ui/work/USR-MAIN-AUTH-PC/current/current-react.png',
  });
});
