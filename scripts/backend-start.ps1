$ErrorActionPreference = "Stop"

$WorkspaceRoot = Split-Path -Parent $PSScriptRoot
$BackendRoot = Join-Path $WorkspaceRoot "cubici_redem"
$JavaExe = Join-Path $WorkspaceRoot "private_local\tools\jdk-13.0.2\bin\java.exe"
$JarPath = Join-Path $BackendRoot "build\libs\redem-0.0.1-SNAPSHOT.jar"
$LocalConfig = Join-Path $WorkspaceRoot "private_local\redem-local.yml"
$OutLog = Join-Path $WorkspaceRoot "private_local\redem-server.out.log"
$ErrLog = Join-Path $WorkspaceRoot "private_local\redem-server.err.log"
$Port = 18080

if (-not (Test-Path -LiteralPath $JavaExe)) {
    throw "Java executable not found: $JavaExe"
}

if (-not (Test-Path -LiteralPath $JarPath)) {
    throw "Backend jar not found. Build it first from cubici_redem with: .\gradlew.bat bootJar -x test"
}

if (-not (Test-Path -LiteralPath $LocalConfig)) {
    throw "Local backend config not found: $LocalConfig"
}

$existing = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if ($existing) {
    $existing |
        Select-Object -ExpandProperty OwningProcess |
        Sort-Object -Unique |
        ForEach-Object { Stop-Process -Id $_ -Force }
    Start-Sleep -Seconds 2
}

$passwordLine = Get-Content -Path $LocalConfig | Where-Object { $_ -match '^\s+password:' } | Select-Object -First 1
if (-not $passwordLine) {
    throw "Could not find datasource password in $LocalConfig"
}

$env:SPRING_PROFILES_ACTIVE = "real"
$env:SPRING_DATASOURCE_URL = "jdbc:mysql://127.0.0.1:3307/cubici?serverTimezone=Asia/Seoul&characterEncoding=UTF-8&useSSL=false&allowPublicKeyRetrieval=true"
$env:SPRING_DATASOURCE_USERNAME = "cubici_dev"
$env:SPRING_DATASOURCE_PASSWORD = ($passwordLine -replace '^\s+password:\s*', '')
$env:SERVER_PORT = "$Port"
$env:CUBICI_SCHEDULING_ENABLED = "false"
$env:SPRING_TASK_SCHEDULING_ENABLED = "false"
$env:CUBICI_CORS_ALLOWED_ORIGINS = "http://localhost:5173,http://127.0.0.1:5173,https://cubici.co.kr,https://www.cubici.co.kr"

Remove-Item -LiteralPath $OutLog, $ErrLog -ErrorAction SilentlyContinue

Start-Process `
    -FilePath $JavaExe `
    -ArgumentList @("-jar", $JarPath) `
    -WorkingDirectory $BackendRoot `
    -WindowStyle Hidden `
    -RedirectStandardOutput $OutLog `
    -RedirectStandardError $ErrLog

Start-Sleep -Seconds 10

$listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if (-not $listener) {
    Write-Host "Cubici backend failed to start. Check:"
    Write-Host $OutLog
    Write-Host $ErrLog
    exit 1
}

Write-Host "Cubici backend is running on http://127.0.0.1:$Port"
