# User Web Source

```text
src/
  App.jsx                    # route dispatcher only
  pages/
    AccountPages.jsx         # login, signup, mypage, shop account
    CommercePages.jsx        # sales, returns, settlements
    HomePages.jsx            # main/dashboard entry
    MoneybankPages.jsx       # moneybank intro, request, current, contract detail
    SupportPages.jsx         # notice, faq, qna, charge
  shared/
    UserCore.jsx             # API helpers, auth session, layout, common components
  styles/
    user-web.css
```

## Parallel Work Boundaries

- Account/MyPage work should stay in `pages/AccountPages.jsx`.
- Sales/Settlement work should stay in `pages/CommercePages.jsx`.
- Moneybank work should stay in `pages/MoneybankPages.jsx`.
- Support/Billing work should stay in `pages/SupportPages.jsx`.
- Shared helpers in `shared/UserCore.jsx` should be changed only when multiple pages need the same behavior.

## Verification Gate

- 1st pass: user-web production build.
- 2nd pass: user Playwright DB E2E suite.
