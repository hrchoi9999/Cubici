# Cubici 240130 UI Migration Batch 2

## Batch Scope

Batch 2 objective: add the 240130 final publishing assets and style foundation to `user-web` without changing page runtime behavior yet.

## Changes

Added final UI static assets:

- `D:\Cubici_Integration_20260730\user-web\public\final-ui\static`

Copied from:

- `D:\Cubici_Integration_20260730\240130_큐빅아이\static`

Asset verification:

- Source files: 287
- Copied files: 287
- Source size: 24,354,554 bytes
- Copied size after font CSS normalization: 24,353,859 bytes

Added CSS foundation loader:

- `D:\Cubici_Integration_20260730\user-web\src\styles\final-ui-foundation.css`

Connected loader:

- `D:\Cubici_Integration_20260730\user-web\src\main.jsx`

Loaded final UI CSS through a low-priority cascade layer:

- `fonts.css`
- `reset.css`
- `common.css`
- `table.css`
- `style-main.css`
- `style-sub.css`
- `modal.css`

Deferred:

- `jquery-ui.css` was not globally loaded in Batch 2 because the source CSS references `/images/jquery-ui-images/*`, but that folder is not included in the 240130 package. It should be handled with the calendar/date picker migration batch if needed.

Adjusted copied font CSS only:

- `public/final-ui/static/fonts/notosansKR/notosansKR.css`
- `public/final-ui/static/fonts/SUIT/SUIT.css`

Reason:

- Removed fallback references to font files that are not present in the 240130 package.
- Original 240130 source folder was not modified.

## Validation

Build:

- Command: `vite.CMD build` with bundled Node in PATH
- Result: passed

Dist asset copy:

- `dist/final-ui/static` contains 287 files
- Size: 24,353,859 bytes

Focused browser smoke against built `dist`:

- `/`: passed
- `/login`: passed
- `/moneybank/intro/advpay`: passed
- `/board/notice/index`: passed

Smoke criteria:

- React root exists
- Page renders text content
- No non-API failed browser requests detected

Known build warnings:

- Existing older rudicks `/resources/...` references still warn during build.
- These warnings pre-existed the final UI migration path and were not introduced by `/final-ui/static`.
- They should be cleaned up later when old rudicks dependencies are removed.

## Implementation Notes

- The final UI CSS is loaded in `@layer cubici-final-source` to avoid immediately overriding current unlayered `user-web.css` behavior.
- This makes final UI classes available for upcoming component migration while reducing the risk of breaking current deployed screens before Batch 3+.
- Later batches can progressively replace current markup with 240130 class names, then remove old rudicks imports.

## Progress

User-facing 240130 final-source UI migration:

- Batch 1 source/route mapping: complete
- Batch 2 asset/style foundation: complete
- Runtime page migration: not started
- Conservative total progress: 18%

Remaining batches:

- Batch 3: common shell
- Batch 4: main/login/signup
- Batch 5: core dashboard/sub pages
- Batch 6: moneybank
- Batch 7: support/account pages
- Batch 8: mobile pass
- Batch 9: regression/release
