import { spawn, spawnSync } from 'node:child_process';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const userRoot = path.resolve(__dirname, '..');
const cubiciRoot = path.resolve(userRoot, '..');
const adminRoot = path.join(cubiciRoot, 'admin-web');
const serviceApiRoot = path.join(cubiciRoot, 'service-api');
const workspaceRoot = path.resolve(cubiciRoot, '..');
const browserPath = path.join(workspaceRoot, '.downloads', 'ms-playwright');
const nodeExe = process.execPath;
const pythonExe = process.env.CUBICI_PYTHON_EXE || path.join(workspaceRoot, '.venv', 'Scripts', 'python.exe');
const apiPort = process.env.CUBICI_API_E2E_PORT || '8000';
const userPort = process.env.CUBICI_USER_E2E_PORT || '4175';
const apiUrl = `http://127.0.0.1:${apiPort}`;
const userUrl = `http://127.0.0.1:${userPort}`;
const env = {
  ...process.env,
  CUBICI_RUN_DB_E2E: process.env.CUBICI_RUN_DB_E2E || '1',
  CUBICI_USER_E2E_PORT: userPort,
  PLAYWRIGHT_BROWSERS_PATH: process.env.PLAYWRIGHT_BROWSERS_PATH || browserPath,
  VITE_API_BASE_URL: process.env.VITE_API_BASE_URL || apiUrl,
};

let apiProcess = null;
let userProcess = null;
let finalExitCode = 1;

try {
  checkDatabase();

  if (!(await canConnect(`${apiUrl}/v1/api/health`))) {
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

  await prepareMasterAdminApiAuth();

  if (!(await canConnect(userUrl))) {
    const buildResult = spawnSync(
      nodeExe,
      [path.join(adminRoot, 'node_modules', 'vite', 'bin', 'vite.js'), 'build'],
      {
        cwd: userRoot,
        env,
        stdio: 'inherit',
      },
    );
    if (buildResult.status !== 0) {
      throw new Error(`User web build failed with exit code ${buildResult.status}`);
    }

    userProcess = spawn(
      nodeExe,
      [path.join(adminRoot, 'node_modules', 'vite', 'bin', 'vite.js'), 'preview', '--host', '127.0.0.1', '--port', userPort, '--strictPort'],
      {
        cwd: userRoot,
        env,
        stdio: 'inherit',
      },
    );
    await waitForServer(userUrl, 120_000);
  }

  finalExitCode = await runPlaywright(process.argv.slice(2));
} catch (error) {
  console.error(error);
} finally {
  if (userProcess) {
    await stopProcess(userProcess);
  }
  if (apiProcess) {
    await stopProcess(apiProcess);
  }
  process.exit(finalExitCode);
}

async function prepareMasterAdminApiAuth() {
  if (env.CUBICI_RUN_DB_E2E !== '1') {
    return;
  }

  const email = env.CUBICI_MASTER_ADMIN_EMAIL;
  const password = env.CUBICI_MASTER_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error('CUBICI_MASTER_ADMIN_EMAIL and CUBICI_MASTER_ADMIN_PASSWORD are required for user-web DB E2E setup API calls.');
  }

  const response = await fetch(`${apiUrl}/v1/api/accounts/admin-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    throw new Error(`Master admin login for user-web DB E2E setup failed with status ${response.status}.`);
  }
  const session = await response.json();
  if (!session?.access_token || String(session?.user?.user_type ?? '').toUpperCase() !== 'ADMIN_USER') {
    throw new Error('Master admin login for user-web DB E2E setup did not return an ADMIN_USER session.');
  }
  env.CUBICI_ADMIN_BEARER_TOKEN = `${session.token_type ?? 'Bearer'} ${session.access_token}`;
}

function runPlaywright(args) {
  return new Promise((resolve) => {
    const cliPath = path.join(adminRoot, 'node_modules', '@playwright', 'test', 'cli.js');
    const child = spawn(nodeExe, [cliPath, 'test', ...args], {
      cwd: userRoot,
      env,
      stdio: 'inherit',
    });
    child.on('exit', (code) => resolve(code ?? 1));
  });
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
    throw new Error(
      'Database preflight failed. Start local Docker PostgreSQL on 127.0.0.1:55432 and retry the user-web DB E2E suite.',
    );
  }
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
    }
    setTimeout(resolve, 2_000);
  });
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
