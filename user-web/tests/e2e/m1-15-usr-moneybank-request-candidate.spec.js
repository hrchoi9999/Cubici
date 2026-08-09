import { expect, test } from '../../../admin-web/node_modules/@playwright/test/index.mjs';

const baseUrl = process.env.CUBICI_M1_MONEYBANK_REQUEST_URL ?? 'http://127.0.0.1:4310';
const session = {
  token_type: 'Bearer',
  access_token: 'm1-15-user-token',
  expires_in: 3600,
  user: {
    user_no: 115,
    email: 'lv-moneybank@cubici.test',
    user_type: 'USER',
    name: 'LV 회원',
    biz_name: 'LV 온라인상사',
    biz_num: '123-45-67890',
  },
};
const variants = [
  { key: 'ADVPAY', path: '/moneybank/advPay/request', serviceName: '구매자금 선지급', hasB2b: true },
  { key: 'ADVCALC', path: '/moneybank/advcalc/request', serviceName: '매출 선정산', hasB2b: false },
];

async function installMocks(page) {
  await page.addInitScript((auth) => {
    window.localStorage.setItem('cubiciUserAuth', JSON.stringify(auth));
  }, session);
  await page.route('**/v1/api/**', async (route) => {
    const url = new URL(route.request().url());
    let body = {};
    if (url.pathname.endsWith('/accounts/me/shops')) {
      body = {
        total: 3,
        items: [
          { id: 1, user_no: 115, shop_type: 'COUPANG', shop_id: 'lv-coupang', status: 'Y', del_yn: 'N' },
          { id: 2, user_no: 115, shop_type: 'NAVER', shop_id: 'lv-naver', status: 'Y', del_yn: 'N' },
          { id: 3, user_no: 115, shop_type: 'STREET11', shop_id: 'lv-11st', status: 'Y', del_yn: 'N' },
        ],
      };
    } else if (url.pathname.endsWith('/contracts')) {
      body = { limit: 5, offset: 0, total: 0, items: [] };
    }
    await route.fulfill({ contentType: 'application/json', status: 200, body: JSON.stringify(body) });
  });
}

test('M1-15 verifies LV moneybank request structure and retained validation on PC', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await installMocks(page);

  for (const variant of variants) {
    await page.goto(`${baseUrl}${variant.path}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);

    await expect(page.locator('.moneybank-shell')).toBeVisible();
    await expect(page.locator('.react-final-sub-visual .visual-tit')).toHaveText('머니뱅크');
    await expect(page.locator('.react-final-tabs .sub-nav > li').nth(1)).toHaveClass(/active/);
    await expect(page.locator('.app-step .step li').first()).toHaveClass(/active/);
    await expect(page.locator('.u15-member-table label')).toHaveCount(4);
    await expect(page.locator('.u15-service-block')).toContainText(`${variant.serviceName} 서비스 신청`);
    await expect(page.locator('.u15-form-section')).toHaveCount(4);
    await expect(page.locator('.shop-checks label')).toHaveCount(3);
    await expect(page.locator('.shop-checks img')).toHaveCount(3);
    expect(await page.locator('.shop-checks img').evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0))).toBe(true);
    await expect(page.getByLabel('정산계좌 은행')).toBeVisible();
    await expect(page.locator('.file-grid input[type="file"]')).toHaveCount(5);

    if (variant.hasB2b) {
      await expect(page.getByLabel('B2B몰 ID')).toBeVisible();
      await expect(page.getByLabel('희망 선지급 한도')).toBeVisible();
      await expect(page.locator('.clause-links')).toHaveCount(0);
    } else {
      await expect(page.getByLabel('B2B몰 ID')).toHaveCount(0);
      await expect(page.locator('.clause-links a')).toHaveCount(4);
    }

    const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(pageOverflow).toBeLessThanOrEqual(1);
    await page.screenshot({
      fullPage: true,
      path: `../docs/reference/lv-ui/work/USR-MONEYBANK-REQUEST-${variant.key}-PC/candidate/candidate-react.png`,
    });

    await page.getByLabel('본인확인 생년월일').fill('900101');
    await page.getByLabel('주민등록증 발급정보').fill('1234');
    await page.getByRole('button', { name: '본인확인 mock 실행' }).click();
    await expect(page.locator('.identity-verification-panel')).toContainText('mock 완료');
    await page.getByText('머니뱅크 신청 약관에 동의합니다.').click();
    await page.getByRole('button', { name: variant.hasB2b ? '구매자금 선지급 신청' : '선정산 신청' }).click();
    await expect(page.locator('.submit-message').last()).toContainText(variant.hasB2b ? 'B2B몰' : '계좌 정보');

  }
});

test('M1-15 captures responsive moneybank request states without page overflow', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  await installMocks(page);

  for (const variant of variants) {
    await page.goto(`${baseUrl}${variant.path}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);

    await expect(page.locator('.mobile-header')).toBeVisible();
    await expect(page.locator('.mobile-gnb li').nth(4)).toHaveClass(/active/);
    await expect(page.locator('.u15-member-table label')).toHaveCount(4);
    await expect(page.locator('.u15-form-section')).toHaveCount(4);
    await expect(page.locator('.shop-checks label')).toHaveCount(3);
    expect(await page.locator('.shop-checks img').evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0))).toBe(true);
    const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(pageOverflow).toBeLessThanOrEqual(1);

    await page.screenshot({
      fullPage: true,
      path: `../docs/reference/lv-ui/work/USR-MONEYBANK-REQUEST-${variant.key}-MOBILE/candidate/candidate-react.png`,
    });
  }

  await context.close();
});
