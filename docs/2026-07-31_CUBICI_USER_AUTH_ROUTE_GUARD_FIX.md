# Cubici User Auth Route Guard Fix

## Issue

- When the user was not logged in, top navigation menu links could open protected business pages.
- API calls were already protected by backend bearer-token checks, but the frontend route itself allowed entry and showed empty or login-required content.

## Decision

- Treat this as a user-web UX/auth routing defect.
- Public pages remain accessible:
  - `/`
  - `/main`
  - `/login`
  - `/mainSignUp`
  - `/idSearch`
  - `/pwdReset`
  - Moneybank intro pages
  - notice/FAQ/charge pages
- Protected pages now redirect to `/login?returnUrl=...`:
  - integrated info
  - sales/returns
  - settlement
  - inventory
  - mypage
  - Moneybank request/evaluate/contract/current/deposit test
  - Q&A user inquiry pages

## Changes

- `user-web/src/App.jsx`
  - Added `requireAuth`.
  - Wrapped protected user routes.

- `user-web/src/pages/AccountPages.jsx`
  - Login success now redirects to the requested `returnUrl` when safe.
  - Falls back to `/cubici/mypage/profile`.

## Verification

- Cloudflare static bundle build passed:
  - `VITE_API_BASE_URL=https://api.cubici.co.kr`
  - `node scripts/build-cloudflare-static-bundle.mjs`

- Static bundle smoke passed:
  - `node scripts/smoke-cloudflare-static-bundle.mjs`

- Local browser smoke passed on `http://127.0.0.1:5175`:
  - `/cubici/integratedInfo/tab1` -> `/login?returnUrl=%2Fcubici%2FintegratedInfo%2Ftab1`
  - `/cubici/salesInfo/sales` -> `/login?returnUrl=%2Fcubici%2FsalesInfo%2Fsales`
  - `/cubici/calculateInfo/calendar` -> `/login?returnUrl=%2Fcubici%2FcalculateInfo%2Fcalendar`
  - `/cubici/invento/index` -> `/login?returnUrl=%2Fcubici%2Finvento%2Findex`
  - `/moneybank/request` -> `/login?returnUrl=%2Fmoneybank%2Frequest`
  - `/moneybank/current` -> `/login?returnUrl=%2Fmoneybank%2Fcurrent`
  - `/cubici/mypage/companyInfo` -> `/login?returnUrl=%2Fcubici%2Fmypage%2FcompanyInfo`
  - `/board/qa/index` -> `/login?returnUrl=%2Fboard%2Fqa%2Findex`
  - `/moneybank/intro/advpay` remains public.

- Cloudflare Pages deployment completed:
  - `https://592e4af4.cubici.pages.dev`

- Production browser smoke passed:
  - `https://cubici.co.kr/cubici/integratedInfo/tab1` redirects to login.
  - `https://cubici.co.kr/cubici/salesInfo/sales` redirects to login.
  - `https://cubici.co.kr/moneybank/request` redirects to login.
  - `https://cubici.co.kr/cubici/mypage/companyInfo` redirects to login.
  - `https://cubici.co.kr/moneybank/intro/advpay` remains public.
  - No page errors observed.

## Notes

- Backend/API was not changed.
- Standalone `pnpm --dir user-web build` was blocked by the Codex pnpm wrapper trying to purge `node_modules` without TTY, but the deployment build path passed.
