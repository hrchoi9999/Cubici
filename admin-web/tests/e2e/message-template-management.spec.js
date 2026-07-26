import { expect, test } from '@playwright/test';

const template = {
  message_no: 1,
  msg_key: '00',
  msg_key_label: '문자',
  msg_code: '91',
  msg_menu: 'CB',
  msg_menu_label: '큐빅아이',
  msg_division: 'SU',
  msg_division_label: '회원가입',
  msg_item: '인증번호',
  msg_title: '핸드폰 인증번호 발송',
  msg_content: '귀하의 핸드폰 인증번호는 {authCode} 입니다.',
  reg_user: '관리자',
  reg_date: '2023-03-27T10:18:50',
  external_send_status_label: '실발송 미연동',
  variable_policy_status_label: '변수정책 확인',
  workflow_status_label: '템플릿 CRUD',
};

test.beforeEach(async ({ page }) => {
  await page.route('**/v1/api/support/message-templates?**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        limit: 20,
        offset: 0,
        total: 1,
        sms_count: 1,
        email_count: 0,
        external_send_status_label: '실발송 미연동',
        variable_policy_status_label: '변수정책 확인',
        items: [template],
      }),
    });
  });

  await page.route('**/v1/api/support/message-templates/1', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify(template),
      });
      return;
    }

    if (route.request().method() === 'PUT') {
      const payload = await route.request().postDataJSON();
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          action: 'updated',
          message_no: 1,
          template: {
            ...template,
            msg_title: payload.msg_title,
            msg_content: payload.msg_content,
          },
        }),
      });
      return;
    }

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        action: 'deleted',
        message_no: 1,
        template: null,
      }),
    });
  });
});

test('message template list, edit, and delete work with mock data', async ({ page }) => {
  await page.goto('/admin/cubici/supportMember/manageSms');

  await expect(page.getByRole('heading', { name: '고객관리' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '문자/이메일' })).toBeVisible();
  await expect(page.getByText('전체 1건')).toBeVisible();
  await expect(page.locator('.summaryStrip').getByText('실발송 미연동')).toBeVisible();
  await expect(page.locator('.summaryStrip').getByText('변수정책 확인')).toBeVisible();
  await expect(page.getByText('핸드폰 인증번호 발송')).toBeVisible();
  await expect(page.getByRole('cell', { name: '템플릿 CRUD' })).toBeVisible();

  await page.getByRole('button', { name: '보기' }).click();
  await expect(page.getByRole('heading', { name: '템플릿 수정' })).toBeVisible();
  await page.getByLabel('제목').fill('수정 제목');
  await page.getByLabel('내용').fill('수정 내용');
  await page.getByRole('button', { name: '수정' }).click();
  await expect(page.getByText('템플릿을 수정했습니다.')).toBeVisible();
  await expect(page.locator('.messageTemplatePreview')).toContainText('템플릿 CRUD');
  await expect(page.locator('.messageTemplatePreview p').filter({ hasText: '수정 내용' })).toBeVisible();

  await page.getByRole('button', { name: '삭제' }).click();
  await expect(page.getByText('템플릿을 삭제했습니다.')).toBeVisible();
});
