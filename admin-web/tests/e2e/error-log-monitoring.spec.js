import { expect, test } from '@playwright/test';

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
      shop_name: '테스트몰',
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
      shop_name: '오류몰',
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

test.beforeEach(async ({ page }) => {
  await page.route('**/v1/api/accounts/me', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ user_no: 1, email: 'admin@example.com', user_type: 'ADMIN_USER', name: '관리자' }),
    });
  });
  await page.addInitScript(() => {
    window.localStorage.setItem('cubiciAdminAuth', JSON.stringify({
      token_type: 'Bearer',
      access_token: 'error-log-test-token',
      user: { email: 'admin@example.com', user_type: 'ADMIN_USER' },
    }));
  });
});

test('error log monitoring list and detail work with mock data', async ({ page }) => {
  await page.route('**/v1/api/monitoring/error-logs?**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(errorLogPayload),
    });
  });

  await page.goto('/admin/cubici/adminMonitor/error_report');

  await expect(page.locator('.subVisual h3', { hasText: 'Error Log' })).toBeVisible();
  await expect(page.getByText('전체 2건')).toBeVisible();
  await expect(page.getByText('조치필요 1건')).toBeVisible();
  await expect(page.getByText('Workflow 조치필요')).toBeVisible();
  await expect(page.getByRole('cell', { name: '테스트몰' })).toBeVisible();
  await expect(page.getByRole('cell', { name: '오류몰' })).toBeVisible();
  await page.getByRole('row', { name: /오류몰/ }).click();
  await expect(page.locator('.errorLogPreview p')).toContainText('API 응답 오류');
  await expect(page.locator('.errorLogPreview')).toContainText('cbci_err_report');
  await expect(page.locator('.errorLogPreview')).toContainText('원인 확인 후 재수집/배치 재실행');
});
