import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const candidateDir = path.resolve(
  __dirname,
  '../../../docs/reference/lv-ui/admin/ADM-00-COMMON-SHELL/candidate',
);

fs.mkdirSync(candidateDir, { recursive: true });

function installApiMocks(page, onAdminMe = () => {}) {
  return page.route('**/v1/api/**', async (route) => {
    const url = route.request().url();
    if (url.includes('/accounts/admin-me')) onAdminMe();
    const payload = url.includes('/accounts/admin-me')
      ? {
          user_no: 1,
          email: 'admin@example.com',
          user_type: 'ADMIN_USER',
          name: '관리자',
        }
      : {
          items: [],
          total: 0,
          counts: {},
          metrics: {},
        };

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(payload),
    });
  });
}

function installAdminSession(page) {
  return page.addInitScript(() => {
    window.localStorage.setItem(
      'cubiciAdminAuth',
      JSON.stringify({
        token_type: 'Bearer',
        access_token: 'adm-batch1-test-token',
        user: {
          email: 'admin@example.com',
          user_type: 'ADMIN_USER',
        },
      }),
    );
  });
}

test('admin login keeps the common visual language on PC and mobile', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/admin');
  await expect(page.locator('.adminLoginCard')).toBeVisible();
  await expect(page.getByLabel('관리자 계정')).toHaveValue('');
  await page.screenshot({ path: path.join(candidateDir, 'admin-login-pc.png') });

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('.adminLoginCard')).toBeVisible();
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);
  await page.screenshot({ path: path.join(candidateDir, 'admin-login-mobile.png') });
});

test('admin common shell is stable on PC', async ({ page }) => {
  await installApiMocks(page);
  await installAdminSession(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/admin/cubici/manageMember/member_tab1');

  await expect(page.locator('#wrap.adminReactWrap')).toBeVisible();
  await expect(page.locator('#admin-navigation')).toBeVisible();
  await expect(page.locator('.adminNavigationToggle')).toBeHidden();
  await expect(page.locator('.contentArea table').first()).toBeVisible();

  const bodyOverflow = await page.evaluate(
    () => document.body.scrollWidth - document.documentElement.clientWidth,
  );
  expect(bodyOverflow).toBeLessThanOrEqual(1);
  await page.screenshot({ path: path.join(candidateDir, 'admin-shell-pc.png') });
});

test('admin common shell uses a dismissible mobile navigation drawer', async ({ page }) => {
  await installApiMocks(page);
  await installAdminSession(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/admin/cubici/manageMember/member_tab1');

  const toggle = page.locator('.adminNavigationToggle');
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await page.screenshot({ path: path.join(candidateDir, 'admin-shell-mobile.png') });

  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  const navigation = page.locator('#admin-navigation');
  await expect(navigation).toBeInViewport();
  await expect(navigation).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
  const navigationBox = await navigation.boundingBox();
  expect(navigationBox?.x).toBeGreaterThanOrEqual(-1);
  expect(navigationBox?.y).toBeGreaterThanOrEqual(67);
  expect(navigationBox?.width).toBeGreaterThanOrEqual(300);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  await expect(page.locator('.adminNavigationBackdrop')).toBeVisible();
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  await page.screenshot({ path: path.join(candidateDir, 'admin-shell-mobile-navigation.png') });

  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');

  const bodyOverflow = await page.evaluate(
    () => document.body.scrollWidth - document.documentElement.clientWidth,
  );
  expect(bodyOverflow).toBeLessThanOrEqual(1);
});

test('admin sidebar navigation stays in the SPA and verifies the session once', async ({ page }) => {
  let adminMeCalls = 0;
  await installApiMocks(page, () => {
    adminMeCalls += 1;
  });
  await installAdminSession(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/admin/cubici/manageMember/member_tab1');

  await expect(page.locator('figure h3')).toHaveText('회원 현황');
  await page.getByRole('button', { name: '쇼핑몰 통합', exact: true }).click();
  await page.getByRole('link', { name: '통합 현황', exact: true }).click();

  await expect(page).toHaveURL(/\/admin\/cubici\/infoIntegrated\/cubici_tab1$/);
  await expect(page.locator('figure h3')).toHaveText('통합 현황');
  await expect(page.getByText('관리자 권한 확인 중입니다.', { exact: true })).toHaveCount(0);
  expect(adminMeCalls).toBe(1);

  await page.goBack();
  await expect(page.locator('figure h3')).toHaveText('회원 현황');
  expect(adminMeCalls).toBe(1);
});
