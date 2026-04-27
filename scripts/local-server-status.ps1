$WorkspaceRoot = Split-Path -Parent $PSScriptRoot
$BackendStatus = Join-Path $WorkspaceRoot "scripts\backend-status.ps1"

$mysql = Get-NetTCPConnection -LocalPort 3307 -State Listen -ErrorAction SilentlyContinue
if ($mysql) {
    Write-Host "MySQL port 3307 is listening."
} else {
    Write-Host "MySQL is not running on port 3307."
}

& $BackendStatus
