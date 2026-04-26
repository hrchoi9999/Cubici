@echo off
set "WORKSPACE_ROOT=%~dp0.."
set "MYSQLADMIN=%WORKSPACE_ROOT%\private_local\tools\mysql-8.0.45-winx64\bin\mysqladmin.exe"
set "ROOTCNF=%WORKSPACE_ROOT%\private_local\mysql\root-client.cnf"

"%MYSQLADMIN%" --defaults-extra-file="%ROOTCNF%" ping
