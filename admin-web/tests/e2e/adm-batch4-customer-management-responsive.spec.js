import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const candidateDir = path.resolve(
  __dirname,
  '../../../docs/reference/lv-ui/admin/ADM-BATCH4-CUSTOMER-MANAGEMENT/candidate',
);

fs.mkdirSync(candidateDir, { recursive: true });

const inquiryPayload = {
  items: [
    {
      qna_id: 1,
      visibility_label: '공개',
      type_label: '큐빅아이',
      created_by: '홍길동',
      title: '서비스 이용 문의',
      reg_date: '2026-08-09',
      latest_reply_date: null,
      answer_status: '답변대기',
      follow_up_status_label: '접수',
      notification_status_label: '알림 미연동',
    },
  ],
  total: 1,
  answered_count: 0,
  waiting_count: 1,
  workflow_status_label: '운영',
  notification_pending_count: 1,
};

const inquiryDetailPayload = {
  inquiry: {
    ...inquiryPayload.items[0],
    type: 'CUBICI',
    content: '<p>서비스 이용 문의 내용입니다.</p>',
  },
  replies: [],
};

const messagePayload = {
  items: [
    {
      message_no: 1,
      msg_key: '00',
      msg_key_label: '문자',
      msg_code: '91',
      msg_menu_label: '큐빅아이',
      msg_division_label: '회원가입',
      msg_item: '인증번호',
      msg_title: '핸드폰 인증번호 발송',
      external_send_status_label: '실발송 미연동',
      variable_policy_status_label: '변수정책 확인',
      workflow_status_label: '템플릿 CRUD',
      reg_date: '2026-08-09',
    },
  ],
  total: 1,
  sms_count: 1,
  email_count: 0,
  external_send_status_label: '실발송 미연동',
  variable_policy_status_label: '변수정책 확인',
};

const boardPayload = {
  board_kind: 'notice',
  items: [
    {
      post_id: 1,
      type_label: '서비스 이용',
      title: '큐빅아이 서비스 이용 안내',
      exposure_status_label: '상시노출',
      attachment_status_label: '첨부 미연동',
      reg_date: '2026-08-09',
    },
  ],
  total: 1,
  attachment_status_label: '첨부 미연동',
  exposure_policy_status_label: '노출정책 확인',
};

const routeConfigs = [
  {
    code: 'ADM-05A-INQUIRY',
    path: '/admin/cubici/supportMember/manageInquiry',
    endpoint: '/support/inquiries',
    readyText: '서비스 이용 문의',
    input: '#inquiryKeyword',
    query: 'keyword',
    value: '문의',
    editor: '.inquiryDetail',
    openButton: '서비스 이용 문의',
  },
  {
    code: 'ADM-05B-MESSAGE',
    path: '/admin/cubici/supportMember/manageSms',
    endpoint: '/support/message-templates',
    readyText: '핸드폰 인증번호 발송',
    input: '#templateKeyword',
    query: 'keyword',
    value: '인증번호',
    editor: '.messageTemplateEditor',
    openButton: '글쓰기',
  },
  {
    code: 'ADM-05C-BOARD',
    path: '/admin/cubici/supportMember/manageBoard_tab1',
    endpoint: '/support/boards/notice',
    readyText: '큐빅아이 서비스 이용 안내',
    input: '#boardKeyword',
    query: 'keyword',
    value: '서비스',
    editor: '.customerBoardEditor',
    openButton: '글쓰기',
  },
];

function apiPayload(url) {
  if (url.includes('/accounts/admin-me')) {
    return { user_no: 1, email: 'admin@example.com', user_type: 'ADMIN_USER', name: '관리자' };
  }
  if (url.includes('/support/inquiries/1')) return inquiryDetailPayload;
  if (url.includes('/support/inquiries')) return inquiryPayload;
  if (url.includes('/support/message-templates')) return messagePayload;
  if (url.includes('/support/boards/')) return boardPayload;
  return { items: [], total: 0 };
}

test.describe('ADM Batch 4 customer management direct menu pages', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/v1/api/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(apiPayload(route.request().url())),
      });
    });
    await page.addInitScript(() => {
      window.localStorage.setItem('cubiciAdminAuth', JSON.stringify({
        token_type: 'Bearer',
        access_token: 'adm-batch4-test-token',
        user: { email: 'admin@example.com', user_type: 'ADMIN_USER' },
      }));
    });
  });

  for (const config of routeConfigs) {
    test(`${config.code} restores responsive UI and preserves search query`, async ({ page }) => {
      const pageErrors = [];
      page.on('pageerror', (error) => pageErrors.push(error.message));

      await page.setViewportSize({ width: 1440, height: 900 });
      const initialRequest = page.waitForRequest((request) => request.url().includes(config.endpoint));
      await page.goto(config.path);
      await initialRequest;
      await expect(page.getByText(config.readyText).first()).toBeVisible();

      await page.locator(config.input).fill(config.value);
      await Promise.all([
        page.waitForRequest((request) => {
          const url = new URL(request.url());
          return url.pathname.includes(config.endpoint) && url.searchParams.get(config.query) === config.value;
        }),
        page.locator(`form.searchArea:has(${config.input}) button[type="submit"]`).click(),
      ]);

      await expect(page.locator('.snbArea li.active li.active')).toBeVisible();
      await expect(page.locator(config.editor)).toBeHidden();
      let overflow = await overflowState(page);
      expect(overflow.body, JSON.stringify(overflow.offenders)).toBeLessThanOrEqual(1);
      let pager = await pagerState(page);
      expect(pager.heightDifference).toBeLessThanOrEqual(1);
      expect(pager.controlBackground).toBe('rgb(159, 178, 207)');
      expect(pager.currentBackground).toBe('rgb(0, 46, 110)');
      await page.screenshot({ path: path.join(candidateDir, `${config.code}-PC.png`), fullPage: true });

      await page.setViewportSize({ width: 390, height: 844 });
      await expect(page.locator('.adminNavigationToggle')).toBeVisible();
      await expect.poll(async () => {
        const navigationBox = await page.locator('#admin-navigation').boundingBox();
        return navigationBox?.x ?? 0;
      }).toBeLessThanOrEqual(-300);
      overflow = await overflowState(page);
      expect(overflow.body, JSON.stringify(overflow.offenders)).toBeLessThanOrEqual(1);
      pager = await pagerState(page);
      expect(pager.heightDifference).toBeLessThanOrEqual(1);
      expect(pager.controlBackground).toBe('rgb(159, 178, 207)');
      expect(pager.currentBackground).toBe('rgb(0, 46, 110)');
      await page.screenshot({ path: path.join(candidateDir, `${config.code}-MOBILE.png`), fullPage: true });

      await page.getByRole('button', { name: config.openButton }).first().click();
      await expect(page.locator(config.editor)).toBeVisible();

      expect(pageErrors).toEqual([]);
    });
  }
});

function pagerState(page) {
  return page.evaluate(() => {
    const items = [...document.querySelectorAll('.pagingControls > *')];
    const heights = items.map((item) => item.getBoundingClientRect().height);
    return {
      heightDifference: Math.max(...heights) - Math.min(...heights),
      controlBackground: getComputedStyle(items[0]).backgroundColor,
      currentBackground: getComputedStyle(items[1]).backgroundColor,
    };
  });
}

function overflowState(page) {
  return page.evaluate(() => {
    const viewportWidth = document.documentElement.clientWidth;
    const bodyWidth = document.body.scrollWidth;
    const offenders = [...document.querySelectorAll('body *')]
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          selector: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}${[...element.classList].map((name) => `.${name}`).join('')}`,
          right: Math.round(rect.right),
          width: Math.round(rect.width),
        };
      })
      .filter((item) => item.right > viewportWidth + 1 && item.right <= bodyWidth + 2)
      .sort((a, b) => b.right - a.right)
      .slice(0, 10);

    return { body: bodyWidth - viewportWidth, offenders };
  });
}
