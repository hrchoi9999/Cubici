import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const candidateDir = path.resolve(
  __dirname,
  '../../../docs/reference/lv-ui/admin/ADM-BATCH3-MONEYBANK-OPERATION/candidate',
);

fs.mkdirSync(candidateDir, { recursive: true });

const contractPayload = {
  items: [
    {
      id: 'MB-20260809-01', mbid: 'MB-20260809-01', status: 'REQUEST', status_label: '신청',
      request_date: '2026-08-09', approval_date: '2026-08-09', contract_date: '2026-08-09',
      user_id: 'member@example.com', user_name: '홍길동', firm_name: '한국상사',
      product_code: 'MP', sales_amount: 3000000, prizm_score: 72, latest_fee_rate: 1.2,
      latest_payment_rate: 80, request_shop: 2, document_status_label: '확인대기',
    },
  ],
  total: 1,
  counts: {
    total_count: 1, request_count: 1, waiting_count: 1, approved_count: 0,
    rejected_count: 0, contracted_count: 0, ended_count: 0,
  },
};

const settlementPayload = {
  items: [
    {
      id: 1, settlements_id: 1, shop_type: 'SMART', shop_id: 'SHOP-1', settlement_type: 'DAILY',
      settlement_date: '2026-08-09', total_sale: 3000000, service_fee: 36000,
      settlement_target_amount: 2964000, settlement_amount: 2964000, pending_released_amount: 0,
      bank_name: '테스트은행', bank_account_holder: '홍길동', bank_account: '000-000',
      status: 'READY', settlement_check_status: 'OK', settlement_difference: 0,
    },
  ],
  total: 1,
  counts: { ok_count: 1, diff_count: 0, check_status_label: '일치' },
};

const redemptionPayload = {
  items: [
    {
      mbid: 'MB-20260809-01', provision_count: 1, total_provision_amount: 3000000,
      latest_provision_date: '2026-08-09', repayment_count: 1, total_repayment_amount: 1000000,
      deposit_count: 1, total_deposit_amount: 1000000, sales_count: 3, sales_payment_amount: 3000000,
      latest_outstanding_balance: 2000000, latest_balance_check_status: 'OK', latest_balance_difference: 0,
      latest_history_date: '2026-08-09',
    },
  ],
  total: 1,
  counts: { ok_count: 1, diff_count: 0, outstanding_count: 1, check_status_label: '일치' },
};

const riskPayload = {
  items: [
    {
      source: {
        mbid: 'MB-20260809-01', user_no: 1, user_name: '홍길동', firm_name: '한국상사',
        biz_num: '000-00-00000', reg_date: '2026-08-09',
      },
      pcs: { no: 1, score: 72, grade: 'B', sales_score: 70, management_score: 74 },
      pms: { no: 1, score: 68, grade: 'B', sales_score: 67, management_score: 69 },
    },
  ],
  total: 1,
  counts: {
    total_count: 1, pcs_count: 1, pms_count: 1, linked_count: 1,
    source_status_label: 'mock', policy_status_label: '조회 재현',
  },
};

const routeConfigs = [
  {
    code: 'ADM-04A-REQUEST', path: '/admin/moneybank/request', endpoint: '/contracts',
    ready: '.requestTable tbody tr', input: '#firmName', query: 'firm_name', value: '한국상사',
  },
  {
    code: 'ADM-04B-APPROVAL', path: '/admin/moneybank/approval_tab1', endpoint: '/contracts',
    ready: '.approvalTable tbody tr', input: '#approvalFirmName', query: 'firm_name', value: '한국상사',
  },
  {
    code: 'ADM-04C-CONTRACT', path: '/admin/moneybank/approval_tab2', endpoint: '/contracts',
    ready: '.contractManagementTable tbody tr', input: '#contractFirmName', query: 'firm_name', value: '한국상사',
  },
  {
    code: 'ADM-04D-SETTLEMENT', path: '/admin/moneybank/settlement', endpoint: '/settlements',
    ready: '.settlementTable tbody tr', input: '#settlementShopId', query: 'shop_id', value: 'SHOP-1',
  },
  {
    code: 'ADM-04E-REDEMPTION', path: '/admin/moneybank/redemption', endpoint: '/redemptions',
    ready: '.redemptionTable tbody tr', input: '#redemptionMbid', query: 'mbid', value: 'MB-20260809-01',
  },
  {
    code: 'ADM-04F-PRIZM', path: '/admin/moneybank/risk-results', endpoint: '/risk-results',
    ready: '.prizmTable tbody tr', input: '#prizmMbid', query: 'mbid', value: 'MB-20260809-01',
  },
];

function apiPayload(url) {
  if (url.includes('/accounts/admin-me')) {
    return { user_no: 1, email: 'admin@example.com', user_type: 'ADMIN_USER', name: '관리자' };
  }
  if (url.includes('/contracts')) return contractPayload;
  if (url.includes('/settlements')) return settlementPayload;
  if (url.includes('/redemptions')) return redemptionPayload;
  if (url.includes('/risk-results')) return riskPayload;
  return { items: [], total: 0, counts: {} };
}

test.describe('ADM Batch 3 moneybank operation direct menu pages', () => {
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
        access_token: 'adm-batch3-test-token',
        user: { email: 'admin@example.com', user_type: 'ADMIN_USER' },
      }));
    });
  });

  for (const config of routeConfigs) {
    test(`${config.code} restores responsive UI and preserves search query`, async ({ page }) => {
      const pageErrors = [];
      page.on('pageerror', (error) => pageErrors.push(error.message));

      await page.setViewportSize({ width: 1440, height: 900 });
      const initialRequest = page.waitForRequest((request) => request.url().includes(config.endpoint));
      await page.goto(config.path);
      await initialRequest;
      await expect(page.locator(config.ready).first()).toBeVisible();

      await page.locator(config.input).fill(config.value);
      await Promise.all([
        page.waitForRequest((request) => {
          const url = new URL(request.url());
          return url.pathname.includes(config.endpoint) && url.searchParams.get(config.query) === config.value;
        }),
        page.locator(`form.searchArea:has(${config.input}) button[type="submit"]`).click(),
      ]);

      await expect(page.locator('.snbArea li.active li.active')).toBeVisible();
      let overflow = await overflowState(page);
      expect(overflow.body, JSON.stringify(overflow.offenders)).toBeLessThanOrEqual(1);
      let tableChrome = await tableChromeState(page);
      expect(tableChrome.accentWidthDifference).toBeLessThanOrEqual(1);
      expect(tableChrome.summaryPaddingTop).toBeLessThanOrEqual(12);
      expect(tableChrome.pagerHeightDifference).toBeLessThanOrEqual(1);
      expect(tableChrome.controlBackground).toBe('rgb(159, 178, 207)');
      expect(tableChrome.currentBackground).toBe('rgb(0, 46, 110)');
      await page.screenshot({ path: path.join(candidateDir, `${config.code}-PC.png`), fullPage: true });

      await page.setViewportSize({ width: 390, height: 844 });
      await expect(page.locator('.adminNavigationToggle')).toBeVisible();
      await expect.poll(async () => {
        const navigationBox = await page.locator('#admin-navigation').boundingBox();
        return navigationBox?.x ?? 0;
      }).toBeLessThanOrEqual(-300);
      overflow = await overflowState(page);
      expect(overflow.body, JSON.stringify(overflow.offenders)).toBeLessThanOrEqual(1);
      tableChrome = await tableChromeState(page);
      expect(tableChrome.accentWidthDifference).toBeLessThanOrEqual(1);
      expect(tableChrome.summaryPaddingTop).toBeLessThanOrEqual(6);
      expect(tableChrome.pagerHeightDifference).toBeLessThanOrEqual(1);
      expect(tableChrome.controlBackground).toBe('rgb(159, 178, 207)');
      expect(tableChrome.currentBackground).toBe('rgb(0, 46, 110)');
      await page.screenshot({ path: path.join(candidateDir, `${config.code}-MOBILE.png`), fullPage: true });

      expect(pageErrors).toEqual([]);
    });
  }
});

function tableChromeState(page) {
  return page.evaluate(() => {
    const overflowBox = document.querySelector('.legacyListTable .overflowBox');
    const summaryBar = document.querySelector('.fixTable .fixBottom');
    const pagerItems = [...document.querySelectorAll('#pagingButton .prev, #pagingButton .num.active, #pagingButton .next')];
    const pagerControl = document.querySelector('#pagingButton .prev');
    const currentPage = document.querySelector('#pagingButton .num.active');
    const pagerHeights = pagerItems.map((item) => item.getBoundingClientRect().height);
    const accentWidth = Number.parseFloat(getComputedStyle(overflowBox, '::before').width);
    const overflowWidth = overflowBox.getBoundingClientRect().width;

    return {
      accentWidthDifference: Math.abs(accentWidth - overflowWidth),
      summaryPaddingTop: Number.parseFloat(getComputedStyle(summaryBar).paddingTop),
      pagerHeightDifference: Math.max(...pagerHeights) - Math.min(...pagerHeights),
      controlBackground: getComputedStyle(pagerControl).backgroundColor,
      currentBackground: getComputedStyle(currentPage).backgroundColor,
    };
  });
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
          right: Math.round(rect.right),
          width: Math.round(rect.width),
        };
      })
      .filter((item) => item.right > viewportWidth + 1 && item.right <= bodyWidth + 2)
      .sort((a, b) => b.right - a.right)
      .slice(0, 10);

    return { body: bodyWidth - viewportWidth, offenders };
  });
}
