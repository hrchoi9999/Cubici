param(
    [string]$ContainerName = 'cubici-postgres-dev'
)

$ErrorActionPreference = 'Stop'

$serviceApiRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$python = Join-Path $serviceApiRoot '.venv\Scripts\python.exe'
$role = "cubici_e2e_$PID"
$password = [guid]::NewGuid().ToString('N')
$email = "e2e-master-$PID@example.invalid"
$roleCreated = $false
$userCreated = $false
$testExitCode = 1

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
    Invoke-DevPsql "create role $role login superuser password '$password'"
    $roleCreated = $true

    Invoke-DevPsql @"
insert into users (
    user_no, email, password, user_type, name, phone, biz_num, biz_name,
    biz_setup_date, biz_type, sectors, fintech_id, reg_date, modified_date
)
select
    coalesce(max(user_no), 0) + 1, '$email', 'local-db-e2e', 'ADMIN_USER',
    'DB E2E Admin', '01000000000', 'E2E$PID', 'DB E2E', '20180101',
    'INDIVIDUAL', '01', 1, now(), now()
from users
"@
    $userCreated = $true

    $env:CUBICI_RUN_DB_E2E = '1'
    $env:CUBICI_DB_HOST = '127.0.0.1'
    $env:CUBICI_DB_PORT = '55432'
    $env:CUBICI_DB_NAME = 'cubici_local'
    $env:CUBICI_DB_USER = $role
    $env:CUBICI_DB_PASSWORD = $password
    $env:CUBICI_MASTER_ADMIN_EMAIL = $email
    $env:CUBICI_AUTH_SECRET = [guid]::NewGuid().ToString('N')

    Push-Location $serviceApiRoot
    try {
        & $python -m pytest -q -p no:cacheprovider `
            tests/test_admin_account_policy_db_e2e.py `
            tests/test_contract_lifecycle_db_e2e.py `
            tests/test_fintech_funding_provider_db_e2e.py `
            tests/test_moneybank_product_preference_db_e2e.py
        $testExitCode = $LASTEXITCODE
    }
    finally {
        Pop-Location
    }
}
finally {
    if ($userCreated) {
        try {
            Invoke-DevPsql "delete from users where email = '$email'"
        }
        catch {
            Write-Warning "Synthetic DB E2E user cleanup failed."
            $testExitCode = 1
        }
    }
    if ($roleCreated) {
        try {
            Invoke-DevPsql "drop owned by $role; drop role if exists $role"
        }
        catch {
            Write-Warning "Ephemeral DB E2E role cleanup failed."
            $testExitCode = 1
        }
    }
}

exit $testExitCode
