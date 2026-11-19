# Cubici Service API

Python backend for Cubici legacy service reproduction.

## Runtime

- Local Python: CPython 3.15.2, `service-api\.venv315\Scripts\python.exe` on Windows
- Python dependencies: `uv.lock`, including the default `dev` group for tests
- DB target: PostgreSQL
- Framework: FastAPI

## Local Run

From the repository root on Windows, with uv 0.10.12 available:

```powershell
$env:UV_PROJECT_ENVIRONMENT = Join-Path (Get-Location) 'service-api\.venv315'
$env:PYYAML_FORCE_LIBYAML = '0'
uv sync --project service-api --locked --no-install-project --python C:\Python315\python.exe
& .\service-api\.venv315\Scripts\python.exe -m uvicorn cubici_service.app:app --app-dir .\service-api\src --host 127.0.0.1 --port 8000 --reload
```

Local launch and E2E scripts default to `service-api/.venv315`. Set
`CUBICI_PYTHON_EXE` to select an already prepared interpreter; CI provides its
locked Python 3.15.2 environment through PATH. The production image has its own
runtime configuration.

## Base Endpoints

- `GET /v1/api/health`
- `GET /v1/api/health/db`
- `GET /docs`

## Read-only Domain Skeletons

- `GET /v1/api/accounts`
- `GET /v1/api/accounts/users`
- `GET /v1/api/sales`
- `GET /v1/api/sales/orders`
- `GET /v1/api/sales/returns`
- `GET /v1/api/settlements`
- `GET /v1/api/contracts`
- `GET /v1/api/redemptions`
- `GET /v1/api/risk-results`

## Database Settings

The API reads local PostgreSQL settings from `Cubici/service-api/.env`.
Do not print, log, or commit `CUBICI_DB_PASSWORD`.

## Scope

- User authentication and account workflow
- Merchant/shop account management
- Sales, returns, settlement query APIs
- Advance payment application, contract, repayment APIs
- Admin operation APIs
- External API adapters default to disabled/stub mode in development

## Rules

- Do not write raw personal, payment, bank, card, API key, or credential values to code, docs, logs, or Git.
- Use local PostgreSQL only for original internal data reproduction.
