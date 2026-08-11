param(
    [string]$EnvFile = 'D:\Cubici_Runtime\production.env',
    [string]$PublicHealthUrl = 'https://api.cubici.co.kr/v1/api/health',
    [int]$HealthTimeoutSeconds = 90,
    [switch]$PreflightOnly
)

$ErrorActionPreference = 'Stop'

$cubiciRoot = Split-Path -Parent $PSScriptRoot
$composePath = Join-Path $cubiciRoot 'docker-compose.prod.yml'
$envPath = if ([IO.Path]::IsPathRooted($EnvFile)) {
    $EnvFile
}
else {
    Join-Path $cubiciRoot $EnvFile
}
$sourcePath = Join-Path $cubiciRoot 'service-api\src\cubici_service\contracts\repository.py'
$containerName = 'cubici-api-prod'
$replacementStarted = $false
$oldImageId = ''
$composeImageName = ''

function Invoke-Compose {
    param([Parameter(Mandatory)][string[]]$Arguments)

    & docker compose --env-file $envPath -f $composePath @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "Docker Compose failed: $($Arguments -join ' ')"
    }
}

function Wait-ApiHealth {
    $deadline = (Get-Date).AddSeconds($HealthTimeoutSeconds)
    do {
        $health = (& docker inspect $containerName --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}').Trim()
        if ($LASTEXITCODE -eq 0 -and $health -eq 'healthy') {
            return
        }
        Start-Sleep -Seconds 3
    } while ((Get-Date) -lt $deadline)

    throw "Production API did not become healthy within $HealthTimeoutSeconds seconds."
}

if (-not (Test-Path -LiteralPath $envPath -PathType Leaf)) {
    throw "External production env file was not found: $envPath"
}
if (Select-String -LiteralPath $envPath -Pattern 'CHANGE_ME_' -Quiet) {
    throw 'External production env file still contains placeholder values.'
}

Push-Location $cubiciRoot
try {
    Invoke-Compose -Arguments @('config', '--quiet')
    if ($PreflightOnly) {
        Write-Output 'production_api_preflight=ok'
        return
    }

    $oldImageId = (& docker inspect $containerName --format '{{.Image}}').Trim()
    $composeImageName = (& docker inspect $containerName --format '{{.Config.Image}}').Trim()
    if ($LASTEXITCODE -ne 0 -or -not $oldImageId -or -not $composeImageName) {
        throw 'Running production API container metadata could not be read.'
    }

    $rollbackTag = "$composeImageName`:rollback-$(Get-Date -Format 'yyyyMMddHHmmss')"
    & docker image tag $oldImageId $rollbackTag
    if ($LASTEXITCODE -ne 0) {
        throw 'Production API rollback image tag could not be created.'
    }

    Invoke-Compose -Arguments @('build', 'cubici-api')
    $replacementStarted = $true
    Invoke-Compose -Arguments @('up', '-d', '--no-deps', 'cubici-api')
    Wait-ApiHealth

    $hostHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $sourcePath).Hash.ToLowerInvariant()
    $containerHash = ((& docker exec $containerName sha256sum /app/src/cubici_service/contracts/repository.py) -split '\s+')[0]
    if ($LASTEXITCODE -ne 0 -or $hostHash -ne $containerHash) {
        throw 'Production API repository source hash does not match the Git worktree source.'
    }

    $healthResponse = Invoke-WebRequest -Uri $PublicHealthUrl -UseBasicParsing -TimeoutSec 20 -Headers @{
        'Cache-Control' = 'no-cache'
    }
    if ($healthResponse.StatusCode -ne 200) {
        throw "Public API health check failed: HTTP $($healthResponse.StatusCode)"
    }

    $imageId = (& docker inspect $containerName --format '{{.Image}}').Trim()
    Write-Output 'production_api_deploy=ok'
    Write-Output "container=$containerName"
    Write-Output "image=$imageId"
    Write-Output 'source_hash_match=true'
    Write-Output "public_health_status=$($healthResponse.StatusCode)"
    Write-Output "rollback_tag=$rollbackTag"
}
catch {
    $deployError = $_
    if ($replacementStarted -and $oldImageId -and $composeImageName) {
        Write-Warning 'Production API deployment failed. Attempting rollback to the previous image.'
        & docker image tag $oldImageId $composeImageName
        try {
            Invoke-Compose -Arguments @('up', '-d', '--no-deps', 'cubici-api')
            Wait-ApiHealth
            Write-Warning 'Production API rollback completed.'
        }
        catch {
            Write-Warning 'Automatic rollback failed. Manual recovery is required.'
        }
    }
    throw $deployError
}
finally {
    Pop-Location
}
