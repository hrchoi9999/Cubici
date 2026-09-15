# Astra Production Hardening - 2026-09-15

## Scope and Source

- User approved inspection, necessary fixes, and deployment in `D:\Cubici_Integration_20260730`.
- User approved deployment-tool use only of `D:\Cubici_Runtime\production.env`; its contents were not printed, copied, or documented.
- User approved official Wrangler OAuth account/user read, Pages write, and background access. Tool-managed credentials stay in ignored `data_local/cloudflare-cli`.
- Production source: branch `fix/cloudflare-admin-spa-routing`, HEAD `4e7704fbe096fde7d54dcef555fb8edc192109d6`, plus the selective uncommitted changes below.
- `D:\Alt_CSM\Cubici` is an older review source, NOT the production deployment source. Its entire tree must not replace the newer production checkout.
- Preserved pre-existing seven modified admin E2E specs, two modified Prism reference images, and untracked user documents. No commit, push, reset, or business-data migration.

## Changes

- `service-api/src/cubici_service/core/access_control.py`: restrict contract owner actions to agree/refuse terms and request termination; reject malformed/non-object JSON.
- `api/v1/endpoints/{contracts,settlements,support}.py`: authorization dependencies run on validated route/body parameters, including alternate integer spellings.
- `settlements/repository.py`: exact owner shop scope is independent of administrator partial search and applies to list/count/sum.
- `app.py`: CORS wraps authorization failures, including regex-only configuration.
- `core/config.py`: structured psycopg conninfo; reject weak/default production authentication secrets. Retain environment-supplied master admin email and existing env precedence.
- `db/connection.py`: retry connection establishment only, not caller SQL.
- User/admin download helpers and callers: authenticated Blob download, 401/403/timeout errors, retry state, URL cleanup.
- `admin-web/src/components/layout/AdminLayout.jsx`: `/admin/logout` link. Preserve existing user logout/session reset and later UI changes.
- `admin-web/src/styles/admin-web.css`: replace nonexistent `bullet-icon01-white.svg` reference with the existing white `bullet-icon01.svg`.
- `service-api/Dockerfile`, `.dockerignore`: import gate and allowlisted build context. Existing libpq5 retained.
- Added focused backend/frontend tests, `scripts/verify-astra-db-focused.py`, and `scripts/verify-astra-deployment.mjs`.

## Verification Before Production

- Backend focused regression: 336 passed across 8 files, with local env loading and real DB access disabled.
- Frontend focused unit tests: 24 passed.
- Development PostgreSQL: SELECT 1 preflight; 15 synthetic SQL/rollback checks and 5 driver-double checks passed twice. Only pg_temp fixtures; no existing business rows read/written. Driver doubles are not real psycopg integration evidence.
- Candidate Docker build/import: passed. All 56 Python source hashes match the worktree.
- Container HTTP smoke: health=200, unauthenticated protected route=401 with CORS, malformed JSON=422.
- Candidate + approved runtime env: production settings validation passed; actual psycopg SELECT 1 passed with `default_transaction_read_only=on` verified. No business queries.
- User/admin static build and static route smoke passed with `VITE_API_BASE_URL=https://api.cubici.co.kr`.
- Generated CSS references: 228 checked, zero missing after icon correction.
- Final preview: `https://c3dfce52.cubici.pages.dev`; 23 route/file SHA256 checks match local bundle. Chrome public home and admin login render correctly.
- Earlier preview `c66013de` found the missing icon and was superseded before production.
- `git diff --check`: passed.

## Commands and Tools

```powershell
# Production checkout working directory
$Node = 'D:\Alt_CSM\.tools\node-v22.13.1-win-x64\node.exe'
$env:VITE_API_BASE_URL = 'https://api.cubici.co.kr'
& $Node scripts/build-cloudflare-static-bundle.mjs
& $Node scripts/smoke-cloudflare-static-bundle.mjs
& $Node scripts/verify-astra-deployment.mjs https://cubici.co.kr
& D:\Alt_CSM\.venv\Scripts\python.exe -B scripts/verify-astra-db-focused.py
& $Node --test admin-web/tests/unit/selective-download-auth.test.cjs
./scripts/deploy-production-api.ps1 -PreflightOnly
```

- Verify build output paths resolve inside this checkout before regenerating dist directories.
- API deployment command: `./scripts/deploy-production-api.ps1`. It tags rollback image, builds API, recreates only API with `--no-deps`, checks health and source hash, and attempts rollback on failure. DB volume and tunnel stay intact.
- Wrangler 4.131.2 executable: `D:\Alt_CSM\.downloads\npm-cache\_npx\32026684e21afda6\node_modules\wrangler\bin\wrangler.js`.
- For Wrangler, set USERPROFILE/APPDATA/LOCALAPPDATA/XDG_CONFIG_HOME to this checkout's `data_local/cloudflare-cli`; logs under its `logs`; `WRANGLER_SEND_METRICS=false`.
- Pages project `cubici`, production branch `main`. Deploy `dist-cloudflare` only, `--commit-dirty=true`; never upload repository, env, DB dump, or runtime files.

## Rollback Baseline and Limits

- Previous production Pages deployment: `32bb7dba-86fd-45de-9a21-76e1a8bfa247`, `https://32bb7dba.cubici.pages.dev`.
- Previous API image: `sha256:066ebf00e01d94fd08732e9b4896f035eae8af275e8bd4ae8ca088cc6b37df65`.
- Docker services: API host port 18000; existing production DB volume `cubici_postgres_prod_data`; tunnel remains unchanged.
- Do not start stale staging compose blindly: its old port overlaps another project.
- Login writes last-login metadata. Real account login and business writes are intentionally excluded from production smoke.
- This is a scoped hardening release, not proof that every legacy screen/formula/lifecycle is complete. Prior optional DB E2E fixture/selector failures remain outside this scope.
- Git source changes remain uncommitted; later Git auto-deploy can overwrite this manual Pages release until changes are separately reviewed and committed.

## Final Deployment Outcome

- Production deployment completed on 2026-09-15, approximately 18:37 KST.
- API image: `sha256:a77d40699b514e581ffb1b73d3cf9dc63376e1a09ae3daa059295c9363079c07`.
- API rollback tag: `cubici_integration_20260730-cubici-api:rollback-20260915183617`.
- Production API source hashes: all 56 Python files match the worktree.
- Pages production deployment: `4b4b21d5-23a2-40f4-acd2-47fb31359202`, branch `main`, URL `https://4b4b21d5.cubici.pages.dev`.
- `https://cubici.co.kr`: all 23 route/static-file content hash checks passed after deployment; CSS references present.
- Public API GET smoke: `/v1/api/health` and `/v1/api/health/db` return 200; `/v1/api/fintech/status`, `/v1/api/settlements/%2B1`, and `/v1/api/support/inquiries/%2B1?user_no=1` return 401 without credentials. All five return the expected CORS origin for `https://cubici.co.kr`.
- API healthy; production PostgreSQL healthy; existing production tunnel running without recreation. DB volume preserved.
- Chrome production home and admin login rendering verified. Existing browser login state was not deliberately changed; no real account login submitted.
- Chromium focused component harness: 8/8 desktop/mobile user/admin download/logout scenarios passed, zero page errors. It bundles actual source components with mocked API, not a full Vite application lifecycle test.
- Browser checks include download events and bytes, Authorization header, 401/403/500/network error, retry, pending state, Blob cleanup, and session clearing. Output: `data_local/focused-frontend/results/report.json`; harness: `data_local/focused-frontend/selective-download-browser.test.cjs`.
- Temporary browser server stopped; port 18125 no longer listening. All verification/deployment command sessions completed. Production services intentionally remain running.

## Manual API Recovery

Use the existing deployment rollback mechanism first. For manual recovery, tag the recorded rollback image as `cubici_integration_20260730-cubici-api:latest`, then run Docker Compose with the approved external runtime env and `up -d --no-deps cubici-api`. Verify container health plus both public health endpoints. Do not run `down`, remove volumes, or recreate PostgreSQL. Pages can be rolled back to the recorded prior production deployment in the Cloudflare project dashboard. These are recovery instructions, not actions performed in this release.

## User-Supplied Login Follow-Up

- The user confirmed they had logged in after deployment. Using the existing Chrome session, verified production dashboard data rendering, settlement list and one detail dialog, Moneybank status, and sales list.
- These views completed loading without visible authorization/server errors; the sales table contained rendered data rows. This does not independently validate business totals or source-data freshness.
- No login credentials were entered by the agent; no logout, contract action, application, upload, payment, or business-data edit was performed. Account names, amounts, order identifiers, and business row content are intentionally omitted from this document.

## Subsequent Authorized Git Publication

- The user subsequently requested commit and push. The earlier uncommitted/no-push statements above describe the deployment-time state.
- Publication scope: 25 selected hardening source/test/script/document files on `fix/cloudflare-admin-spa-routing`; preserve unrelated pre-existing changes. No main merge, force push, or new production deployment.
- After fetch, the branch and its remote tracking ref both pointed to baseline `4e7704f` with zero divergence.
- Focused revalidation: 214 backend checks passed using `service-api/.venv/Scripts/python.exe` with env loading disabled; frontend unit 24 passed.
- Initial API collection failed in an unsuitable root/Alt_CSM Python environment due to missing openpyxl; corrected by selecting the existing API environment, without package changes.
- The frontend unit harness now resolves esbuild through Vite, accommodating pnpm's non-hoisted dependencies. This is a test-only change and does not alter deployed application bytes.
- Actual env files, tool credentials, generated bundle, DB dumps and reference captures are excluded. The only tracked env-named file found was the existing `service-api/.env.example` template, not part of this change.
- Existing CI targets PRs to devCubici or manual dispatch, not this branch push. Local focused results are not a claim of a successful new GitHub Actions run.
