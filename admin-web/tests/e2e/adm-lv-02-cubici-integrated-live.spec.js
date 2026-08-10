import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const candidateDir = path.resolve(
  __dirname,
  '../../../docs/reference/lv-ui/admin/ADM-LV-02-CUBICI-INTEGRATED/candidate',
);
const sessionJson = process.env.CUBICI_ADMIN_SESSION_JSON;

fs.mkdirSync(candidateDir, { recursive: true });
test.skip(!sessionJson, 'CUBICI_ADMIN_SESSION_JSON is required for live DB verification.');

async function installSession(page) {
  const session = JSON.parse(sessionJson);
  await page.addInitScript((value) => {
    window.localStorage.setItem('cubiciAdminAuth', JSON.stringify(value));
  }, session);
}

async function expectLiveCharts(page) {
  const canvases = page.locator('.integratedLvChartBox canvas');
  await expect(canvases).toHaveCount(3);
  for (let index = 0; index < 3; index += 1) {
    const canvas = canvases.nth(index);
    await expect(canvas).toBeVisible();
    await expect.poll(async () => canvas.evaluate((element) => {
      const pixels = element.getContext('2d').getImageData(0, 0, element.width, element.height).data;
      let coloredPixels = 0;
      for (let offset = 3; offset < pixels.length; offset += 4) {
        if (pixels[offset] > 0) coloredPixels += 1;
      }
      return coloredPixels;
    })).toBeGreaterThan(500);
  }
}

test.beforeEach(async ({ page }) => {
  await installSession(page);
});

test('ADM-LV-02 renders actual Docker DB data on PC', async ({ page }) => {
  const responses = [];
  page.on('response', (response) => {
    if (response.url().includes('/v1/api/management/cubici-integrated')) {
      responses.push(response.status());
    }
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/admin/cubici/infoIntegrated/cubici_tab1');

  await expect(page.locator('.m-alert')).toHaveCount(0);
  await expect(page.locator('.integratedLvMetricGrid article')).toHaveCount(12);
  await expect.poll(() => page.locator('#integratedPartnerCode option').count()).toBeGreaterThan(1);
  await expect.poll(() => page.locator('#integratedProductCode option').count()).toBeGreaterThan(1);
  await expect(page.locator('.integratedLvOptions .baseDate')).toContainText('2024-05-05');
  await expectLiveCharts(page);
  expect(responses.every((status) => status === 200)).toBe(true);

  await page.locator('.userInfo').evaluate((element) => {
    element.textContent = '관리자님, 안녕하세요!';
  });
  await page.screenshot({
    fullPage: true,
    path: path.join(candidateDir, 'ADM-LV-02-CUBICI-INTEGRATED-LIVE-PC.png'),
  });
});

test('ADM-LV-02 renders actual Docker DB data without mobile overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/admin/cubici/infoIntegrated/cubici_tab1');

  await expect(page.locator('.m-alert')).toHaveCount(0);
  await expect(page.locator('.integratedLvMetricGrid article')).toHaveCount(12);
  await expectLiveCharts(page);
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);
  await page.screenshot({
    fullPage: true,
    path: path.join(candidateDir, 'ADM-LV-02-CUBICI-INTEGRATED-LIVE-MOBILE.png'),
  });
});
