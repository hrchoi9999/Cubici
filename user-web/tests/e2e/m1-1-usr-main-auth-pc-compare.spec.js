import { expect, test } from '../../../admin-web/node_modules/@playwright/test/index.mjs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

test('M1-1 renders the authenticated main comparison board', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  const boardPath = path.resolve(
    '..',
    'docs/reference/lv-ui/work/USR-MAIN-AUTH-PC/compare.html',
  );

  await page.goto(pathToFileURL(boardPath).href);
  await expect(page.getByRole('heading', { name: 'USR-MAIN-AUTH-PC 화면 비교' })).toBeVisible();
  await page.screenshot({
    fullPage: true,
    path: '../docs/reference/lv-ui/work/USR-MAIN-AUTH-PC/compare/reference-vs-current.png',
  });
});
