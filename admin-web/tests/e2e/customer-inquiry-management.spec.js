import { expect, test } from '@playwright/test';

const inquiry = {
  qna_id: 1,
  user_no: 36,
  type: 'CUBICI',
  type_label: '큐빅아이',
  title: '문의 제목',
  content: '<p>문의 내용</p>',
  visibility: '0',
  visibility_label: '비공개',
  created_by: '문경남',
  reg_date: '2024-01-09T11:54:35',
  modified_date: '2024-01-09T11:54:35',
  reply_count: 1,
  latest_reply_date: '2024-01-09T13:50:37',
  answer_status: '답변완료',
  follow_up_status_label: '후속완료',
  notification_status_label: '알림 미연동',
  workflow_status_label: '정상',
};

test.beforeEach(async ({ page }) => {
  await page.route('**/v1/api/support/inquiries?**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        limit: 20,
        offset: 0,
        total: 1,
        answered_count: 1,
        waiting_count: 0,
        notification_pending_count: 0,
        workflow_status_label: '정상',
        items: [inquiry],
      }),
    });
  });

  await page.route('**/v1/api/support/inquiries/1', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        inquiry,
        replies: [
          {
            reply_id: 1,
            user_no: 99,
            content: '<p>답변 내용</p>',
            created_by: 'admin',
            last_modified_by: null,
            reg_date: '2024-01-09T12:15:37',
            modified_date: '2024-01-09T13:50:37',
          },
        ],
      }),
    });
  });

  await page.route('**/v1/api/support/inquiries/1/replies/1', async (route) => {
    const payload = await route.request().postDataJSON();

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        qna_id: 1,
        reply_id: 1,
        action: 'updated',
        detail: {
          inquiry: {
            ...inquiry,
            reply_count: 1,
            latest_reply_date: '2024-01-10T10:00:00',
            answer_status: '답변완료',
          },
          replies: [
            {
              reply_id: 1,
              user_no: payload.user_no,
              content: payload.content,
              created_by: 'admin',
              last_modified_by: payload.operated_by,
              reg_date: '2024-01-09T12:15:37',
              modified_date: '2024-01-10T10:00:00',
            },
          ],
        },
      }),
    });
  });
});

test('customer inquiry list and detail panel work with mock data', async ({ page }) => {
  await page.goto('/admin/cubici/supportMember/manageInquiry');

  await expect(page.getByRole('heading', { name: '고객관리' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '고객문의' })).toBeVisible();
  await expect(page.getByText('전체 1건')).toBeVisible();
  await expect(page.getByText('답변완료 1건')).toBeVisible();
  await expect(page.getByText('알림대기 0건')).toBeVisible();
  await expect(page.getByText('실발송 미연동')).toBeVisible();
  await expect(page.getByText('문경남')).toBeVisible();
  await expect(page.getByText('문의 제목')).toBeVisible();
  await expect(page.getByRole('cell', { name: '후속완료' })).toBeVisible();
  await expect(page.getByRole('cell', { name: '알림 미연동' })).toBeVisible();

  await page.getByLabel('검색').fill('문의');
  await page.getByLabel('답변상태').selectOption('answered');
  await page.getByRole('button', { name: '검색' }).click();

  await page.getByRole('button', { name: '문의 제목' }).click();
  await expect(page.locator('.inquiryContent p').filter({ hasText: '문의 내용' })).toBeVisible();
  await expect(page.locator('.inquiryContent p').filter({ hasText: '답변 내용' })).toBeVisible();
  await expect(page.locator('.detailInfoTable')).toContainText('후속완료');
  await expect(page.locator('.detailInfoTable')).toContainText('알림 미연동');

  await page.getByLabel('답변 등록/수정').fill('수정 답변');
  await page.getByRole('button', { name: '답변수정' }).click();
  await expect(page.getByText('답변을 수정했습니다.')).toBeVisible();
  await expect(page.locator('.inquiryContent p').filter({ hasText: '수정 답변' })).toBeVisible();
});
