import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const candidateDir = path.resolve(
  __dirname,
  '../../../docs/reference/lv-ui/admin/ADM-BATCH2-SIX-PAGES/candidate',
);

fs.mkdirSync(candidateDir, { recursive: true });

const memberSummary = {
  metrics: {
    standard_date: '2026-08-09',
    from_date: '2026-08-01',
    to_date: '2026-08-09',
    cubici_yesterday_count: 12,
    cubici_total_count: 1280,
    moneybank_yesterday_count: 4,
    moneybank_total_count: 320,
    terminated_yesterday_count: 1,
    terminated_total_count: 42,
    partner_yesterday_count: 2,
    partner_total_count: 19,
    data_source_label: 'PostgreSQL 직접집계',
    aggregation_status_label: 'legacy 산식 검산 대기',
    shop_grouping_status_label: 'shop grouping 검산 대기',
  },
  series: [
    {
      bucket: '2026-08-07', cubici_count: 7, moneybank_count: 2, terminated_count: 0,
      cubici_cumulative: 1261, moneybank_cumulative: 314, terminated_cumulative: 41, moneybank_ratio: 24.9,
    },
    {
      bucket: '2026-08-08', cubici_count: 7, moneybank_count: 2, terminated_count: 1,
      cubici_cumulative: 1268, moneybank_cumulative: 316, terminated_cumulative: 42, moneybank_ratio: 24.9,
    },
    {
      bucket: '2026-08-09', cubici_count: 12, moneybank_count: 4, terminated_count: 0,
      cubici_cumulative: 1280, moneybank_cumulative: 320, terminated_cumulative: 42, moneybank_ratio: 25,
    },
  ],
};

const overview = {
  unit: 'day',
  summary: {
    standard_date: '2026-08-09',
    from_date: '2026-08-01',
    to_date: '2026-08-09',
    contract_total_count: 12,
    active_contract_count: 8,
    provision_total_amount: 12000000,
    provision_total_count: 5,
    repayment_total_amount: 3000000,
    repayment_total_count: 2,
    outstanding_balance_amount: 9000000,
    outstanding_balance_count: 6,
    balance_reconcile_diff: 0,
    data_source_label: 'PostgreSQL 직접집계',
    aggregation_status_label: 'legacy 산식 검산 대기',
    balance_reconcile_status_label: '검산 일치',
  },
  warnings: [
    {
      mbid: 'MB-20260809-01', user_name: '홍길동', firm_name: '한국상사',
      provision_amount: 3000000, repayment_amount: 1000000, outstanding_balance: 2000000,
      signal: '상환기일 확인', prizm_grade: 'B',
    },
  ],
  series: [
    { bucket: '2026-08-07', contract_count: 3, provision_amount: 5000000, repayment_amount: 1200000, settlement_amount: 2400000 },
    { bucket: '2026-08-08', contract_count: 4, provision_amount: 4000000, repayment_amount: 800000, settlement_amount: 2000000 },
    { bucket: '2026-08-09', contract_count: 5, provision_amount: 3000000, repayment_amount: 1000000, settlement_amount: 1600000 },
  ],
};

const payment = {
  items: [
    {
      seq: 1, row_no: 1, charge_name: 'Standard', reg_date: '2026-01-10T09:00:00',
      user_id: 'member@example.com', user_name: '홍길동', firm_name: '한국상사',
      user_phone: '010-0000-0000', firm_tel: '02-0000-0000', shop_count: 2,
      firm_addr: '서울시 강동구', expire_date: '2027-01-09T23:59:59',
      payment_date: '2026-08-09T10:30:00', payment_status_label: '결제완료',
      amount: 110000, payment_fee: 3300, vat: 330, profit: 106370,
    },
  ],
  counts: { total_count: 1, paid_count: 1 },
  sums: { amount: 110000, payment_fee: 3300, vat: 330, profit: 106370 },
};

const usage = {
  items: [
    {
      mbid: 'MB-20260809-01', usage_status: '상환', request_date: '2026-08-01',
      user_email: 'member@example.com', firm_name: '한국상사', user_name: '홍길동', product_code: 'MP',
      contract_date: '2026-08-02', expire_date: '2026-09-02', fee_rate: 1.2, payment_rate: 80,
      provision_amount: 3000000, repayment_amount: 1000000, outstanding_balance: 2000000, prizm_grade: 'B',
    },
  ],
  total: 1,
  counts: { request_count: 0, review_count: 0, rejected_count: 0, repayment_count: 1, expired_count: 0 },
  sums: { provision_amount: 3000000, outstanding_balance: 2000000 },
};

const routeConfigs = [
  {
    code: 'ADM-01A-CUBICI-INTEGRATED',
    path: '/admin/cubici/infoIntegrated/cubici_tab1',
    endpoint: '/management/member-summary',
    ready: '.integratedPanel tbody tr',
    interact: async (page) => {
      await Promise.all([
        page.waitForRequest((request) => request.url().includes('/management/member-summary') && request.url().includes('unit=week')),
        page.locator('.legacySearchBox select[name="unit"]').selectOption('week'),
      ]);
    },
  },
  {
    code: 'ADM-01B-MONEYBANK-INTEGRATED',
    path: '/admin/cubici/infoIntegrated/moneybank_tab1',
    endpoint: '/management/overview',
    ready: '.integratedPanel tbody tr',
    interact: async (page) => {
      await Promise.all([
        page.waitForRequest((request) => request.url().includes('/management/overview') && request.url().includes('unit=week')),
        page.locator('.legacySearchBox select[name="unit"]').selectOption('week'),
      ]);
    },
  },
  {
    code: 'ADM-02A-MEMBER-SUMMARY',
    path: '/admin/cubici/manageMember/member_tab1',
    endpoint: '/management/member-summary',
    ready: '.memberSummaryTable tbody tr',
    interact: async (page) => {
      await page.locator('#memberPartnerCode').fill('PARTNER-A');
      await Promise.all([
        page.waitForRequest((request) => request.url().includes('/management/member-summary') && request.url().includes('partner_code=PARTNER-A')),
        page.locator('form.searchArea:has(#memberPartnerCode) button[type="submit"]').click(),
      ]);
    },
  },
  {
    code: 'ADM-02B-MEMBER-PAYMENT',
    path: '/admin/cubici/manageMember/payment_tab1',
    endpoint: '/management/member-payments',
    ready: '.memberPaymentTable tbody tr',
    pagination: true,
    interact: async (page) => {
      await page.locator('#paymentUserName').fill('홍길동');
      await Promise.all([
        page.waitForRequest((request) => request.url().includes('/management/member-payments') && request.url().includes('%ED%99%8D%EA%B8%B8%EB%8F%99')),
        page.locator('form.searchArea:has(#paymentUserName) button[type="submit"]').click(),
      ]);
    },
  },
  {
    code: 'ADM-03A-MANAGEMENT-OVERVIEW',
    path: '/admin/moneybank/cubici/management/info_tab1',
    endpoint: '/management/overview',
    ready: '.managementWarningTable tbody tr',
    interact: async (page) => {
      await page.locator('#overviewUnit').selectOption('week');
      await Promise.all([
        page.waitForRequest((request) => request.url().includes('/management/overview') && request.url().includes('unit=week')),
        page.locator('.searchArea button[type="submit"]').click(),
      ]);
    },
  },
  {
    code: 'ADM-03B-MANAGEMENT-USAGE',
    path: '/admin/moneybank/management/usageList',
    endpoint: '/management/usage',
    ready: '.managementUsageTable tbody tr',
    pagination: true,
    absent: '#prizmMbid',
    interact: async (page) => {
      await page.locator('#usageFirmName').fill('한국상사');
      await Promise.all([
        page.waitForRequest((request) => request.url().includes('/management/usage') && request.url().includes('%ED%95%9C%EA%B5%AD%EC%83%81%EC%82%AC')),
        page.locator('form.searchArea:has(#usageFirmName) button[type="submit"]').click(),
      ]);
    },
  },
];

function apiPayload(url) {
  if (url.includes('/accounts/admin-me')) {
    return { user_no: 1, email: 'admin@example.com', user_type: 'ADMIN_USER', name: '관리자' };
  }
  if (url.includes('/management/member-summary')) return memberSummary;
  if (url.includes('/management/member-payments')) return payment;
  if (url.includes('/management/overview')) return overview;
  if (url.includes('/management/usage')) return usage;
  return { items: [], total: 0, counts: {}, sums: {}, metrics: {}, series: [] };
}

test.describe('ADM Batch 2 six direct menu pages', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/v1/api/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(apiPayload(route.request().url())),
      });
    });
    await page.addInitScript(() => {
      window.localStorage.setItem('cubiciAdminAuth', JSON.stringify({
        token_type: 'Bearer',
        access_token: 'adm-batch2-test-token',
        user: { email: 'admin@example.com', user_type: 'ADMIN_USER' },
      }));
    });
  });

  for (const config of routeConfigs) {
    test(`${config.code} restores responsive UI and preserves query interaction`, async ({ page }) => {
      const pageErrors = [];
      page.on('pageerror', (error) => pageErrors.push(error.message));

      await page.setViewportSize({ width: 1440, height: 900 });
      const initialRequest = page.waitForRequest((request) => request.url().includes(config.endpoint));
      await page.goto(config.path);
      await initialRequest;
      await expect(page.locator(config.ready).first()).toBeVisible();
      if (config.absent) await expect(page.locator(config.absent)).toHaveCount(0);
      await config.interact(page);
      await expect(page.locator('.snbArea li.active li.active')).toBeVisible();
      let overflow = await overflowState(page);
      expect(overflow.body, JSON.stringify(overflow.offenders)).toBeLessThanOrEqual(1);
      if (config.pagination) await expectPaginationStyle(page);
      await page.screenshot({ path: path.join(candidateDir, `${config.code}-PC.png`), fullPage: true });

      await page.setViewportSize({ width: 390, height: 844 });
      await expect(page.locator('.adminNavigationToggle')).toBeVisible();
      await expect.poll(async () => {
        const navigationBox = await page.locator('#admin-navigation').boundingBox();
        return navigationBox?.x ?? 0;
      }).toBeLessThanOrEqual(-300);
      overflow = await overflowState(page);
      expect(overflow.body, JSON.stringify(overflow.offenders)).toBeLessThanOrEqual(1);
      if (config.pagination) await expectPaginationStyle(page);
      await page.screenshot({ path: path.join(candidateDir, `${config.code}-MOBILE.png`), fullPage: true });

      expect(pageErrors).toEqual([]);
    });
  }
});

async function expectPaginationStyle(page) {
  const state = await page.evaluate(() => {
    const controls = document.querySelectorAll('#pagingButton button, .pagingControls > button');
    const current = document.querySelector('#pagingButton .num.active, .pagingControls > span');
    const heights = [controls[0], current, controls[controls.length - 1]]
      .map((item) => item.getBoundingClientRect().height);
    return {
      heightDifference: Math.max(...heights) - Math.min(...heights),
      previousBackground: getComputedStyle(controls[0]).backgroundColor,
      nextBackground: getComputedStyle(controls[controls.length - 1]).backgroundColor,
      currentBackground: getComputedStyle(current).backgroundColor,
    };
  });

  expect(state.heightDifference).toBeLessThanOrEqual(1);
  expect(state.previousBackground).toBe('rgb(159, 178, 207)');
  expect(state.nextBackground).toBe('rgb(159, 178, 207)');
  expect(state.currentBackground).toBe('rgb(0, 46, 110)');
}

function overflowState(page) {
  return page.evaluate(() => {
    const viewportWidth = document.documentElement.clientWidth;
    const bodyWidth = document.body.scrollWidth;
    const offenders = [...document.querySelectorAll('body *')]
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          selector: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}${[...element.classList].map((name) => `.${name}`).join('')}`,
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
        };
      })
      .filter((item) => item.right > viewportWidth + 1 && item.right <= bodyWidth + 2)
      .sort((a, b) => b.right - a.right)
      .slice(0, 10);

    return {
      body: bodyWidth - viewportWidth,
      offenders,
    };
  });
}
