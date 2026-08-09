# Cubici 240130 UI Migration Batch Plan

## Goal

Apply `D:\Cubici_Integration_20260730\240130_큐빅아이` as the primary UI/UX source for `cubici.co.kr` while keeping the current React/FastAPI architecture.

## Scope Boundary

The 240130 source appears to be the user/customer-facing Cubici site publishing package. It includes main, login, signup, service, moneybank, support, mobile navigation, and account-related user pages.

Admin UI/UX is part of the overall Cubici project scope, but it is not directly covered by the 240130 source unless a separate admin publishing/design package is provided. Admin work should therefore be planned as a separate admin batch after the user-facing 240130 migration baseline is established, or handled in parallel only if final admin UI source is supplied.

## Batch Plan

| Batch | Scope | Main Work | Validation | Output |
|---|---|---|---|---|
| Batch 1 | Source baseline | Map 240130 HTML pages to current React routes/components; classify common layout, main, sub, mobile, modal assets | Static source inventory and route map review | Migration map and component list |
| Batch 2 | Asset/style foundation | Import 240130 fonts/images/CSS tokens; create React-compatible legacy-final style layer; remove old rudicks dependency where replaced | Frontend build, visual smoke on main/login/sub | Shared CSS/assets ready |
| Batch 3 | Common shell | Rebuild user header, footer, mobile bottom nav, mobile menu, auth-aware header states | Desktop/mobile route smoke | Common UX frame applied |
| Batch 4 | Main/login pages | Rebuild `index`, `index-login`, `login`, signup entry states from 240130 source; fix JPG-equivalent initial states | Main/login focused Playwright screenshots | Main experience migrated |
| Batch 5 | Core dashboard/sub pages | Migrate c1/c2/c3 pages: 통합정보, 매출정보, 정산정보, 정산캘린더/상세 layouts | Focused route screenshot and API fixture smoke | Core service pages migrated |
| Batch 6 | Moneybank | Migrate c4 pages; correct modal hidden-by-default and initial tab state; preserve current API/auth behavior | Moneybank focused screenshots and route guard check | Moneybank pages migrated |
| Batch 7 | Support/account pages | Migrate c5/c6 pages, notices, Q&A, FAQ, 가입정보, 마이페이지-related UI | Focused screenshots and form-state smoke | Remaining user pages migrated |
| Batch 8 | Mobile pass | Tune 720px/375px responsive states against 231130 JPG and 240130 CSS | Mobile Playwright screenshots | Mobile UX aligned |
| Batch 9 | Regression/release | Full user route smoke, protected route check, production build, Cloudflare deployment | Build, smoke, production checks | Deployment candidate/release |

## Key Decisions

- Backend changes are not planned for UI migration unless a page lacks the current API contract.
- The 240130 source is newer than the 231130 JPGs, but JPG-equivalent initial states should be restored where the source has demo-state issues.
- Known source-state fixes:
  - Hide moneybank join modal by default.
  - Initialize `c4p1` to `tab1` instead of visible `tab3`.
  - Decide per page whether 24.01 text revisions override 231130 JPG wording.

## Conservative Progress Baseline

- Current deployed UI migration based on older legacy/rudicks source: usable but visually superseded.
- 240130 final-source migration progress: 0% implemented, source review complete.
- Recommended next work: Batch 1 only.
