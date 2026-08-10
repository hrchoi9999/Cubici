import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const candidateDir = path.resolve(
  __dirname,
  '../../../docs/reference/lv-ui/admin/ADM-BATCH5-MONITORING/candidate',
);

fs.mkdirSync(candidateDir, { recursive: true });

const errorLogPayload = {
  total: 2,
  success_count: 1,
  fail_count: 1,
  pending_action_count: 1,
  workflow_status_label: '조치필요',
  items: [
    {
      shop_id: 'cubici@shop.co.kr',
      shop_name: '11번가',
      scenario: '정산 수집',
      started_at: '2026-08-09T09:10:11',
      runtime_label: '0시간 2분 5초',
      status: '성공',
      processing_status_label: '처리완료',
      follow_up_action_label: '추가조치 없음',
      source_table: 'cbci_scheduled_report',
      error_log: '-',
    },
    {
      shop_id: 'admin@shop.co.kr',
      shop_name: '쿠팡',
      scenario: '매출 수집',
      started_at: '2026-08-09T10:10:11',
      runtime_label: '0시간 1분 1초',
      status: '실패',
      processing_status_label: '조치필요',
      follow_up_action_label: '원인 확인 후 재수집',
      source_table: 'cbci_err_report',
      error_log: 'API 응답 오류',
    },
  ],
};

const serverStatusPayload = {
  checked_at: '2026-08-09T10:00:00',
  overall_status: '주의',
  metric_source_label: 'FastAPI/DB/배치 로그 기반',
  metric_source_status_label: '외부 서버 metric 미연동',
  follow_up_action_label: 'Error Log 실패 건 확인',
  recent_success_count: 12,
  recent_fail_count: 1,
  metrics: [
    ['API 서버', '정상', '응답 가능', 'FastAPI endpoint 응답 기준', 'FastAPI self-check'],
    ['PostgreSQL', '정상', '연결 가능', 'select now() 실행 기준', 'PostgreSQL connection'],
    ['배치 성공', '정상', '12건', '최근 24시간 실행 기준', 'cbci_scheduled_report'],
    ['배치 실패', '주의', '1건', '최근 24시간 실패 기준', 'cbci_err_report'],
  ].map(([name, status, value, note, source_label]) => ({
    name,
    status,
    value,
    note,
    source_label,
    action_label: status === '주의' ? 'Error Log 확인' : '추가조치 없음',
    checked_at: '2026-08-09T10:00:00',
  })),
};

const fintechItem = {
  mbid: 'MONEY00001',
  req_type: 'REQ',
  req_date: '20260809',
  req_time: '101112',
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

function apiPayload(request) {
  const url = new URL(request.url());
  if (url.pathname.endsWith('/accounts/admin-me')) {
    return { user_no: 1, email: 'admin@example.com', user_type: 'ADMIN_USER', name: '관리자' };
  }
  if (url.pathname.endsWith('/monitoring/error-logs')) return errorLogPayload;
  if (url.pathname.endsWith('/monitoring/server-status')) return serverStatusPayload;
  if (url.pathname.endsWith('/fintech/status')) {
    return { mode: 'legacy-db-read', live_transfer_enabled: false, source_tables: [], supported_operations: [], next_action: '-' };
  }
  if (url.pathname.includes('/fintech/trade-requests/')) {
    return { ...fintechItem, parsed_send_msg: null, parsed_recv_msg: null };
  }
  if (url.pathname.endsWith('/fintech/trade-requests')) {
    return { limit: 20, offset: 0, total: 1, items: [fintechItem] };
  }
  return { items: [], total: 0 };
}

test.describe('ADM Batch 5 monitoring pages', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/v1/api/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(apiPayload(route.request())),
      });
    });
    await page.addInitScript(() => {
      window.localStorage.setItem('cubiciAdminAuth', JSON.stringify({
        token_type: 'Bearer',
        access_token: 'adm-batch5-test-token',
        user: { email: 'admin@example.com', user_type: 'ADMIN_USER' },
      }));
    });
  });

  test('ADM-06A Error Log restores LV list and responsive behavior', async ({ page }) => {
    const initialRequest = page.waitForRequest((request) => request.url().includes('/monitoring/error-logs'));
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/admin/cubici/adminMonitor/error_report');
    await initialRequest;
    await expect(page.getByRole('cell', { name: '11번가' })).toBeVisible();
    await expect(page.locator('.snbArea li.active li.active')).toBeVisible();
    await expect(page.locator('.legacyTabs')).toHaveCount(0);
    await expect(page.locator('.errorLogPreview')).toHaveCount(0);

    await page.locator('#errorScenario').fill('정산');
    await Promise.all([
      page.waitForRequest((request) => new URL(request.url()).searchParams.get('scenario') === '정산'),
      page.locator('form.searchArea button[type="submit"]').click(),
    ]);
    await assertResponsivePage(page, 'ADM-06A-ERROR-LOG');
    await assertPager(page);

    await page.getByRole('row', { name: /쿠팡/ }).click();
    await expect(page.locator('.errorLogPreview')).toContainText('API 응답 오류');
  });

  test('ADM-06B server monitor refreshes range and stays responsive', async ({ page }) => {
    const initialRequest = page.waitForRequest((request) => request.url().includes('/monitoring/server-status'));
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/admin/cubici/adminMonitor/server_monitor');
    await initialRequest;
    await expect(page.locator('.serverStatusCard')).toHaveCount(4);
    await expect(page.locator('.snbArea li.active li.active')).toBeVisible();
    await expect(page.locator('.legacyTabs')).toHaveCount(0);

    await Promise.all([
      page.waitForRequest((request) => new URL(request.url()).searchParams.get('hours') === '6'),
      page.locator('#serverMonitorHours').selectOption('6'),
    ]);
    await assertResponsivePage(page, 'ADM-06B-SERVER');
  });

  test('ADM-06C fintech trade search and detail stay functional', async ({ page }) => {
    const initialRequest = page.waitForRequest((request) => request.url().includes('/fintech/trade-requests?'));
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/admin/cubici/adminMonitor/fintech_trade');
    await initialRequest;
    await expect(page.getByRole('cell', { name: 'MONEY00001' })).toBeVisible();
    await expect(page.locator('.snbArea li.active li.active')).toBeVisible();
    await expect(page.locator('.legacyTabs')).toHaveCount(0);
    await expect(page.locator('.fintechParserPanel')).toHaveCount(0);

    await page.locator('#fintechMbid').fill('MONEY00001');
    await Promise.all([
      page.waitForRequest((request) => new URL(request.url()).searchParams.get('mbid') === 'MONEY00001'),
      page.locator('form.searchArea').first().getByRole('button', { name: '검색' }).click(),
    ]);
    await assertResponsivePage(page, 'ADM-06C-FINTECH');
    await assertPager(page);

    const detailRequest = page.waitForRequest((request) => request.url().includes('/fintech/trade-requests/20260809/'));
    await page.getByRole('row', { name: /MONEY00001/ }).click();
    await detailRequest;
    await expect(page.locator('.fintechParserPanel')).toBeVisible();
    await page.getByRole('button', { name: '테스트 전문 생성' }).click();
    await expect(page.locator('.fintechMockForm')).toBeVisible();
  });
});

async function assertResponsivePage(page, code) {
  expect(await bodyOverflow(page)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: path.join(candidateDir, `${code}-PC.png`), fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('.adminNavigationToggle')).toBeVisible();
  await expect.poll(async () => {
    const box = await page.locator('#admin-navigation').boundingBox();
    return box?.x ?? 0;
  }).toBeLessThanOrEqual(-300);
  expect(await bodyOverflow(page)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: path.join(candidateDir, `${code}-MOBILE.png`), fullPage: true });
}

async function assertPager(page) {
  const pager = await page.locator('.pagingControls').evaluate((container) => {
    const items = [...container.children];
    const heights = items.map((item) => item.getBoundingClientRect().height);
    return {
      difference: Math.max(...heights) - Math.min(...heights),
      previous: getComputedStyle(items[0]).backgroundColor,
      current: getComputedStyle(items[1]).backgroundColor,
    };
  });
  expect(pager.difference).toBeLessThanOrEqual(1);
  expect(pager.previous).toBe('rgb(159, 178, 207)');
  expect(pager.current).toBe('rgb(0, 46, 110)');
}

function bodyOverflow(page) {
  return page.evaluate(() => document.body.scrollWidth - document.documentElement.clientWidth);
}
