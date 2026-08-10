import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const candidateDir = path.resolve(
  __dirname,
  '../../../docs/reference/lv-ui/admin/ADM-LV-16-SERVER-MONITOR/candidate',
);

fs.mkdirSync(candidateDir, { recursive: true });

const serverStatus = {
  checked_at: '2026-08-10T14:30:00',
  overall_status: '주의',
  metric_source_label: 'FastAPI/DB/배치 로그 기반',
  metric_source_status_label: '외부 서버 metric 미연동',
  follow_up_action_label: 'Error Log 실패 건 확인',
  recent_success_count: 12,
  recent_fail_count: 1,
  metrics: [
    ['API 서버', '정상', '응답 가능', '관리자 API 응답 기준', '응답 지연 시 API 로그 확인'],
    ['PostgreSQL', '정상', '연결 가능', 'DB 현재 시각 조회 기준', '연결 지연 시 DB 상태 확인'],
    ['배치 성공', '정상', '12건', '최근 24시간 정상 실행 기준', '실행 0건이면 스케줄 확인'],
    ['배치 실패', '주의', '1건', '최근 24시간 오류 발생 기준', 'Error Log에서 원인 확인'],
  ].map(([name, status, value, note, action_label]) => ({
    name,
    status,
    value,
    note,
    action_label,
    source_label: 'internal',
    checked_at: '2026-08-10T14:30:00',
  })),
};

test.beforeEach(async ({ page }) => {
  await page.route('**/v1/api/**', async (route) => {
    const url = new URL(route.request().url());
    const body = url.pathname.endsWith('/accounts/admin-me')
      ? { user_no: 1, email: 'admin@example.com', user_type: 'ADMIN_USER', name: '관리자' }
      : serverStatus;
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) });
  });
  await page.addInitScript(() => {
    window.localStorage.setItem('cubiciAdminAuth', JSON.stringify({
      token_type: 'Bearer',
      access_token: 'adm-lv-16-token',
      user: { email: 'admin@example.com', user_type: 'ADMIN_USER' },
    }));
  });
});

test('ADM-LV-16 서버 관리 PC와 모바일 후보를 생성한다', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/admin/cubici/adminMonitor/server_monitor');

  await expect(page.locator('.serverStatusCard')).toHaveCount(4);
  await expect(page.locator('.serverMonitorSummary')).toContainText('정상 처리');
  await expect(page.getByRole('columnheader', { name: '데이터 원본' })).toBeVisible();
  await expect(page.getByText('외부 서버 metric 미연동')).toHaveCount(0);
  expect(await bodyOverflow(page)).toBeLessThanOrEqual(1);
  await page.screenshot({
    path: path.join(candidateDir, 'ADM-LV-16-SERVER-MONITOR-PC.png'),
    fullPage: true,
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect(page.locator('.adminNavigationToggle')).toBeVisible();
  await expect.poll(async () => {
    const box = await page.locator('#admin-navigation').boundingBox();
    return box?.x ?? 0;
  }).toBeLessThanOrEqual(-300);
  await expect(page.locator('.serverStatusCard')).toHaveCount(4);
  expect(await bodyOverflow(page)).toBeLessThanOrEqual(1);
  await page.screenshot({
    path: path.join(candidateDir, 'ADM-LV-16-SERVER-MONITOR-MOBILE.png'),
    fullPage: true,
  });
});

test('ADM-LV-16 조회범위 변경과 새로고침 기능을 유지한다', async ({ page }) => {
  const requests = [];
  page.on('request', (request) => {
    if (request.url().includes('/monitoring/server-status')) requests.push(request.url());
  });

  await page.goto('/admin/cubici/adminMonitor/server_monitor');
  await page.locator('#serverMonitorHours').selectOption('6');
  await expect.poll(() => requests.some((url) => new URL(url).searchParams.get('hours') === '6')).toBeTruthy();

  const requestCount = requests.length;
  await page.getByRole('button', { name: '새로고침' }).click();
  await expect.poll(() => requests.length).toBeGreaterThan(requestCount);
});

function bodyOverflow(page) {
  return page.evaluate(() => document.body.scrollWidth - document.documentElement.clientWidth);
}
