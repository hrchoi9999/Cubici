# Cubici Development Environment Setup

## Verified On This PC

- Workspace: `C:\Cubici`
- Git: `2.54.0.windows.1`, available on PATH
- Python: `3.10.11` installed at `C:\Users\PC\AppData\Local\Programs\Python\Python310`
- Python analysis venv: `C:\Cubici\.venv310`, verified with pandas, numpy, and scikit-learn
- Node.js from Codex app: `v24.14.0`, available as `node`
- Node.js local toolchain for website: `v24.15.0` with npm `11.12.1` at `C:\Cubici\private_local\tools\node-v24.15.0-win-x64`
- MySQL Community Server: `8.0.45`, portable install at `C:\Cubici\private_local\tools\mysql-8.0.45-winx64`
- MySQL local instance: `127.0.0.1:3307`, database `cubici`
- DBeaver Community: portable install at `C:\Cubici\private_local\tools\dbeaver`
- OpenJDK: `13.0.2`, portable install at `C:\Cubici\private_local\tools\jdk-13.0.2`
- Apache Maven: `3.9.11`, portable install at `C:\Cubici\private_local\tools\apache-maven-3.9.11`
- Apache Tomcat: `9.0.117`, portable install at `C:\Cubici\private_local\tools\apache-tomcat-9.0.117`
- VS Code: `1.117.0`, available as `code`
- Original backup: `C:\Cubici_original_backup`

## Still Missing

No required first-phase tools are currently missing.

Optional later:

- Docker Desktop

## Python Environment

Use the existing Python 3.10 virtual environment:

```powershell
cd C:\Cubici
.\.venv310\Scripts\Activate.ps1
python analysis\generate_sample_data.py
```

If activation is blocked or `python` is not resolved in the current shell, call the venv executable directly:

```powershell
C:\Cubici\.venv310\Scripts\python.exe analysis\generate_sample_data.py
```

## Website

The Node MSI installer failed on this PC, so the website uses the local Node ZIP toolchain under `private_local`.
Run this helper first in each new PowerShell session:

```powershell
Set-ExecutionPolicy -Scope Process Bypass -Force
. .\scripts\dev-env.ps1
```

Then:

```powershell
cd C:\Cubici\website
npm run dev
```

Without the helper, call npm directly:

```powershell
C:\Cubici\private_local\tools\node-v24.15.0-win-x64\npm.cmd run dev
```

For `cmd.exe` sessions:

```bat
scripts\dev-env.cmd
cd website
npm run dev
```

## MySQL

Local MySQL uses a portable project-local install, not a Windows service.

Connection settings:

- Host: `127.0.0.1`
- Port: `3307`
- Database: `cubici`
- Dev user: `cubici_dev`

Credentials are stored only in:

```text
C:\Cubici\private_local\mysql\credentials.txt
```

Start, check, and stop the local DB:

```bat
scripts\mysql-start.cmd
scripts\mysql-status.cmd
scripts\mysql-stop.cmd
```

Open DBeaver:

```bat
scripts\dbeaver.cmd
```

## Local Backend/DB Server

For the current development phase, this PC is used as the temporary backend and DB server.

Start both MySQL and the Spring Boot backend:

```bat
scripts\local-server-start.cmd
```

Check status:

```bat
scripts\local-server-status.cmd
```

Stop both services:

```bat
scripts\local-server-stop.cmd
```

Backend-only helpers:

```bat
scripts\backend-start.cmd
scripts\backend-status.cmd
scripts\backend-stop.cmd
```

## External Demo Tunnel

Use Cloudflare Tunnel when `cubici.co.kr` must call this PC's temporary backend during an external demo.

```bat
scripts\tunnel-start.cmd
scripts\tunnel-status.cmd
scripts\tunnel-stop.cmd
```

Public API URL:

```text
https://api.cubici.co.kr
```

Keep this PC powered on and connected to the internet while demoing. Do not expose MySQL directly.

## Legacy Java Tooling

The legacy Java project is configured with Maven compiler `source` and `target` set to `13`, so the workspace uses OpenJDK 13.0.2 for compatibility.

Activate the dev environment, then check versions:

```powershell
Set-ExecutionPolicy -Scope Process Bypass -Force
. .\scripts\dev-env.ps1
java -version
mvn --version
```

Tomcat helpers:

```bat
scripts\tomcat-version.cmd
scripts\tomcat-start.cmd
scripts\tomcat-stop.cmd
```

## GitHub Safety Rules

Do not commit:

- `private_local/`
- `backup_*.sql`
- real DB dumps
- real account/API/SMS/payment credentials
- `legacy-java/src/main/resources/egovframework/globals.properties`
- `legacy-java/src/main/resources/egovframework/mailsmsweb.properties`
- analytics service-account JSON files

Commit example files only, such as `.env.example` and sanitized config templates.
