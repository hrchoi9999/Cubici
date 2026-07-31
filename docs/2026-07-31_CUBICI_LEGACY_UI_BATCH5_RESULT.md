# Cubici Legacy UI Batch 5 Result

## Scope

- Target: user-web only.
- Backend/API code: unchanged.
- Admin pages: excluded from this user-page batch.
- Goal: mobile/page-level tuning, focused E2E, static bundle verification, and production preflight.

## Changed Files

- `user-web/src/styles/user-web.css`
  - Added mobile overrides for legacy fixed-width wrappers.
  - Released `#header`, `.inner`, `.subVisualArea .inner`, and `contentGrid` width constraints on small screens.
  - Constrained legacy table overflow inside panel content instead of expanding the whole page.
  - Tuned mobile panel headers, board list padding, intro section typography, and intro image size.

## Verification

- Focused Playwright E2E on local dev server `http://127.0.0.1:5175`: passed.
  - Desktop selectors:
    - `/`: `#header.react-legacy-header`
    - `/moneybank/intro/advpay`: `.react-legacy-intro img.halfImg`
    - `/board/notice/index`: `.react-legacy-board table.list`
    - `/cubici/salesInfo/sales`: `.react-legacy-search-panel`
    - `/cubici/mypage/profile`: `.react-legacy-mypage-panel`
  - Mobile viewport `375x812`:
    - `/`, `/login`, `/moneybank/intro/advpay`, `/board/notice/index`, `/cubici/salesInfo/sales`, `/cubici/invento/index`, `/cubici/mypage/profile`
    - `innerWidth = 375`, `scrollWidth = 375`
    - Browser page errors: none.
- `user-web` production build: passed.
- Cloudflare static bundle build: passed.
- Cloudflare static bundle smoke: passed.

## Production Preflight

- `https://cubici.co.kr/`: HTTP 200.
- `https://api.cubici.co.kr/`: HTTP 530.
- `https://api.cubici.co.kr/health`: HTTP 530.
- `https://api.cubici.co.kr/v1/health`: HTTP 530.
- `https://api.cubici.co.kr/docs`: HTTP 530.

## Deployment Readiness

- Frontend build artifact is ready.
- Production deployment is blocked by API origin/Cloudflare 530 preflight failure.
- Do not deploy the user-web UI restoration to production until `api.cubici.co.kr` returns a valid API response.

## Conservative Progress

- User-page legacy UI restoration after Batch 1: about 20%.
- After Batch 2: about 35%.
- After Batch 3: about 50%.
- After Batch 4: about 70%.
- After Batch 5 local UI verification: about 85%.

The remaining 15% is conservative deployment readiness work: API origin recovery, final production preflight, production deploy, and post-deploy smoke.

## Next Step

- Resolve or confirm `api.cubici.co.kr` Cloudflare/origin status.
- After API preflight passes, proceed with production deploy and post-deploy smoke.
