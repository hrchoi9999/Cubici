$ErrorActionPreference = "Stop"

$WorkspaceRoot = Split-Path -Parent $PSScriptRoot
$MySqlStart = Join-Path $WorkspaceRoot "scripts\mysql-start.cmd"
$BackendStart = Join-Path $WorkspaceRoot "scripts\backend-start.ps1"

& $MySqlStart
Start-Sleep -Seconds 5

$mysql = Get-NetTCPConnection -LocalPort 3307 -State Listen -ErrorAction SilentlyContinue
if (-not $mysql) {
    throw "MySQL did not start on 127.0.0.1:3307."
}

& $BackendStart

Write-Host ""
Write-Host "Cubici local backend/DB server is ready."
Write-Host "MySQL:   127.0.0.1:3307, database cubici"
Write-Host "Backend: http://127.0.0.1:18080"
