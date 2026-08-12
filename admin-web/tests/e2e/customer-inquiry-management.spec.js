import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';

import { installMockAdminAuth } from './helpers/mock-admin-auth.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const candidateDir = path.resolve(
  currentDir,
  '../../../docs/reference/lv-ui/admin/ADM-LV-12-CUSTOMER-INQUIRY/candidate',
);

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

let replyPayload;

test.beforeEach(async ({ page }) => {
  replyPayload = null;
  await installMockAdminAuth(page);
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
    replyPayload = payload;

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

test('ADM-LV-12 customer inquiry list, detail, reply, and responsive views work', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/admin/cubici/supportMember/manageInquiry');

  await expect(page.getByRole('heading', { name: '고객관리' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '고객문의' })).toBeVisible();
  await expect(page.getByText('문경남')).toBeVisible();
  await expect(page.getByText('문의 제목')).toBeVisible();
  await expect(page.locator('.inquiryLvTable thead th')).toHaveCount(8);
  await expect(page.locator('.lvBoardPager button.active')).toHaveText('1');
  await page.screenshot({ path: path.join(candidateDir, 'ADM-LV-12-LIST-PC.png'), fullPage: true });

  await page.getByRole('searchbox', { name: '검색' }).fill('문의');
  await page.getByRole('button', { name: '검색' }).click();

  await page.getByRole('button', { name: '문의 제목' }).click();
  await expect(page.locator('.customerInquiryLvArticle p').filter({ hasText: '문의 내용' })).toBeVisible();
  await expect(page.locator('.customerInquiryLvArticle p').filter({ hasText: '답변 내용' })).toBeVisible();
  await expect(page.locator('.customerInquiryLvWorkflow')).toContainText('후속완료');
  await expect(page.locator('.customerInquiryLvWorkflow')).toContainText('알림 미연동');
  await expect(page.locator('.inquiryLvTable')).toHaveCount(0);
  await page.screenshot({ path: path.join(candidateDir, 'ADM-LV-12-DETAIL-PC.png'), fullPage: true });

  await page.getByLabel('답변 등록/수정').fill('수정 답변');
  await page.getByRole('button', { name: '답변수정' }).click();
  await expect(page.getByText('답변을 수정했습니다.')).toBeVisible();
  await expect(page.locator('.customerInquiryLvArticle p').filter({ hasText: '수정 답변' })).toBeVisible();
  expect(replyPayload).toMatchObject({
    user_no: 1,
    operated_by: '관리자',
  });
  await page.getByRole('button', { name: '목록', exact: true }).click();
  await expect(page.locator('.inquiryLvTable')).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/admin/cubici/supportMember/manageInquiry');
  await expect.poll(async () => (await page.locator('#admin-navigation').boundingBox())?.x ?? 0).toBeLessThan(-100);
  await expect(page.locator('.table-scroll')).toHaveCSS('overflow-x', 'auto');
  expect(await page.evaluate(() => document.body.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: path.join(candidateDir, 'ADM-LV-12-LIST-MOBILE.png'), fullPage: true });

  await page.getByRole('button', { name: '문의 제목' }).click();
  await expect(page.locator('.customerInquiryLvDetail')).toBeVisible();
  expect(await page.evaluate(() => document.body.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: path.join(candidateDir, 'ADM-LV-12-DETAIL-MOBILE.png'), fullPage: true });
  expect(pageErrors).toEqual([]);
});
