import path from 'node:path';
import { expect, test } from '@playwright/test';
import { installMockAdminAuth } from './helpers/mock-admin-auth.js';

const smsTemplate = {
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
};

const emailTemplate = {
  ...smsTemplate,
  message_no: 2,
  msg_key: '01',
  msg_key_label: '이메일',
  msg_code: '11',
  msg_item: '가입 안내',
  msg_title: '큐빅아이 회원가입 안내',
  msg_content: '<main style="padding:32px;font-family:sans-serif"><h1>큐빅아이</h1><p>회원가입을 환영합니다.</p></main>',
};

const candidateDir = path.resolve(
  process.cwd(),
  '..',
  'docs',
  'reference',
  'lv-ui',
  'admin',
  'ADM-LV-13-MESSAGE-TEMPLATE',
  'candidate',
);

test.beforeEach(async ({ page }) => {
  await installMockAdminAuth(page);

  await page.route('**/v1/api/support/message-templates?**', async (route) => {
    const requestUrl = new URL(route.request().url());
    const isEmail = requestUrl.searchParams.get('msg_key') === '01';
    const item = isEmail ? emailTemplate : smsTemplate;
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        limit: 20,
        offset: 0,
        total: 1,
        sms_count: 1,
        email_count: 1,
        items: [item],
      }),
    });
  });

  await page.route('**/v1/api/support/message-templates/*', async (route) => {
    const messageNo = Number(new URL(route.request().url()).pathname.split('/').pop());
    const template = messageNo === 2 ? emailTemplate : smsTemplate;

    if (route.request().method() === 'GET') {
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify(template) });
      return;
    }

    if (route.request().method() === 'PUT') {
      const payload = await route.request().postDataJSON();
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          action: 'updated',
          message_no: messageNo,
          template: { ...template, msg_title: payload.msg_title, msg_content: payload.msg_content },
        }),
      });
      return;
    }

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ action: 'deleted', message_no: messageNo, template: null }),
    });
  });
});

test('문자/이메일 목록, 편집, 삭제 및 이메일 상세화면이 작동한다', async ({ page }) => {
  await page.goto('/admin/cubici/supportMember/manageSms');

  await expect(page.getByRole('heading', { name: '고객관리' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '문자/이메일' })).toBeVisible();
  await expect(page.getByText('핸드폰 인증번호 발송')).toBeVisible();
  await expect(page.getByRole('columnheader', { name: '요약' })).toBeVisible();

  await page.getByRole('button', { name: '보기' }).click();
  await expect(page.getByRole('heading', { name: '템플릿 수정' })).toBeVisible();
  await page.getByLabel('제목').fill('수정 제목');
  await page.getByLabel('내용').fill('수정 내용');
  await page.getByRole('button', { name: '수정' }).click();
  await expect(page.getByText('템플릿을 수정했습니다.')).toBeVisible();

  await page.getByRole('button', { name: '보기' }).click();
  await page.getByRole('button', { name: '삭제' }).click();
  await expect(page.getByText('템플릿을 삭제했습니다.')).toBeVisible();

  await page.getByRole('link', { name: '이메일', exact: true }).click();
  await expect(page.getByText('큐빅아이 회원가입 안내')).toBeVisible();
  await page.getByRole('button', { name: '상세 화면' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByTitle('이메일 템플릿 상세화면')).toBeVisible();
  await page.getByRole('button', { name: '취소' }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
});

test('ADM-LV-13 PC 및 모바일 후보 화면을 생성한다', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/admin/cubici/supportMember/manageSms');
  await expect(page.getByText('핸드폰 인증번호 발송')).toBeVisible();
  await page.screenshot({ path: path.join(candidateDir, 'ADM-LV-13-SMS-LIST-PC.png'), fullPage: true });

  await page.getByRole('link', { name: '이메일', exact: true }).click();
  await expect(page.getByText('큐빅아이 회원가입 안내')).toBeVisible();
  await page.screenshot({ path: path.join(candidateDir, 'ADM-LV-13-EMAIL-LIST-PC.png'), fullPage: true });
  await page.getByRole('button', { name: '상세 화면' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.screenshot({ path: path.join(candidateDir, 'ADM-LV-13-EMAIL-PREVIEW-PC.png'), fullPage: true });
  await page.getByRole('button', { name: '취소' }).click();

  await page.getByRole('button', { name: '보기' }).click();
  await expect(page.getByRole('heading', { name: '템플릿 수정' })).toBeVisible();
  await page.screenshot({ path: path.join(candidateDir, 'ADM-LV-13-EDITOR-PC.png'), fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/admin/cubici/supportMember/manageSms');
  await expect(page.getByText('핸드폰 인증번호 발송')).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: path.join(candidateDir, 'ADM-LV-13-SMS-LIST-MOBILE.png'), fullPage: true });
  await expect.poll(() => page.locator('.messageTemplateLvList .table-scroll').evaluate(
    (element) => element.scrollWidth > element.clientWidth,
  )).toBe(true);

  await page.getByRole('button', { name: '보기' }).click();
  await expect(page.getByRole('heading', { name: '템플릿 수정' })).toBeVisible();
  await page.screenshot({ path: path.join(candidateDir, 'ADM-LV-13-EDITOR-MOBILE.png'), fullPage: true });
});
