$WorkspaceRoot = Split-Path -Parent $PSScriptRoot
$NodeRoot = Join-Path $WorkspaceRoot "private_local\tools\node-v24.15.0-win-x64"
$VenvScripts = Join-Path $WorkspaceRoot ".venv310\Scripts"
$MySqlBin = Join-Path $WorkspaceRoot "private_local\tools\mysql-8.0.45-winx64\bin"
$JavaHome = Join-Path $WorkspaceRoot "private_local\tools\jdk-13.0.2"
$MavenBin = Join-Path $WorkspaceRoot "private_local\tools\apache-maven-3.9.11\bin"
$CatalinaHome = Join-Path $WorkspaceRoot "private_local\tools\apache-tomcat-9.0.117"

if (Test-Path -LiteralPath $NodeRoot) {
    $env:Path = "$NodeRoot;$env:Path"
}

if (Test-Path -LiteralPath $VenvScripts) {
    $env:Path = "$VenvScripts;$env:Path"
}

if (Test-Path -LiteralPath $MySqlBin) {
    $env:Path = "$MySqlBin;$env:Path"
}

if (Test-Path -LiteralPath $JavaHome) {
    $env:JAVA_HOME = $JavaHome
    $env:Path = "$JavaHome\bin;$env:Path"
}

if (Test-Path -LiteralPath $MavenBin) {
    $env:Path = "$MavenBin;$env:Path"
}

if (Test-Path -LiteralPath $CatalinaHome) {
    $env:CATALINA_HOME = $CatalinaHome
    $env:Path = "$CatalinaHome\bin;$env:Path"
}

Write-Host "Cubici dev environment paths are active for this PowerShell session."
Write-Host "Node:" (Get-Command node -ErrorAction SilentlyContinue).Source
Write-Host "npm:" (Get-Command npm -ErrorAction SilentlyContinue).Source
Write-Host "python:" (Get-Command python -ErrorAction SilentlyContinue).Source
Write-Host "mysql:" (Get-Command mysql -ErrorAction SilentlyContinue).Source
Write-Host "java:" (Get-Command java -ErrorAction SilentlyContinue).Source
Write-Host "mvn:" (Get-Command mvn -ErrorAction SilentlyContinue).Source
