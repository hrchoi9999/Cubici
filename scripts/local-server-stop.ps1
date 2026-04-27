$WorkspaceRoot = Split-Path -Parent $PSScriptRoot
$BackendStop = Join-Path $WorkspaceRoot "scripts\backend-stop.ps1"
$MySqlStop = Join-Path $WorkspaceRoot "scripts\mysql-stop.cmd"

& $BackendStop
& $MySqlStop

Write-Host "Cubici local backend/DB server stop requested."
