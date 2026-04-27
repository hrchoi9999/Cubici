$Port = 18080
$listeners = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue

if (-not $listeners) {
    Write-Host "Cubici backend is not running on port $Port."
    exit 0
}

$listeners |
    Select-Object -ExpandProperty OwningProcess |
    Sort-Object -Unique |
    ForEach-Object {
        Stop-Process -Id $_ -Force
        Write-Host "Stopped Cubici backend process $_."
    }
