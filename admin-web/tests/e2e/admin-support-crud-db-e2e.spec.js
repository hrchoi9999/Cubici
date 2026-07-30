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
test.setTimeout(180_000);

let fixture = null;

test.afterEach(() => {
  if (fixture) {
    cleanupSupportFixture(fixture);
    fixture = null;
  }
});

test('customer inquiry reply create and update persist with real database through admin UI', async ({ page, request }) => {
  fixture = makeFixture();
  const masterAdminSession = await prepareMasterAdminSession(page, request);
  await createInquiryFixture(request, fixture, masterAdminSession);

  await page.goto(`${adminBaseUrl}/admin/cubici/supportMember/manageInquiry`);
  await page.getByLabel('검색').fill(fixture.inquiryTitle);
  await page.getByRole('button', { name: '검색' }).click();

  const inquiryRow = page.locator('tbody tr').filter({ hasText: fixture.inquiryTitle });
  await expect(inquiryRow).toContainText('답변대기');
  await inquiryRow.getByRole('button', { name: fixture.inquiryTitle }).click();

  const detail = page.locator('.inquiryDetail');
  await expect(detail.locator('.inquiryContent p').filter({ hasText: fixture.inquiryContent })).toBeVisible();
  await expect(detail.getByText('등록된 답변이 없습니다.')).toBeVisible();

  const replyCreateContent = `답변 등록 ${fixture.suffix}`;
  await detail.getByLabel('답변 등록/수정').fill(replyCreateContent);
  const replyCreateResponsePromise = waitForApiResponse(page, `/v1/api/support/inquiries/${fixture.inquiryQnaId}/replies`, 'POST');
  await detail.getByRole('button', { name: '답변등록' }).click();
  await expectApiResponse(replyCreateResponsePromise);
  await expect(page.getByText('답변을 등록했습니다.')).toBeVisible();
  expect(readInquiryState(fixture)).toMatchObject({
    qna_count: 1,
    reply_count: 1,
    reply_content: replyCreateContent,
  });

  const replyUpdateContent = `답변 수정 ${fixture.suffix}`;
  await detail.getByLabel('답변 등록/수정').fill(replyUpdateContent);
  const replyUpdateResponsePromise = page.waitForResponse((response) => (
    response.url().includes(`/v1/api/support/inquiries/${fixture.inquiryQnaId}/replies/`)
    && response.request().method() === 'PUT'
  ), { timeout: 30_000 });
  await detail.getByRole('button', { name: '답변수정' }).click();
  await expectApiResponse(replyUpdateResponsePromise);
  await expect(page.getByText('답변을 수정했습니다.')).toBeVisible();
  expect(readInquiryState(fixture)).toMatchObject({
    qna_count: 1,
    reply_count: 1,
    reply_content: replyUpdateContent,
  });
});

test('customer board create, update, and delete persist with real database through admin UI', async ({ page, request }) => {
  fixture = makeFixture();
  await prepareMasterAdminSession(page, request);

  await page.goto(`${adminBaseUrl}/admin/cubici/supportMember/manageBoard_tab1`);
  const editor = page.locator('.customerBoardEditor');
  await expect(editor.getByRole('heading', { name: '게시글 등록' })).toBeVisible();

  await editor.getByLabel('제목').fill(fixture.boardTitle);
  await editor.getByLabel('내용').fill(fixture.boardContent);
  const createResponsePromise = waitForApiResponse(page, '/v1/api/support/boards/notice', 'POST');
  await editor.getByRole('button', { name: '등록' }).click();
  await expectApiResponse(createResponsePromise);
  await expect(page.getByText('게시글을 등록했습니다.')).toBeVisible();
  expect(readBoardState(fixture)).toMatchObject({
    post_count: 1,
    title: fixture.boardTitle,
    content: fixture.boardContent,
  });

  await expect(editor.getByRole('heading', { name: '게시글 수정' })).toBeVisible();
  await editor.getByLabel('제목').fill(`${fixture.boardTitle} 수정`);
  await editor.getByLabel('내용').fill(`${fixture.boardContent} 수정`);
  const updateResponsePromise = page.waitForResponse((response) => (
    response.url().includes('/v1/api/support/boards/notice/')
    && response.request().method() === 'PUT'
  ), { timeout: 30_000 });
  await editor.getByRole('button', { name: '수정' }).click();
  await expectApiResponse(updateResponsePromise);
  await expect(page.getByText('게시글을 수정했습니다.')).toBeVisible();
  expect(readBoardState(fixture)).toMatchObject({
    post_count: 1,
    title: `${fixture.boardTitle} 수정`,
    content: `${fixture.boardContent} 수정`,
  });

  const deleteResponsePromise = page.waitForResponse((response) => (
    response.url().includes('/v1/api/support/boards/notice/')
    && response.request().method() === 'DELETE'
  ), { timeout: 30_000 });
  await editor.getByRole('button', { name: '삭제' }).click();
  await expectApiResponse(deleteResponsePromise);
  await expect(page.getByText('게시글을 삭제했습니다.')).toBeVisible();
  expect(readBoardState(fixture)).toMatchObject({ post_count: 0 });
});

test('message template create, update, and delete persist with real database through admin UI', async ({ page, request }) => {
  fixture = makeFixture();
  await prepareMasterAdminSession(page, request);
  fixture.templateCode = findAvailableTemplateCode();

  await page.goto(`${adminBaseUrl}/admin/cubici/supportMember/manageSms`);
  const editor = page.locator('.messageTemplateEditor');
  const form = editor.locator('.messageTemplateForm');
  await expect(editor.getByRole('heading', { name: '템플릿 등록' })).toBeVisible();

  await form.locator('input[name="msgCode"]').fill(fixture.templateCode);
  await form.getByLabel('항목').fill(fixture.templateItem);
  await form.getByLabel('제목').fill(fixture.templateTitle);
  await form.getByLabel('내용').fill(fixture.templateContent);
  await form.getByLabel('작성자').fill('admin');
  const createResponsePromise = waitForApiResponse(page, '/v1/api/support/message-templates', 'POST');
  await form.getByRole('button', { name: '등록' }).click();
  await expectApiResponse(createResponsePromise);
  await expect(page.getByText('템플릿을 등록했습니다.')).toBeVisible();
  expect(readTemplateState(fixture)).toMatchObject({
    template_count: 1,
    msg_title: fixture.templateTitle,
    msg_content: fixture.templateContent,
  });

  await expect(editor.getByRole('heading', { name: '템플릿 수정' })).toBeVisible();
  await form.getByLabel('제목').fill(`${fixture.templateTitle} 수정`);
  await form.getByLabel('내용').fill(`${fixture.templateContent} 수정`);
  const updateResponsePromise = page.waitForResponse((response) => (
    response.url().includes('/v1/api/support/message-templates/')
    && response.request().method() === 'PUT'
  ), { timeout: 30_000 });
  await form.getByRole('button', { name: '수정' }).click();
  await expectApiResponse(updateResponsePromise);
  await expect(page.getByText('템플릿을 수정했습니다.')).toBeVisible();
  expect(readTemplateState(fixture)).toMatchObject({
    template_count: 1,
    msg_title: `${fixture.templateTitle} 수정`,
    msg_content: `${fixture.templateContent} 수정`,
  });

  const deleteResponsePromise = page.waitForResponse((response) => (
    response.url().includes('/v1/api/support/message-templates/')
    && response.request().method() === 'DELETE'
  ), { timeout: 30_000 });
  await form.getByRole('button', { name: '삭제' }).click();
  await expectApiResponse(deleteResponsePromise);
  await expect(page.getByText('템플릿을 삭제했습니다.')).toBeVisible();
  expect(readTemplateState(fixture)).toMatchObject({ template_count: 0 });
});

function waitForApiResponse(page, pathname, method) {
  return page.waitForResponse((response) => (
    response.url().includes(pathname)
    && response.request().method() === method
  ), { timeout: 30_000 });
}

async function expectApiResponse(responsePromise) {
  const response = await responsePromise;
  expect(response.ok(), await response.text()).toBeTruthy();
}

async function prepareMasterAdminSession(page, request) {
  const session = await loginMasterAdminForFixture(request);
  await page.addInitScript((masterAdminSession) => {
    window.localStorage.setItem('cubiciAdminAuth', JSON.stringify(masterAdminSession));
  }, session);
  return session;
}

async function loginMasterAdminForFixture(request) {
  const email = process.env.CUBICI_MASTER_ADMIN_EMAIL;
  const password = process.env.CUBICI_MASTER_ADMIN_PASSWORD;
  expect(Boolean(email && password), 'CUBICI_MASTER_ADMIN_EMAIL and CUBICI_MASTER_ADMIN_PASSWORD are required').toBeTruthy();

  const response = await request.post(`${apiBaseUrl}/v1/api/accounts/login`, {
    data: { email, password },
  });
  const text = await response.text();
  expect(response.ok(), text).toBeTruthy();

  const session = text ? JSON.parse(text) : null;
  expect(session?.access_token).toBeTruthy();
  expect(String(session?.user?.user_type ?? '').toUpperCase()).toBe('ADMIN_USER');
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

function makeFixture() {
  const suffix = String(Date.now()).slice(-8);
  return {
    suffix,
    inquiryQnaId: null,
    inquiryTitle: `문의실DB${suffix}`,
    inquiryContent: `문의 내용 ${suffix}`,
    boardTitle: `공지실DB${suffix}`,
    boardContent: `공지 내용 ${suffix}`,
    templateCode: null,
    templateItem: `항목${suffix.slice(-4)}`,
    templateTitle: `템플릿실DB${suffix}`,
    templateContent: `템플릿 내용 ${suffix}`,
  };
}

async function createInquiryFixture(request, currentFixture, masterAdminSession) {
  const response = await request.post(`${apiBaseUrl}/v1/api/support/inquiries`, withMasterAdminAuth(masterAdminSession, {
    data: {
      user_no: 36,
      type: 'CUBICI',
      title: currentFixture.inquiryTitle,
      content: currentFixture.inquiryContent,
      visibility: 'private',
      operated_by: 'local-db-support-e2e',
    },
  }));
  expect(response.ok()).toBeTruthy();
  currentFixture.inquiryQnaId = (await response.json()).qna_id;
}

function findAvailableTemplateCode() {
  return runPython(`
from cubici_service.db.connection import get_connection

with get_connection() as conn:
    with conn.cursor() as cur:
        cur.execute("select msg_code from message_template where msg_key = '00'")
        used = {row[0] for row in cur.fetchall()}

for code in range(99, 9, -1):
    value = f"{code:02d}"
    if value not in used:
        print(value)
        break
  `).trim();
}

function readInquiryState(currentFixture) {
  return JSON.parse(runPython(`
import json
import sys
from cubici_service.db.connection import get_connection

qna_id = int(sys.argv[1])
with get_connection() as conn:
    with conn.cursor() as cur:
        cur.execute("select count(*)::int from qna where qna_id = %s", (qna_id,))
        qna_count = cur.fetchone()[0]
        cur.execute(
            """
            select count(*)::int, max(content)
            from qna_reply
            where qna_id = %s
            """,
            (qna_id,),
        )
        reply_count, reply_content = cur.fetchone()

print(json.dumps({
    "qna_count": qna_count,
    "reply_count": reply_count,
    "reply_content": reply_content,
}, ensure_ascii=False))
  `, [String(currentFixture.inquiryQnaId ?? 0)]));
}

function readBoardState(currentFixture) {
  return JSON.parse(runPython(`
import json
import sys
from cubici_service.db.connection import get_connection

title_prefix = sys.argv[1]
with get_connection() as conn:
    with conn.cursor() as cur:
        cur.execute(
            """
            select count(*)::int, max(title), max(content)
            from notice
            where title like %s
            """,
            (title_prefix + "%",),
        )
        post_count, title, content = cur.fetchone()

print(json.dumps({
    "post_count": post_count,
    "title": title,
    "content": content,
}, ensure_ascii=False))
  `, [currentFixture.boardTitle]));
}

function readTemplateState(currentFixture) {
  return JSON.parse(runPython(`
import json
import sys
from cubici_service.db.connection import get_connection

msg_code = sys.argv[1]
title_prefix = sys.argv[2]
with get_connection() as conn:
    with conn.cursor() as cur:
        cur.execute(
            """
            select count(*)::int, max(msg_title), max(msg_content)
            from message_template
            where msg_key = '00'
              and msg_code = %s
              and msg_title like %s
            """,
            (msg_code, title_prefix + "%"),
        )
        template_count, msg_title, msg_content = cur.fetchone()

print(json.dumps({
    "template_count": template_count,
    "msg_title": msg_title,
    "msg_content": msg_content,
}, ensure_ascii=False))
  `, [currentFixture.templateCode ?? '', currentFixture.templateTitle]));
}

function cleanupSupportFixture(currentFixture) {
  runPython(`
import sys
from cubici_service.db.connection import get_connection

qna_id = int(sys.argv[1] or 0)
board_title = sys.argv[2]
template_code = sys.argv[3]
template_title = sys.argv[4]
with get_connection() as conn:
    with conn.cursor() as cur:
        if qna_id:
            cur.execute("delete from qna_reply where qna_id = %s", (qna_id,))
            cur.execute("delete from qna where qna_id = %s", (qna_id,))
        cur.execute("delete from notice where title like %s", (board_title + "%",))
        if template_code:
            cur.execute(
                "delete from message_template where msg_key = '00' and msg_code = %s and msg_title like %s",
                (template_code, template_title + "%"),
            )
  `, [
    String(currentFixture.inquiryQnaId ?? 0),
    currentFixture.boardTitle,
    currentFixture.templateCode ?? '',
    currentFixture.templateTitle,
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
