import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const candidateDir = path.resolve(
  __dirname,
  '../../../docs/reference/lv-ui/admin/ADM-LV-17-FINTECH-TRADE/candidate',
);

fs.mkdirSync(candidateDir, { recursive: true });

const tradeItem = {
  mbid: 'MONEY00001',
  req_type: 'REQ',
  req_date: '20260810',
  req_time: '143011',
  svc_type: 'TRANSFER',
  bank_code: '039',
  comp_code: 'CUBICI01',
  seq_no: '100001',
  msg_code: '0100100',
  send_flag: 'Y',
  recv_flag: 'Y',
  process_status: '완료',
  send_msg_length: 300,
  recv_msg_length: 300,
  result_policy: '정상',
  result_reason: '정상 응답',
};

const parsedSend = {
  message_length: 300,
  message_code: '0100',
  business_class_code: '100',
  msg_code: '0100100',
  operation: '송금 요청',
  fields: [
    { name: '업체코드', offset: 8, length: 8, field_type: 'text', value: 'CUBICI01' },
    { name: '전문번호', offset: 16, length: 6, field_type: 'text', value: '100001' },
    { name: '출금금액', offset: 80, length: 13, field_type: 'number', int_value: 1250000 },
    { name: '입금계좌번호', offset: 120, length: 20, field_type: 'text', value: 'TEST-ACCOUNT' },
  ],
};

const parsedRecv = {
  message_length: 300,
  message_code: '0110',
  business_class_code: '100',
  msg_code: '0110100',
  operation: '송금 응답',
  fields: [
    { name: '응답코드', offset: 40, length: 4, field_type: 'text', value: '0000' },
    { name: '은행응답코드', offset: 44, length: 4, field_type: 'text', value: '0000' },
    { name: '처리결과', offset: 48, length: 1, field_type: 'text', value: 'Y' },
    { name: '수수료', offset: 180, length: 10, field_type: 'number', int_value: 0 },
  ],
};

test.beforeEach(async ({ page }) => {
  await page.route('**/v1/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    let body;

    if (url.pathname.endsWith('/accounts/admin-me')) {
      body = { user_no: 1, email: 'admin@example.com', user_type: 'ADMIN_USER', name: '관리자' };
    } else if (url.pathname.endsWith('/fintech/status')) {
      body = { mode: 'mock-adapter', live_transfer_enabled: false, source_tables: [], supported_operations: [] };
    } else if (url.pathname.endsWith('/fintech/mock/transfer-request')) {
      body = {
        adapter_mode: 'mock-db',
        live_transfer_enabled: false,
        created: true,
        req_date: '20260810',
        req_time: '143011',
        bank_code: '039',
        comp_code: 'CUBICI01',
        seq_no: '100002',
        msg_code: '0100100',
        send_flag: 'N',
        recv_flag: 'N',
        process_status: '대기',
        message_length: 300,
        warning: 'test only',
      };
    } else if (url.pathname.includes('/fintech/trade-requests/')) {
      body = { ...tradeItem, parsed_send_msg: parsedSend, parsed_recv_msg: parsedRecv };
    } else if (url.pathname.endsWith('/fintech/trade-requests')) {
      body = { limit: 20, offset: 0, total: 1, items: [tradeItem] };
    } else {
      body = { items: [], total: 0 };
    }

    await route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) });
  });

  await page.addInitScript(() => {
    window.localStorage.setItem('cubiciAdminAuth', JSON.stringify({
      token_type: 'Bearer',
      access_token: 'adm-lv-17-token',
      user: { email: 'admin@example.com', user_type: 'ADMIN_USER' },
    }));
  });
});

test('ADM-LV-17 목록 검색과 PC·모바일 후보를 검증한다', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/admin/cubici/adminMonitor/fintech_trade');

  await expect(page.getByRole('cell', { name: 'MONEY00001' })).toBeVisible();
  await expect(page.locator('.fintechLvToolbar')).toContainText('실송금 연동 준비');
  await expect(page.getByRole('heading', { name: '펌뱅킹 전문 목록' })).toBeVisible();
  await page.locator('#fintechMbid').fill('MONEY00001');
  await Promise.all([
    page.waitForRequest((request) => new URL(request.url()).searchParams.get('mbid') === 'MONEY00001'),
    page.locator('.fintechLvSearch').getByRole('button', { name: '검색' }).click(),
  ]);
  expect(await bodyOverflow(page)).toBeLessThanOrEqual(1);
  await expectTableScroll(page);
  await page.screenshot({
    path: path.join(candidateDir, 'ADM-LV-17-LIST-PC.png'),
    fullPage: true,
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expectClosedNavigation(page);
  await expect(page.getByRole('cell', { name: 'MONEY00001' })).toBeVisible();
  expect(await bodyOverflow(page)).toBeLessThanOrEqual(1);
  await expectTableScroll(page);
  await page.screenshot({
    path: path.join(candidateDir, 'ADM-LV-17-LIST-MOBILE.png'),
    fullPage: true,
  });
});

test('ADM-LV-17 전문 상세와 parser PC·모바일 후보를 검증한다', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/admin/cubici/adminMonitor/fintech_trade');
  await page.getByRole('row', { name: /MONEY00001/ }).click();

  await expect(page.locator('.fintechLvDetail')).toBeVisible();
  await expect(page.getByRole('heading', { name: '송신 전문 요약' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '수신 전문 필드' })).toBeVisible();
  await expect(page.getByRole('cell', { name: '정상 응답' })).toBeVisible();
  await page.screenshot({
    path: path.join(candidateDir, 'ADM-LV-17-DETAIL-PC.png'),
    fullPage: true,
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expectClosedNavigation(page);
  await page.getByRole('row', { name: /MONEY00001/ }).click();
  await expect(page.locator('.fintechLvDetail')).toBeVisible();
  expect(await bodyOverflow(page)).toBeLessThanOrEqual(1);
  await page.screenshot({
    path: path.join(candidateDir, 'ADM-LV-17-DETAIL-MOBILE.png'),
    fullPage: true,
  });
});

test('ADM-LV-17 테스트 전문 저장 기능을 유지한다', async ({ page }) => {
  await page.goto('/admin/cubici/adminMonitor/fintech_trade');
  await page.getByRole('button', { name: '테스트 전문 생성' }).click();
  await expect(page.locator('.fintechMockForm')).toBeVisible();

  await page.locator('#mockCompCode').fill('CUBICI01');
  await page.locator('#mockAmount').fill('1250000');
  const saveRequest = page.waitForRequest((request) => (
    request.method() === 'POST' && request.url().endsWith('/fintech/mock/transfer-request')
  ));
  await page.getByRole('button', { name: '테스트 저장' }).click();
  const request = await saveRequest;
  expect(request.postDataJSON().amount).toBe(1250000);
  await expect(page.locator('.fintechMockMessage')).toContainText('테스트 송금요청 저장 완료');
});

async function expectClosedNavigation(page) {
  await expect(page.locator('.adminNavigationToggle')).toBeVisible();
  await expect.poll(async () => {
    const box = await page.locator('#admin-navigation').boundingBox();
    return box?.x ?? 0;
  }).toBeLessThanOrEqual(-300);
}

async function expectTableScroll(page) {
  const dimensions = await page.locator('.fintechLvList .tableScroll').evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
    overflowX: getComputedStyle(element).overflowX,
  }));
  expect(dimensions.scrollWidth).toBeGreaterThan(dimensions.clientWidth);
  expect(dimensions.overflowX).toBe('scroll');
  await expect(page.locator('.fintechHorizontalScrollbar')).toBeVisible();
  const range = page.getByRole('slider', { name: '전문 목록 가로 스크롤' });
  await expect(range).toBeVisible();
  expect(Number(await range.getAttribute('max'))).toBeGreaterThan(0);
  await page.getByRole('button', { name: '오른쪽으로 스크롤' }).click();
  await expect.poll(async () => Number(await range.inputValue())).toBeGreaterThan(0);
  await page.getByRole('button', { name: '왼쪽으로 스크롤' }).click();
  await expect.poll(async () => Number(await range.inputValue())).toBe(0);
}

function bodyOverflow(page) {
  return page.evaluate(() => document.body.scrollWidth - document.documentElement.clientWidth);
}
