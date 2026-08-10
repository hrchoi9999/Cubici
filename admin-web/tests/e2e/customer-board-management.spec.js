import path from 'node:path';
import { expect, test } from '@playwright/test';
import { installMockAdminAuth } from './helpers/mock-admin-auth.js';

const notice = {
  post_id: 3,
  board_kind: 'notice',
  user_id: 2,
  type: 'OTHER',
  type_label: '기타',
  title: '큐빅아이 사이트 리뉴얼 안내',
  content: '<p>공지 내용</p>',
  created_by: '관리자',
  last_modified_by: '관리자',
  reg_date: '2023-12-22T18:17:50',
  modified_date: '2023-12-22T18:20:00',
};

const faq = {
  post_id: 31,
  board_kind: 'faq',
  user_id: 2,
  type: 'SERVICE_USE',
  type_label: '서비스 이용',
  title: '머니뱅크 서비스는 어떻게 신청하나요?',
  content: '<p>A. 서비스 신청 메뉴에서 신청할 수 있습니다.</p>',
  created_by: '관리자',
  last_modified_by: '관리자',
  reg_date: '2023-11-30T10:00:00',
  modified_date: '2023-11-30T10:00:00',
};

const candidateDir = path.resolve(
  process.cwd(),
  '..',
  'docs',
  'reference',
  'lv-ui',
  'admin',
  'ADM-LV-14-CUSTOMER-BOARD',
  'candidate',
);

async function fulfillList(route, boardKind) {
  const isNotice = boardKind === 'notice';
  await route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({
      board_kind: boardKind,
      limit: 20,
      offset: 0,
      total: isNotice ? 5 : 31,
      items: [isNotice ? notice : faq],
    }),
  });
}

test.beforeEach(async ({ page }) => {
  await installMockAdminAuth(page);

  await page.route('**/v1/api/support/boards/notice?**', (route) => fulfillList(route, 'notice'));
  await page.route('**/v1/api/support/boards/faq?**', (route) => fulfillList(route, 'faq'));

  await page.route('**/v1/api/support/boards/*/*', async (route) => {
    const parts = new URL(route.request().url()).pathname.split('/');
    const boardKind = parts.at(-2);
    const postId = Number(parts.at(-1));
    const post = boardKind === 'faq' ? faq : notice;

    if (route.request().method() === 'GET') {
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify(post) });
      return;
    }

    if (route.request().method() === 'PUT') {
      const payload = await route.request().postDataJSON();
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          action: 'updated',
          board_kind: boardKind,
          post_id: postId,
          post: { ...post, title: payload.title, content: payload.content },
        }),
      });
      return;
    }

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ action: 'deleted', board_kind: boardKind, post_id: postId, post: null }),
    });
  });
});

test('서비스 공지와 FAQ 목록, 편집, 삭제가 작동한다', async ({ page }) => {
  await page.goto('/admin/cubici/supportMember/manageBoard_tab1');

  await expect(page.getByRole('heading', { name: '고객관리' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '고객 공지 관리' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: '공지사항' })).toBeVisible();
  await expect(page.getByText('큐빅아이 사이트 리뉴얼 안내')).toBeVisible();

  await page.getByRole('button', { name: '공지보기' }).click();
  await expect(page.getByRole('heading', { name: '서비스 공지 수정' })).toBeVisible();
  await page.getByLabel('제목').fill('수정 공지');
  await page.getByLabel('내용').fill('수정 내용');
  await page.getByRole('button', { name: '수정' }).click();
  await expect(page.getByText('게시글을 수정했습니다.')).toBeVisible();

  await page.getByRole('button', { name: '공지보기' }).click();
  await page.getByRole('button', { name: '삭제' }).click();
  await expect(page.getByText('게시글을 삭제했습니다.')).toBeVisible();

  await page.getByRole('link', { name: 'FAQ', exact: true }).click();
  await expect(page.getByRole('columnheader', { name: '답변' })).toBeVisible();
  await expect(page.getByText('머니뱅크 서비스는 어떻게 신청하나요?')).toBeVisible();
  await page.getByRole('button', { name: '상세보기' }).click();
  await expect(page.getByRole('heading', { name: 'FAQ 수정' })).toBeVisible();
  await expect(page.getByLabel('내용')).toHaveValue(/서비스 신청 메뉴/);
});

test('ADM-LV-14 PC 및 모바일 후보 화면을 생성한다', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/admin/cubici/supportMember/manageBoard_tab1');
  await expect(page.getByText('큐빅아이 사이트 리뉴얼 안내')).toBeVisible();
  await page.screenshot({ path: path.join(candidateDir, 'ADM-LV-14-NOTICE-LIST-PC.png'), fullPage: true });
  await page.getByRole('button', { name: '공지보기' }).click();
  await page.screenshot({ path: path.join(candidateDir, 'ADM-LV-14-NOTICE-EDITOR-PC.png'), fullPage: true });

  await page.goto('/admin/cubici/supportMember/manageBoard_tab2');
  await expect(page.getByText('머니뱅크 서비스는 어떻게 신청하나요?')).toBeVisible();
  await page.screenshot({ path: path.join(candidateDir, 'ADM-LV-14-FAQ-LIST-PC.png'), fullPage: true });
  await page.getByRole('button', { name: '상세보기' }).click();
  await page.screenshot({ path: path.join(candidateDir, 'ADM-LV-14-FAQ-EDITOR-PC.png'), fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/admin/cubici/supportMember/manageBoard_tab1');
  await expect(page.getByText('큐빅아이 사이트 리뉴얼 안내')).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expect.poll(() => page.locator('.customerBoardLvList .table-scroll').evaluate(
    (element) => element.scrollWidth > element.clientWidth,
  )).toBe(true);
  await page.screenshot({ path: path.join(candidateDir, 'ADM-LV-14-NOTICE-LIST-MOBILE.png'), fullPage: true });
  await page.getByRole('button', { name: '공지보기' }).click();
  await page.screenshot({ path: path.join(candidateDir, 'ADM-LV-14-NOTICE-EDITOR-MOBILE.png'), fullPage: true });

  await page.goto('/admin/cubici/supportMember/manageBoard_tab2');
  await expect(page.getByText('머니뱅크 서비스는 어떻게 신청하나요?')).toBeVisible();
  await page.screenshot({ path: path.join(candidateDir, 'ADM-LV-14-FAQ-LIST-MOBILE.png'), fullPage: true });
  await page.getByRole('button', { name: '상세보기' }).click();
  await page.screenshot({ path: path.join(candidateDir, 'ADM-LV-14-FAQ-EDITOR-MOBILE.png'), fullPage: true });
});
