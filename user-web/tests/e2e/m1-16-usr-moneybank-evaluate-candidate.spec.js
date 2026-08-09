import { expect, test } from '../../../admin-web/node_modules/@playwright/test/index.mjs';

const baseUrl = process.env.CUBICI_M1_MONEYBANK_EVALUATE_URL ?? 'http://127.0.0.1:4310';
const session = {
  token_type: 'Bearer',
  access_token: 'm1-16-user-token',
  expires_in: 3600,
  user: {
    user_no: 116,
    email: 'lv-review@cubici.test',
    user_type: 'USER',
    name: 'LV 대표자',
    biz_name: 'LV 온라인상사',
    biz_num: '123-45-67890',
    reg_date: '2025-05-15T09:00:00',
  },
};
const variants = [
  { key: 'ADVPAY', path: '/moneybank/advPay/evaluate', serviceName: '구매자금 선지급', contractPath: '/moneybank/advPay/contractForm' },
  { key: 'ADVCALC', path: '/moneybank/advcalc/evaluate', serviceName: '매출 선정산', contractPath: '/moneybank/advcalc/contract' },
];

function contract(status = 'CONDITIONS_ACCEPT') {
  return {
    mbid: 'MB-20260808-0116',
    user_no: 116,
    user_email: 'lv-review@cubici.test',
    user_name: 'LV 대표자',
    firm_name: 'LV 온라인상사',
    product_code: 'MP',
    status,
    request_date: '2026-08-07T10:00:00',
    approval_date: '2026-08-08T09:00:00',
    contract_date: null,
    expire_date: null,
    sales_amount: 30000000,
    demand_acc_bank_code: '경남은행',
    demand_acc_holder: 'LV 대표자',
    demand_acc_number: '111222333444',
    main_acc_bank_code: '신한은행',
    main_acc_holder: 'LV 대표자',
    main_acc_number: '555666777888',
    contract_shop_count: 3,
    request_shop: 3,
    prizm_score: 'A',
    latest_payment_rate: 90,
    latest_fee_rate: 1.2,
    modified_date: '2026-08-08T09:30:00',
  };
}

function contractDetail(status = 'CONDITIONS_ACCEPT') {
  return {
    contract: contract(status),
    shops: [
      { id: 1, mbid: 'MB-20260808-0116', contract_shop_type: 'NAVER', contract_shop_id: 'lv-naver' },
      { id: 2, mbid: 'MB-20260808-0116', contract_shop_type: 'COUPANG', contract_shop_id: 'lv-coupang' },
      { id: 3, mbid: 'MB-20260808-0116', contract_shop_type: 'STREET11', contract_shop_id: 'lv-11st' },
    ],
    fees: [{
      id: 1,
      mbid: 'MB-20260808-0116',
      payment_rate: 90,
      sales_limit_per_order: 3000000,
      max_outstanding_balance: 30000000,
      rates: [{ id: 1, fee_type: 'BASE', fee_rate: 1.2 }],
    }],
    certificate: null,
    document: null,
    redemption: null,
    risk_result: null,
  };
}

async function installMocks(page, state) {
  await page.addInitScript((auth) => {
    window.localStorage.setItem('cubiciUserAuth', JSON.stringify(auth));
  }, session);
  await page.route('**/v1/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    let body = {};

    if (request.method() === 'PUT' && url.pathname.endsWith('/contracts/MB-20260808-0116/status')) {
      state.updatePayload = request.postDataJSON();
      state.status = state.updatePayload.action === 'agree_terms' ? 'USE_AGREE' : 'TERMS_REFUSED';
      body = { mbid: 'MB-20260808-0116', status: state.status, message: '이용조건이 처리되었습니다.' };
    } else if (url.pathname.endsWith('/contracts/MB-20260808-0116')) {
      body = contractDetail(state.status);
    } else if (url.pathname.endsWith('/contracts')) {
      body = { limit: 5, offset: 0, total: 1, items: [contract(state.status)] };
    } else {
      body = { limit: 5, offset: 0, total: 0, items: [] };
    }
    await route.fulfill({ contentType: 'application/json', status: 200, body: JSON.stringify(body) });
  });
}

test('M1-16 verifies LV evaluation details and terms transition on PC', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });

  for (const variant of variants) {
    const state = { status: 'CONDITIONS_ACCEPT', updatePayload: null };
    await installMocks(page, state);
    await page.goto(`${baseUrl}${variant.path}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);

    await expect(page.locator('.moneybank-shell')).toBeVisible();
    await expect(page.locator('.react-final-sub-visual .visual-tit')).toHaveText('머니뱅크');
    await expect(page.locator('.react-final-tabs .sub-nav > li').nth(1)).toHaveClass(/active/);
    await expect(page.locator('.app-step .step li').nth(1)).toHaveClass(/active/);
    await expect(page.locator('.u16-review-progress .step-list li.active')).toHaveCount(4);
    await expect(page.locator('.u16-info-table label')).toHaveCount(8);
    await expect(page.locator('.u16-shop')).toHaveCount(3);
    expect(await page.locator('.u16-shop img').evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0))).toBe(true);
    await expect(page.locator('.u16-result-table').getByLabel('지급율', { exact: true })).toHaveValue('90%');
    await expect(page.locator('.u16-result-table').getByLabel('주문 건당 한도', { exact: true })).toHaveValue('3,000,000원');
    await expect(page.locator('.u16-terms-copy')).toContainText(variant.serviceName);
    await expect(page.getByRole('button', { name: '이용조건 동의', exact: true })).toBeVisible();

    const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(pageOverflow).toBeLessThanOrEqual(1);
    await page.screenshot({
      fullPage: true,
      path: `../docs/reference/lv-ui/work/USR-MONEYBANK-EVALUATE-${variant.key}-PC/candidate/candidate-react.png`,
    });

    await page.getByRole('button', { name: '이용조건 동의', exact: true }).click();
    await expect.poll(() => state.updatePayload?.action).toBe('agree_terms');
    await expect(page.locator('.u16-next-action .primary-action')).toHaveAttribute('href', variant.contractPath);
  }
});

test('M1-16 captures responsive evaluation states without page overflow', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 2 });
  const page = await context.newPage();

  for (const variant of variants) {
    const state = { status: 'CONDITIONS_ACCEPT', updatePayload: null };
    await installMocks(page, state);
    await page.goto(`${baseUrl}${variant.path}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);

    await expect(page.locator('.mobile-header')).toBeVisible();
    await expect(page.locator('.mobile-gnb li').nth(4)).toHaveClass(/active/);
    await expect(page.locator('.u16-review-progress .step-list li')).toHaveCount(4);
    await expect(page.locator('.u16-info-table label')).toHaveCount(8);
    await expect(page.locator('.u16-result-table label')).toHaveCount(6);
    const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(pageOverflow).toBeLessThanOrEqual(1);

    await page.screenshot({
      fullPage: true,
      path: `../docs/reference/lv-ui/work/USR-MONEYBANK-EVALUATE-${variant.key}-MOBILE/candidate/candidate-react.png`,
    });
  }

  await context.close();
});
