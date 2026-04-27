$Port = 18080
$listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue

if (-not $listener) {
    Write-Host "Cubici backend is not running on port $Port."
    exit 1
}

Write-Host "Cubici backend port $Port is listening."

try {
    $health = Invoke-RestMethod -Uri "http://127.0.0.1:$Port/api/health" -TimeoutSec 5
    $health | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Backend port is open, but health check failed."
    Write-Host $_.Exception.Message
    exit 1
}
