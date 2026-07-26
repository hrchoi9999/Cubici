import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright';

const workspaceRoot = 'D:\\Alt_CSM';
const cubiciRoot = `${workspaceRoot}\\Cubici`;
const pythonExe = `${workspaceRoot}\\.venv\\Scripts\\python.exe`;
const nodeExe = `${workspaceRoot}\\.tools\\node-v22.13.1-win-x64\\node.exe`;
const serviceApiRoot = `${cubiciRoot}\\service-api`;
const adminWebRoot = `${cubiciRoot}\\admin-web`;
const viteCli = `${adminWebRoot}\\node_modules\\vite\\bin\\vite.js`;
const apiBaseUrl = 'http://127.0.0.1:8000';
const adminBaseUrl = 'http://127.0.0.1:5174';
const seqNo = String(Date.now() % 1000000).padStart(6, '0');
const mockPayload = {
  reqDate: '',
  bankCode: '039',
  compCode: 'MOCKT001',
  seqNo,
};

function startProcess(command, args, cwd, env = {}) {
  return spawn(command, args, {
    cwd,
    env: { ...process.env, ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });
}

async function waitForUrl(url, label) {
  const deadline = Date.now() + 45000;
  let lastError = '';

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
      lastError = `${response.status}`;
    } catch (error) {
      lastError = error.message;
    }
    await delay(500);
  }

  throw new Error(`${label} not ready: ${lastError}`);
}

async function cleanupMockRow() {
  if (!mockPayload.reqDate) {
    return;
  }

  const code = `
from pathlib import Path
import os
for line in Path(r'D:\\Alt_CSM\\Cubici\\service-api\\.env').read_text(encoding='utf-8').splitlines():
    if line and not line.strip().startswith('#') and '=' in line:
        k, v = line.split('=', 1)
        os.environ.setdefault(k.strip(), v.strip())
from cubici_service.db.connection import get_connection
with get_connection() as conn:
    with conn.cursor() as cur:
        cur.execute(
            '''
            delete from "TRADE_REQUEST_BIN"
            where "REQ_DATE" = %s
              and "BANK_CODE" = %s
              and "COMP_CODE" = %s
              and "SEQ_NO" = %s
              and "PROCESS_STATUS" = 'MOCK'
              and "SEND_FLAG" = 'N'
              and "RECV_FLAG" = 'N'
            ''',
            (${JSON.stringify(mockPayload.reqDate)}, ${JSON.stringify(mockPayload.bankCode)}, ${JSON.stringify(mockPayload.compCode)}, ${JSON.stringify(mockPayload.seqNo)}),
        )
        print(cur.rowcount)
`;

  const cleanup = startProcess(
    pythonExe,
    ['-c', code],
    serviceApiRoot,
    { PYTHONPATH: `${serviceApiRoot}\\src` },
  );

  await new Promise((resolve, reject) => {
    let output = '';
    let errorOutput = '';
    cleanup.stdout.on('data', (chunk) => {
      output += chunk.toString();
    });
    cleanup.stderr.on('data', (chunk) => {
      errorOutput += chunk.toString();
    });
    cleanup.on('exit', (code) => {
      if (code === 0) {
        console.log(`cleanup=${output.trim()}`);
        resolve();
      } else {
        reject(new Error(`cleanup failed: ${errorOutput}`));
      }
    });
  });
}

const api = startProcess(
  pythonExe,
  ['-m', 'uvicorn', 'cubici_service.app:app', '--app-dir', 'src', '--host', '127.0.0.1', '--port', '8000'],
  serviceApiRoot,
  { PYTHONPATH: `${serviceApiRoot}\\src` },
);
const admin = startProcess(
  nodeExe,
  [viteCli, '--host', '127.0.0.1', '--port', '5174', '--strictPort'],
  adminWebRoot,
  { VITE_API_BASE_URL: apiBaseUrl },
);

let browser;

try {
  await waitForUrl(`${apiBaseUrl}/v1/api/fintech/status`, 'api');
  await waitForUrl(`${adminBaseUrl}/admin/cubici/adminMonitor/fintech_trade`, 'admin');

  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });

  await page.goto(`${adminBaseUrl}/admin/cubici/adminMonitor/fintech_trade`, {
    waitUntil: 'networkidle',
  });

  const form = page.locator('form.fintechMockForm');
  await form.locator('input[name="mbid"]').fill('MOCK000001');
  await form.locator('input[name="comp_code"]').fill(mockPayload.compCode);
  await form.locator('input[name="bank_code"]').fill(mockPayload.bankCode);
  await form.locator('input[name="seq_no"]').fill(mockPayload.seqNo);
  await form.locator('input[name="amount"]').fill('12345');
  await form.locator('input[name="withdrawal_account_number"]').fill('111222333');
  await form.locator('input[name="deposit_bank_code"]').fill('088');
  await form.locator('input[name="deposit_account_number"]').fill('444555666');
  await form.locator('input[name="deposit_summary"]').fill('MOCKIN');
  await form.locator('input[name="withdrawal_summary"]').fill('MOCKOUT');

  const responsePromise = page.waitForResponse((response) => (
    response.url().includes('/v1/api/fintech/mock/transfer-request')
    && response.request().method() === 'POST'
  ));
  await form.locator('button[type="submit"]').click();
  const response = await responsePromise;
  const body = await response.json();
  mockPayload.reqDate = body.req_date;

  await page.waitForFunction(
    (seq) => document.body.innerText.includes(seq),
    mockPayload.seqNo,
    { timeout: 15000 },
  );

  const message = await page.locator('.fintechMockMessage').innerText();
  const rowCount = await page.locator('.fintechTradeTable tbody tr').count();
  console.log(JSON.stringify({
    apiReady: true,
    adminReady: true,
    created: body.created,
    reqDate: body.req_date,
    seqNo: body.seq_no,
    processStatus: body.process_status,
    message,
    rowCount,
    consoleErrors: errors,
  }));
} finally {
  if (browser) {
    await browser.close();
  }
  await cleanupMockRow();
  api.kill();
  admin.kill();
}
