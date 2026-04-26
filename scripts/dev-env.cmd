@echo off
set "WORKSPACE_ROOT=%~dp0.."
set "JAVA_HOME=%WORKSPACE_ROOT%\private_local\tools\jdk-13.0.2"
set "CATALINA_HOME=%WORKSPACE_ROOT%\private_local\tools\apache-tomcat-9.0.117"
set "PATH=%CATALINA_HOME%\bin;%WORKSPACE_ROOT%\private_local\tools\apache-maven-3.9.11\bin;%JAVA_HOME%\bin;%WORKSPACE_ROOT%\private_local\tools\mysql-8.0.45-winx64\bin;%WORKSPACE_ROOT%\private_local\tools\node-v24.15.0-win-x64;%WORKSPACE_ROOT%\.venv310\Scripts;%PATH%"
echo Cubici dev environment paths are active for this cmd session.
where node
where npm
where python
where mysql
where java
where mvn
