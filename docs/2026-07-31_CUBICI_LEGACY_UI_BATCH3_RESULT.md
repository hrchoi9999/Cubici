# Cubici Legacy UI Batch 3 Result

## Scope

- Target: user-web only.
- Backend/API: unchanged.
- Admin pages: excluded from this user-page batch.
- Goal: expand legacy common format coverage to representative intro pages and board detail pages.

## Changed Files

- `user-web/src/pages/MoneybankPages.jsx`
  - Replaced the custom `intro-split` block in Moneybank intro pages with `LegacyIntroSection`.
  - Updated Moneybank intro images to runtime `/resources/rudicks/...` paths.
- `user-web/src/pages/SupportPages.jsx`
  - Replaced board detail and Q&A detail/reply wrappers with `LegacyPanel`.
  - Kept existing API/data logic unchanged.
- `user-web/src/styles/user-web.css`
  - Added detail panel spacing rules.
  - Added `LegacyIntroSection` description and CTA spacing rules.

## Verification

- `user-web` production build: passed.
- Playwright DOM smoke on local dev server `http://127.0.0.1:5175`: passed.
  - `/moneybank/intro/advpay`: `.react-legacy-intro .descriptionBox` found.
  - Moneybank intro image loaded from `/resources/rudicks/img/sub/moneybank-img01.png`.
  - `/board/notice/index`: `.react-legacy-board .boardList table.list` found.
  - `/board/notice/demo`: `.react-legacy-detail-panel` content area found.
  - `/board/qa/demo`: `.react-legacy-reply-panel` found.
  - Browser page errors: none.
- Cloudflare static bundle build: passed.
- Cloudflare static bundle smoke: passed.

## Conservative Progress

- User-page legacy UI restoration after Batch 1: about 20%.
- After Batch 2: about 35%.
- After Batch 3: about 50%.

This is a conservative estimate. Main shell, main page, login, tabs, board list, intro, and board detail representative formats are now migrated. Remaining user-page work still includes broader table/search/form coverage, mobile visual tuning, focused E2E, and production deployment verification.

## Remaining Batches

- Batch 4: expand legacy common format to search/table/form/mypage screens.
- Batch 5: mobile and page-level visual tuning, focused E2E, Cloudflare/API preflight, production deployment readiness.

## Next Step

- Start Batch 4 after user approval.
