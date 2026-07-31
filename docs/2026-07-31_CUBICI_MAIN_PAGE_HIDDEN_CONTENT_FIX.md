# Cubici Main Page Hidden Content Fix

## Issue

- Production main page top/header area rendered, but the content below it appeared empty.
- Scope was limited to user web frontend rendering. Backend/API was not changed.

## Root Cause

- Legacy CSS contains `.actionVisual article { display: none; ... }`.
- React main page feature cards were rendered as `article.conArticle` inside `.actionVisual`.
- As a result, the imported legacy CSS hid all React feature cards under the main visual area.

## Change

- File changed: `user-web/src/styles/user-web.css`
- Added explicit override for `.react-feature-grid .conArticle`:
  - `display: block`
  - reset legacy absolute positioning
  - preserve legacy-like panel border, padding, and shadow

## Verification

- Local Playwright smoke on `http://127.0.0.1:5175/`
  - 4 main feature cards visible.
  - Partner area visible.
  - No page errors observed.

- Production build:
  - `VITE_API_BASE_URL=https://api.cubici.co.kr`
  - `node scripts/build-cloudflare-static-bundle.mjs` passed.
  - `node scripts/smoke-cloudflare-static-bundle.mjs` passed.

- Cloudflare Pages redeploy:
  - Deployment URL: `https://d7dd980d.cubici.pages.dev`
  - Production domain checked: `https://cubici.co.kr`

- Post-deploy Playwright smoke:
  - `https://d7dd980d.cubici.pages.dev`: 4 cards visible, partner area visible.
  - `https://cubici.co.kr`: 4 cards visible, partner area visible.

## Remaining Risk

- This was a focused rendering fix for the main page.
- Full user/admin regression and GitHub commit/push remain separate follow-up work.
