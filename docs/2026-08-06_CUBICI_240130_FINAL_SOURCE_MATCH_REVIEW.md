# Cubici 240130 UI/UX Source Match Review

## Scope

- Final publishing source: `D:\Cubici_Integration_20260730\240130_큐빅아이`
- Previously reviewed JPG references: `D:\Cubici\큐빅아이 231130 JPG`
- Review date: 2026-08-06

## Source Inventory

- HTML pages: 35
- CSS files: 22
- JavaScript files: 12
- Image files: 196 total in `static/img`
- Fonts: NanumSquare, NotoSansKR, SUIT, Fontello included

Key source files:

- Layout includes: `header.html`, `footer.html`, `mobile-gnb.html`
- Main/login: `index.html`, `index-login.html`, `login.html`
- User pages: `c1p1.html`, `c1p2.html`, `c1p3.html`, `c2p1.html`, `c2p2.html`, `c3p1.html`, `c3p2.html`, `c4p1.html`, `c4p2_1.html`, `c4p2_2.html`, `c4p3.html`, `c5p2.html`, `c5p3.html`, `c5p4.html`, `c6p1.html`, `c6p2.html`, `c6p3.html`
- Signup: `회원가입_약관동의.html`, `회원가입_기본정보.html`, `회원가입_가입완료.html`
- Shared assets: `static/css/common.css`, `style-main.css`, `style-sub.css`, `table.css`, `modal.css`, `static/img/**`, `static/fonts/**`

## Vendor Notes

`전달사항.txt` says:

- `수정  24.01.30으로 주석 했습니다.`
- `c3p1.html 생성`
- `js 폴더-> calendar.js생성`
- `modal.css/style-sub.css 수정 (주석없음)`

This indicates the folder is later than the 2023-11-30 JPG captures and includes 2024-01-30 publishing revisions.

## Match Result

Overall judgment: mostly matching final design lineage, but not a strict 1:1 copy of the 231130 JPG captures.

Confirmed matches:

- PC main hero, navy header, Cubici logo, blue finance/chart visual, footer style
- PC subpage header band, pill sub navigation, table/filter/chart design family
- Moneybank intro visual: rounded blue title band, people image, four circular process steps, pill service tabs
- Mobile header, bottom navigation, logged-in dashboard cards, slider, moneybank summary panel
- JPG screen set maps to concrete HTML pages in the 240130 source

Observed differences:

- `index-login.html`: 231130 JPG shows the main dashboard and right quick-service cards in a two-column layout. The 240130 rendered source places the quick-service cards below the dashboard at desktop width.
- `c4p1.html`: modal markup is visible by default because `.modal-wrap.join` is not initially hidden. For JPG-equivalent default page state, the modal should be hidden until a trigger click.
- `c4p1.html`: first tab button is active, but the visible panel is `tab3` because `tab1` and `tab2` have `d-none` while `tab3` does not. The JPG-visible `구매자금 선지급 서비스` content exists in `tab1`; React migration should set `tab1` as the initial visible panel.
- Several labels were revised after the JPG captures, for example `선정산 서비스 이용잔액` changed to `머니뱅크 서비스 이용잔액` in 24.01.23 comments.
- `c3p1.html` 정산캘린더 exists in the 240130 source but was not present as a separate 231130 JPG in the reviewed image folder.

## Render Check

Screenshots were generated under:

- `D:\Cubici_Integration_20260730\docs\240130_render_check`

Rendered pages:

- `pc_index.png`
- `pc_index_login.png`
- `pc_login.png`
- `pc_c4p1.png`
- `pc_c4p1_modal_closed.png`
- `pc_c4p1_jpg_state.png`
- `pc_c1p2.png`
- `pc_c5p2.png`
- `mobile_index_login.png`
- `mobile_menu.png`

## React Migration Implication

The 240130 folder should be treated as the primary UI/UX source for the next React migration batch.

Implementation notes:

- Use 240130 HTML/CSS/assets as source of truth for layout and component structure.
- Keep backend/FastAPI unchanged unless data contracts are missing.
- Convert default demo-state issues during React migration:
  - Hide modal components by default.
  - Initialize moneybank `c4p1` service tab to `tab1`.
  - Decide with the user whether 24.01 text/layout revisions override 231130 JPG wording.
- Do not use current deployed older rudicks design as the visual source once this migration starts.

