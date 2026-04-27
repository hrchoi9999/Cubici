$WorkspaceRoot = Split-Path -Parent $PSScriptRoot
$Cloudflared = Join-Path $WorkspaceRoot "private_local\tools\cloudflared\cloudflared.exe"

$running = Get-CimInstance Win32_Process |
    Where-Object {
        $_.ExecutablePath -eq $Cloudflared -and
        $_.CommandLine -like "*tunnel*" -and
        $_.CommandLine -like "*run*"
    }

if ($running) {
    Write-Host "Cloudflare Tunnel is running."
    $running | Select-Object ProcessId, CommandLine
} else {
    Write-Host "Cloudflare Tunnel is not running."
    exit 1
}
