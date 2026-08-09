# Cubici 240130 UI Migration Batch 1

## Batch Scope

Batch 1 objective: map the 240130 final publishing source to the current React user-web routes/components and define the migration units for later implementation batches.

No runtime implementation was changed in this batch.

## Source Summary

240130 source path: `D:\Cubici_Integration_20260730\240130_큐빅아이`

Inventory:

- HTML files found: 35
- Site UI HTML targets: 31
- Excluded from user route migration: `url.html`, `mail/*.html`, `static/fonts/fontello/demo.html`
- CSS foundation: `reset.css`, `common.css`, `table.css`, `style-main.css`, `style-sub.css`, `modal.css`, `jquery-ui.css`
- JS behavior reference: `publishing.js`, `publishing-main.js`, `calendar.js`, Swiper, datepicker
- Image assets: 196 files in `static/img` (`135 png`, `32 svg`, `28 jpg`, `1 ico`)

## Current React Structure

Current user app entry: `D:\Cubici_Integration_20260730\user-web\src\App.jsx`

Current component groups:

- `shared/UserCore.jsx`: layout, header/footer, nav, tabs, panel/table helpers, API helpers
- `pages/HomePages.jsx`: main, integrated info, inventory
- `pages/AccountPages.jsx`: login, signup, id/password, mypage
- `pages/CommercePages.jsx`: sales, returns, settlements, calendar summary
- `pages/MoneybankPages.jsx`: intro, request, evaluate, contract, current, contract detail, clauses
- `pages/SupportPages.jsx`: notice, Q&A, FAQ, charge info
- `styles/user-web.css`: current user-web visual layer

## Route Mapping

| 240130 HTML | 240130 Screen | Current React Route | Current Component | Migration Action |
|---|---|---|---|---|
| `index.html` | 메인 로그인전 | `/`, `/main` | `MainPage` | Merge with auth-aware main state or split unauth view |
| `index-login.html` | 메인 로그인후 | `/`, `/main` after auth | `MainPage` | Add authenticated dashboard layout using 240130 main-wrap |
| `login.html` | 로그인 | `/login` | `LoginPage` | Replace markup/style, keep current login API |
| `회원가입_약관동의.html` | 회원가입 약관 | `/mainSignUp` | `SignupPage` | Split signup into step UI or render step state inside existing component |
| `회원가입_기본정보.html` | 회원가입 기본정보 | `/mainSignUp` | `SignupPage` | Map form fields to existing signup API payload |
| `회원가입_가입완료.html` | 가입완료 | after signup | `SignupPage` redirect/complete state | Add complete state screen |
| `c1p1.html` | 통합정보 당월현황 | `/cubici/integratedInfo/tab1` | `IntegratedInfoPage tab1` | Replace panel/table/card structure |
| `c1p2.html` | 통합정보 매출분석 | `/cubici/integratedInfo/tab2` | `IntegratedInfoPage tab2` | Replace chart/table shell; keep API aggregation |
| `c1p3.html` | 통합정보 상품분석 | `/cubici/integratedInfo/tab3` | `IntegratedInfoPage tab3` | Replace product analysis shell |
| `c2p1.html` | 매출정보 판매현황 | `/cubici/salesInfo/sales` | `SalesOrSettlementPage sales` | Replace filter/table/detail modal layout |
| `c2p2.html` | 매출정보 반품/교환 | `/cubici/salesInfo/return` | `SalesOrSettlementPage returns` | Replace filter/table/detail modal layout |
| `c3p1.html` | 정산정보 정산캘린더 | `/cubici/calculateInfo/calendar` | `SalesOrSettlementPage settlements calendar` | Build calendar UI from 240130 `c3p1` |
| `c3p2.html` | 정산정보 정산상세 | `/cubici/calculateInfo/details` | `SalesOrSettlementPage settlements` | Replace table/detail modal layout |
| `c4p1.html` | 머니뱅크 서비스소개 | `/moneybank/intro/advpay`, `/moneybank/intro/advcalc`, `/moneybank/intro/creditpay` | `MoneybankIntroPage` | Single page with tab state; fix initial `tab1` and modal hidden |
| `c4p2_1.html` | 머니뱅크 서비스신청 | `/moneybank/request`, `/moneybank/advPay/request`, `/moneybank/advcalc/request` | `RequestPage` | Replace form sections; keep validation/API |
| `c4p2_2.html` | 머니뱅크 검토 및 심사 | `/moneybank/advPay/evaluate`, `/moneybank/advcalc/evaluate` | `EvaluatePage` | Replace review/decision layout |
| `c4p3.html` | 머니뱅크 서비스현황 | `/moneybank/current` | `CurrentPage` | Replace status/table/card layout |
| `c5p2.html` | 고객지원 서비스공지 | `/board/notice/index` | `SupportBoardPage notice` | Replace board list shell |
| `c5p3.html` | 고객지원 Q&A | `/board/qa/index` | `SupportBoardPage qa` | Replace board list/write entry shell |
| `QnA-write.html` | Q&A 글쓰기 | `/board/qa/index` form state or `/board/qa/write` | `SupportBoardPage qa` | Add explicit write state/route alias if needed |
| `c5p4.html` | 고객지원 FAQ | `/board/faq/index` | `SupportBoardPage faq` | Replace FAQ accordion/list shell |
| `view.html` | 게시글 상세 | `/board/notice/:id`, `/board/faq/:id`, `/board/qa/:id` | `BoardDetailPage`, `InquiryDetailPage` | Reuse detail layout across board types |
| `c6p1.html` | 마이페이지 가입정보 | `/cubici/mypage/companyInfo` and profile | `MyPage`, `CompanyInfoPanel` | Replace profile/company info sections |
| `c6p2.html` | 마이페이지 쇼핑몰/API 정보 | `/cubici/mypage/businessInfo`, `/cubici/mypage/myAuth` | `MyPage`, `ShopConnectionPanel`, `AuthInfoPanel` | Replace forms/tables; preserve secret masking |
| `c6p3.html` | 마이페이지/머니뱅크 상세 및 modal samples | `/cubici/mypage/myCharge`, `/moneybank/current/:mbid` | `MyPage`, `ContractDetailPage` | Use as modal/detail component reference |
| `modal_view.html` | 모달 모음 | multiple current modal states | current inline panels/modals | Extract reusable modal components |
| `notfound.html` | 404 | fallback route | `NotReadyPage` | Replace current not-ready visual |
| `header.html` | PC/mobile header | all pages | `Layout/Header` | Replace common header |
| `footer.html` | footer | all pages | `Layout` footer | Replace common footer |
| `mobile-gnb.html` | mobile bottom nav | all mobile pages | currently missing equivalent | Add in `Layout` |

## Common Component Targets

| New React Component Target | Source Reference | Purpose |
|---|---|---|
| `FinalLayout` or updated `Layout` | `header.html`, `footer.html`, `mobile-gnb.html` | Common page shell |
| `FinalHeader` | `header.html` | Auth-aware nav, user menu, mobile menu button |
| `FinalFooter` | `footer.html` | Footer logo/company/service intro |
| `FinalMobileGnb` | `mobile-gnb.html` | Mobile bottom navigation |
| `FinalSubVisual` | `visual-wrap`, `visual-tit` blocks | Rounded subpage visual band |
| `FinalSubNav` | `sub-nav-wrap`, `sub-nav` | Section tabs/subnav |
| `FinalSearchForm` | `top-form`, `form-wrap`, `select-wrap` | Shared filter/search area |
| `FinalTable` | `basic-table`, `table-r-border`, `table-top` | Shared tables |
| `FinalModal` | `modal.css`, `modal_view.html`, page-local modal blocks | Reusable modal shell |
| `FinalMainPublic` | `index.html` | Public main state |
| `FinalMainAuthed` | `index-login.html` | Logged-in dashboard state |
| `FinalMoneybankIntro` | `c4p1.html` | Moneybank intro/tabs/process |
| `FinalSignupSteps` | `회원가입_*.html` | Signup terms/info/complete states |

## Known Source-State Fixes Before Implementation

- `c4p1.html`: add hidden default for `.modal-wrap.join`; show only from click state.
- `c4p1.html`: initialize visible service panel to `tab1`, because JPG reference and active tab are `구매자금 선지급`.
- `index-login.html`: decide whether to follow 231130 JPG two-column desktop layout or 240130 rendered CSS layout where quick cards flow below dashboard.
- Mobile dashboard labels differ between JPG and 240130 text comments. Use 240130 as source of truth unless user requests exact 231130 wording.
- `url.html` omits the URL for 정산캘린더, but `c3p1.html` exists and should map to `/cubici/calculateInfo/calendar`.
- `c1p1/c1p2/c1p3` comments say 통합정보, but the rendered visual title says 매출정보. Treat this as a source labeling defect; React nav should keep menu semantics from current routes.

## Recommended Batch 2 Starting Point

Batch 2 should not start by migrating individual pages. It should first create the shared asset/style foundation:

1. Copy 240130 static assets into `user-web/public/final-ui` or equivalent public path.
2. Add a final UI CSS entry that loads/reset-scopes `fonts.css`, `reset.css`, `common.css`, `table.css`, `style-main.css`, `style-sub.css`, `modal.css`.
3. Convert image/font relative paths or place assets so existing CSS paths resolve.
4. Run frontend build.
5. Render smoke pages for `/`, `/login`, `/moneybank/intro/advpay`, `/board/notice/index`.

## Batch 1 Validation

Validation performed:

- Enumerated 240130 HTML files with `rg --files`.
- Read `url.html` menu map.
- Read current `user-web/src/App.jsx` route map.
- Reviewed current page/component group files under `user-web/src/pages`.
- Reviewed common layout helpers in `user-web/src/shared/UserCore.jsx`.
- Reviewed 240130 CSS/image inventory.

No frontend build was required because Batch 1 did not change runtime code.

## Progress

User-facing 240130 final-source UI migration:

- Source review and mapping: complete
- Runtime implementation: not started
- Conservative total progress: 10%

Remaining batches:

- Batch 2: asset/style foundation
- Batch 3: common shell
- Batch 4: main/login/signup
- Batch 5: core dashboard/sub pages
- Batch 6: moneybank
- Batch 7: support/account pages
- Batch 8: mobile pass
- Batch 9: regression/release

