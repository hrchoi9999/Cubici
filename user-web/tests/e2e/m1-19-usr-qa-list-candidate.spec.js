import { expect, test } from '../../../admin-web/node_modules/@playwright/test/index.mjs';

const baseUrl = process.env.CUBICI_M1_QA_URL ?? 'http://127.0.0.1:4310';
const routePath = '/board/qa/index';
const session = {
  token_type: 'Bearer',
  access_token: 'm1-19-user-token',
  expires_in: 3600,
  user: {
    user_no: 119,
    email: 'lv-qa@cubici.test',
    user_type: 'USER',
    name: 'LV 사용자',
    biz_name: 'LV 온라인상사',
  },
};

const qaItems = Array.from({ length: 12 }, (_, index) => ({
  qna_id: `QNA-${12 - index}`,
  user_no: 119,
  type: index % 2 ? 'CUBICI' : 'MONEYBANK',
  type_label: index % 2 ? '큐빅아이' : '머니뱅크',
  title: index === 0 ? '머니뱅크는 중복적으로 이용할 수 있나요?' : `서비스 이용 문의 ${12 - index}`,
  content: `Q&A 문의 내용 ${12 - index}`,
  answer_status: index % 3 ? '답변대기' : '답변완료',
  created_by: 'LV 사용자',
  reg_date: `2026-08-${String(8 - Math.min(index, 7)).padStart(2, '0')}`,
}));

async function installMocks(page, items = []) {
  await page.addInitScript((auth) => {
    window.localStorage.setItem('cubiciUserAuth', JSON.stringify(auth));
  }, session);
  await page.route('**/v1/api/**', async (route) => {
    const url = new URL(route.request().url());
    const body = url.pathname.endsWith('/support/inquiries')
      ? {
          total: items.length,
          answered_count: items.filter((item) => item.answer_status === '답변완료').length,
          waiting_count: items.filter((item) => item.answer_status !== '답변완료').length,
          items,
        }
      : { total: 0, items: [] };
    await route.fulfill({ contentType: 'application/json', status: 200, body: JSON.stringify(body) });
  });
}

test('M1-19 restores the LV empty Q&A list on PC', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await installMocks(page);
  await page.goto(`${baseUrl}${routePath}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  await expect(page.locator('.react-final-sub-visual .visual-tit')).toHaveText('고객지원');
  await expect(page.locator('.react-final-tabs .sub-nav > li')).toHaveCount(5);
  await expect(page.locator('.react-final-tabs .sub-nav > li').nth(2)).toHaveClass(/active/);
  await expect(page.locator('.support-summary')).toHaveCount(0);
  await expect(page.locator('.u19-qa-page .form-panel')).toHaveCount(0);
  await expect(page.locator('.u19-write-button')).toHaveAttribute('href', '/board/qa/write');
  await expect(page.locator('.u19-qa-table thead th')).toHaveCount(6);
  await expect(page.locator('.u19-qa-table tbody')).toContainText('등록된 문의가 없습니다.');
  const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(pageOverflow).toBeLessThanOrEqual(1);

  await page.screenshot({
    fullPage: true,
    path: '../docs/reference/lv-ui/work/USR-QA-LIST-PC/candidate/candidate-react.png',
  });

  await page.locator('.u19-write-button').click();
  await expect(page).toHaveURL(/\/board\/qa\/write$/);
  await expect(page.locator('.u21-qa-write-form')).toBeVisible();
  await expect(page.locator('.u21-qa-write-form .input-tit')).toHaveCount(4);
});

test('M1-19 filters, paginates and links Q&A data', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await installMocks(page, qaItems);
  await page.goto(`${baseUrl}${routePath}`, { waitUntil: 'networkidle' });

  await expect(page.locator('.u19-qa-table tbody tr')).toHaveCount(10);
  await expect(page.locator('.u19-qa-table .completion')).toHaveCount(4);
  await page.getByRole('button', { name: '다음 페이지' }).click();
  await expect(page.locator('.u19-qa-table tbody tr')).toHaveCount(2);
  await page.getByLabel('Q&A 검색').fill('중복적으로');
  await page.getByRole('button', { name: '검색', exact: true }).click();
  await expect(page.locator('.u19-qa-table tbody tr')).toHaveCount(1);
  await expect(page.locator('.u19-qa-table .title a')).toHaveAttribute('href', '/board/qa/QNA-12');
});

test('M1-19 renders the empty Q&A state without mobile overflow', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  await installMocks(page);
  await page.goto(`${baseUrl}${routePath}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  await expect(page.locator('.mobile-header')).toBeVisible();
  await expect(page.locator('.mobile-gnb li').nth(5)).toHaveClass(/active/);
  await expect(page.locator('.u19-write-button')).toBeVisible();
  await expect(page.locator('.u19-qa-table tbody')).toContainText('등록된 문의가 없습니다.');
  const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(pageOverflow).toBeLessThanOrEqual(1);

  await page.screenshot({
    fullPage: true,
    path: '../docs/reference/lv-ui/work/USR-QA-LIST-MOBILE/candidate/candidate-react.png',
  });
  await context.close();
});
