# Cubici Production Deployment Plan

## Target Topology

- Frontend: Cloudflare Pages
- Frontend domain: `https://cubici.co.kr`
- Backend API domain: `https://api.cubici.co.kr`
- Backend runtime: Spring Boot jar from `cubici_redem`
- Database: managed MySQL 8.x or private MySQL on the backend host
- PRIZM v2 analytics: Python batch/API service added later, writing results to MySQL

## Current Status

- Cloudflare Pages is connected to GitHub `hrchoi9999/Cubici`.
- Frontend build root is `website`.
- Frontend build command is `npm run build`.
- Frontend output directory is `dist`.
- Local backend API is running on `http://127.0.0.1:18080`.
- Local frontend can read dashboard values from `/api/dashboard/summary`.

## Temporary Local Backend/DB Server

Until the real production server is selected, this PC is the backend and DB server for development and investor demo preparation.

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

Local endpoints:

```text
MySQL:   127.0.0.1:3307, database cubici
Backend: http://127.0.0.1:18080
Health:  http://127.0.0.1:18080/api/health
Data:    http://127.0.0.1:18080/api/dashboard/summary
```

Important: Cloudflare Pages visitors cannot call `127.0.0.1` on this PC. For public demos from `cubici.co.kr`, expose this PC with Cloudflare Tunnel or use a real hosted backend. Do not open MySQL directly to the internet.

## Required Production Decisions

Choose one backend/database option before live API launch.

1. Managed PaaS backend plus managed MySQL
   - Easiest operating model.
   - Recommended for investor demo speed.
   - Examples: Google Cloud Run plus Cloud SQL MySQL, AWS Lightsail plus RDS, Render/Railway plus managed MySQL.

2. Single VPS with Spring Boot and MySQL
   - Lowest monthly cost.
   - More server administration work.
   - Acceptable for a controlled demo, less ideal for long-term operations.

3. Separate VPS backend plus managed MySQL
   - Good middle ground.
   - Backend is simple to control, DB backup/security is easier.

Recommended first production path: option 1 or 3.

## Cloudflare DNS

Keep Cloudflare authoritative DNS for `cubici.co.kr`.

- `cubici.co.kr`: Cloudflare Pages custom domain
- `www.cubici.co.kr`: Cloudflare Pages custom domain or redirect to apex
- `api.cubici.co.kr`: CNAME or A record to the backend host

Do not point API traffic to the local development PC.

## Cloudflare Pages Environment Variable

Set this in Cloudflare Pages project settings when the backend is live:

```text
VITE_CUBICI_API_BASE=https://api.cubici.co.kr
```

When this value is empty, the deployed page remains static and does not call the API.

## Backend Environment Variables

Use environment variables or a private config file on the server. Do not commit real values.

```text
SPRING_PROFILES_ACTIVE=real
SERVER_PORT=18080
SPRING_DATASOURCE_URL=jdbc:mysql://<db-host>:3306/cubici?serverTimezone=Asia/Seoul&characterEncoding=UTF-8&useSSL=true
SPRING_DATASOURCE_USERNAME=<db-user>
SPRING_DATASOURCE_PASSWORD=<db-password>
CUBICI_SCHEDULING_ENABLED=false
SPRING_TASK_SCHEDULING_ENABLED=false
CUBICI_CORS_ALLOWED_ORIGINS=https://cubici.co.kr,https://www.cubici.co.kr
```

For production, open MySQL only to the backend host or private network.

## Backend Build

From `C:\Cubici\cubici_redem`:

```powershell
$env:JAVA_HOME='C:\Cubici\private_local\tools\jdk-13.0.2'
$env:GRADLE_USER_HOME='C:\Cubici\private_local\gradle-home'
$env:PATH="$env:JAVA_HOME\bin;$env:PATH"
.\gradlew.bat bootJar -x test
```

Artifact:

```text
C:\Cubici\cubici_redem\build\libs\redem-0.0.1-SNAPSHOT.jar
```

## API Health Checks

Expected endpoints:

```text
GET /api/health
GET /api/dashboard/summary
```

Production smoke test:

```powershell
Invoke-RestMethod https://api.cubici.co.kr/api/health
Invoke-RestMethod https://api.cubici.co.kr/api/dashboard/summary
```

## Security Rules

- Never commit `.env`, DB dumps, private config, API keys, certificates, or account credentials.
- Keep production DB credentials outside GitHub and Cloudflare Pages source files.
- Use HTTPS for `api.cubici.co.kr`.
- Restrict CORS to `https://cubici.co.kr` and `https://www.cubici.co.kr` before opening real user data.
- Keep scheduler jobs disabled until each external transfer/API job is reviewed.

## PRIZM v2 Placement

PRIZM v2 should be introduced as a Python analytics layer.

- Python collects and normalizes external data.
- Python writes feature snapshots and scores to MySQL.
- Spring Boot exposes the latest score, evidence, risk flags, and trend data through APIs.
- Frontend visualizes those API outputs for investor demo screens.
