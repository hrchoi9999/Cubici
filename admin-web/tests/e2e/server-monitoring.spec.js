import { expect, test } from '@playwright/test';

const serverStatus = {
  checked_at: '2026-07-22T10:00:00',
  overall_status: '주의',
  metric_source_label: 'FastAPI/DB/배치 로그 기반',
  metric_source_status_label: '외부 서버 metric 미연동',
  follow_up_action_label: 'Error Log 실패 건 확인',
  recent_success_count: 12,
  recent_fail_count: 1,
  last_success_at: '2026-07-22T09:50:00',
  last_fail_at: '2026-07-22T08:00:00',
  metrics: [
    {
      name: 'API 서버',
      status: '정상',
      value: '응답 가능',
      checked_at: '2026-07-22T10:00:00',
      note: 'FastAPI endpoint 응답 기준',
      source_label: 'FastAPI self-check',
      action_label: '응답 지연 시 service-api 로그 확인',
    },
    {
      name: 'PostgreSQL',
      status: '정상',
      value: '연결 가능',
      checked_at: '2026-07-22T10:00:00',
      note: 'select now() 실행 기준',
      source_label: 'PostgreSQL connection',
      action_label: 'timeout 반복 시 Docker PostgreSQL 상태 확인',
    },
    {
      name: '배치 성공',
      status: '정상',
      value: '12건',
      checked_at: '2026-07-22T09:50:00',
      note: '최근 24시간 cbci_scheduled_report 기준',
      source_label: 'cbci_scheduled_report',
      action_label: '성공 0건이면 배치 스케줄 실행 여부 확인',
    },
    {
      name: '배치 실패',
      status: '주의',
      value: '1건',
      checked_at: '2026-07-22T08:00:00',
      note: '최근 24시간 cbci_err_report 기준',
      source_label: 'cbci_err_report',
      action_label: '실패 건은 Error Log에서 원인 확인 후 재수집/재실행',
    },
  ],
};

test.beforeEach(async ({ page }) => {
  await page.route('**/v1/api/accounts/admin-me', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ user_no: 1, email: 'admin@example.com', user_type: 'ADMIN_USER', name: '관리자' }),
    });
  });
  await page.addInitScript(() => {
    window.localStorage.setItem('cubiciAdminAuth', JSON.stringify({
      token_type: 'Bearer',
      access_token: 'server-monitor-test-token',
      user: { email: 'admin@example.com', user_type: 'ADMIN_USER' },
    }));
  });
});

test('server monitoring status cards render with mock data', async ({ page }) => {
  await page.route('**/v1/api/monitoring/server-status?**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(serverStatus),
    });
  });

  await page.goto('/admin/cubici/adminMonitor/server_monitor');

  await expect(page.locator('.subVisual h3', { hasText: '서버 관리' })).toBeVisible();
  await expect(page.locator('.serverMonitorSummary')).toContainText('종합 상태');
  await expect(page.locator('.serverMonitorSummary')).toContainText('주의');
  await expect(page.locator('.serverMonitorSummary')).toContainText('정상 처리');
  await expect(page.getByText('외부 서버 metric 미연동')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'API 서버' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'PostgreSQL' })).toBeVisible();
  await expect(page.locator('.serverStatusCard').filter({ hasText: '배치 성공' }).getByText('12건', { exact: true })).toBeVisible();
  await expect(page.locator('.serverStatusCard').filter({ hasText: '배치 실패' }).getByText('1건', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: '점검 기준' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: '점검 항목' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Error Log' })).toBeVisible();
});
