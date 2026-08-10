import path from 'node:path';
import { expect, test } from '@playwright/test';
import { installMockAdminAuth } from './helpers/mock-admin-auth.js';

const errorLogPayload = {
  limit: 20,
  offset: 0,
  total: 2,
  success_count: 1,
  fail_count: 1,
  pending_action_count: 1,
  workflow_status_label: '조치필요',
  items: [
    {
      shop_id: 'shop-001',
      shop_type: 'NAVER',
      shop_name: '11번가',
      scenario: '정산 수집',
      started_at: '2026-07-21T09:10:11',
      runtime_seconds: 125,
      runtime_label: '0시간 2분 5초',
      status: '성공',
      processing_status_label: '처리완료',
      follow_up_action_label: '추가조치 없음',
      source_table: 'cbci_scheduled_report',
      error_log: '-',
    },
    {
      shop_id: 'shop-002',
      shop_type: 'COUPANG',
      shop_name: '쿠팡',
      scenario: '매출 수집',
      started_at: '2026-07-21T10:10:11',
      runtime_seconds: 61,
      runtime_label: '0시간 1분 1초',
      status: '실패',
      processing_status_label: '조치필요',
      follow_up_action_label: '원인 확인 후 재수집/배치 재실행',
      source_table: 'cbci_err_report',
      error_log: 'API 응답 오류',
    },
  ],
};

const candidateDir = path.resolve(
  process.cwd(),
  '..',
  'docs',
  'reference',
  'lv-ui',
  'admin',
  'ADM-LV-15-ERROR-LOG',
  'candidate',
);

test.beforeEach(async ({ page }) => {
  await installMockAdminAuth(page);
  await page.route('**/v1/api/monitoring/error-logs?**', async (route) => {
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify(errorLogPayload) });
  });
});

test('Error Log 검색, legacy 7열 목록과 상세가 작동한다', async ({ page }) => {
  await page.goto('/admin/cubici/adminMonitor/error_report');

  await expect(page.locator('.subVisual h3', { hasText: 'Error Log' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: '실행시간' })).toBeVisible();
  await expect(page.getByRole('cell', { name: '11번가' })).toBeVisible();
  await expect(page.getByRole('cell', { name: '쿠팡' })).toBeVisible();

  await page.getByLabel('시나리오').fill('매출');
  const requestPromise = page.waitForRequest((request) => new URL(request.url()).searchParams.get('scenario') === '매출');
  await page.getByRole('button', { name: '검색' }).click();
  await requestPromise;

  await page.getByRole('button', { name: 'API 응답 오류' }).click();
  await expect(page.getByRole('heading', { name: '에러로그 상세' })).toBeVisible();
  await expect(page.locator('.errorLogLvDetail')).toContainText('cbci_err_report');
  await expect(page.locator('.errorLogLvDetail')).toContainText('원인 확인 후 재수집/배치 재실행');
  await page.getByRole('button', { name: '닫기' }).click();
  await expect(page.locator('.errorLogLvDetail')).toBeHidden();
});

test('ADM-LV-15 PC 및 모바일 후보 화면을 생성한다', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/admin/cubici/adminMonitor/error_report');
  await expect(page.getByRole('cell', { name: '쿠팡' })).toBeVisible();
  await page.screenshot({ path: path.join(candidateDir, 'ADM-LV-15-LIST-PC.png'), fullPage: true });
  await page.getByRole('button', { name: 'API 응답 오류' }).click();
  await page.screenshot({ path: path.join(candidateDir, 'ADM-LV-15-DETAIL-PC.png'), fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/admin/cubici/adminMonitor/error_report');
  await expect(page.getByRole('cell', { name: '쿠팡' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expect.poll(() => page.locator('.errorLogLvList .tableScroll').evaluate(
    (element) => element.scrollWidth > element.clientWidth,
  )).toBe(true);
  await page.screenshot({ path: path.join(candidateDir, 'ADM-LV-15-LIST-MOBILE.png'), fullPage: true });
  await page.getByRole('button', { name: 'API 응답 오류' }).click();
  await page.screenshot({ path: path.join(candidateDir, 'ADM-LV-15-DETAIL-MOBILE.png'), fullPage: true });
});
