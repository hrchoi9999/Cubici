import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const candidateDir = path.resolve(
  __dirname,
  '../../../docs/reference/lv-ui/admin/ADM-LV-22-PRIZM-SYSTEM/candidate',
);

fs.mkdirSync(candidateDir, { recursive: true });

function configRow(division, subjectNo, subjectName, itemNo, itemName, weight, definition) {
  return {
    row_no: 1,
    division,
    division_label: division === 1 ? 'Prizm' : 'CRA',
    subject_no: subjectNo,
    subject_name: subjectName,
    item_no: itemNo,
    item_nm: itemName,
    item_definition: definition,
    item_weight: weight,
    item_standard_low1: '',
    item_standard_high1: '3',
    item_standard_low2: '3',
    item_standard_high2: '6',
    item_standard_low3: '6',
    item_standard_high3: '12',
    item_standard_low4: '12',
    item_standard_high4: '24',
    item_standard_low5: '24',
    item_standard_high5: '',
    config_status_label: '설정완료',
  };
}

const items = [
  configRow(1, 1, '기업개요', 1, '사업기간', '21.2', '평가일 기준 운영기간'),
  configRow(1, 1, '기업개요', 2, '온라인 운영기간', '6.4', '등록 쇼핑몰 중 최대 운영기간'),
  configRow(1, 1, '기업개요', 3, '(등록) 운영 쇼핑몰 수', '8.5', '등록 운영 쇼핑몰 수'),
  configRow(1, 2, '매출지표', 1, '월매출액 (최근 1개월)', '29.4', '최근 1개월 매출총액'),
  configRow(1, 2, '매출지표', 2, '월매출건 (최근 1개월)', '20.6', '최근 1개월 주문건수'),
  configRow(1, 3, '정산지표', 1, '월정산액 (최근 1개월)', '15', '최근 1개월 정산입금액'),
  configRow(1, 3, '정산지표', 2, '주문정산회수기간', '10.5', '평균 정산 소요일자'),
  configRow(2, 1, '기업개요', 1, '정산계좌 변경여부', '77', '결제통장 변경 여부'),
  configRow(2, 1, '기업개요', 2, '정산입금 결손', '23', '정산계산 잔액 확인'),
  configRow(2, 2, '매출지표', 1, '격주 매출액 변화', '4', '주간 매출액 변화 비율'),
  configRow(2, 2, '매출지표', 2, '격간 판매건수 변화', '4', '주간 판매건수 변화 비율'),
].map((item, index) => ({ ...item, row_no: index + 1 }));

const records = [
  {
    record_id: 2,
    division: 1,
    subject_no: 1,
    item_no: 1,
    item_name: '사업기간',
    admin_id: 'admin',
    update_memo: '운영기준 조정',
    before_payload: {},
    after_payload: {},
    reg_date: '2026-08-10T09:20:00',
  },
  {
    record_id: 1,
    division: 2,
    subject_no: 1,
    item_no: 1,
    item_name: '정산계좌 변경여부',
    admin_id: 'admin',
    update_memo: '초기 설정',
    before_payload: {},
    after_payload: {},
    reg_date: '2026-08-09T09:00:00',
  },
];

test.beforeEach(async ({ page }) => {
  await page.route('**/v1/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    let body;

    if (url.pathname.endsWith('/accounts/admin-me')) {
      body = { user_no: 1, email: 'admin@example.com', user_type: 'ADMIN_USER', name: '관리자' };
    } else if (url.pathname.endsWith('/preferences/prizm-config/update-records')) {
      body = { limit: 5, offset: 0, total: records.length, items: records };
    } else if (/\/preferences\/prizm-config\/items\/\d+\/\d+\/\d+$/.test(url.pathname)) {
      const [division, subjectNo, itemNo] = url.pathname.split('/').slice(-3).map(Number);
      const item = items.find((row) => row.division === division && row.subject_no === subjectNo && row.item_no === itemNo);
      if (request.method() === 'PUT') {
        const payload = await request.postDataJSON();
        body = { action: 'updated', division, subject_no: subjectNo, item_no: itemNo, item: { ...item, ...payload } };
      } else {
        body = item;
      }
    } else if (url.pathname.endsWith('/preferences/prizm-config/items')) {
      const subjectNo = Number(url.searchParams.get('subject_no')) || null;
      const itemName = url.searchParams.get('item_name') || '';
      const filtered = items.filter((item) => (
        (!subjectNo || item.subject_no === subjectNo)
        && (!itemName || item.item_nm.includes(itemName))
      ));
      body = {
        limit: 100,
        offset: 0,
        counts: { total_count: 26, prizm_count: 15, cra_count: 11, incomplete_count: 0 },
        items: filtered,
      };
    } else {
      body = { items: [], total: 0 };
    }

    await route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) });
  });

  await page.addInitScript(() => {
    window.localStorage.setItem('cubiciAdminAuth', JSON.stringify({
      token_type: 'Bearer',
      access_token: 'adm-lv-22-token',
      user: { email: 'admin@example.com', user_type: 'ADMIN_USER' },
    }));
  });
});

test('ADM-LV-22 Prizm PC·모바일 후보를 검증한다', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/admin/cubici/adminPreference/prizmConfig');

  await expect(page.getByRole('button', { name: 'Prizm' })).toHaveClass(/active/);
  await expect(page.getByRole('heading', { name: '차원 List' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '평가지표' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '세부지표 설정' })).toBeVisible();
  await expect(page.locator('.prizmLvSummary')).toContainText('미완성 0');
  await expect(page.locator('.prizmLvChoiceList').first()).toContainText('기업개요');
  await expect(page.locator('.prizmLvDetailPanel').getByLabel('지표 정의')).toHaveValue('평가일 기준 운영기간');
  expect(await bodyOverflow(page)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: path.join(candidateDir, 'ADM-LV-22-PRIZM-PC.png'), fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expectClosedNavigation(page);
  await expect(page.locator('.prizmHorizontalScrollbar')).toBeVisible();
  expect(await bodyOverflow(page)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: path.join(candidateDir, 'ADM-LV-22-PRIZM-MOBILE.png'), fullPage: true });
});

test('ADM-LV-22 CRA PC·모바일 후보와 탭 연속성을 검증한다', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/admin/cubici/adminPreference/prizmConfig');
  await page.getByRole('button', { name: 'CRA Index' }).click();

  await expect(page.getByRole('button', { name: 'CRA Index' })).toHaveClass(/active/);
  await expect(page.locator('.prizmLvChoiceList').nth(1)).toContainText('정산계좌 변경여부');
  await expect(page.locator('.prizmLvDetailPanel').getByLabel('지표 정의')).toHaveValue('결제통장 변경 여부');
  await expect(page.getByRole('link', { name: 'RawData' })).toHaveAttribute('href', '/admin/cubici/adminPreference/prizmRawData');
  expect(await bodyOverflow(page)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: path.join(candidateDir, 'ADM-LV-22-CRA-PC.png'), fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await expectClosedNavigation(page);
  expect(await bodyOverflow(page)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: path.join(candidateDir, 'ADM-LV-22-CRA-MOBILE.png'), fullPage: true });
});

test('ADM-LV-22 지표 검색·선택·수정 API 흐름을 유지한다', async ({ page }) => {
  await page.goto('/admin/cubici/adminPreference/prizmConfig');

  await page.getByLabel('항목명').fill('월매출액');
  const searchRequest = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return url.pathname.endsWith('/preferences/prizm-config/items') && url.searchParams.get('item_name') === '월매출액';
  });
  await page.getByRole('button', { name: '검색' }).click();
  await searchRequest;
  await expect(page.locator('.prizmLvChoiceList').nth(1)).toContainText('월매출액');

  await page.reload();
  await page.locator('.prizmLvChoiceList').nth(1).getByRole('button', { name: /온라인 운영기간/ }).click();
  const editor = page.locator('.prizmLvDetailPanel');
  await editor.getByLabel('지표 정의').fill('등록 쇼핑몰 최대 운영기간 수정');
  await editor.getByLabel('변경메모').fill('기준 검토');
  const updateRequest = page.waitForRequest((request) => request.method() === 'PUT' && request.url().endsWith('/preferences/prizm-config/items/1/1/2'));
  await editor.getByRole('button', { name: '수정' }).click();
  await updateRequest;
  await expect(page.getByText('Prism 설정을 수정했습니다.')).toBeVisible();
});

async function expectClosedNavigation(page) {
  await expect(page.locator('.adminNavigationToggle')).toBeVisible();
  await expect.poll(async () => {
    const box = await page.locator('#admin-navigation').boundingBox();
    return box?.x ?? 0;
  }).toBeLessThanOrEqual(-300);
}

function bodyOverflow(page) {
  return page.evaluate(() => document.body.scrollWidth - document.documentElement.clientWidth);
}
