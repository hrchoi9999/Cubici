import { expect, test } from '../../../admin-web/node_modules/@playwright/test/index.mjs';

const baseUrl = process.env.CUBICI_M1_USER_URL ?? 'http://127.0.0.1:4310';
const sourceUrl = process.env.CUBICI_LV_SOURCE_URL ?? 'http://127.0.0.1:4311/view.html';
const session = {
  token_type: 'Bearer',
  access_token: 'm1-25-user-token',
  expires_in: 3600,
  user: {
    user_no: 125,
    email: 'lv-support@cubici.test',
    user_type: 'USER',
    name: '홍길동',
    biz_name: 'LV 온라인상사',
  },
};

const notice = {
  post_id: 'NOTICE-25',
  board_kind: 'notice',
  type: 'CUBICI',
  type_label: '큐빅아이',
  title: '[쇼핑몰 등록] 네이버 API KEY 확인 방법',
  content: '네이버 API KEY 확인 방법 첨부파일을 참조하세요.\n쇼핑몰 등록은 마이페이지 > 가입 정보 페이지에서 가능합니다.\n감사합니다.\n\n큐빅아이 드림',
  created_by: '관리자',
  reg_date: '2026-08-09T10:15:00',
  modified_date: '2026-08-09T10:15:00',
  attachment_name: '네이버 API KEY 확인 방법_큐빅아이.pdf',
  attachment_size: '416.792 KB',
};

const faq = {
  post_id: 'FAQ-25',
  board_kind: 'faq',
  type: 'MONEYBANK',
  type_label: '머니뱅크',
  title: '머니뱅크 서비스 이용은 어떻게 신청하나요?',
  content: '머니뱅크 메뉴의 서비스 신청 화면에서 쇼핑몰과 정산계좌 정보를 입력해 주세요.\n심사 완료 후 이용조건을 확인할 수 있습니다.',
  created_by: '관리자',
  reg_date: '2026-08-08T09:30:00',
  attachment_status_label: '첨부 미연동',
};

function inquiryDetail({ answered = true, title = '정산내역 확인 문의' } = {}) {
  return {
    inquiry: {
      qna_id: answered ? 'QNA-25' : 'QNA-EDIT',
      user_no: 125,
      type: 'CUBICI',
      type_label: '큐빅아이',
      title,
      content: '어제 등록된 정산내역의 상세 금액을 확인하고 싶습니다.',
      answer_status: answered ? '답변완료' : '답변대기',
      visibility: 'private',
      visibility_label: '비공개',
      created_by: '홍길동',
      reg_date: '2026-08-09T11:00:00',
    },
    replies: answered ? [{
      reply_id: 'REPLY-25',
      content: '정산정보 메뉴의 정산상세에서 주문별 금액을 확인하실 수 있습니다.',
      created_by: '관리자',
      reg_date: '2026-08-09T13:00:00',
    }] : [],
  };
}

async function installMocks(page) {
  const calls = [];
  await page.addInitScript((auth) => {
    window.localStorage.setItem('cubiciUserAuth', JSON.stringify(auth));
  }, session);
  await page.route('**/v1/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    let body = { total: 0, items: [] };

    if (path.endsWith('/support/boards/notice/NOTICE-25')) body = notice;
    else if (path.endsWith('/support/boards/faq/FAQ-25')) body = faq;
    else if (path.endsWith('/support/inquiries/QNA-25')) body = inquiryDetail();
    else if (path.endsWith('/support/inquiries/QNA-EDIT') && request.method() === 'PUT') {
      const payload = request.postDataJSON();
      calls.push({ method: 'PUT', payload });
      body = { detail: inquiryDetail({ answered: false, title: payload.title }) };
      body.detail.inquiry = { ...body.detail.inquiry, ...payload };
    } else if (path.endsWith('/support/inquiries/QNA-EDIT')) body = inquiryDetail({ answered: false });

    await route.fulfill({ contentType: 'application/json', status: 200, body: JSON.stringify(body) });
  });
  return calls;
}

async function expectNoPageOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

test('M1-25 captures the shared LV support-detail reference', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(sourceUrl, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('.noti-twrap')).toBeVisible();
  for (const screen of ['USR-NOTICE-DETAIL-PC', 'USR-QA-DETAIL-PC', 'USR-FAQ-DETAIL-PC']) {
    await page.screenshot({ fullPage: true, path: `../docs/reference/lv-ui/work/${screen}/reference/lv-reference-rendered.png` });
  }

  await page.setViewportSize({ width: 360, height: 640 });
  await page.reload({ waitUntil: 'domcontentloaded' });
  for (const screen of ['USR-NOTICE-DETAIL-MOBILE', 'USR-QA-DETAIL-MOBILE', 'USR-FAQ-DETAIL-MOBILE']) {
    await page.screenshot({ fullPage: true, path: `../docs/reference/lv-ui/work/${screen}/reference/lv-reference-rendered.png` });
  }
});

test('M1-25 restores notice and FAQ detail in the LV article format', async ({ page }) => {
  await installMocks(page);
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(`${baseUrl}/board/notice/NOTICE-25`, { waitUntil: 'networkidle' });
  await expect(page.locator('.u25-notice-detail-page .u25-support-article')).toBeVisible();
  await expect(page.getByText('네이버 API KEY 확인 방법_큐빅아이.pdf')).toBeVisible();
  await expect(page.getByRole('link', { name: '목록' })).toHaveAttribute('href', '/board/notice/index');
  await expectNoPageOverflow(page);
  await page.screenshot({ fullPage: true, path: '../docs/reference/lv-ui/work/USR-NOTICE-DETAIL-PC/candidate/candidate-react.png' });

  await page.goto(`${baseUrl}/board/faq/FAQ-25`, { waitUntil: 'networkidle' });
  await expect(page.locator('.u25-faq-detail-page .u25-support-article')).toBeVisible();
  await expect(page.getByText('머니뱅크 서비스 이용은 어떻게 신청하나요?', { exact: true }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: '목록' })).toHaveAttribute('href', '/board/faq/index');
  await expectNoPageOverflow(page);
  await page.screenshot({ fullPage: true, path: '../docs/reference/lv-ui/work/USR-FAQ-DETAIL-PC/candidate/candidate-react.png' });
});

test('M1-25 preserves Q&A answer display and unanswered-inquiry editing', async ({ page }) => {
  const calls = await installMocks(page);
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(`${baseUrl}/board/qa/QNA-25`, { waitUntil: 'networkidle' });
  await expect(page.locator('.u25-qa-detail-page .u25-support-article')).toHaveCount(2);
  await expect(page.getByText('답변완료')).toBeVisible();
  await expect(page.getByText('정산정보 메뉴의 정산상세에서 주문별 금액을 확인하실 수 있습니다.')).toBeVisible();
  await page.screenshot({ fullPage: true, path: '../docs/reference/lv-ui/work/USR-QA-DETAIL-PC/candidate/candidate-react.png' });

  await page.goto(`${baseUrl}/board/qa/QNA-EDIT`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: '수정', exact: true }).click();
  await page.getByLabel('제목').fill('정산내역 확인 문의 수정');
  await page.getByRole('button', { name: '저장', exact: true }).click();
  await expect(page.getByText('문의가 수정되었습니다.')).toBeVisible();
  expect(calls.find((call) => call.method === 'PUT')?.payload.title).toBe('정산내역 확인 문의 수정');
});

test('M1-25 renders all support details responsively without page overflow', async ({ page }) => {
  await installMocks(page);
  await page.setViewportSize({ width: 360, height: 640 });
  const routes = [
    ['/board/notice/NOTICE-25', 'USR-NOTICE-DETAIL-MOBILE'],
    ['/board/qa/QNA-25', 'USR-QA-DETAIL-MOBILE'],
    ['/board/faq/FAQ-25', 'USR-FAQ-DETAIL-MOBILE'],
  ];
  for (const [route, screen] of routes) {
    await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
    await expect(page.locator('.u25-support-detail-page')).toBeVisible();
    await expect(page.locator('.u25-support-tabs .sub-nav li')).toHaveCount(5);
    expect(await page.locator('.u25-support-tabs').evaluate((node) => node.scrollLeft)).toBe(0);
    const tabBounds = await page.locator('.u25-support-tabs .sub-nav li').evaluateAll((nodes) => nodes.map((node) => {
      const rect = node.getBoundingClientRect();
      return { left: rect.left, right: rect.right };
    }));
    expect(tabBounds[0].left).toBeGreaterThanOrEqual(0);
    expect(tabBounds[4].right).toBeLessThanOrEqual(360);
    await expectNoPageOverflow(page);
    await page.screenshot({ fullPage: true, path: `../docs/reference/lv-ui/work/${screen}/candidate/candidate-react.png` });
  }
});
