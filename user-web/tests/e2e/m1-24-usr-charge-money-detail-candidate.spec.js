import { expect, test } from '../../../admin-web/node_modules/@playwright/test/index.mjs';

const baseUrl = process.env.CUBICI_M1_USER_URL ?? 'http://127.0.0.1:4310';
const sourceBaseUrl = process.env.CUBICI_LV_SOURCE_BASE_URL ?? 'http://127.0.0.1:4311';
const session = {
  token_type: 'Bearer',
  access_token: 'm1-24-user-token',
  expires_in: 3600,
  user: {
    user_no: 124,
    email: 'lv-charge@cubici.test',
    user_type: 'USER',
    name: '홍길동',
    biz_name: 'LV 온라인상사',
    biz_num: '123-45-67890',
  },
};

const contract = {
  mbid: 'LV-MB-2401',
  user_no: 124,
  status: 'CONTRACT',
  product_code: 'ADV_CALC',
  latest_payment_rate: 0.8,
  latest_fee_rate: 0.032,
  request_date: '2026-07-01',
  contract_date: '2026-07-10',
  expire_date: '2027-07-09',
  electronic_signature_status: 'SIGNED',
  demand_acc_bank_code: '004',
  demand_acc_number: '1234567890',
  demand_acc_holder: 'LV 온라인상사',
  main_acc_bank_code: '088',
  main_acc_number: '9876543210',
  main_acc_holder: 'LV 온라인상사',
};

const plans = [
  { charge_code: 'B0101', charge_name: '1개월 기본요금', charge_type: 'B', amount: 29000, period: 1, period_unit: 'M', status: '운영', is_current: true },
  { charge_code: 'B0103', charge_name: '3개월 기본요금', charge_type: 'B', amount: 81000, period: 3, period_unit: 'M', status: '운영' },
  { charge_code: 'B0106', charge_name: '6개월 기본요금', charge_type: 'B', amount: 156000, period: 6, period_unit: 'M', status: '운영' },
  { charge_code: 'B0112', charge_name: '1년 기본요금', charge_type: 'B', amount: 288000, period: 12, period_unit: 'M', status: '운영' },
];

function contractDetail() {
  return {
    contract,
    shops: [
      { id: 1, contract_shop_type: 'NAVER', contract_shop_id: 'lv-smartstore', reg_date: '2026-07-01' },
      { id: 2, contract_shop_type: 'COUPANG', contract_shop_id: 'lv-coupang', reg_date: '2026-07-01' },
    ],
    fees: [{
      id: 1,
      payment_rate: 0.8,
      sales_limit_per_order: 1000000,
      max_outstanding_balance: 50000000,
      reg_date: '2026-07-10',
      rates: [{ id: 1, fee_type: '정산수수료', fee_rate: 0.032 }],
    }],
    redemption: {
      latest_cumulative_provision_amount: 12000000,
      latest_cumulative_repayment_amount: 7000000,
      latest_outstanding_balance: 5000000,
      latest_history_date: '2026-08-08',
    },
  };
}

async function installMocks(page) {
  await page.addInitScript((auth) => {
    window.localStorage.setItem('cubiciUserAuth', JSON.stringify(auth));
  }, session);
  await page.route('**/v1/api/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    let body = { total: 0, items: [] };

    if (path.includes('/preferences/charges')) body = { counts: { total_count: 4, operating_count: 4, ended_count: 0 }, items: plans };
    else if (path.includes('/accounts/me/shops')) body = { total: 2, items: [{ id: 1, shop_type: 'NAVER', shop_id: 'lv-smartstore', status: 'Y' }, { id: 2, shop_type: 'COUPANG', shop_id: 'lv-coupang', status: 'Y' }] };
    else if (path.includes('/contracts/LV-MB-2401/documents/files')) body = { total: 1, items: [{ uuid: 'LV-DOC-1', file_division: '사업자등록증', origin_file_name: '사업자등록증', file_ext: 'pdf', file_size: 152400, input_date: '2026-07-01' }] };
    else if (path === '/v1/api/contracts/LV-MB-2401') body = contractDetail();
    else if (path === '/v1/api/contracts') body = { total: 1, items: [contract] };
    else if (path.includes('/redemptions/LV-MB-2401/operation-history')) body = { total: 1, items: [{ id: 1, reg_date: '2026-08-08', operation_type: 'REPAYMENT', operation_code: 'RP-240808', amount: 1000000, new_cumulative_provision_amount: 12000000, new_cumulative_repayment_amount: 7000000, new_outstanding_balance: 5000000, status: 'DONE' }] };
    else if (path.includes('/redemptions')) body = { total: 1, items: [{ mbid: contract.mbid, latest_cumulative_provision_amount: 12000000, latest_cumulative_repayment_amount: 7000000, latest_outstanding_balance: 5000000, latest_history_date: '2026-08-08' }] };

    await route.fulfill({ contentType: 'application/json', status: 200, body: JSON.stringify(body) });
  });
}

async function expectNoPageOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

test('M1-24 captures the LV charge and moneybank detail references', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(`${sourceBaseUrl}/c6p2.html`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('현재 요금제', { exact: true }).first()).toBeVisible();
  await page.screenshot({ fullPage: true, path: '../docs/reference/lv-ui/work/USR-MYPAGE-CHARGE-PC/reference/lv-reference-rendered.png' });

  await page.goto(`${sourceBaseUrl}/c4p3.html`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('이용조건', { exact: true }).first()).toBeVisible();
  await page.screenshot({ fullPage: true, path: '../docs/reference/lv-ui/work/USR-MONEYBANK-DETAIL-PC/reference/lv-reference-rendered.png' });

  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto(`${sourceBaseUrl}/c6p2.html`, { waitUntil: 'domcontentloaded' });
  await page.screenshot({ fullPage: true, path: '../docs/reference/lv-ui/work/USR-MYPAGE-CHARGE-MOBILE/reference/lv-reference-rendered.png' });
  await page.goto(`${sourceBaseUrl}/c4p3.html`, { waitUntil: 'domcontentloaded' });
  await page.screenshot({ fullPage: true, path: '../docs/reference/lv-ui/work/USR-MONEYBANK-DETAIL-MOBILE/reference/lv-reference-rendered.png' });
});

test('M1-24 restores the LV charge structure and keeps unavailable actions explicit', async ({ page }) => {
  await installMocks(page);
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(`${baseUrl}/cubici/mypage/myCharge`, { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: '현재 요금제' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '변경 요금제 선택' })).toBeVisible();
  await expect(page.locator('.u24-plan-grid label')).toHaveCount(4);
  await expect(page.getByText('1개월 기본요금', { exact: true }).first()).toBeVisible();
  await page.locator('.u24-plan-grid label').nth(3).click();
  await page.getByRole('button', { name: '결제하기' }).click();
  await expect(page.getByText('요금제 변경 및 결제 API는 아직 연결되지 않았습니다.')).toBeVisible();
  await expectNoPageOverflow(page);
  await page.screenshot({ fullPage: true, path: '../docs/reference/lv-ui/work/USR-MYPAGE-CHARGE-PC/candidate/candidate-react.png' });
});

test('M1-24 restores moneybank 이용조건 and preserves contract sections', async ({ page }) => {
  await installMocks(page);
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(`${baseUrl}/moneybank/current/LV-MB-2401`, { waitUntil: 'networkidle' });
  const conditions = page.locator('.u24-contract-conditions');
  await expect(conditions.getByRole('heading', { name: '이용조건' })).toBeVisible();
  await expect(conditions.getByText('LV-MB-2401', { exact: true })).toBeVisible();
  await expect(conditions.getByText('lv-smartstore', { exact: false })).toBeVisible();
  await expect(page.getByRole('heading', { name: '공동인증 전자서명' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '제출서류' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '지급/상환 이력' })).toBeVisible();
  await expectNoPageOverflow(page);
  await page.screenshot({ fullPage: true, path: '../docs/reference/lv-ui/work/USR-MONEYBANK-DETAIL-PC/candidate/candidate-react.png' });
});

test('M1-24 renders charge and moneybank detail responsively', async ({ page }) => {
  await installMocks(page);
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto(`${baseUrl}/cubici/mypage/myCharge`, { waitUntil: 'networkidle' });
  await expect(page.locator('.u24-plan-grid label')).toHaveCount(4);
  await expectNoPageOverflow(page);
  await page.screenshot({ fullPage: true, path: '../docs/reference/lv-ui/work/USR-MYPAGE-CHARGE-MOBILE/candidate/candidate-react.png' });

  await page.goto(`${baseUrl}/moneybank/current/LV-MB-2401`, { waitUntil: 'networkidle' });
  await expect(page.locator('.u24-condition-grid dl')).toHaveCount(14);
  await expectNoPageOverflow(page);
  await page.screenshot({ fullPage: true, path: '../docs/reference/lv-ui/work/USR-MONEYBANK-DETAIL-MOBILE/candidate/candidate-react.png' });
});
