import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const adminRoot = path.resolve(__dirname, '..', '..');
const cubiciRoot = path.resolve(adminRoot, '..');
const workspaceRoot = path.resolve(cubiciRoot, '..');
const serviceApiRoot = path.join(cubiciRoot, 'service-api');
const pythonExe = process.env.CUBICI_PYTHON_EXE || path.join(workspaceRoot, '.venv', 'Scripts', 'python.exe');
const apiBaseUrl = process.env.CUBICI_API_BASE_URL || 'http://127.0.0.1:8000';
const adminBaseUrl = process.env.CUBICI_ADMIN_BASE_URL || 'http://127.0.0.1:5174';

test.skip(process.env.CUBICI_RUN_DB_E2E !== '1', 'set CUBICI_RUN_DB_E2E=1 to run local PostgreSQL UI E2E tests');
test.setTimeout(120_000);

let fixture = null;

test.afterEach(() => {
  if (fixture) {
    restorePrizmFixture(fixture);
    fixture = null;
  }
});

test('Prism configuration update persists through UI and restores the development database', async ({ page, request }) => {
  fixture = readPrizmFixture();
  const session = await prepareMasterAdminSession(page, request);
  const marker = `Prism DB E2E ${fixture.suffix}`;
  const changed = {
    definition: `${fixture.original.item_definition} [${fixture.suffix}]`,
    weight: '999.99',
    high1: `E2E-${fixture.suffix}`,
  };

  try {
    await page.goto(`${adminBaseUrl}/admin/cubici/adminPreference/prizmConfig`);
    await expect(page.locator('.prizmLvSummary')).toContainText('전체 26');

    const editor = page.locator('.prizmLvDetailPanel');
    await expect(editor.getByLabel('지표 정의')).toHaveValue(fixture.original.item_definition);
    await editor.getByLabel('지표 정의').fill(changed.definition);
    await editor.getByLabel('가중치').fill(changed.weight);
    await editor.locator('input[name="itemStandardHigh1"]').fill(changed.high1);
    await editor.getByLabel('변경메모').fill(marker);

    const updateResponsePromise = waitForApiResponse(
      page,
      `/v1/api/preferences/prizm-config/items/${fixture.division}/${fixture.subjectNo}/${fixture.itemNo}`,
      'PUT',
    );
    await editor.getByRole('button', { name: '수정' }).click();
    const updatePayload = await expectApiJsonResponse(updateResponsePromise);

    expect(updatePayload.item).toMatchObject({
      item_definition: changed.definition,
      item_weight: changed.weight,
      item_standard_high1: changed.high1,
    });
    await expect(page.getByText('Prism 설정을 수정했습니다.')).toBeVisible();
    await expect(editor.getByLabel('지표 정의')).toHaveValue(changed.definition);
    await expect(editor.getByLabel('가중치')).toHaveValue(changed.weight);
    await expect(editor.locator('input[name="itemStandardHigh1"]')).toHaveValue(changed.high1);
    await expect(page.locator('.prizmLvSummary')).toContainText(`변경이력 ${fixture.originalRecordCount + 1}`);

    const detailResponse = await request.get(
      `${apiBaseUrl}/v1/api/preferences/prizm-config/items/${fixture.division}/${fixture.subjectNo}/${fixture.itemNo}`,
      withMasterAdminAuth(session),
    );
    const detailPayload = await expectApiJsonResponse(Promise.resolve(detailResponse));
    expect(detailPayload).toMatchObject({
      item_definition: changed.definition,
      item_weight: changed.weight,
      item_standard_high1: changed.high1,
    });

    const recordResponse = await request.get(
      `${apiBaseUrl}/v1/api/preferences/prizm-config/update-records?limit=5&offset=0&division=all`,
      withMasterAdminAuth(session),
    );
    const recordPayload = await expectApiJsonResponse(Promise.resolve(recordResponse));
    expect(recordPayload.total).toBe(fixture.originalRecordCount + 1);
    expect(recordPayload.items[0]).toMatchObject({
      division: fixture.division,
      subject_no: fixture.subjectNo,
      item_no: fixture.itemNo,
      update_memo: marker,
    });

    expect(readPrizmState(fixture, marker)).toMatchObject({
      item_definition: changed.definition,
      item_weight: changed.weight,
      item_standard_high1: changed.high1,
      marker_record_count: 1,
      total_record_count: fixture.originalRecordCount + 1,
    });
  } finally {
    restorePrizmFixture(fixture);
  }

  expect(readPrizmState(fixture, marker)).toMatchObject({
    ...fixture.original,
    marker_record_count: 0,
    total_record_count: fixture.originalRecordCount,
  });
  fixture = null;
});

function waitForApiResponse(page, pathname, method) {
  return page.waitForResponse((response) => (
    response.url().includes(pathname)
    && response.request().method() === method
  ), { timeout: 30_000 });
}

async function expectApiJsonResponse(responsePromise) {
  const response = await responsePromise;
  const text = await response.text();
  expect(response.ok(), text).toBeTruthy();
  return text ? JSON.parse(text) : null;
}

async function prepareMasterAdminSession(page, request) {
  const email = process.env.CUBICI_MASTER_ADMIN_EMAIL;
  const password = process.env.CUBICI_MASTER_ADMIN_PASSWORD;
  expect(Boolean(email && password), 'CUBICI_MASTER_ADMIN_EMAIL and CUBICI_MASTER_ADMIN_PASSWORD are required').toBeTruthy();

  const response = await request.post(`${apiBaseUrl}/v1/api/accounts/admin-login`, {
    data: { email, password },
  });
  const session = await expectApiJsonResponse(Promise.resolve(response));
  expect(session?.access_token).toBeTruthy();
  expect(String(session?.user?.user_type ?? '').toUpperCase()).toBe('ADMIN_USER');
  await page.addInitScript((masterAdminSession) => {
    window.localStorage.setItem('cubiciAdminAuth', JSON.stringify(masterAdminSession));
  }, session);
  return session;
}

function withMasterAdminAuth(session, options = {}) {
  return {
    ...options,
    headers: {
      ...(options.headers ?? {}),
      Authorization: `${session.token_type ?? 'Bearer'} ${session.access_token}`,
    },
  };
}

function readPrizmFixture() {
  const suffix = String(Date.now()).slice(-8);
  const payload = JSON.parse(runPython(`
import json
from cubici_service.db.connection import get_connection

with get_connection() as conn:
    with conn.cursor() as cur:
        cur.execute(
            """
            select
                item_definition, item_weight,
                item_standard_low1, item_standard_high1,
                item_standard_low2, item_standard_high2,
                item_standard_low3, item_standard_high3,
                item_standard_low4, item_standard_high4,
                item_standard_low5, item_standard_high5
            from prizm_items
            where division = 1 and subject_no = 1 and item_no = 1
            """
        )
        row = cur.fetchone()
        if row is None:
            raise RuntimeError("Prism fixture item 1/1/1 was not found")
        cur.execute("select count(*)::int from prizm_item_update_record")
        record_count = cur.fetchone()[0]

keys = [
    "item_definition", "item_weight",
    "item_standard_low1", "item_standard_high1",
    "item_standard_low2", "item_standard_high2",
    "item_standard_low3", "item_standard_high3",
    "item_standard_low4", "item_standard_high4",
    "item_standard_low5", "item_standard_high5",
]
print(json.dumps({"original": dict(zip(keys, row)), "recordCount": record_count}, ensure_ascii=False))
  `));
  return {
    suffix,
    division: 1,
    subjectNo: 1,
    itemNo: 1,
    original: payload.original,
    originalRecordCount: payload.recordCount,
  };
}

function readPrizmState(currentFixture, marker) {
  return JSON.parse(runPython(`
import json
import sys
from cubici_service.db.connection import get_connection

division, subject_no, item_no, marker = int(sys.argv[1]), int(sys.argv[2]), int(sys.argv[3]), sys.argv[4]
with get_connection() as conn:
    with conn.cursor() as cur:
        cur.execute(
            """
            select
                item_definition, item_weight,
                item_standard_low1, item_standard_high1,
                item_standard_low2, item_standard_high2,
                item_standard_low3, item_standard_high3,
                item_standard_low4, item_standard_high4,
                item_standard_low5, item_standard_high5
            from prizm_items
            where division = %s and subject_no = %s and item_no = %s
            """,
            (division, subject_no, item_no),
        )
        row = cur.fetchone()
        cur.execute(
            """
            select count(*)::int
            from prizm_item_update_record
            where division = %s and subject_no = %s and item_no = %s and update_memo = %s
            """,
            (division, subject_no, item_no, marker),
        )
        marker_count = cur.fetchone()[0]
        cur.execute("select count(*)::int from prizm_item_update_record")
        total_count = cur.fetchone()[0]

keys = [
    "item_definition", "item_weight",
    "item_standard_low1", "item_standard_high1",
    "item_standard_low2", "item_standard_high2",
    "item_standard_low3", "item_standard_high3",
    "item_standard_low4", "item_standard_high4",
    "item_standard_low5", "item_standard_high5",
]
result = dict(zip(keys, row))
result.update({"marker_record_count": marker_count, "total_record_count": total_count})
print(json.dumps(result, ensure_ascii=False))
  `, [
    String(currentFixture.division),
    String(currentFixture.subjectNo),
    String(currentFixture.itemNo),
    marker,
  ]));
}

function restorePrizmFixture(currentFixture) {
  runPython(`
import json
import sys
from cubici_service.db.connection import get_connection

division, subject_no, item_no, marker = int(sys.argv[1]), int(sys.argv[2]), int(sys.argv[3]), sys.argv[4]
original = json.loads(sys.argv[5])
with get_connection() as conn:
    with conn.cursor() as cur:
        cur.execute(
            """
            update prizm_items
            set
                item_definition = %s, item_weight = %s,
                item_standard_low1 = %s, item_standard_high1 = %s,
                item_standard_low2 = %s, item_standard_high2 = %s,
                item_standard_low3 = %s, item_standard_high3 = %s,
                item_standard_low4 = %s, item_standard_high4 = %s,
                item_standard_low5 = %s, item_standard_high5 = %s
            where division = %s and subject_no = %s and item_no = %s
            """,
            (
                original["item_definition"], original["item_weight"],
                original["item_standard_low1"], original["item_standard_high1"],
                original["item_standard_low2"], original["item_standard_high2"],
                original["item_standard_low3"], original["item_standard_high3"],
                original["item_standard_low4"], original["item_standard_high4"],
                original["item_standard_low5"], original["item_standard_high5"],
                division, subject_no, item_no,
            ),
        )
        cur.execute(
            """
            delete from prizm_item_update_record
            where division = %s and subject_no = %s and item_no = %s and update_memo = %s
            """,
            (division, subject_no, item_no, marker),
        )
  `, [
    String(currentFixture.division),
    String(currentFixture.subjectNo),
    String(currentFixture.itemNo),
    `Prism DB E2E ${currentFixture.suffix}`,
    JSON.stringify(currentFixture.original),
  ]);
}

function runPython(code, args = []) {
  return execFileSync(pythonExe, ['-c', code, ...args], {
    cwd: serviceApiRoot,
    env: {
      ...process.env,
      PYTHONPATH: path.join(serviceApiRoot, 'src'),
    },
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}
