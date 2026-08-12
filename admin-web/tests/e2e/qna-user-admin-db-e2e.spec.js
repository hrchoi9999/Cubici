import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const cubiciRoot = path.resolve(currentDir, '..', '..', '..');
const serviceApiRoot = path.join(cubiciRoot, 'service-api');
const pythonExe = process.env.CUBICI_PYTHON_EXE || path.join(serviceApiRoot, '.venv', 'Scripts', 'python.exe');
const userBaseUrl = process.env.CUBICI_USER_BASE_URL || 'http://127.0.0.1:4175';
const adminBaseUrl = process.env.CUBICI_ADMIN_BASE_URL || 'http://127.0.0.1:4173';

test.skip(process.env.CUBICI_RUN_DB_E2E !== '1', 'set CUBICI_RUN_DB_E2E=1 to run local PostgreSQL UI E2E tests');
test.setTimeout(120_000);

let fixture;

test.beforeAll(() => {
  fixture = setupFixture();
});

test.afterAll(() => {
  cleanupFixture();
});

test('user Q&A CRUD and admin reply lifecycle persist through both React applications', async ({ browser }) => {
  const userContext = await browser.newContext();
  await userContext.addInitScript((session) => {
    window.localStorage.setItem('cubiciUserAuth', JSON.stringify(session));
  }, fixture.owner_session);
  const userPage = await userContext.newPage();

  await userPage.goto(`${userBaseUrl}/board/qa/write`);
  await userPage.getByLabel('제목').fill(fixture.answered_title);
  await userPage.getByLabel('내용').fill('브라우저 문의 최초 내용');
  await userPage.getByRole('button', { name: '등록', exact: true }).click();
  await expect(userPage).toHaveURL(/\/board\/qa\/\d+$/);
  await expect(userPage.locator('.u25-support-article').getByRole('heading', { name: fixture.answered_title }).first()).toBeVisible();
  const answeredId = Number(new URL(userPage.url()).pathname.split('/').pop());

  await userPage.getByRole('button', { name: '수정', exact: true }).click();
  await userPage.getByLabel('내용').fill('브라우저 문의 수정 내용');
  await userPage.getByRole('button', { name: '저장', exact: true }).click();
  await expect(userPage.getByText('문의가 수정되었습니다.')).toBeVisible();
  await expect(userPage.getByText('브라우저 문의 수정 내용', { exact: true })).toBeVisible();

  const adminContext = await browser.newContext();
  await adminContext.addInitScript((session) => {
    window.localStorage.setItem('cubiciAdminAuth', JSON.stringify(session));
  }, fixture.admin_session);
  const adminPage = await adminContext.newPage();
  await adminPage.goto(`${adminBaseUrl}/admin/cubici/supportMember/manageInquiry`);
  await adminPage.getByRole('searchbox', { name: '검색' }).fill(fixture.answered_title);
  await adminPage.getByRole('button', { name: '검색' }).click();

  const inquiryRow = adminPage.locator('tbody tr').filter({ hasText: fixture.answered_title });
  await expect(inquiryRow).toContainText('답변대기');
  await inquiryRow.getByRole('button', { name: fixture.answered_title }).click();

  await adminPage.getByLabel('답변 등록/수정').fill('브라우저 관리자 답변');
  await adminPage.getByRole('button', { name: '답변등록' }).click();
  await expect(adminPage.getByText('답변을 등록했습니다.')).toBeVisible();
  await adminPage.getByLabel('답변 등록/수정').fill('브라우저 관리자 수정 답변');
  await adminPage.getByRole('button', { name: '답변수정' }).click();
  await expect(adminPage.getByText('답변을 수정했습니다.')).toBeVisible();

  await userPage.reload();
  await expect(userPage.getByText('브라우저 관리자 수정 답변', { exact: true })).toBeVisible();
  await expect(userPage.getByText('답변이 등록된 문의는 수정 또는 삭제할 수 없습니다.')).toBeVisible();
  await expect(userPage.getByRole('button', { name: '수정', exact: true })).toHaveCount(0);
  await expect(userPage.getByRole('button', { name: '삭제', exact: true })).toHaveCount(0);

  expect(readInquiryState(answeredId)).toMatchObject({
    qna_count: 1,
    reply_count: 1,
    inquiry_content: '브라우저 문의 수정 내용',
    reply_content: '브라우저 관리자 수정 답변',
    reply_user_no: fixture.admin_session.user.user_no,
  });

  await userPage.goto(`${userBaseUrl}/board/qa/write`);
  await userPage.getByLabel('제목').fill(fixture.deleted_title);
  await userPage.getByLabel('내용').fill('브라우저 삭제 문의');
  await userPage.getByRole('button', { name: '등록', exact: true }).click();
  await expect(userPage).toHaveURL(/\/board\/qa\/\d+$/);
  const deletedId = Number(new URL(userPage.url()).pathname.split('/').pop());
  await userPage.getByRole('button', { name: '삭제', exact: true }).click();
  await expect(userPage).toHaveURL(/\/board\/qa\/index$/);
  expect(readInquiryState(deletedId).qna_count).toBe(0);

  await adminContext.close();
  await userContext.close();
});

function setupFixture() {
  return JSON.parse(runPython(`
import json
from cubici_service.accounts.repository import AccountAuthUser, _build_auth_response
from cubici_service.db.connection import get_connection

owner_email = 'qna-browser-owner@example.invalid'
admin_email = 'qna-browser-admin@example.invalid'

with get_connection() as connection:
    with connection.cursor() as cursor:
        cursor.execute("select qna_id from qna where title like 'QNA-BROWSER-E2E-%'")
        stale_ids = [row[0] for row in cursor.fetchall()]
        if stale_ids:
            cursor.execute('delete from qna_reply where qna_id = any(%s)', (stale_ids,))
            cursor.execute('delete from qna where qna_id = any(%s)', (stale_ids,))
        cursor.execute('delete from users where email in (%s, %s)', (owner_email, admin_email))
        cursor.execute('select coalesce(max(user_no), 0) + 1 from users')
        owner_no = int(cursor.fetchone()[0])
        admin_no = owner_no + 1
        cursor.executemany(
            """
            insert into users (
                user_no, email, password, user_type, name, phone, biz_num,
                biz_name, biz_setup_date, biz_type, sectors, fintech_id,
                reg_date, modified_date
            ) values (
                %s, %s, 'local-db-e2e', %s, %s, '01000000000', %s,
                'QNA Browser E2E', '20180101', 'INDIVIDUAL', '01', 1,
                now(), now()
            )
            """,
            [
                (owner_no, owner_email, 'USER', 'QNA 브라우저 사용자', f'QNA{owner_no}'),
                (admin_no, admin_email, 'ADMIN_USER', 'QNA 브라우저 관리자', f'QNA{admin_no}'),
            ],
        )

owner = AccountAuthUser(
    user_no=owner_no, email=owner_email, user_type='USER', name='QNA 브라우저 사용자',
    phone=None, biz_num=None, biz_name='QNA Browser E2E',
)
admin = AccountAuthUser(
    user_no=admin_no, email=admin_email, user_type='ADMIN_USER', name='QNA 브라우저 관리자',
    phone=None, biz_num=None, biz_name='QNA Browser E2E',
)
print(json.dumps({
    'owner_session': _build_auth_response(owner).model_dump(mode='json'),
    'admin_session': _build_auth_response(admin).model_dump(mode='json'),
    'answered_title': 'QNA-BROWSER-E2E-ANSWERED',
    'deleted_title': 'QNA-BROWSER-E2E-DELETED',
}))
  `));
}

function readInquiryState(qnaId) {
  return JSON.parse(runPython(`
import json
import sys
from cubici_service.db.connection import get_connection

qna_id = int(sys.argv[1])
with get_connection() as connection:
    with connection.cursor() as cursor:
        cursor.execute(
            """
            select
                count(distinct q.qna_id)::int,
                count(r.reply_id)::int,
                max(q.content),
                max(r.content),
                max(r.user_no)
            from qna q
            left join qna_reply r on r.qna_id = q.qna_id
            where q.qna_id = %s
            """,
            (qna_id,),
        )
        qna_count, reply_count, inquiry_content, reply_content, reply_user_no = cursor.fetchone()
print(json.dumps({
    'qna_count': qna_count,
    'reply_count': reply_count,
    'inquiry_content': inquiry_content,
    'reply_content': reply_content,
    'reply_user_no': reply_user_no,
}))
  `, [String(qnaId)]));
}

function cleanupFixture() {
  const result = JSON.parse(runPython(`
import json
from cubici_service.db.connection import get_connection

emails = ['qna-browser-owner@example.invalid', 'qna-browser-admin@example.invalid']
with get_connection() as connection:
    with connection.cursor() as cursor:
        cursor.execute("select qna_id from qna where title like 'QNA-BROWSER-E2E-%'")
        qna_ids = [row[0] for row in cursor.fetchall()]
        if qna_ids:
            cursor.execute('delete from qna_reply where qna_id = any(%s)', (qna_ids,))
            cursor.execute('delete from qna where qna_id = any(%s)', (qna_ids,))
        cursor.execute('delete from users where email = any(%s)', (emails,))
        cursor.execute("""
            select
                (select count(*)::int from users where email = any(%s)),
                (select count(*)::int from qna where title like 'QNA-BROWSER-E2E-%%')
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
