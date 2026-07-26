import { expect, test } from '@playwright/test';

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
  reg_date: '2021-05-21T16:13:56',
  modified_date: '2021-05-24T10:08:17',
  exposure_status_label: '상시노출',
  attachment_status_label: '첨부 미연동',
  policy_status_label: '노출정책 확인',
};

test.beforeEach(async ({ page }) => {
  await page.route('**/v1/api/support/boards/notice?**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        board_kind: 'notice',
        limit: 20,
        offset: 0,
        total: 1,
        attachment_status_label: '첨부 미연동',
        exposure_policy_status_label: '노출정책 확인',
        items: [notice],
      }),
    });
  });

  await page.route('**/v1/api/support/boards/notice/3', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify(notice),
      });
      return;
    }

    if (route.request().method() === 'PUT') {
      const payload = await route.request().postDataJSON();
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          action: 'updated',
          board_kind: 'notice',
          post_id: 3,
          post: {
            ...notice,
            title: payload.title,
            content: payload.content,
          },
        }),
      });
      return;
    }

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        action: 'deleted',
        board_kind: 'notice',
        post_id: 3,
        post: null,
      }),
    });
  });
});

test('customer board list, edit, and delete work with mock data', async ({ page }) => {
  await page.goto('/admin/cubici/supportMember/manageBoard_tab1');

  await expect(page.getByRole('heading', { name: '고객관리' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '고객 공지 관리' })).toBeVisible();
  await expect(page.getByText('서비스 공지 1건')).toBeVisible();
  await expect(page.locator('.summaryStrip').getByText('첨부 미연동')).toBeVisible();
  await expect(page.locator('.summaryStrip').getByText('노출정책 확인')).toBeVisible();
  await expect(page.getByText('큐빅아이 사이트 리뉴얼 안내')).toBeVisible();
  await expect(page.getByRole('cell', { name: '상시노출' })).toBeVisible();

  await page.getByRole('button', { name: '공지보기' }).click();
  await expect(page.getByRole('heading', { name: '게시글 수정' })).toBeVisible();
  await page.getByLabel('제목').fill('수정 공지');
  await page.getByLabel('내용').fill('수정 내용');
  await page.getByRole('button', { name: '수정' }).click();
  await expect(page.getByText('게시글을 수정했습니다.')).toBeVisible();
  await expect(page.locator('.messageTemplatePreview')).toContainText('노출정책 확인');
  await expect(page.locator('.messageTemplatePreview p').filter({ hasText: '수정 내용' })).toBeVisible();

  await page.getByRole('button', { name: '삭제' }).click();
  await expect(page.getByText('게시글을 삭제했습니다.')).toBeVisible();
});
