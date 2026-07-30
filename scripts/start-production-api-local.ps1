param(
    [int]$Port = 8000
)

$ErrorActionPreference = "Stop"

$CubiciRoot = Split-Path -Parent $PSScriptRoot
$WorkspaceRoot = Split-Path -Parent $CubiciRoot
$ServiceApiRoot = Join-Path $CubiciRoot "service-api"
$PythonExe = Join-Path $WorkspaceRoot ".venv\Scripts\python.exe"

if (-not (Test-Path $PythonExe)) {
    throw "Python venv not found: $PythonExe"
}

$env:PYTHONPATH = Join-Path $ServiceApiRoot "src"
if (-not $env:CUBICI_ENV) {
    $env:CUBICI_ENV = "production-local"
}
if (-not $env:CUBICI_CORS_ALLOW_ORIGINS) {
    $env:CUBICI_CORS_ALLOW_ORIGINS = "https://admin.example.com,https://app.example.com"
}
if (-not $env:CUBICI_CORS_ALLOW_ORIGIN_REGEX) {
    $env:CUBICI_CORS_ALLOW_ORIGIN_REGEX = ""
}

Push-Location $ServiceApiRoot
try {
    & $PythonExe -m uvicorn cubici_service.app:app --app-dir src --host 127.0.0.1 --port $Port
}
finally {
    Pop-Location
}
