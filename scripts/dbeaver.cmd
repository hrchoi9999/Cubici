@echo off
set "WORKSPACE_ROOT=%~dp0.."
set "DBEAVER=%WORKSPACE_ROOT%\private_local\tools\dbeaver\dbeaver.exe"

if not exist "%DBEAVER%" (
  echo DBeaver executable not found: %DBEAVER%
  exit /b 1
)

start "" "%DBEAVER%"
