$WorkspaceRoot = Split-Path -Parent $PSScriptRoot
$Cloudflared = Join-Path $WorkspaceRoot "private_local\tools\cloudflared\cloudflared.exe"

$running = Get-CimInstance Win32_Process |
    Where-Object {
        $_.ExecutablePath -eq $Cloudflared -and
        $_.CommandLine -like "*tunnel*" -and
        $_.CommandLine -like "*run*"
    }

if (-not $running) {
    Write-Host "Cloudflare Tunnel is not running."
    exit 0
}

$running | ForEach-Object {
    Stop-Process -Id $_.ProcessId -Force
    Write-Host "Stopped Cloudflare Tunnel process $($_.ProcessId)."
}
