$ErrorActionPreference = "Stop"

$WorkspaceRoot = Split-Path -Parent $PSScriptRoot
$Cloudflared = Join-Path $WorkspaceRoot "private_local\tools\cloudflared\cloudflared.exe"
$Config = Join-Path $WorkspaceRoot "private_local\cloudflared\config.yml"
$OutLog = Join-Path $WorkspaceRoot "private_local\cloudflared.out.log"
$ErrLog = Join-Path $WorkspaceRoot "private_local\cloudflared.err.log"

if (-not (Test-Path -LiteralPath $Cloudflared)) {
    throw "cloudflared executable not found: $Cloudflared"
}

if (-not (Test-Path -LiteralPath $Config)) {
    throw "cloudflared config not found: $Config"
}

$running = Get-CimInstance Win32_Process |
    Where-Object {
        $_.ExecutablePath -eq $Cloudflared -and
        $_.CommandLine -like "*tunnel*" -and
        $_.CommandLine -like "*run*"
    }

if ($running) {
    Write-Host "Cloudflare Tunnel is already running."
    $running | Select-Object ProcessId, CommandLine
    exit 0
}

Remove-Item -LiteralPath $OutLog, $ErrLog -ErrorAction SilentlyContinue

Start-Process `
    -FilePath $Cloudflared `
    -ArgumentList @("--config", $Config, "tunnel", "run", "cubici-local-api") `
    -WorkingDirectory $WorkspaceRoot `
    -WindowStyle Hidden `
    -RedirectStandardOutput $OutLog `
    -RedirectStandardError $ErrLog

Start-Sleep -Seconds 5

$started = Get-CimInstance Win32_Process |
    Where-Object {
        $_.ExecutablePath -eq $Cloudflared -and
        $_.CommandLine -like "*tunnel*" -and
        $_.CommandLine -like "*run*"
    }

if (-not $started) {
    Write-Host "Cloudflare Tunnel failed to start. Check:"
    Write-Host $OutLog
    Write-Host $ErrLog
    exit 1
}

Write-Host "Cloudflare Tunnel is running for https://api.cubici.co.kr"
