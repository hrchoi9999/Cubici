import { expect, test } from '../../../admin-web/node_modules/@playwright/test/index.mjs';

const targetUrl = process.env.CUBICI_M1_CANDIDATE_URL ?? 'http://127.0.0.1:4310/';

test('M1-1 verifies and captures the restored authenticated PC main screen', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.addInitScript(() => {
    window.localStorage.setItem('cubiciUserAuth', JSON.stringify({
      access_token: 'visual-reference-token',
      token_type: 'Bearer',
      user: {
        user_no: 1,
        email: 'visual-reference@cubici.local',
        name: '홍길동',
        user_type: 'GENERAL',
      },
    }));
  });
  await page.route('**/v1/api/accounts/me/dashboard-summary', (route) => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({
      sales_total_amount: 123500000,
      settlement_total_amount: 123500000,
      moneybank_available_balance: 123500000,
      total_principal_amount: 123500000,
      total_repayment_amount: 123500000,
      activities: [
        { occurred_at: '2026-10-10T09:00:00', operation_type: 'PROVISION', amount: 520000, outstanding_balance: 11800000 },
        { occurred_at: '2026-10-09T09:00:00', operation_type: 'REPAYMENT', amount: 680000, outstanding_balance: 11800000 },
      ],
    }),
  }));

  await page.goto(targetUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  await expect(page.locator('.auth-main-shell')).toBeVisible();
  await expect(page.getByRole('heading', { name: '매출/정산 한눈에 보기' })).toBeVisible();
  await expect(page.getByText('머니뱅크 서비스 이용잔액')).toBeVisible();
  await expect(page.locator('.lv-auth-dashboard .data-in').filter({ hasText: '123,500,000' })).toHaveCount(5);
  await expect(page.locator('.lv-main-content .menu-list > li')).toHaveCount(4);
  await expect(page.locator('.pc-header')).toHaveCSS('background-color', 'rgb(0, 46, 110)');
  await expect(page.locator('.lv-auth-dashboard .col-item').first()).toHaveCSS('padding', '30px 50px');
  await expect(page.locator('.mainContents')).toHaveCSS('height', '740px');

  await page.screenshot({
    fullPage: true,
    path: '../docs/reference/lv-ui/work/USR-MAIN-AUTH-PC/candidate/candidate-react.png',
  });
});
