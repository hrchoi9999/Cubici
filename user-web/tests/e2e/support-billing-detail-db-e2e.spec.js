import { expect, test } from '../../../admin-web/node_modules/@playwright/test/index.mjs';

const apiBaseUrl = process.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const authSession = {
  access_token: 'e2e-local-token',
  user: {
    user_no: 36,
    user_type: 'USER',
    email: 'e2e-user@cubici.local',
    name: 'E2E 사용자',
    biz_name: 'E2E 테스트 상사',
    biz_num: '000-00-00000',
    charge_code: 'B0101',
  },
};

let createdPosts = [];

test.beforeEach(async ({ page }) => {
  createdPosts = [];
  await page.addInitScript((session) => {
    window.localStorage.setItem('cubiciUserAuth', JSON.stringify(session));
  }, authSession);
});

test.afterEach(async ({ request }) => {
  for (const post of createdPosts.reverse()) {
    await request.delete(`${apiBaseUrl}/v1/api/support/boards/${post.kind}/${post.postId}`);
  }
});

test('notice faq detail and charge detail render with plain text policy', async ({ page, request }) => {
  const stamp = Date.now();
  const notice = await createBoardPost(request, 'notice', {
    type: 'CUBICI',
    title: `E2E 공지 상세 ${stamp}`,
    content: '<img src=x onerror="window.__supportXss=1">공지 상세 본문입니다.',
    user_id: 2,
    operated_by: 'e2e-support',
  });
  const faqCubici = await createBoardPost(request, 'faq', {
    type: 'CUBICI',
    title: `E2E FAQ 큐빅아이 ${stamp}`,
    content: '<b>큐빅아이 FAQ 본문</b>',
    user_id: 2,
    operated_by: 'e2e-support',
  });
  const faqMoneybank = await createBoardPost(request, 'faq', {
    type: 'MONEYBANK',
    title: `E2E FAQ 머니뱅크 ${stamp}`,
    content: '<script>window.__supportXss=1</script>머니뱅크 FAQ 본문',
    user_id: 2,
    operated_by: 'e2e-support',
  });

  await page.goto('/board/notice/index');
  await expect(page.getByRole('heading', { name: '서비스 공지', exact: true })).toBeVisible();
  await page.getByRole('link', { name: notice.title }).click();
  await expect(page).toHaveURL(new RegExp(`/board/notice/${notice.postId}$`));
  await expect(page.getByRole('heading', { name: '서비스 공지 상세' })).toBeVisible();
  await expect(page.getByText('공지 상세 본문입니다.')).toBeVisible();
  await expect(page.getByText('HTML 태그를 실행하지 않고 텍스트로만 표시합니다.')).toBeVisible();
  await expect(page.evaluate(() => window.__supportXss)).resolves.toBeUndefined();

  await page.goto('/board/faq/index');
  await expect(page.getByRole('heading', { name: 'FAQ', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'FAQ 분류' })).toBeVisible();
  await page.getByLabel('구분').selectOption('MONEYBANK');
  await expect(page.getByRole('link', { name: faqMoneybank.title })).toBeVisible();
  await expect(page.getByRole('link', { name: faqCubici.title })).toHaveCount(0);
  await page.getByRole('link', { name: faqMoneybank.title }).click();
  await expect(page).toHaveURL(new RegExp(`/board/faq/${faqMoneybank.postId}$`));
  await expect(page.getByRole('heading', { name: 'FAQ 상세' })).toBeVisible();
  await expect(page.getByText('머니뱅크 FAQ 본문')).toBeVisible();
  await expect(page.evaluate(() => window.__supportXss)).resolves.toBeUndefined();

  await page.goto('/chargeInfo');
  await expect(page.getByRole('heading', { name: '현재 이용요금' })).toBeVisible();
  await expect(page.getByText('결제 식별정보, 카드번호, 계좌번호')).toBeVisible();
  await page.getByRole('link', { name: '상세보기' }).first().click();
  await expect(page).toHaveURL(/\/chargeInfo\/[^/]+$/);
  await expect(page.getByRole('heading', { name: '요금 상세' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '요금 조건' })).toBeVisible();
  await expect(page.getByText('사용자 결제 이력은 별도 API가 확인되지 않아')).toBeVisible();
});

async function createBoardPost(request, kind, payload) {
  const response = await request.post(`${apiBaseUrl}/v1/api/support/boards/${kind}`, { data: payload });
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  createdPosts.push({ kind, postId: body.post_id });
  return { ...body.post, postId: body.post_id };
}
