import { expect, test } from '@playwright/test';

const productRow = {
  row_no: 1,
  firm_no: 10,
  firm_id: '1234567890',
  firm_name: '머니뱅크 제휴사',
  rep_name: '대표',
  firm_zip: '12345',
  firm_address: '서울',
  manager_name: '담당자',
  manager_rank: '팀장',
  manager_phone: '01000000000',
  developer_name: '개발자',
  developer_rank: '매니저',
  developer_phone: '01011112222',
  cs_name: 'CS',
  cs_rank: '대리',
  cs_phone: '01033334444',
  firm_tel: '0212345678',
  firm_fax: null,
  firm_email: 'firm@example.com',
  division: null,
  product_name: '선정산 기본상품',
  product_status: '00',
  product_status_label: '운영',
  min_sales_amount: 1000000,
  min_business_period: '6개월',
  min_calc_amount: 100000,
  credit_rate: 'B',
  cubici_period: '12개월',
  amount_limit: 50000000,
  other_conditions: '테스트',
  service_amount_standard: '매출기준',
  service_amount_min: 100000,
  service_amount_max: 5000000,
  service_amount_unit: '원',
  execute_amount_standard: '승인금액',
  execute_amount_min: 100000,
  execute_amount_max: 3000000,
  execute_amount_unit: '원',
  service_fee_standard: '구간',
  service_fee_min: 1.5,
  service_fee_max: 3,
  annual_fee_rate: 12,
  interest_standard: '일할',
  interest_min: 0.1,
  interest_max: 0.5,
  limit_change_yn: 'Y',
  service_repay_period: '일',
  service_repay_min: 7,
  service_repay_max: 30,
  service_repay_method: '만기일시',
  extension_yn: 'N',
  launch_date: '2026-07-01',
  expire_date: '2026-12-31',
  repayment_count: 1,
  repay_amount: 1000000,
  mid_repay_yn: 'Y',
  b2b_firm_name: 'B2B',
  product_type: 'STD',
  reg_date: '2026-07-22T10:00:00',
  update_date: null,
};

test.beforeEach(async ({ page }) => {
  await page.route('**/v1/api/preferences/moneybank-products?**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        limit: 20,
        offset: 0,
        counts: {
          total_count: 1,
          operating_count: 1,
          completed_count: 0,
          stopped_count: 0,
        },
        items: [productRow],
      }),
    });
  });

  await page.route('**/v1/api/preferences/moneybank-products/10', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify(productRow),
      });
      return;
    }

    const payload = await route.request().postDataJSON();
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        action: 'updated',
        firm_no: 10,
        product: {
          ...productRow,
          product_name: payload.product_name,
          firm_name: payload.firm_name,
        },
      }),
    });
  });
});

test('moneybank product list, detail, and update work with mock data', async ({ page }) => {
  await page.goto('/admin/cubici/adminPreference/manageMoneybank_tab1');

  await expect(page.locator('.adminPageHeader h2', { hasText: '환경설정' })).toBeVisible();
  await expect(page.getByText('전체 1개')).toBeVisible();
  await expect(page.getByRole('cell', { name: '머니뱅크 제휴사' })).toBeVisible();
  await expect(page.getByRole('cell', { name: '선정산 기본상품' })).toBeVisible();

  await page.getByRole('button', { name: '보기' }).click();
  await expect(page.getByRole('heading', { name: '상품 상세' })).toBeVisible();

  const editor = page.locator('.moneybankProductPanel');
  await editor.getByLabel('상품명').fill('선정산 수정상품');
  await editor.getByLabel('회사명').fill('머니뱅크 제휴사 수정');
  await editor.getByRole('button', { name: '수정' }).click();
  await expect(page.getByText('머니뱅크 상품을 수정했습니다.')).toBeVisible();
});
