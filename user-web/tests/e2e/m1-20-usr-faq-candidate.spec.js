import { expect, test } from '../../../admin-web/node_modules/@playwright/test/index.mjs';

const baseUrl = process.env.CUBICI_M1_FAQ_URL ?? 'http://127.0.0.1:4310';
const routePath = '/board/faq/index';

const lvFaqItems = [
  ['머니뱅크', '머니뱅크는 중복적으로 이용할 수 있나요?'],
  ['머니뱅크', '머니뱅크는 재신청은 가능한가요?'],
  ['머니뱅크', '머니뱅크 서비스 해지 신청은 어떻게 하면 되나요?'],
  ['머니뱅크', '머니뱅크 이용가능 금액을 늘리고자 하면 어떻게 해야 하나요?'],
  ['머니뱅크', '머니뱅크를 이용하려면 어떤 조건이 있나요?'],
  ['머니뱅크', '머니뱅크를 이용하면 신용도가 떨어지나요?'],
  ['머니뱅크', '머니뱅크의 장점은 무엇인가요?'],
  ['머니뱅크', '머니뱅크 서비스가 뭔가요?'],
  ['서비스이용', '몇 몇 정보가 제공되지 않는 것 같습니다.'],
  ['서비스이용', '쇼핑몰 접근오류 문자/이메일이 왔어요?'],
].map(([type, title], index) => ({
  post_id: 31 - index,
  type,
  type_label: type,
  title,
  content: index === 0
    ? '<p>머니뱅크는 동일한 정산예정금에 대해 중복 이용할 수 없습니다.</p>'
    : `${title}에 대한 안내입니다.`,
}));

async function installMocks(page, items = lvFaqItems) {
  await page.route('**/v1/api/**', async (route) => {
    const url = new URL(route.request().url());
    const body = url.pathname.endsWith('/support/boards/faq')
      ? { total: items.length, items }
      : { total: 0, items: [] };
    await route.fulfill({ contentType: 'application/json', status: 200, body: JSON.stringify(body) });
  });
}

test('M1-20 restores the LV FAQ list and accordion on PC', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await installMocks(page);
  await page.goto(`${baseUrl}${routePath}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  await expect(page.locator('.react-final-sub-visual .visual-tit')).toHaveText('고객지원');
  await expect(page.locator('.react-final-tabs .sub-nav > li')).toHaveCount(5);
  await expect(page.locator('.react-final-tabs .sub-nav > li').nth(3)).toHaveClass(/active/);
  await expect(page.locator('.support-summary')).toHaveCount(0);
  await expect(page.locator('.u20-faq-table thead th')).toHaveCount(4);
  await expect(page.locator('.u20-faq-question')).toHaveCount(10);
  await expect(page.locator('.u20-faq-answer-row')).toHaveCount(0);
  await expect(page.locator('.u20-faq-toggle').first()).toHaveAttribute('aria-expanded', 'false');
  const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(pageOverflow).toBeLessThanOrEqual(1);

  await page.screenshot({
    fullPage: true,
    path: '../docs/reference/lv-ui/work/USR-FAQ-PC/candidate/candidate-react.png',
  });

  await page.locator('.u20-faq-toggle').first().click();
  await expect(page.locator('.u20-faq-toggle').first()).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('.u20-faq-answer-row')).toHaveCount(1);
  await expect(page.locator('.u20-faq-answer-row')).toContainText('중복 이용할 수 없습니다.');
  await expect(page.locator('.u20-faq-answer-row')).not.toContainText('<p>');
  await page.locator('.u20-faq-toggle').first().click();
  await expect(page.locator('.u20-faq-answer-row')).toHaveCount(0);

  await page.getByLabel('FAQ 검색').fill('재신청');
  await page.getByRole('button', { name: '검색', exact: true }).click();
  await expect(page.locator('.u20-faq-question')).toHaveCount(1);
  await expect(page.locator('.u20-faq-question')).toContainText('재신청');
});

test('M1-20 paginates FAQ data by ten items', async ({ page }) => {
  const items = [
    ...lvFaqItems,
    { post_id: 21, type: '서비스이용', type_label: '서비스이용', title: '추가 FAQ 21', content: '추가 안내 21' },
    { post_id: 20, type: '서비스이용', type_label: '서비스이용', title: '추가 FAQ 20', content: '추가 안내 20' },
  ];
  await page.setViewportSize({ width: 1280, height: 800 });
  await installMocks(page, items);
  await page.goto(`${baseUrl}${routePath}`, { waitUntil: 'networkidle' });

  await expect(page.locator('.u20-faq-question')).toHaveCount(10);
  await page.getByRole('button', { name: '다음 페이지' }).click();
  await expect(page.locator('.u20-faq-question')).toHaveCount(2);
  await expect(page.locator('.u20-faq-question').first()).toContainText('추가 FAQ 21');
});

test('M1-20 renders the LV FAQ list without mobile overflow', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  await installMocks(page);
  await page.goto(`${baseUrl}${routePath}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  await expect(page.locator('.mobile-header')).toBeVisible();
  await expect(page.locator('.mobile-gnb li').nth(5)).toHaveClass(/active/);
  const activeTabBounds = await page.locator('.react-final-tabs .sub-nav > li.active').boundingBox();
  expect(activeTabBounds.x).toBeGreaterThanOrEqual(0);
  expect(activeTabBounds.x + activeTabBounds.width).toBeLessThanOrEqual(360);
  await expect(page.locator('.u20-faq-question')).toHaveCount(10);
  await page.locator('.u20-faq-toggle').first().click();
  await expect(page.locator('.u20-faq-answer-row')).toBeVisible();
  const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(pageOverflow).toBeLessThanOrEqual(1);

  await page.locator('.u20-faq-toggle').first().click();
  await page.screenshot({
    fullPage: true,
    path: '../docs/reference/lv-ui/work/USR-FAQ-MOBILE/candidate/candidate-react.png',
  });
  await context.close();
});
