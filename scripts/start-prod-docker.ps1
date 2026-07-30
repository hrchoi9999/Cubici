param(
    [string]$EnvFile = ".env.production.local"
)

$ErrorActionPreference = "Stop"

$CubiciRoot = Split-Path -Parent $PSScriptRoot
$EnvPath = Join-Path $CubiciRoot $EnvFile

if (-not (Test-Path $EnvPath)) {
    throw "Production env file not found: $EnvPath. Copy ops\production.env.sample and set real values."
}

Push-Location $CubiciRoot
try {
    docker compose --env-file $EnvPath -f docker-compose.prod.yml up -d --build
}
finally {
    Pop-Location
}
