# Cubici Legacy UI Batch 4 Result

## Scope

- Target: user-web only.
- Backend/API: unchanged.
- Admin pages: excluded from this user-page batch.
- Goal: expand legacy common format coverage to search, table, form, and mypage representative screens.

## Changed Files

- `user-web/src/pages/CommercePages.jsx`
  - Replaced sales/returns/settlement search block with `LegacySearchPanel`.
  - Replaced result and calendar tables with `LegacyPanel` + legacy table wrappers.
- `user-web/src/pages/HomePages.jsx`
  - Replaced integrated info panels and inventory panels with `LegacyPanel` / `LegacySearchPanel`.
  - Fixed main inventory link to the actual route `/cubici/invento/index`.
- `user-web/src/pages/AccountPages.jsx`
  - Replaced mypage profile summary with `LegacyPanel`.
  - Replaced company, business, auth, charge, withdraw, and shop connection panels with `LegacyFormPanel`.
  - Converted nested mypage tables to inline legacy table wrappers.
- `user-web/src/styles/user-web.css`
  - Added shared table styling for `LegacyPanel` and inline legacy tables.
  - Added search note, form action, inline table, and mypage panel spacing rules.

## Verification

- `user-web` production build: passed.
- Playwright DOM smoke on local dev server `http://127.0.0.1:5175`: passed.
  - `/cubici/salesInfo/sales`: search panel and result table found.
  - `/cubici/calculateInfo/calendar`: calendar table panel found.
  - `/cubici/integratedInfo/tab1`: integrated info panel found.
  - `/cubici/invento/index`: inventory search and table panels found.
  - `/cubici/mypage/profile`: mypage base panel found.
  - `/cubici/mypage/companyInfo`: mypage form panel found.
  - Browser page errors: none.
- Cloudflare static bundle build: passed.
- Cloudflare static bundle smoke: passed.

## Conservative Progress

- User-page legacy UI restoration after Batch 1: about 20%.
- After Batch 2: about 35%.
- After Batch 3: about 50%.
- After Batch 4: about 70%.

This is conservative. The main repeated user-page formats are now covered: shell, main, login, tabs, board list, intro, board detail, search, table, form, and mypage. Remaining work is mostly mobile behavior, page-level spacing, visual comparison, focused E2E, and production deployment readiness.

## Remaining Batch

- Batch 5: mobile and page-level visual tuning, focused E2E, Cloudflare/API preflight, production deployment readiness.

## Next Step

- Start Batch 5 after user approval.
