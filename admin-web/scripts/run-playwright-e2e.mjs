import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const adminRoot = path.resolve(__dirname, '..');
const workspaceRoot = path.resolve(adminRoot, '..', '..');
const cubiciRoot = path.resolve(adminRoot, '..');
const userRoot = path.join(cubiciRoot, 'user-web');
const serviceApiRoot = path.join(cubiciRoot, 'service-api');
const browserPath = path.join(workspaceRoot, '.downloads', 'ms-playwright');
const pythonExe = process.env.CUBICI_PYTHON_EXE || path.join(workspaceRoot, '.venv', 'Scripts', 'python.exe');
const dynamicPortOffset = String(process.pid % 1000).padStart(3, '0');
const previewPort = process.env.CUBICI_E2E_PORT || `28${dynamicPortOffset}`;
const apiPort = process.env.CUBICI_API_E2E_PORT || `29${dynamicPortOffset}`;
const userPort = process.env.CUBICI_USER_E2E_PORT || `30${dynamicPortOffset}`;
const baseUrl = `http://127.0.0.1:${previewPort}`;
const apiUrl = `http://127.0.0.1:${apiPort}`;
const userUrl = `http://127.0.0.1:${userPort}`;
const env = {
  ...process.env,
  CUBICI_RUN_DB_E2E: process.env.CUBICI_RUN_DB_E2E || '1',
  CUBICI_ADMIN_BASE_URL: process.env.CUBICI_ADMIN_BASE_URL || baseUrl,
  CUBICI_API_BASE_URL: process.env.CUBICI_API_BASE_URL || apiUrl,
  CUBICI_USER_BASE_URL: process.env.CUBICI_USER_BASE_URL || userUrl,
  CUBICI_USER_E2E_PORT: userPort,
  CUBICI_CORS_ALLOW_ORIGINS: process.env.CUBICI_CORS_ALLOW_ORIGINS || [baseUrl, userUrl].join(','),
  CUBICI_CORS_ALLOW_ORIGIN_REGEX: process.env.CUBICI_CORS_ALLOW_ORIGIN_REGEX || 'https?://(127\\.0\\.0\\.1|localhost):\\d+',
  PLAYWRIGHT_BROWSERS_PATH: process.env.PLAYWRIGHT_BROWSERS_PATH || browserPath,
  VITE_API_BASE_URL: process.env.VITE_API_BASE_URL || apiUrl,
};

let apiProcess = null;
let previewProcess = null;
let userProcess = null;
let finalExitCode = 1;
let adminStorageStatePath = null;

try {
  checkDatabase();
  await ensureServiceApi();
  await prepareMasterAdminTestAuth();
  await ensureUserWeb();
  buildAdminWeb();

  const alreadyRunning = await canConnect(baseUrl);
  if (!alreadyRunning) {
    previewProcess = spawn(
      process.execPath,
      ['./node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', previewPort],
      {
        cwd: adminRoot,
        env,
        stdio: 'inherit',
      },
    );
    await waitForServer(baseUrl, 20_000);
  }

  finalExitCode = await runPlaywright(process.argv.slice(2));
} catch (error) {
  console.error(error);
} finally {
  if (userProcess) {
    await stopProcess(userProcess);
  }
  if (previewProcess) {
    await stopProcess(previewProcess);
  }
  if (apiProcess) {
    await stopProcess(apiProcess);
  }
  if (adminStorageStatePath) {
    fs.rmSync(adminStorageStatePath, { force: true });
  }
  process.exit(finalExitCode);
}

async function ensureServiceApi() {
  if (await canConnect(`${apiUrl}/v1/api/health`)) {
    return;
  }

  apiProcess = spawn(
    pythonExe,
    ['-m', 'uvicorn', 'cubici_service.app:app', '--app-dir', 'src', '--host', '127.0.0.1', '--port', apiPort],
    {
      cwd: serviceApiRoot,
      env: {
        ...env,
        PYTHONPATH: path.join(serviceApiRoot, 'src'),
      },
      stdio: 'inherit',
    },
  );
  await waitForServer(`${apiUrl}/v1/api/health`, 20_000);
}

async function prepareMasterAdminTestAuth() {
  if (env.CUBICI_RUN_DB_E2E !== '1') {
    return;
  }

  const email = env.CUBICI_MASTER_ADMIN_EMAIL;
  const password = env.CUBICI_MASTER_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error('CUBICI_MASTER_ADMIN_EMAIL and CUBICI_MASTER_ADMIN_PASSWORD are required for admin DB E2E authentication.');
  }

  const session = await loginMasterAdmin(email, password);
  const tokenType = session.token_type ?? 'Bearer';
  env.CUBICI_ADMIN_BEARER_TOKEN = `${tokenType} ${session.access_token}`;

  adminStorageStatePath = env.CUBICI_ADMIN_STORAGE_STATE_PATH || path.join(
    os.tmpdir(),
    `cubici-admin-storage-state-${process.pid}.json`,
  );
  env.CUBICI_ADMIN_STORAGE_STATE_PATH = adminStorageStatePath;
  fs.writeFileSync(
    adminStorageStatePath,
    JSON.stringify({
      cookies: [],
      origins: [
        {
          origin: baseUrl,
          localStorage: [
            {
              name: 'cubiciAdminAuth',
              value: JSON.stringify(session),
            },
          ],
        },
      ],
    }),
    'utf8',
  );
}

async function loginMasterAdmin(email, password) {
  const response = await fetch(`${apiUrl}/v1/api/accounts/admin-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    throw new Error(`Master admin login for DB E2E failed with status ${response.status}.`);
  }
  const session = await response.json();
  if (!session?.access_token || String(session?.user?.user_type ?? '').toUpperCase() !== 'ADMIN_USER') {
    throw new Error('Master admin login for DB E2E did not return an ADMIN_USER session.');
  }
  return session;
}

async function ensureUserWeb() {
  if (await canConnect(userUrl)) {
    return;
  }

  const build = spawnSync(
    process.execPath,
    [path.join(adminRoot, 'node_modules', 'vite', 'bin', 'vite.js'), 'build'],
    {
      cwd: userRoot,
      env,
      stdio: 'inherit',
    },
  );
  if (build.status !== 0) {
    throw new Error(`User web build failed with exit code ${build.status}`);
  }

  userProcess = spawn(
    process.execPath,
    [path.join(adminRoot, 'node_modules', 'vite', 'bin', 'vite.js'), 'preview', '--host', '127.0.0.1', '--port', userPort, '--strictPort'],
    {
      cwd: userRoot,
      env,
      stdio: 'inherit',
    },
  );
  await waitForServer(userUrl, 120_000);
}

function checkDatabase() {
  const check = spawnSync(
    pythonExe,
    [
      '-c',
      [
        'from cubici_service.db.connection import get_connection',
        'with get_connection() as connection:',
        '    with connection.cursor() as cursor:',
        "        cursor.execute('select 1')",
        '        cursor.fetchone()',
        "print('database preflight ok')",
      ].join('\n'),
    ],
    {
      cwd: serviceApiRoot,
      env: {
        ...env,
        PYTHONPATH: path.join(serviceApiRoot, 'src'),
      },
      stdio: 'inherit',
    },
  );
  if (check.status !== 0) {
    throw new Error('Database preflight failed. Start local Docker PostgreSQL on 127.0.0.1:55432 and retry the admin-web DB E2E suite.');
  }
}

function buildAdminWeb() {
  const build = spawnSync(
    process.execPath,
    ['./node_modules/vite/bin/vite.js', 'build'],
    {
      cwd: adminRoot,
      env,
      stdio: 'inherit',
    },
  );
  if (build.status !== 0) {
    throw new Error(`Admin web build failed with exit code ${build.status}`);
  }
}

function runPlaywright(args) {
  return new Promise((resolve) => {
    const cliPath = path.join(adminRoot, 'node_modules', '@playwright', 'test', 'cli.js');
    const child = spawn(process.execPath, [cliPath, 'test', ...args], {
      cwd: adminRoot,
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    let resolved = false;

    function finish(code) {
      if (resolved) {
        return;
      }
      resolved = true;
      resolve(code);
    }

    function handleOutput(chunk, stream) {
      const text = chunk.toString();
      output += text;
      stream.write(text);
      if (/\n\s+\d+\s+passed\b/.test(output) && !/\bfailed\b/.test(output)) {
        setTimeout(async () => {
          await stopProcess(child);
          finish(0);
        }, 500);
      }
    }

    child.stdout.on('data', (chunk) => handleOutput(chunk, process.stdout));
    child.stderr.on('data', (chunk) => handleOutput(chunk, process.stderr));
    child.on('exit', (code) => finish(code ?? 1));
  });
}

function canConnect(url) {
  return new Promise((resolve) => {
    const request = http.get(url, (response) => {
      response.resume();
      resolve(response.statusCode >= 200 && response.statusCode < 500);
    });
    request.on('error', () => resolve(false));
    request.setTimeout(2_000, () => {
      request.destroy();
      resolve(false);
    });
  });
}

async function waitForServer(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await canConnect(url)) {
      return;
    }
    await delay(250);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function stopProcess(child) {
  return new Promise((resolve) => {
    if (child.exitCode !== null) {
      resolve();
      return;
    }
    child.once('exit', () => resolve());
    child.kill('SIGTERM');
    if (process.platform === 'win32') {
      spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
    } else {
      child.kill('SIGTERM');
    }
    setTimeout(resolve, 2_000);
  });
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
