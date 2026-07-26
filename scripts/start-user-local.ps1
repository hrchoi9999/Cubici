param(
  [int]$ApiPort = 8000,
  [int]$UserPort = 5175
)

$ErrorActionPreference = "Stop"

$CubiciRoot = Split-Path -Parent $PSScriptRoot
$WorkspaceRoot = Split-Path -Parent $CubiciRoot
$PythonExe = Join-Path $WorkspaceRoot ".venv\Scripts\python.exe"
$NodeExe = Join-Path $WorkspaceRoot ".tools\node-v22.13.1-win-x64\node.exe"
$ServiceApiRoot = Join-Path $CubiciRoot "service-api"
$AdminWebRoot = Join-Path $CubiciRoot "admin-web"
$UserWebRoot = Join-Path $CubiciRoot "user-web"
$ServiceLogs = Join-Path $ServiceApiRoot ".logs"
$UserLogs = Join-Path $UserWebRoot ".logs"

New-Item -ItemType Directory -Force -Path $ServiceLogs | Out-Null
New-Item -ItemType Directory -Force -Path $UserLogs | Out-Null

function Test-LocalPort {
  param([int]$Port)
  $client = [System.Net.Sockets.TcpClient]::new()
  try {
    $connect = $client.BeginConnect("127.0.0.1", $Port, $null, $null)
    if (-not $connect.AsyncWaitHandle.WaitOne(500, $false)) {
      return $false
    }
    $client.EndConnect($connect)
    return $true
  } catch {
    return $false
  } finally {
    $client.Close()
  }
}

if (-not (Test-Path $PythonExe)) {
  throw "Python executable not found: $PythonExe"
}
if (-not (Test-Path $NodeExe)) {
  throw "Node executable not found: $NodeExe"
}

if (Test-LocalPort $ApiPort) {
  Write-Host "API already listening: http://127.0.0.1:$ApiPort"
} else {
  $apiOut = Join-Path $ServiceLogs "api-$ApiPort.out.log"
  $apiErr = Join-Path $ServiceLogs "api-$ApiPort.err.log"
  $apiArgs = @(
    "-m", "uvicorn",
    "cubici_service.app:app",
    "--app-dir", "src",
    "--host", "127.0.0.1",
    "--port", "$ApiPort"
  )
  $previousPythonPath = $env:PYTHONPATH
  $env:PYTHONPATH = Join-Path $ServiceApiRoot "src"
  $apiProcess = Start-Process -FilePath $PythonExe -ArgumentList $apiArgs -WorkingDirectory $ServiceApiRoot -WindowStyle Hidden -RedirectStandardOutput $apiOut -RedirectStandardError $apiErr -PassThru
  $env:PYTHONPATH = $previousPythonPath
  Write-Host "API started: PID=$($apiProcess.Id), http://127.0.0.1:$ApiPort"
}

if (Test-LocalPort $UserPort) {
  Write-Host "User web already listening: http://127.0.0.1:$UserPort"
} else {
  $viteCli = Join-Path $AdminWebRoot "node_modules\vite\bin\vite.js"
  if (-not (Test-Path $viteCli)) {
    throw "Vite CLI not found: $viteCli"
  }
  $userOut = Join-Path $UserLogs "user-$UserPort.out.log"
  $userErr = Join-Path $UserLogs "user-$UserPort.err.log"
  $userArgs = @(
    $viteCli,
    "--host", "127.0.0.1",
    "--port", "$UserPort",
    "--strictPort"
  )
  $previousViteApiBaseUrl = $env:VITE_API_BASE_URL
  $env:VITE_API_BASE_URL = "http://127.0.0.1:$ApiPort"
  $userProcess = Start-Process -FilePath $NodeExe -ArgumentList $userArgs -WorkingDirectory $UserWebRoot -WindowStyle Hidden -RedirectStandardOutput $userOut -RedirectStandardError $userErr -PassThru
  $env:VITE_API_BASE_URL = $previousViteApiBaseUrl
  Write-Host "User web started: PID=$($userProcess.Id), http://127.0.0.1:$UserPort"
}

Write-Host "User URL: http://127.0.0.1:$UserPort/"
Write-Host "Moneybank URL: http://127.0.0.1:$UserPort/moneybank/current"
