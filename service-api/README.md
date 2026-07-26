# Cubici Service API

Python backend for Cubici legacy service reproduction.

## Runtime

- Python: `D:\Alt_CSM\.venv\Scripts\python.exe`
- Version: Python 3.14.5
- DB target: PostgreSQL
- Framework: FastAPI

## Local Run

```powershell
D:\Alt_CSM\.venv\Scripts\python.exe -m uvicorn cubici_service.app:app --app-dir D:\Alt_CSM\Cubici\service-api\src --host 127.0.0.1 --port 8000 --reload
```

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
