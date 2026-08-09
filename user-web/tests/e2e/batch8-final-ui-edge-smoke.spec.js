import { expect, test } from '../../../admin-web/node_modules/@playwright/test/index.mjs';

const longText = '큐빅아이_장문데이터_ABCDEFGHIJKLMNOPQRSTUVWXYZ_0123456789_사업자상호와계약번호가길어지는운영상황';

const session = {
  access_token: 'batch8-edge-token',
  token_type: 'Bearer',
  user: {
    user_no: 8008,
    email: `batch8-${longText.toLowerCase()}@example.com`,
    name: 'Batch8 Edge',
    phone: '010-1234-5678',
    user_type: 'GENERAL',
    biz_name: `스모크상사 ${longText}`,
    biz_num: '000-00-00000',
    partner_code: `EDGE-${longText}`,
    charge_code: `LONG-${longText}`,
  },
};

function boardItems(kind) {
  return {
    total: 2,
    answered_count: 1,
    waiting_count: 1,
    items: [
      {
        post_id: `NOTICE-${longText}`,
        qna_id: `QNA-${longText}`,
        type: 'CUBICI',
        type_label: '큐빅아이',
        title: `${kind} 장문 제목 ${longText} ${longText}`,
        content: `본문 요약도 길어질 수 있습니다. ${longText} ${longText} ${longText}`,
        answer_status: '답변대기',
        created_by: `운영자-${longText}`,
        reg_date: '2026-08-06',
        modified_date: '2026-08-06',
      },
      {
        post_id: `NOTICE-2-${longText}`,
        qna_id: `QNA-2-${longText}`,
        type: 'MONEYBANK',
        type_label: '머니뱅크',
        title: `두 번째 장문 제목 ${longText}`,
        content: `두 번째 장문 본문 ${longText}`,
        answer_status: '답변완료',
        created_by: '고객지원',
        reg_date: '2026-08-05',
        modified_date: '2026-08-06',
      },
    ],
  };
}

function chargeList() {
  return {
    counts: { total_count: 2, operating_count: 2, ended_count: 0 },
    items: [
      chargeDetail(`LONG-${longText}`),
      chargeDetail(`SECOND-${longText}`),
    ],
  };
}

function chargeDetail(code) {
  return {
    charge_code: code,
    charge_name: `프리미엄 장문 요금제 ${longText} ${code}`,
    charge_type: 'B',
    status: '운영',
    amount: 123456789,
    period: 12,
    period_unit: 'M',
    sales_count: `월 매출 기준 ${longText}`,
    product_count: `상품 등록 기준 ${longText}`,
    start_date: '2026-08-01',
    expire_date: '2027-08-01',
    charge_detail: `요금 상세 조건 ${longText} ${longText} ${longText}`,
  };
}

function contractDetail(mbid) {
  return {
    contract: {
      mbid,
      status: 'ACTIVE',
      product_code: 'ADV_CALC',
      latest_payment_rate: 0.8,
      latest_fee_rate: 0.0345,
      request_date: '2026-08-01',
      approval_date: '2026-08-02',
      agree_date: '2026-08-03',
      contract_date: '2026-08-04',
      sales_amount: 987654321,
      demand_acc_bank_code: '088',
      demand_acc_number: `${longText}-1234567890`,
      demand_acc_holder: `대표자 ${longText}`,
      main_acc_bank_code: '020',
      main_acc_number: `${longText}-0987654321`,
      main_acc_holder: `상호 ${longText}`,
      document_file_count: 2,
      prizm_score: `A-${longText}`,
      electronic_signature_status: 'SIGNED',
      electronic_signed_at: '2026-08-05',
    },
    shops: [
      { id: 1, contract_shop_type: `오픈마켓 ${longText}`, contract_shop_id: `seller-${longText}`, reg_date: '2026-08-01' },
    ],
    fees: [
      {
        id: 1,
        payment_rate: 0.8,
        sales_limit_per_order: 1000000,
        max_outstanding_balance: 50000000,
        reg_date: '2026-08-01',
        rates: [{ id: 1, fee_type: `정산수수료 ${longText}`, fee_rate: 0.0345 }],
      },
    ],
    redemption: {
      latest_cumulative_provision_amount: 10000000,
      latest_cumulative_repayment_amount: 4000000,
      latest_outstanding_balance: 6000000,
      latest_history_date: '2026-08-06',
    },
  };
}

test.beforeEach(async ({ page }) => {
  await page.route('**/v1/api/**', (route) => {
    const url = new URL(route.request().url());
    let body = { items: [], total: 0 };
    if (url.pathname.includes('/support/boards/notice')) body = boardItems('notice');
    if (url.pathname.includes('/support/boards/faq')) body = boardItems('faq');
    if (url.pathname.includes('/support/inquiries')) body = boardItems('qa');
    if (url.pathname.includes('/preferences/charges') && url.pathname.split('/').length <= 5) body = chargeList();
    if (url.pathname.includes('/preferences/charges/') && url.pathname.split('/').length > 5) body = chargeDetail(decodeURIComponent(url.pathname.split('/').pop() ?? 'LONG'));
    if (url.pathname.includes('/contracts/') && !url.pathname.includes('/documents') && !url.pathname.includes('/status')) body = contractDetail(decodeURIComponent(url.pathname.split('/').pop() ?? 'EDGE'));
    if (url.pathname.includes('/documents/files')) body = { items: [{ uuid: `file-${longText}`, file_division: `사업자서류 ${longText}`, origin_file_name: `장문파일명-${longText}`, file_ext: 'pdf', file_size: 123456, input_date: '2026-08-06' }] };
    if (url.pathname.includes('/operation-history')) body = { items: [{ id: 1, reg_date: '2026-08-06', operation_type: `REPAY-${longText}`, operation_code: `OP-${longText}`, new_cumulative_provision_amount: 10000000, new_cumulative_repayment_amount: 4000000, new_outstanding_balance: 6000000, status: 'DONE' }] };
    if (url.pathname.includes('/accounts/me/shops')) body = { items: [{ id: `shop-${longText}`, shop_type: `오픈마켓 ${longText}`, shop_id: `seller-${longText}`, status: 'ACTIVE' }] };
    if (url.pathname === '/v1/api/contracts') body = { items: [contractDetail(`MBID-${longText}`).contract], total: 1 };
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
  await page.addInitScript((value) => {
    window.localStorage.setItem('cubiciUserAuth', JSON.stringify(value));
  }, session);
});

test('Batch 8 desktop tab spacing and long data fit', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto('/cubici/mypage/companyInfo');
  await expect(page.locator('.react-final-tabs .sub-nav li')).toHaveCount(3);
  const tabMetrics = await page.locator('.react-final-tabs .sub-nav li').evaluateAll((items) => items.map((item) => item.getBoundingClientRect().width));
  expect(tabMetrics.every((width) => width >= 100)).toBeTruthy();
  const metrics = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 2);
  await page.screenshot({ fullPage: true, path: '../docs/batch8_mobile_edge_smoke/desktop_mypage_long_data.png' });
});

test('Batch 8 mobile representative long data pages do not overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const pages = [
    ['/board/notice/index', '.final-support-page'],
    ['/board/qa/index', '.final-support-page'],
    ['/chargeInfo', '.final-charge-page'],
    [`/chargeInfo/${encodeURIComponent(`LONG-${longText}`)}`, '.final-charge-page'],
    ['/cubici/mypage/profile', '.final-mypage-page'],
    [`/moneybank/current/${encodeURIComponent(`MBID-${longText}`)}`, '.final-moneybank-derived-page'],
  ];
  for (const [path, selector] of pages) {
    await page.goto(path);
    await expect(page.locator(selector).first()).toBeVisible();
    const metrics = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 2);
  }
  await page.screenshot({ fullPage: true, path: '../docs/batch8_mobile_edge_smoke/mobile_last_route_long_data.png' });
});
