@echo off
set "WORKSPACE_ROOT=%~dp0.."
set "MYSQLD=%WORKSPACE_ROOT%\private_local\tools\mysql-8.0.45-winx64\bin\mysqld.exe"
set "MYINI=%WORKSPACE_ROOT%\private_local\mysql\my.ini"

if not exist "%MYSQLD%" (
  echo MySQL executable not found: %MYSQLD%
  exit /b 1
)

start "Cubici MySQL 8.0.45" /min "%MYSQLD%" --defaults-file="%MYINI%"
echo Cubici MySQL start requested on 127.0.0.1:3307.
