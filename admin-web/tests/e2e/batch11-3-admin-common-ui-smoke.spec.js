import { expect, test } from '@playwright/test';

const MASTER_ADMIN_EMAIL = process.env.VITE_CUBICI_MASTER_ADMIN_EMAIL ?? process.env.CUBICI_MASTER_ADMIN_EMAIL ?? '';

const routes = [
  '/admin/cubici/manageMember/member_tab1',
  '/admin/moneybank/request',
  '/admin/cubici/supportMember/manageInquiry',
  '/admin/cubici/adminPreference/manageCharge',
];

function emptyApiPayload(url) {
  if (url.includes('/v1/api/accounts/admin-me')) {
    return {
      user_no: 1,
      email: MASTER_ADMIN_EMAIL,
      user_type: 'ADMIN_USER',
      name: '관리자',
      phone: null,
      biz_num: null,
      biz_name: null,
    };
  }

  if (url.includes('/member-summary')) {
    return {
      metrics: {},
      trend: [],
      partners: [],
    };
  }

  if (url.includes('/charges')) {
    return {
      items: [],
      counts: { total_count: 0, operating_count: 0, ended_count: 0 },
    };
  }

  return {
    items: [],
    total: 0,
    counts: {},
    metrics: {},
  };
}

test.describe('batch 11-3 admin common UI smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/v1/api/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(emptyApiPayload(route.request().url())),
      });
    });

    await page.addInitScript((masterAdminEmail) => {
      window.localStorage.setItem(
        'cubiciAdminAuth',
        JSON.stringify({
          token_type: 'Bearer',
          access_token: 'test-token',
          user: {
            email: masterAdminEmail,
            user_type: 'ADMIN_USER',
          },
        }),
      );
    }, MASTER_ADMIN_EMAIL);
  });

  for (const path of routes) {
    test(`${path} renders common search and table shell`, async ({ page }) => {
      const pageErrors = [];
      page.on('pageerror', (error) => pageErrors.push(error.message));

      await page.goto(path);

      await expect(page.locator('#wrap.adminReactWrap')).toBeVisible();
      await expect(page.locator('.searchArea').first()).toBeVisible();
      await expect(page.locator('.legacyListTable, .m-shadowTable, table').first()).toBeVisible();

      const metrics = await page.evaluate(() => {
        const searchArea = document.querySelector('.searchArea');
        const inputBox = document.querySelector('.searchArea .inputBox');
        const table = document.querySelector('.m-shadowTable, table');
        const bodyOverflow = document.body.scrollWidth - document.documentElement.clientWidth;

        return {
          searchAreaHeight: searchArea?.getBoundingClientRect().height ?? 0,
          inputBoxHeight: inputBox?.getBoundingClientRect().height ?? 0,
          tableFontSize: table ? Number.parseFloat(getComputedStyle(table).fontSize) : 0,
          bodyOverflow,
        };
      });

      expect(metrics.searchAreaHeight).toBeGreaterThan(20);
      expect(metrics.inputBoxHeight).toBeGreaterThanOrEqual(28);
      expect(metrics.tableFontSize).toBeGreaterThanOrEqual(12);
      expect(metrics.tableFontSize).toBeLessThanOrEqual(14);
      expect(metrics.bodyOverflow).toBeLessThanOrEqual(120);
      expect(pageErrors).toEqual([]);
    });
  }
});
