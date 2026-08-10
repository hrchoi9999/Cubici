import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';

import { installMockAdminAuth } from './helpers/mock-admin-auth.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const candidateDir = path.resolve(
  currentDir,
  '../../../docs/reference/lv-ui/admin/ADM-LV-11-CREDIT-INDICATOR/candidate',
);

function makeItem(rowNo, division, subjectNo, itemNo, name, weight, standards) {
  const values = [...standards, ...Array(10).fill(null)].slice(0, 10);
  return {
    row_no: rowNo,
    division,
    division_label: division === 1 ? 'Prizm' : 'CRA',
    subject_no: subjectNo,
    subject_name: `주제 ${subjectNo}`,
    item_no: itemNo,
    item_nm: name,
    item_definition: name,
    item_weight: weight,
    ...Object.fromEntries(values.flatMap((value, index) => {
      const grade = Math.floor(index / 2) + 1;
      return [[`item_standard_${index % 2 === 0 ? 'low' : 'high'}${grade}`, value]];
    })),
  };
}

const items = [
  makeItem(1, 1, 1, 1, '사업기간', '21.2', [null, '24', '24', '36', '36', '48', '48', '60', '60', null]),
  makeItem(2, 1, 1, 2, '온라인 운영기간', '6.4', [null, '12', '12', '24', '24', '36', '36', '48', '48', null]),
  makeItem(3, 1, 1, 3, '(등록) 운영 쇼핑몰 수', '8.5', [null, '3', '3', '4', '4', '5', '5', '6', '6', null]),
  makeItem(4, 1, 2, 1, '월매출액 (최근 1개월)', '29.4', [null, '11000000', '11000000', '20000000', '20000000', '30000000', '30000000', '50000000', '50000000', null]),
  makeItem(5, 1, 2, 2, '월매출건 (최근 1개월)', '20.6', [null, '400', '400', '1000', '1000', '2000', '2000', '3000', '3000', null]),
  makeItem(6, 1, 3, 1, '월정산액 (최근 1개월)', '15', [null, '6000000', '6000000', '15000000', '15000000', '30000000', '30000000', '50000000', '50000000', null]),
  makeItem(7, 1, 3, 2, '주문정산회수기간', '10.5', ['28', null, '21', '28', '16', '21', '11', '16', null, '10']),
  makeItem(8, 1, 3, 3, '매출 대비 정산율', '10.5', [null, '60', '60', '75', '75', '88', '88', '93', '93', null]),
  makeItem(9, 1, 4, 1, '매출판촉 비율', '7', ['33', null, '27', '33', '21', '27', '15', '21', null, '15']),
  makeItem(10, 1, 4, 2, '배송완료기간', '11.7', ['3.9', null, '3.3', '3.9', '2.8', '3.3', '2.2', '2.8', null, '2.2']),
  makeItem(11, 1, 4, 3, '구매거부율', '9.3', ['5', null, '4', '5', '2.5', '4', '1.2', '2.5', null, '1.2']),
  makeItem(12, 1, 5, 1, '대표자 신용평점', '23.8', [null, '501', '501', '561', '561', '631', '631', '691', '691', null]),
  makeItem(13, 1, 5, 2, '신용평가 전체순위', '11.9', ['94', null, '87', '94', '69', '87', '49', '69', null, '49']),
  makeItem(14, 1, 5, 3, '신용평점 변화율', '14.3', [null, '-7', '-7', '-3', '-3', '3', '3', '7', '7', null]),
  makeItem(15, 1, 6, 1, '평가등급', null, ['320', null, '321', '500', '501', '700', '701', '879', '880', '1000']),
  makeItem(16, 2, 1, 1, '정산계좌 변경여부', '77', []),
  makeItem(17, 2, 1, 2, '정산입금 결손', '23', []),
  makeItem(18, 2, 2, 1, '격주 매출액 변화', '4', ['10', null, '3', '10', '-3', '3', '-15', '-3', null, '-15']),
  makeItem(19, 2, 2, 2, '격간 판매건수 변화', '4', ['10', null, '3', '10', '-3', '3', '-15', '-3', null, '-15']),
  makeItem(20, 2, 2, 3, '격주 단위매출액 변화', '5.3', ['10', null, '3', '10', '-3', '3', '-15', '-3', null, '-15']),
  makeItem(21, 2, 2, 4, '격주 동일id 구매율', '6.7', [null, '-5', '-5', '-1', '-1', '5', '5', '10', '10', null]),
  makeItem(22, 2, 3, 1, '격주 판촉비율', '4.3', [null, '5', '5', '8', '8', '12', '12', '17', '17', null]),
  makeItem(23, 2, 3, 2, '격주 구매거부율', '3.6', [null, '-3', '-3', '0', '0', '5', '5', '12', '12', null]),
  makeItem(24, 2, 3, 3, '격주 매출대비 정산율', '5', ['10', null, '3', '10', '-5', '3', '-15', '-5', null, '-15']),
  makeItem(25, 2, 3, 4, '격주 배송준비기간', '7.1', [null, '-3', '-3', '0', '0', '5', '5', '12', '12', null]),
  makeItem(26, 2, 6, 1, '평가등급', null, ['180', '200', '150', '179', '91', '149', '60', '90', '40', '59']),
];

test.beforeEach(async ({ page }) => {
  await installMockAdminAuth(page);
  await page.route('**/v1/api/preferences/prizm-config/items?**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        limit: 100,
        offset: 0,
        counts: { total_count: items.length, prizm_count: 2, cra_count: 2, incomplete_count: 0 },
        items,
      }),
    });
  });
  await page.route('**/v1/api/preferences/prizm-config/items/*/*/*', async (route) => {
    const payload = await route.request().postDataJSON();
    const segments = new URL(route.request().url()).pathname.split('/');
    const division = Number(segments.at(-3));
    const subjectNo = Number(segments.at(-2));
    const itemNo = Number(segments.at(-1));
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        action: 'updated',
        division,
        subject_no: subjectNo,
        item_no: itemNo,
        item: { ...items[0], ...payload, division, subject_no: subjectNo, item_no: itemNo },
      }),
    });
  });
});

test('ADM-LV-11 renders the LV matrix and saves only changed rows', async ({ page }) => {
  const updateRequests = [];
  page.on('request', (request) => {
    if (request.method() === 'PUT' && request.url().includes('/prizm-config/items/')) {
      updateRequests.push(request);
    }
  });

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/admin/moneybank/manage');

  await expect(page.locator('.subVisual h3')).toHaveText('신용평가지표');
  await expect(page.getByText('PCS 지표', { exact: true })).toBeVisible();
  await expect(page.getByText('PCS 평가등급', { exact: true })).toBeVisible();
  await expect(page.getByText('PMS 지표', { exact: true })).toBeVisible();
  await expect(page.getByText('PMS 평가등급', { exact: true })).toBeVisible();
  await expect(page.getByText('NO(정상)', { exact: true }).first()).toBeVisible();
  await page.screenshot({ path: path.join(candidateDir, 'ADM-LV-11-PC.png'), fullPage: true });

  await page.getByLabel('사업기간 척도 가중비').fill('22');
  await page.getByRole('button', { name: '저장', exact: true }).click();
  await expect(page.getByText('1개 평가항목을 저장했습니다.')).toBeVisible();
  expect(updateRequests).toHaveLength(1);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/admin/moneybank/manage');
  await expect(page.locator('.adminNavigationToggle')).toBeVisible();
  await expect.poll(async () => (await page.locator('#admin-navigation').boundingBox())?.x ?? 0).toBeLessThan(-100);
  await expect(page.locator('.creditIndicatorTableScroll').first()).toHaveCSS('overflow-x', 'auto');
  await page.screenshot({ path: path.join(candidateDir, 'ADM-LV-11-MOBILE.png'), fullPage: true });
});
