import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '../../../admin-web/node_modules/@playwright/test/index.mjs';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const cubiciRoot = path.resolve(currentDir, '..', '..', '..');
const serviceApiRoot = path.join(cubiciRoot, 'service-api');
const pythonExe = process.env.CUBICI_PYTHON_EXE || path.join(serviceApiRoot, '.venv', 'Scripts', 'python.exe');
const userBaseUrl = process.env.CUBICI_USER_BASE_URL || 'http://127.0.0.1:4175';

test.skip(process.env.CUBICI_RUN_DB_E2E !== '1', 'set CUBICI_RUN_DB_E2E=1 to run local PostgreSQL UI E2E tests');
test.setTimeout(120_000);

let fixture;

test.beforeAll(() => {
  fixture = setupFixture();
});

test.afterAll(() => {
  cleanupFixture();
});

test('Q&A list uses total, limit, offset and keyword with more than 30 real rows', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await context.addInitScript((session) => {
    window.localStorage.setItem('cubiciUserAuth', JSON.stringify(session));
  }, fixture.owner_session);
  const page = await context.newPage();
  const inquiryRequests = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.pathname.endsWith('/v1/api/support/inquiries') && request.method() === 'GET') {
      inquiryRequests.push(url);
    }
  });

  await page.goto(`${userBaseUrl}/board/qa/index`);
  await expect(page.locator('.u19-qa-table tbody tr')).toHaveCount(10);
  await expect(page.locator('.u19-qa-table')).toContainText(`${fixture.owner_prefix}-ITEM-031`);
  await expect(page.locator('.u19-qa-table')).not.toContainText(fixture.stranger_prefix);
  await expect(page.locator('.u19-pagination button[aria-current="page"]')).toHaveText('1');
  await expect(page.locator('.u19-pagination button')).toHaveCount(8);
  expect(queryState(inquiryRequests.at(-1))).toMatchObject({ limit: '10', offset: '0', keyword: null });

  await page.getByRole('button', { name: '다음 페이지' }).click();
  await expect(page.locator('.u19-pagination button[aria-current="page"]')).toHaveText('2');
  await expect(page.locator('.u19-qa-table tbody tr')).toHaveCount(10);
  await expect(page.locator('.u19-qa-table')).toContainText(`${fixture.owner_prefix}-ITEM-021`);
  expect(queryState(inquiryRequests.at(-1))).toMatchObject({ limit: '10', offset: '10', keyword: null });

  await page.getByRole('button', { name: '마지막 페이지' }).click();
  await expect(page.locator('.u19-pagination button[aria-current="page"]')).toHaveText('4');
  await expect(page.locator('.u19-qa-table tbody tr')).toHaveCount(1);
  await expect(page.locator('.u19-qa-table')).toContainText(`${fixture.owner_prefix}-ITEM-001`);
  expect(queryState(inquiryRequests.at(-1))).toMatchObject({ limit: '10', offset: '30', keyword: null });

  await page.getByLabel('Q&A 검색').fill('ITEM-017');
  await page.getByRole('button', { name: '검색', exact: true }).click();
  await expect(page.locator('.u19-pagination button[aria-current="page"]')).toHaveText('1');
  await expect(page.locator('.u19-qa-table tbody tr')).toHaveCount(1);
  await expect(page.locator('.u19-qa-table')).toContainText(`${fixture.owner_prefix}-ITEM-017`);
  expect(queryState(inquiryRequests.at(-1))).toMatchObject({ limit: '10', offset: '0', keyword: 'ITEM-017' });

  await page.getByLabel('Q&A 검색').fill('');
  await page.getByRole('button', { name: '검색', exact: true }).click();
  await expect(page.locator('.u19-pagination button[aria-current="page"]')).toHaveText('1');
  await expect(page.locator('.u19-qa-table tbody tr')).toHaveCount(10);
  expect(queryState(inquiryRequests.at(-1))).toMatchObject({ limit: '10', offset: '0', keyword: null });

  await context.close();
});

function queryState(url) {
  return {
    limit: url.searchParams.get('limit'),
    offset: url.searchParams.get('offset'),
    keyword: url.searchParams.get('keyword'),
    userNo: url.searchParams.get('user_no'),
  };
}

function setupFixture() {
  return JSON.parse(runPython(`
import json
from cubici_service.accounts.repository import AccountAuthUser, _build_auth_response
from cubici_service.db.connection import get_connection

owner_email = 'qna-pagination-owner@example.invalid'
stranger_email = 'qna-pagination-stranger@example.invalid'
owner_prefix = 'QNA-PAGINATION-E2E-OWNER'
stranger_prefix = 'QNA-PAGINATION-E2E-STRANGER'

with get_connection() as connection:
    with connection.cursor() as cursor:
        cursor.execute("select qna_id from qna where title like 'QNA-PAGINATION-E2E-%%'")
        stale_ids = [row[0] for row in cursor.fetchall()]
        if stale_ids:
            cursor.execute('delete from qna_reply where qna_id = any(%s)', (stale_ids,))
            cursor.execute('delete from qna where qna_id = any(%s)', (stale_ids,))
        cursor.execute('delete from users where email in (%s, %s)', (owner_email, stranger_email))
        cursor.execute('select coalesce(max(user_no), 0) + 1 from users')
        owner_no = int(cursor.fetchone()[0])
        stranger_no = owner_no + 1
        cursor.executemany(
            """
            insert into users (
                user_no, email, password, user_type, name, phone, biz_num,
                biz_name, biz_setup_date, biz_type, sectors, fintech_id,
                reg_date, modified_date
            ) values (
                %s, %s, 'local-db-e2e', 'USER', %s, '01000000000', %s,
                'QNA Pagination E2E', '20180101', 'INDIVIDUAL', '01', 1,
                now(), now()
            )
            """,
            [
                (owner_no, owner_email, 'QNA 페이지 사용자', f'QNA{owner_no}'),
                (stranger_no, stranger_email, 'QNA 타 사용자', f'QNA{stranger_no}'),
            ],
        )
        cursor.execute('select coalesce(max(qna_id), 0) + 1 from qna')
        first_qna_id = int(cursor.fetchone()[0])
        rows = []
        for index in range(1, 32):
            rows.append((
                first_qna_id + index - 1,
                owner_no,
                f'{owner_prefix}-ITEM-{index:03d}',
                f'소유자 페이지 검증 내용 {index:03d}',
                'QNA 페이지 사용자',
                index,
            ))
        for index in range(1, 6):
            rows.append((
                first_qna_id + 31 + index - 1,
                stranger_no,
                f'{stranger_prefix}-ITEM-{index:03d}',
                f'타 사용자 비공개 내용 {index:03d}',
                'QNA 타 사용자',
                100 + index,
            ))
        cursor.executemany(
            """
            insert into qna (
                qna_id, user_no, type, title, content, visibility,
                created_by, last_modified_by, reg_date, modified_date
            ) values (
                %s, %s, 'CUBICI', %s, %s, '0'::bit,
                %s, %s, timestamp '2026-08-12 09:00:00' + (%s * interval '1 second'),
                timestamp '2026-08-12 09:00:00' + (%s * interval '1 second')
            )
            """,
            [(qna_id, user_no, title, content, created_by, created_by, order_no, order_no)
             for qna_id, user_no, title, content, created_by, order_no in rows],
        )

owner = AccountAuthUser(
    user_no=owner_no, email=owner_email, user_type='USER', name='QNA 페이지 사용자',
    phone=None, biz_num=None, biz_name='QNA Pagination E2E',
)
print(json.dumps({
    'owner_session': _build_auth_response(owner).model_dump(mode='json'),
    'owner_prefix': owner_prefix,
    'stranger_prefix': stranger_prefix,
}))
  `));
}

function cleanupFixture() {
  const result = JSON.parse(runPython(`
import json
from cubici_service.db.connection import get_connection

emails = ['qna-pagination-owner@example.invalid', 'qna-pagination-stranger@example.invalid']
with get_connection() as connection:
    with connection.cursor() as cursor:
        cursor.execute("select qna_id from qna where title like 'QNA-PAGINATION-E2E-%%'")
        qna_ids = [row[0] for row in cursor.fetchall()]
        if qna_ids:
            cursor.execute('delete from qna_reply where qna_id = any(%s)', (qna_ids,))
            cursor.execute('delete from qna where qna_id = any(%s)', (qna_ids,))
        cursor.execute('delete from users where email = any(%s)', (emails,))
        cursor.execute("""
            select
                (select count(*)::int from users where email = any(%s)),
                (select count(*)::int from qna where title like 'QNA-PAGINATION-E2E-%%')
        """, (emails,))
        users, inquiries = cursor.fetchone()
print(json.dumps({'users': users, 'inquiries': inquiries}))
  `));
  expect(result).toEqual({ users: 0, inquiries: 0 });
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
