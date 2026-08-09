import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const candidateDir = path.resolve(
  __dirname,
  '../../../docs/reference/lv-ui/admin/ADM-BATCH5B-ENVIRONMENT/candidate',
);

fs.mkdirSync(candidateDir, { recursive: true });

const adminAccount = {
  row_no: 1,
  admin_id: 'temp_admin_1',
  admin_type: '00',
  admin_type_label: '큐빅아이',
  admin_name: '운영관리자',
  admin_phone: '01000000000',
  admin_email: 'admin@example.com',
  admin_department: '운영팀',
  admin_grade: '02',
  admin_grade_label: '승인대기',
  approval_status: '대기',
  admin_reg_date: '2026-08-09T09:00:00',
  admin_approval_date: null,
};

const charge = {
  row_no: 1,
  charge_code: 'B0101',
  charge_name: '1개월 기본요금',
  charge_type: 'B',
  status: '운영',
  start_date: '2026-01-01',
  expire_date: '2099-12-31',
  sub_id: 1,
  sales_count: '30',
  product_count: '10',
  amount: 29000,
  period: 1,
  period_unit: 'M',
  charge_detail: '기본 요금제',
  reg_date: '2026-08-09T09:00:00',
};

const promotion = {
  row_no: 1,
  promo_code: 'NCBCI',
  promo_name: '신규 자체 프로모션',
  promo_target: 'N',
  promo_target_label: '신규',
  partner_code: 'CBCI',
  partner_name: '자체',
  status: 'Y',
  status_label: '운영',
  start_date: '2026-07-01',
  expire_date: '2026-12-31',
  charge_codes: ['B0101'],
  charge_names: ['1개월 기본요금'],
  discount_rate: 10,
  period: 1,
  period_unit: 'M',
  period_unit_label: '개월',
  sub_id: 1,
  sub_id_label: '1',
  promo_detail: '신규 회원 혜택',
  reg_date: '2026-08-09T09:00:00',
};

const partner = {
  row_no: 1,
  partner_id: '1234567890',
  partner_code: 'BAAZ',
  partner_name: '아즈온',
  rep_name: '대표',
  partner_zip: '12345',
  partner_address: '서울시 강동구',
  partner_status: '00',
  partner_status_label: '운영',
  partner_type: 'BA',
  partner_type_label: 'B2B대행',
  manager_name: '담당자',
  manager_phone: '01000000000',
  reg_date: '2026-08-09T09:00:00',
};

const product = {
  row_no: 1,
  firm_no: 10,
  firm_id: '1234567890',
  firm_name: '머니뱅크 제휴사',
  rep_name: '대표',
  firm_zip: '12345',
  firm_address: '서울시 강동구',
  manager_name: '담당자',
  manager_rank: '팀장',
  manager_phone: '01000000000',
  product_name: '선정산 기본상품',
  product_status: '00',
  product_status_label: '운영',
  service_amount_min: 100000,
  service_amount_max: 5000000,
  service_repay_min: 7,
  service_repay_max: 30,
  service_fee_min: 1.5,
  service_fee_max: 3,
  reg_date: '2026-08-09T09:00:00',
};

const prizmItem = {
  row_no: 1,
  division: 1,
  division_label: 'Prizm',
  subject_no: 1,
  subject_name: '사업 안정성',
  item_no: 1,
  item_nm: '사업기간',
  config_status_label: '설정완료',
  item_definition: '사업자등록 기간',
  item_weight: '10',
  item_standard_low1: '0',
  item_standard_high1: '3',
  item_standard_low2: '3',
  item_standard_high2: '6',
  item_standard_low3: '6',
  item_standard_high3: '12',
  item_standard_low4: '12',
  item_standard_high4: '24',
  item_standard_low5: '24',
  item_standard_high5: null,
};

const routeConfigs = [
  {
    code: 'ADM-07A-ADMIN-ACCOUNT',
    path: '/admin/cubici/adminPreference/adminRegister_tab1',
    readyText: '운영관리자',
    editor: '.adminAccountPanel',
    openButton: '신청 등록',
  },
  {
    code: 'ADM-07B-CHARGE',
    path: '/admin/cubici/adminPreference/manageCharge',
    readyText: '1개월 기본요금',
    editor: '.chargeEditorPanel',
    openButton: '요금제 추가',
  },
  {
    code: 'ADM-07C-PROMOTION',
    path: '/admin/cubici/adminPreference/managePromotion',
    readyText: '신규 자체 프로모션',
    editor: '.promotionEditorPanel',
    openButton: '연계코드 추가',
  },
  {
    code: 'ADM-07D-PARTNER',
    path: '/admin/cubici/adminPreference/managePartner',
    readyText: '아즈온',
    editor: '.partnerEditorPanel',
    openButton: '협력사 추가',
  },
  {
    code: 'ADM-07E-MONEYBANK',
    path: '/admin/cubici/adminPreference/manageMoneybank_tab1',
    readyText: '선정산 기본상품',
    editor: '.moneybankProductPanel',
    openButton: '보기',
  },
  {
    code: 'ADM-07F-PRIZM-SYSTEM',
    path: '/admin/cubici/adminPreference/prizmConfig',
    readyText: '사업기간',
    editor: '.prizmConfigPanel',
    openButton: '선택',
  },
];

function apiPayload(request) {
  const { pathname } = new URL(request.url());

  if (pathname.endsWith('/accounts/admin-me')) {
    return { user_no: 1, email: 'admin@example.com', user_type: 'ADMIN_USER', name: '관리자' };
  }
  if (pathname.endsWith('/preferences/admin-accounts/temp_admin_1')) return adminAccount;
  if (pathname.endsWith('/preferences/admin-accounts')) {
    return { limit: 20, offset: 0, counts: { total_count: 1, pending_count: 1, approved_count: 0 }, items: [adminAccount] };
  }
  if (pathname.endsWith('/preferences/charges/B0101')) return charge;
  if (pathname.endsWith('/preferences/charges')) {
    return { limit: 20, offset: 0, counts: { total_count: 1, operating_count: 1, ended_count: 0 }, items: [charge] };
  }
  if (pathname.endsWith('/preferences/promotions/options')) {
    return {
      targets: [{ value: 'N', label: '신규' }],
      partner_divisions: [{ value: 'CBCI', label: '자체' }],
      partners: [],
      charges: [{ value: 'B0101', label: '1개월 기본요금' }],
    };
  }
  if (pathname.endsWith('/preferences/promotions/NCBCI')) return promotion;
  if (pathname.endsWith('/preferences/promotions')) {
    return { limit: 20, offset: 0, counts: { total_count: 1, operating_count: 1, ended_count: 0 }, items: [promotion] };
  }
  if (pathname.endsWith('/preferences/partners/1234567890')) {
    return {
      partner,
      managers: [
        { manager_type: '00', manager_name: '책임자', manager_rank: '팀장', manager_email: 'sup@example.com', manager_phone: '01011112222' },
        { manager_type: '01', manager_name: '담당자', manager_rank: '매니저', manager_email: 'manager@example.com', manager_phone: '01000000000' },
      ],
    };
  }
  if (pathname.endsWith('/preferences/partners')) {
    return {
      limit: 20,
      offset: 0,
      counts: { total_count: 1, operating_count: 1, ended_count: 0, type_ba_count: 1, type_bb_count: 0, type_co_count: 0, type_fi_count: 0, type_mn_count: 0, type_th_count: 0 },
      items: [partner],
    };
  }
  if (pathname.endsWith('/preferences/moneybank-products/10')) return product;
  if (pathname.endsWith('/preferences/moneybank-products')) {
    return { limit: 20, offset: 0, counts: { total_count: 1, operating_count: 1, completed_count: 0, stopped_count: 0 }, items: [product] };
  }
  if (pathname.endsWith('/preferences/prizm-config/items/1/1/1')) return prizmItem;
  if (pathname.endsWith('/preferences/prizm-config/items')) {
    return { limit: 20, offset: 0, counts: { total_count: 1, prizm_count: 1, cra_count: 0, incomplete_count: 0 }, items: [prizmItem] };
  }
  if (pathname.endsWith('/preferences/prizm-config/update-records')) {
    return { limit: 5, offset: 0, total: 1, items: [{ record_id: 1, division: 1, subject_no: 1, item_no: 1, item_name: '사업기간', admin_id: 'admin', update_memo: '초기 조정', reg_date: '2026-08-09T09:00:00' }] };
  }
  return { items: [], total: 0 };
}

test.describe('ADM Batch 5B environment preference pages', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/v1/api/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(apiPayload(route.request())),
      });
    });
    await page.addInitScript(() => {
      window.localStorage.setItem('cubiciAdminAuth', JSON.stringify({
        token_type: 'Bearer',
        access_token: 'adm-batch5b-test-token',
        user: { email: 'admin@example.com', user_type: 'ADMIN_USER' },
      }));
    });
  });

  for (const config of routeConfigs) {
    test(`${config.code} restores LV list density and responsive detail flow`, async ({ page }) => {
      const pageErrors = [];
      page.on('pageerror', (error) => pageErrors.push(error.message));

      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(config.path);
      await expect(page.getByText(config.readyText).first()).toBeVisible();
      await expect(page.locator('.snbArea li.active li.active')).toBeVisible();
      await expect(page.locator(config.editor)).toHaveCount(0);
      await assertViewport(page);
      await assertPager(page);
      await page.screenshot({ path: path.join(candidateDir, `${config.code}-PC.png`), fullPage: true });

      await page.setViewportSize({ width: 390, height: 844 });
      await expect(page.locator('.adminNavigationToggle')).toBeVisible();
      await expect.poll(async () => {
        const box = await page.locator('#admin-navigation').boundingBox();
        return box?.x ?? 0;
      }).toBeLessThanOrEqual(-300);
      await assertViewport(page);
      await assertPager(page);
      await page.screenshot({ path: path.join(candidateDir, `${config.code}-MOBILE.png`), fullPage: true });

      await page.getByRole('button', { name: config.openButton }).first().click();
      await expect(page.locator(config.editor)).toBeVisible();
      expect(pageErrors).toEqual([]);
    });
  }
});

async function assertViewport(page) {
  const state = await page.evaluate(() => ({
    overflow: document.body.scrollWidth - document.documentElement.clientWidth,
    tableScrollers: [...document.querySelectorAll('.overflowBox, .legacyTableWrap')]
      .filter((element) => element.scrollWidth > element.clientWidth).length,
  }));
  expect(state.overflow).toBeLessThanOrEqual(1);
  expect(state.tableScrollers).toBeGreaterThanOrEqual(1);
}

async function assertPager(page) {
  const pager = page.locator('.pagingControls').first();
  await expect(pager).toBeVisible();
  const state = await pager.evaluate((container) => {
    const items = [...container.children];
    const heights = items.map((item) => item.getBoundingClientRect().height);
    return {
      difference: Math.max(...heights) - Math.min(...heights),
      previous: getComputedStyle(items[0]).backgroundColor,
      current: getComputedStyle(items[1]).backgroundColor,
    };
  });
  expect(state.difference).toBeLessThanOrEqual(1);
  expect(state.previous).toBe('rgb(159, 178, 207)');
  expect(state.current).toBe('rgb(0, 46, 110)');
}
