@echo off
call "%~dp0dev-env.cmd" > nul
"%CATALINA_HOME%\bin\shutdown.bat"
