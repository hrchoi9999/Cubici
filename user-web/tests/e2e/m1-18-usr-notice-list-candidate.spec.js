import { expect, test } from '../../../admin-web/node_modules/@playwright/test/index.mjs';

const baseUrl = process.env.CUBICI_M1_NOTICE_URL ?? 'http://127.0.0.1:4310';
const routePath = '/board/notice/index';
const referenceNoticeItems = [
  ['서비스이용', '[쇼핑몰 등록] 네이버 API KEY 확인 방법', '2023-02-22'],
  ['서비스이용', '[쇼핑몰 등록] 11번가 API KEY 확인 방법', '2023-02-22'],
  ['서비스이용', '[쇼핑몰 등록] 쿠팡 API KEY 확인 방법', '2023-02-22'],
  ['머니뱅크', '[머니뱅크] 경남은행 계좌개설 가이드', '2023-02-22'],
  ['기타', '큐빅아이 사이트 리뉴얼 안내', '2021-05-21'],
].map(([typeLabel, title, regDate], index) => ({
  post_id: `NOTICE-${5 - index}`,
  type: typeLabel === '머니뱅크' ? 'MONEYBANK' : typeLabel === '기타' ? 'ETC' : 'SERVICE',
  type_label: typeLabel,
  title,
  content: `${title}의 상세 안내 내용입니다.`,
  created_by: '관리자',
  reg_date: regDate,
}));
const paginationNoticeItems = [
  ...referenceNoticeItems,
  {
    post_id: 'NOTICE-PAGE-2-A', type: 'SERVICE', type_label: '서비스이용', title: '판매 데이터 연동 점검 안내', content: '판매 데이터 연동 점검 상세 안내입니다.', created_by: '관리자', reg_date: '2021-04-10',
  },
  {
    post_id: 'NOTICE-PAGE-2-B', type: 'ETC', type_label: '기타', title: '개인정보 처리방침 변경 안내', content: '개인정보 처리방침 변경 상세 안내입니다.', created_by: '관리자', reg_date: '2021-03-01',
  },
];

async function installMocks(page, items = referenceNoticeItems) {
  await page.route('**/v1/api/**', async (route) => {
    const url = new URL(route.request().url());
    const body = url.pathname.endsWith('/support/boards/notice')
      ? { total: items.length, limit: 30, offset: 0, items }
      : { total: 0, items: [] };
    await route.fulfill({ contentType: 'application/json', status: 200, body: JSON.stringify(body) });
  });
}

test('M1-18 restores the LV notice list, search and pagination on PC', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await installMocks(page);
  await page.goto(`${baseUrl}${routePath}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  await expect(page.locator('.react-final-sub-visual .visual-tit')).toHaveText('고객지원');
  await expect(page.locator('.react-final-tabs .sub-nav > li')).toHaveCount(5);
  await expect(page.locator('.react-final-tabs .sub-nav > li').nth(1)).toHaveClass(/active/);
  await expect(page.locator('.support-summary')).toHaveCount(0);
  await expect(page.locator('.u18-notice-page .form-panel')).toHaveCount(0);
  await expect(page.locator('.u18-notice-table thead th')).toHaveCount(5);
  await expect(page.locator('.u18-notice-table tbody tr')).toHaveCount(5);
  await expect(page.locator('.u18-notice-table tbody tr').first()).toContainText('[쇼핑몰 등록] 네이버 API KEY 확인 방법');
  await expect(page.locator('.u18-notice-table .answer a')).toHaveCount(5);
  await expect(page.locator('.support-snippet')).toHaveCount(0);

  const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(pageOverflow).toBeLessThanOrEqual(1);
  await page.screenshot({
    fullPage: true,
    path: '../docs/reference/lv-ui/work/USR-NOTICE-LIST-PC/candidate/candidate-react.png',
  });

  await page.getByLabel('서비스 공지 검색').fill('경남은행');
  await page.getByRole('button', { name: '검색', exact: true }).click();
  await expect(page.locator('.u18-notice-table tbody tr')).toHaveCount(1);
  await expect(page.locator('.u18-notice-table tbody')).toContainText('경남은행 계좌개설 가이드');
  await expect(page.locator('.u18-notice-table .title a')).toHaveAttribute('href', '/board/notice/NOTICE-2');
});

test('M1-18 paginates notice data beyond five rows', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await installMocks(page, paginationNoticeItems);
  await page.goto(`${baseUrl}${routePath}`, { waitUntil: 'networkidle' });

  await expect(page.locator('.u18-notice-table tbody tr')).toHaveCount(5);
  await page.getByRole('button', { name: '다음 페이지' }).click();
  await expect(page.locator('.u18-notice-table tbody tr')).toHaveCount(2);
  await expect(page.locator('.u18-notice-table tbody')).toContainText('개인정보 처리방침 변경 안내');
  await page.getByRole('button', { name: '첫 페이지' }).click();
  await expect(page.locator('.u18-notice-table tbody')).toContainText('네이버 API KEY 확인 방법');
});

test('M1-18 converts the notice rows to a fluid mobile list', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  await installMocks(page);
  await page.goto(`${baseUrl}${routePath}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  await expect(page.locator('.mobile-header')).toBeVisible();
  await expect(page.locator('.mobile-gnb li').nth(5)).toHaveClass(/active/);
  await expect(page.locator('.u18-notice-search')).toBeVisible();
  await expect(page.locator('.u18-notice-table tbody tr')).toHaveCount(5);
  await expect(page.locator('.u18-notice-table .answer a')).toHaveCount(5);
  const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(pageOverflow).toBeLessThanOrEqual(1);

  await page.screenshot({
    fullPage: true,
    path: '../docs/reference/lv-ui/work/USR-NOTICE-LIST-MOBILE/candidate/candidate-react.png',
  });
  await context.close();
});
