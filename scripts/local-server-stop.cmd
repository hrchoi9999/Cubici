@echo off
set "WORKSPACE_ROOT=%~dp0.."
powershell -NoProfile -ExecutionPolicy Bypass -File "%WORKSPACE_ROOT%\scripts\local-server-stop.ps1"
