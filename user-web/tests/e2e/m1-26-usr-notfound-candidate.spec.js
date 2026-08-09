import { expect, test } from '../../../admin-web/node_modules/@playwright/test/index.mjs';

const baseUrl = process.env.CUBICI_M1_USER_URL ?? 'http://127.0.0.1:4310';
const sourceUrl = process.env.CUBICI_LV_SOURCE_URL ?? 'http://127.0.0.1:4311/notfound.html';

async function expectNoPageOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

test('M1-26 captures the LV not-found reference on PC and mobile', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(sourceUrl, { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: 'PAGE NOT FOUND' })).toBeVisible();
  await page.screenshot({ fullPage: true, path: '../docs/reference/lv-ui/work/USR-NOTFOUND-PC/reference/lv-reference-rendered.png' });

  await page.setViewportSize({ width: 360, height: 640 });
  await page.reload({ waitUntil: 'networkidle' });
  await expectNoPageOverflow(page);
  await page.screenshot({ fullPage: true, path: '../docs/reference/lv-ui/work/USR-NOTFOUND-MOBILE/reference/lv-reference-rendered.png' });
});

test('M1-26 restores the LV not-found content and navigation', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(`${baseUrl}/lv-u26-not-found`, { waitUntil: 'networkidle' });

  const panel = page.locator('.u26-notfound-page .notfound-box');
  await expect(panel.getByRole('heading', { name: 'PAGE NOT FOUND' })).toBeVisible();
  await expect(panel.getByText('죄송합니다. 요청하신 페이지를 찾을 수 없습니다.')).toBeVisible();
  await expect(panel.getByRole('link', { name: '고객센터' })).toHaveAttribute('href', '/board/notice/index');
  await expect(panel.getByRole('link', { name: '메인으로' })).toHaveAttribute('href', '/main');
  await expect(panel.locator('strong')).toHaveCount(0);
  await expectNoPageOverflow(page);
  await page.screenshot({ fullPage: true, path: '../docs/reference/lv-ui/work/USR-NOTFOUND-PC/candidate/candidate-react.png' });
});

test('M1-26 keeps the LV not-found layout responsive on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto(`${baseUrl}/lv-u26-not-found`, { waitUntil: 'networkidle' });

  const panel = page.locator('.u26-notfound-page .notfound-box');
  await expect(panel).toBeVisible();
  await expect(panel.getByRole('link')).toHaveCount(2);
  const buttonWidths = await panel.getByRole('link').evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().width));
  expect(buttonWidths.every((width) => Math.abs(width - 120) <= 1)).toBeTruthy();
  await expectNoPageOverflow(page);
  await page.screenshot({ fullPage: true, path: '../docs/reference/lv-ui/work/USR-NOTFOUND-MOBILE/candidate/candidate-react.png' });
});
