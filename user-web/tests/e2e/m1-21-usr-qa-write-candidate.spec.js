import { expect, test } from '../../../admin-web/node_modules/@playwright/test/index.mjs';

const baseUrl = process.env.CUBICI_M1_QA_WRITE_URL ?? 'http://127.0.0.1:4310';
const sourceUrl = process.env.CUBICI_LV_SOURCE_URL ?? 'http://127.0.0.1:4311/QnA-write.html';
const routePath = '/board/qa/write';
const session = {
  token_type: 'Bearer',
  access_token: 'm1-21-user-token',
  expires_in: 3600,
  user: {
    user_no: 121,
    email: 'lv-qa-write@cubici.test',
    user_type: 'USER',
    name: 'LV 사용자',
    biz_name: 'LV 온라인상사',
  },
};

async function installMocks(page, { failCreate = false } = {}) {
  const requests = [];
  await page.addInitScript((auth) => {
    window.localStorage.setItem('cubiciUserAuth', JSON.stringify(auth));
  }, session);
  await page.route('**/v1/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.pathname.endsWith('/support/inquiries') && request.method() === 'POST') {
      requests.push(request.postDataJSON());
      await route.fulfill({
        contentType: 'application/json',
        status: failCreate ? 500 : 200,
        body: JSON.stringify(failCreate
          ? { detail: '등록 처리 실패' }
          : { action: 'created', qna_id: 321, detail: {} }),
      });
      return;
    }
    if (url.pathname.endsWith('/support/inquiries/321')) {
      await route.fulfill({
        contentType: 'application/json',
        status: 200,
        body: JSON.stringify({
          inquiry: {
            qna_id: 321,
            user_no: 121,
            type: 'MONEYBANK',
            type_label: '머니뱅크',
            title: '머니뱅크 이용 문의',
            content: '정산예정금 확인 방법을 알려주세요.',
            visibility: '0',
            visibility_label: '비공개',
            created_by: 'LV 사용자',
            reg_date: '2026-08-09T09:00:00',
            reply_count: 0,
          },
          replies: [],
        }),
      });
      return;
    }
    await route.fulfill({ contentType: 'application/json', status: 200, body: JSON.stringify({ total: 0, items: [] }) });
  });
  return requests;
}

test('M1-21 captures the final-source Q&A write reference', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(sourceUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  await expect(page.locator('.visual-tit')).toHaveText('고객지원');
  await expect(page.locator('.sub-nav > li.active')).toContainText('Q&A');
  await expect(page.locator('.write-box .input-tit')).toHaveCount(4);
  await expect(page.locator('.qnawrite .btn-box .btn')).toHaveCount(2);
  await page.screenshot({
    fullPage: true,
    path: '../docs/reference/lv-ui/work/USR-QA-WRITE-PC/reference/lv-reference-rendered.png',
  });

  await page.setViewportSize({ width: 360, height: 640 });
  await page.reload({ waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const sourceOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(sourceOverflow).toBeLessThanOrEqual(1);
  await page.screenshot({
    fullPage: true,
    path: '../docs/reference/lv-ui/work/USR-QA-WRITE-MOBILE/reference/lv-reference-rendered.png',
  });
});

test('M1-21 restores the LV Q&A write form and preserves create API flow', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  const requests = await installMocks(page);
  await page.goto(`${baseUrl}${routePath}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  await expect(page.locator('.react-final-sub-visual .visual-tit')).toHaveText('고객지원');
  await expect(page.locator('.react-final-sub-visual .visual-desc')).toHaveCount(0);
  await expect(page.locator('.react-final-tabs .sub-nav > li').nth(2)).toHaveClass(/active/);
  await expect(page.locator('.u21-qa-write-form .input-tit')).toHaveCount(4);
  await expect(page.getByLabel('작성자')).toHaveValue('LV 사용자');
  await expect(page.getByLabel('작성자')).toHaveAttribute('readonly', '');
  await expect(page.getByLabel('구분').locator('option')).toHaveCount(9);
  await expect(page.getByLabel('제목')).toHaveAttribute('maxlength', '50');
  await expect(page.getByLabel('내용')).toHaveAttribute('maxlength', '20000');
  await expect(page.getByLabel('공개 여부')).toHaveCount(0);
  await expect(page.getByRole('button', { name: '등록', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: '취소', exact: true })).toHaveAttribute('href', '/board/qa/index');

  const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(pageOverflow).toBeLessThanOrEqual(1);
  await page.screenshot({
    fullPage: true,
    path: '../docs/reference/lv-ui/work/USR-QA-WRITE-PC/candidate/candidate-react.png',
  });

  await page.getByLabel('구분').selectOption('MONEYBANK');
  await page.getByLabel('제목').fill('  머니뱅크 이용 문의  ');
  await page.getByLabel('내용').fill('  정산예정금 확인 방법을 알려주세요.  ');
  await page.getByRole('button', { name: '등록', exact: true }).click();
  await expect(page).toHaveURL(/\/board\/qa\/321$/);
  expect(requests).toHaveLength(1);
  expect(requests[0]).toMatchObject({
    user_no: 121,
    type: 'MONEYBANK',
    title: '머니뱅크 이용 문의',
    content: '정산예정금 확인 방법을 알려주세요.',
    visibility: 'private',
    operated_by: 'LV 사용자',
  });
});

test('M1-21 keeps the form on screen when create API fails', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await installMocks(page, { failCreate: true });
  await page.goto(`${baseUrl}${routePath}`, { waitUntil: 'networkidle' });

  await page.getByLabel('제목').fill('등록 실패 확인');
  await page.getByLabel('내용').fill('오류 메시지와 재시도 상태를 확인합니다.');
  await page.getByRole('button', { name: '등록', exact: true }).click();
  await expect(page.locator('.u21-qa-write-form > .auth-message')).toContainText('문의 등록 실패');
  await expect(page.getByRole('button', { name: '등록', exact: true })).toBeEnabled();
  await expect(page).toHaveURL(new RegExp(`${routePath}$`));
});

test('M1-21 renders the LV Q&A write form without mobile overflow', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  await installMocks(page);
  await page.goto(`${baseUrl}${routePath}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  await expect(page.locator('.mobile-header')).toBeVisible();
  const activeTabBounds = await page.locator('.react-final-tabs .sub-nav > li.active').boundingBox();
  expect(activeTabBounds.x).toBeGreaterThanOrEqual(0);
  expect(activeTabBounds.x + activeTabBounds.width).toBeLessThanOrEqual(360);
  await expect(page.getByLabel('작성자')).toHaveValue('LV 사용자');
  await expect(page.getByLabel('내용')).toBeVisible();
  await expect(page.getByRole('button', { name: '등록', exact: true })).toBeVisible();
  const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(pageOverflow).toBeLessThanOrEqual(1);

  await page.screenshot({
    fullPage: true,
    path: '../docs/reference/lv-ui/work/USR-QA-WRITE-MOBILE/candidate/candidate-react.png',
  });
  await context.close();
});
