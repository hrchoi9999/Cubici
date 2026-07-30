import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '../../../admin-web/node_modules/@playwright/test/index.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const userRoot = path.resolve(__dirname, '..', '..');
const cubiciRoot = path.resolve(userRoot, '..');
const workspaceRoot = path.resolve(cubiciRoot, '..');
const serviceApiRoot = path.join(cubiciRoot, 'service-api');
const pythonExe = process.env.CUBICI_PYTHON_EXE || path.join(workspaceRoot, '.venv', 'Scripts', 'python.exe');
const authSession = {
  access_token: 'e2e-local-token',
  user: {
    user_no: 36,
    user_type: 'USER',
    email: 'e2e-user@cubici.local',
    name: 'E2E 사용자',
    biz_name: 'E2E 테스트 상사',
    biz_num: '000-00-00000',
  },
};

let createdTitle = '';
let updatedTitle = '';

test.beforeEach(async ({ page }) => {
  createdTitle = `E2E Q&A ${Date.now()}`;
  updatedTitle = `${createdTitle} 수정`;
  await page.addInitScript((session) => {
    window.localStorage.setItem('cubiciUserAuth', JSON.stringify(session));
  }, authSession);
});

test.afterEach(() => {
  if (createdTitle) {
    cleanupInquiry(createdTitle);
  }
  if (updatedTitle) {
    cleanupInquiry(updatedTitle);
  }
});

test('user qna create/detail and charge info render with database API', async ({ page }) => {
  await page.goto('/board/qa/index');

  await expect(page.getByRole('heading', { name: 'Q&A', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: '문의 등록' })).toBeVisible();

  await page.getByLabel('구분').selectOption('MONEYBANK');
  await page.getByLabel('공개 여부').selectOption('private');
  await page.getByLabel('제목').fill(createdTitle);
  await page.getByLabel('내용').fill('Playwright 실제 DB 연결 테스트 후 삭제합니다.');
  await page.getByRole('button', { name: '문의 등록' }).click();

  await expect(page).toHaveURL(/\/board\/qa\/\d+$/);
  await expect(page.getByRole('heading', { name: 'Q&A 상세' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '문의 내용' })).toBeVisible();
  await expect(page.getByText(createdTitle)).toBeVisible();
  await expect(page.getByText('Playwright 실제 DB 연결 테스트 후 삭제합니다.')).toBeVisible();

  await page.getByRole('button', { name: '수정' }).click();
  await page.getByLabel('제목').fill(updatedTitle);
  await page.getByLabel('내용').fill('Playwright 실제 DB 연결 수정 후 삭제합니다.');
  await page.getByRole('button', { name: '저장' }).click();
  await expect(page.getByText('문의가 수정되었습니다.')).toBeVisible();
  await expect(page.getByText(updatedTitle)).toBeVisible();
  await expect(page.getByText('Playwright 실제 DB 연결 수정 후 삭제합니다.')).toBeVisible();

  await page.getByRole('button', { name: '삭제' }).click();
  await expect(page).toHaveURL(/\/board\/qa\/index$/);
  await expect(page.getByText(updatedTitle)).toHaveCount(0);

  await page.goto('/board/qa/index');
  await expect(page.getByText(updatedTitle)).toHaveCount(0);

  await page.goto('/chargeInfo');
  await expect(page.getByRole('heading', { name: '요금안내' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '전체 요금제' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'B0101' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'F0301' })).toBeVisible();
});

test('user mypage and moneybank current render contract fee and redemption data', async ({ page }) => {
  await page.goto('/cubici/mypage/profile');

  await expect(page.getByRole('heading', { name: '마이페이지' })).toBeVisible();
  await expect(page.getByText('최근 계약')).toBeVisible();
  await expect(page.getByText('적용 금융조건')).toBeVisible();
  await expect(page.getByText('상환 요약')).toBeVisible();
  await expect(page.getByText('80%')).toBeVisible();

  await page.goto('/moneybank/current');
  await expect(page.getByRole('heading', { name: '머니뱅크 현황' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '계약/신청 현황' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '상환 현황' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: '지급율' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: '평균 수수료' })).toBeVisible();

  await page.goto('/moneybank/current/MPK2723122');
  await expect(page.getByRole('heading', { name: '머니뱅크 계약 상세' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '수수료 조건' })).toBeVisible();
  await expect(page.getByText('COUPANG 1.6%')).toBeVisible();
  await expect(page.getByText('NAVER 0.6%')).toBeVisible();
  await expect(page.getByRole('heading', { name: '상환 요약' })).toBeVisible();
});

function cleanupInquiry(title) {
  const script = `
from cubici_service.db.connection import get_connection
title = ${JSON.stringify(title)}
with get_connection() as connection:
    with connection.cursor() as cursor:
        cursor.execute("delete from qna_reply where qna_id in (select qna_id from qna where user_no = %s and title = %s)", (36, title))
        cursor.execute("delete from qna where user_no = %s and title = %s", (36, title))
`;
  execFileSync(pythonExe, ['-c', script], {
    cwd: serviceApiRoot,
    env: {
      ...process.env,
      PYTHONPATH: path.join(serviceApiRoot, 'src'),
    },
    stdio: 'ignore',
  });
}
