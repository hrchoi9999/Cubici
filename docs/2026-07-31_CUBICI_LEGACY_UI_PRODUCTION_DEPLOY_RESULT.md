# Cubici Legacy UI Production Deploy Result

## Scope

- Target: user-web and admin-web static Cloudflare Pages bundle.
- Backend/API code: unchanged.
- Deployment was explicitly approved by the user despite API preflight returning HTTP 530.
- Production backend is understood to be operated separately through Docker/Cloudflare Tunnel.

## Build

- Command:
  - `VITE_API_BASE_URL=https://api.cubici.co.kr node scripts/build-cloudflare-static-bundle.mjs`
- Result:
  - Passed.
  - `dist-cloudflare` generated with user app, admin app, legacy `/resources/**`, `_worker.js`, `_redirects`, `_routes.json`, and `_headers`.
- Static bundle smoke:
  - `node scripts/smoke-cloudflare-static-bundle.mjs`
  - Passed.

## Deployment

- Command:
  - `pnpm dlx wrangler pages deploy dist-cloudflare --project-name=cubici --branch=main`
- Result:
  - Cloudflare Pages deployment complete.
  - Deployment URL: `https://f3010ab3.cubici.pages.dev`
  - Uploaded 46 files, 3333 files reused.

## Post-Deploy Smoke

- HTTP smoke:
  - `https://f3010ab3.cubici.pages.dev/`: 200, `Cubici User Web`
  - `https://f3010ab3.cubici.pages.dev/moneybank/intro/advpay`: 200, `Cubici User Web`
  - `https://f3010ab3.cubici.pages.dev/cubici/salesInfo/sales`: 200, `Cubici User Web`
  - `https://f3010ab3.cubici.pages.dev/admin`: 200, `Cubici Admin`
  - `https://cubici.co.kr/`: 200, `Cubici User Web`
  - `https://cubici.co.kr/moneybank/intro/advpay`: 200, `Cubici User Web`
  - `https://cubici.co.kr/cubici/salesInfo/sales`: 200, `Cubici User Web`
  - `https://cubici.co.kr/admin`: 200, `Cubici Admin`
- Playwright render smoke:
  - `https://f3010ab3.cubici.pages.dev`: passed.
  - `https://cubici.co.kr`: passed.
  - Verified selectors:
    - `#header.react-legacy-header`
    - `.react-legacy-intro img.halfImg`
    - `.react-legacy-search-panel`
    - admin `#root`
  - Browser page errors: none.

## Remaining API Risk

- `https://api.cubici.co.kr/health`: HTTP 530 after deployment.
- Frontend deployment is complete, but API-backed screens can still fail until Docker origin/Cloudflare Tunnel is recovered.

## Current Status

- User-page legacy UI restoration: about 95% including production deployment.
- Remaining work:
  - Recover/confirm API origin and Cloudflare Tunnel.
  - Post-recovery API-backed smoke for login, mypage, sales, settlement, moneybank current, and admin API pages.
