param(
    [string]$ContainerName = 'cubici-postgres-dev',
    [string]$NodeExe = '',
    [string[]]$Specs = @('moneybank-full-lifecycle-db-e2e.spec.js')
)

$ErrorActionPreference = 'Stop'

$adminRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$cubiciRoot = (Resolve-Path (Join-Path $adminRoot '..')).Path
$serviceApiRoot = Join-Path $cubiciRoot 'service-api'
$python = Join-Path $serviceApiRoot '.venv\Scripts\python.exe'
if (-not $NodeExe) {
    $nodeCommand = Get-Command node -ErrorAction SilentlyContinue
    $NodeExe = if ($nodeCommand) {
        $nodeCommand.Source
    }
    else {
        Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
    }
}
if (-not (Test-Path -LiteralPath $NodeExe)) {
    throw "Node.js executable was not found: $NodeExe"
}
$role = "cubici_ui_e2e_$PID"
$dbPassword = [guid]::NewGuid().ToString('N')
$adminEmail = "ui-e2e-master-$PID@example.invalid"
$adminPassword = "$([guid]::NewGuid().ToString('N'))Aa1!"
$roleCreated = $false
$adminCreated = $false
$testExitCode = 1
$adminScriptPath = $null

function Invoke-DevPsql {
    param([Parameter(Mandatory)][string]$Sql)

    & docker exec $ContainerName psql -U cubici_app -d cubici_local -v ON_ERROR_STOP=1 -qc $Sql
    if ($LASTEXITCODE -ne 0) {
        throw "Development PostgreSQL command failed with exit code $LASTEXITCODE."
    }
}

$health = (& docker inspect $ContainerName --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}').Trim()
if ($LASTEXITCODE -ne 0 -or $health -ne 'healthy') {
    throw "Docker development database is not healthy: $ContainerName ($health)"
}

try {
    Invoke-DevPsql "create role $role login superuser password '$dbPassword'"
    $roleCreated = $true

    $env:CUBICI_RUN_DB_E2E = '1'
    $env:CUBICI_DB_HOST = '127.0.0.1'
    $env:CUBICI_DB_PORT = '55432'
    $env:CUBICI_DB_NAME = 'cubici_local'
    $env:CUBICI_DB_USER = $role
    $env:CUBICI_DB_PASSWORD = $dbPassword
    $env:CUBICI_MASTER_ADMIN_EMAIL = $adminEmail
    $env:CUBICI_MASTER_ADMIN_PASSWORD = $adminPassword
    $env:CUBICI_AUTH_SECRET = [guid]::NewGuid().ToString('N')
    $env:CUBICI_PYTHON_EXE = $python
    $env:PYTHONPATH = Join-Path $serviceApiRoot 'src'
    if (-not $env:PLAYWRIGHT_BROWSERS_PATH) {
        $env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $env:LOCALAPPDATA 'ms-playwright'
    }

    $createAdmin = @'
import sys
from cubici_service.accounts.repository import _hash_password
from cubici_service.db.connection import get_connection

email, password = sys.argv[1:3]
with get_connection() as connection:
    with connection.cursor() as cursor:
        cursor.execute("select coalesce(max(user_no), 0) + 1 from users")
        user_no = cursor.fetchone()[0]
        cursor.execute(
            """
            insert into users (
                user_no, email, password, user_type, name, phone, biz_num,
                biz_name, biz_setup_date, biz_type, sectors, fintech_id,
                reg_date, modified_date
            ) values (
                %s, %s, %s, 'ADMIN_USER', 'UI E2E Admin', '01000000000',
                '0000000000', 'UI E2E', '20180101', 'INDIVIDUAL', '01', 1,
                now(), now()
            )
            """,
            (user_no, email, _hash_password(password)),
        )
'@
    Push-Location $serviceApiRoot
    try {
        $adminScriptPath = Join-Path ([IO.Path]::GetTempPath()) "cubici-ui-e2e-admin-$PID.py"
        [IO.File]::WriteAllText($adminScriptPath, $createAdmin, [Text.UTF8Encoding]::new($false))
        & $python $adminScriptPath $adminEmail $adminPassword
        if ($LASTEXITCODE -ne 0) {
            throw "Synthetic admin creation failed with exit code $LASTEXITCODE."
        }
        $adminCreated = $true
    }
    finally {
        Pop-Location
    }

    Push-Location $adminRoot
    try {
        $playwrightArgs = @('.\scripts\run-playwright-e2e.mjs') + $Specs + @('--project=chromium')
        & $NodeExe @playwrightArgs
        $testExitCode = $LASTEXITCODE
    }
    finally {
        Pop-Location
    }
}
finally {
    if ($adminScriptPath) {
        Remove-Item -LiteralPath $adminScriptPath -Force -ErrorAction SilentlyContinue
    }
    if ($adminCreated) {
        try {
            Invoke-DevPsql "delete from users where email = '$adminEmail'"
        }
        catch {
            Write-Warning "Synthetic UI E2E admin cleanup failed."
            $testExitCode = 1
        }
    }
    if ($roleCreated) {
        try {
            Invoke-DevPsql "drop owned by $role; drop role if exists $role"
        }
        catch {
            Write-Warning "Ephemeral UI E2E role cleanup failed."
            $testExitCode = 1
        }
    }
}

exit $testExitCode
