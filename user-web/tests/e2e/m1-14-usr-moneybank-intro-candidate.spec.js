import { expect, test } from '../../../admin-web/node_modules/@playwright/test/index.mjs';

const baseUrl = process.env.CUBICI_M1_MONEYBANK_INTRO_URL ?? 'http://127.0.0.1:4310';
const variants = [
  {
    key: 'ADVPAY',
    path: '/moneybank/intro/advpay',
    title: '구매자금 선지급 서비스',
    headline: '5백만원에서 5천만원까지 필요한 만큼',
    itemCount: 4,
    requestHref: '/moneybank/advPay/request',
  },
  {
    key: 'ADVCALC',
    path: '/moneybank/intro/advcalc',
    title: '쇼핑몰매출 선정산 서비스',
    headline: '운영하고 있는 쇼핑몰만 등록하면 끝',
    itemCount: 5,
    requestHref: '/moneybank/advcalc/request',
  },
  {
    key: 'CREDIT',
    path: '/moneybank/intro/creditpay',
    title: '소상공인 신용대출',
    headline: '100% 비대면기반 완벽 신용대출!',
    itemCount: 4,
    requestHref: '/moneybank/request',
  },
];

test('M1-14 verifies all LV moneybank intro states on PC', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });

  for (const [index, variant] of variants.entries()) {
    await page.goto(`${baseUrl}${variant.path}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);

    await expect(page.locator('.final-moneybank-intro-page')).toBeVisible();
    await expect(page.locator('.react-final-sub-visual .visual-tit')).toHaveText('머니뱅크');
    await expect(page.locator('.react-final-sub-visual .visual-desc')).toHaveCount(0);
    await expect(page.locator('.react-final-tabs .sub-nav > li').first()).toHaveClass(/active/);
    await expect(page.locator('.bank-info li')).toHaveCount(4);
    await expect(page.locator('.final-moneybank-intro-page .tab li').nth(index)).toHaveClass(/active/);
    await expect(page.locator('.tit-card .tit')).toHaveText(variant.title);
    await expect(page.locator('.icon-card .item-tit').first()).toHaveText(variant.headline);
    await expect(page.locator('.wrap-type-1 > .item')).toHaveCount(variant.itemCount);
    await expect(page.locator('.panel .wide-btn')).toHaveAttribute('href', variant.requestHref);
    await expect(page.locator('.sec-1 .figure img')).toHaveJSProperty('complete', true);

    if (variant.key === 'ADVCALC') {
      await expect(page.locator('.u14-shop-logos img')).toHaveCount(3);
    }

    const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(pageOverflow).toBeLessThanOrEqual(1);
    await page.screenshot({
      fullPage: true,
      path: `../docs/reference/lv-ui/work/USR-MONEYBANK-INTRO-${variant.key}-PC/candidate/candidate-react.png`,
    });
  }
});

test('M1-14 captures responsive moneybank intro states without page overflow', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 2 });
  const page = await context.newPage();

  for (const [index, variant] of variants.entries()) {
    await page.goto(`${baseUrl}${variant.path}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);

    await expect(page.locator('.mobile-header')).toBeVisible();
    await expect(page.locator('.final-moneybank-intro-page .tab li').nth(index)).toHaveClass(/active/);
    await expect(page.locator('.mobile-gnb li').nth(4)).toHaveClass(/active/);
    await expect(page.locator('.tit-card .tit')).toHaveText(variant.title);
    const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(pageOverflow).toBeLessThanOrEqual(1);

    await page.screenshot({
      fullPage: true,
      path: `../docs/reference/lv-ui/work/USR-MONEYBANK-INTRO-${variant.key}-MOBILE/candidate/candidate-react.png`,
    });
  }

  await context.close();
});
