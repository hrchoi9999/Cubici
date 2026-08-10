import { expect, test } from '../../../admin-web/node_modules/@playwright/test/index.mjs';

const baseUrl = process.env.CUBICI_M1_USER_URL ?? 'http://127.0.0.1:4310';
const session = {
  access_token: 'uc03-mobile-gnb-token',
  token_type: 'Bearer',
  user: {
    user_no: 103,
    email: 'mobile-gnb@cubici.test',
    name: '홍길동',
    user_type: 'USER',
  },
};

const expectedLinks = [
  '/',
  '/cubici/integratedInfo/tab1',
  '/cubici/salesInfo/sales',
  '/cubici/calculateInfo/calendar',
  '/moneybank/intro/advpay',
  '/board/notice/index',
];

async function installMocks(page) {
  await page.route('**/v1/api/**', (route) => route.fulfill({
    contentType: 'application/json',
    status: 200,
    body: JSON.stringify({ items: [], total: 0 }),
  }));
}

async function setAuthenticatedSession(page) {
  await page.goto(`${baseUrl}/main`, { waitUntil: 'domcontentloaded' });
  await page.evaluate((value) => window.localStorage.setItem('cubiciUserAuth', JSON.stringify(value)), session);
}

async function expectStableMobileGnb(page, activeIndex) {
  const gnb = page.locator('.mobile-gnb-wrap');
  const items = gnb.locator('li');
  await expect(gnb).toBeVisible();
  await expect(items).toHaveCount(6);

  const hrefs = await gnb.locator('a').evaluateAll((anchors) => anchors.map((anchor) => anchor.getAttribute('href')));
  expect(hrefs).toEqual(expectedLinks);

  if (activeIndex === -1) {
    await expect(gnb.locator('li.active')).toHaveCount(0);
  } else {
    await expect(gnb.locator('li.active')).toHaveCount(1);
    await expect(items.nth(activeIndex)).toHaveClass(/active/);
    await expect(items.nth(activeIndex).locator('.icon')).toHaveCSS('background-color', 'rgb(78, 81, 128)');
  }

  const geometry = await items.evaluateAll((nodes) => nodes.map((node) => {
    const box = node.getBoundingClientRect();
    return { left: box.left, right: box.right, width: box.width };
  }));
  const viewportWidth = page.viewportSize().width;
  expect(geometry.every((box) => box.width > 0 && box.left >= -1 && box.right <= viewportWidth + 1)).toBeTruthy();
  expect(geometry.every((box, index) => index === 0 || box.left >= geometry[index - 1].right - 1)).toBeTruthy();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

test('UC03 keeps all six LV GNB items and activates their original slots', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await installMocks(page);
  await setAuthenticatedSession(page);

  const cases = [
    ['/main', 0],
    ['/m/cubici/infoIntegrated/tab2', 1],
    ['/cubici/salesInfo/sales', 2],
    ['/cubici/calculateInfo/calendar', 3],
    ['/moneybank/current', 4],
    ['/board/notice/NOTICE-UC03', 5],
    ['/cubici/mypage/companyInfo', -1],
  ];

  for (const [path, activeIndex] of cases) {
    await page.goto(`${baseUrl}${path}`, { waitUntil: 'domcontentloaded' });
    await expectStableMobileGnb(page, activeIndex);
  }

  await page.goto(`${baseUrl}/main`, { waitUntil: 'networkidle' });
  await page.locator('.mobile-gnb-wrap').screenshot({
    path: '../docs/reference/lv-ui/work/USR-COMMON-MOBILE-GNB-HOME/candidate/candidate-react.png',
  });

  await page.goto(`${baseUrl}/board/notice/NOTICE-UC03`, { waitUntil: 'domcontentloaded' });
  await page.locator('.mobile-gnb-wrap').screenshot({
    path: '../docs/reference/lv-ui/work/USR-COMMON-MOBILE-GNB-CUSTOMER/candidate/candidate-react.png',
  });
});

test('UC03 keeps the LV GNB responsive at its 768px breakpoint', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await installMocks(page);
  await setAuthenticatedSession(page);
  await page.goto(`${baseUrl}/moneybank/current`, { waitUntil: 'domcontentloaded' });
  await expectStableMobileGnb(page, 4);
});

test('UC03 keeps the full mobile menu route-aware and complete', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await installMocks(page);
  await page.goto(`${baseUrl}/board/faq/FAQ-UC03`, { waitUntil: 'domcontentloaded' });

  const header = page.locator('.react-final-header');
  await header.getByRole('button', { name: '전체 메뉴 열기' }).click();
  await expect(header.locator('.m-nav')).toHaveCSS('top', '0px');
  await expect(header.locator('.m-nav .gnb > li')).toHaveCount(6);
  const activeGroup = header.locator('.m-nav .gnb > li.active');
  await expect(activeGroup.locator('.dep-01')).toContainText('고객지원');
  await expect(activeGroup.locator('.dep-01')).toBeVisible();
  await expect(activeGroup.locator('.dep-02 a')).toHaveCount(5);
  await expect(activeGroup.locator('.dep-02 a').first()).toBeVisible();
  await expect(header.locator('.m-nav').getByRole('link', { name: '블로그' })).toHaveAttribute('href', 'https://blog.naver.com/cubici2020');
  const activeButtonBounds = await activeGroup.locator('.dep-01 > span').boundingBox();
  const mobileNavBounds = await header.locator('.m-nav').boundingBox();
  expect(activeButtonBounds.x).toBeGreaterThanOrEqual(mobileNavBounds.x);
  expect(activeButtonBounds.x + activeButtonBounds.width).toBeLessThanOrEqual(mobileNavBounds.x + 110);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  await page.screenshot({
    path: '../docs/reference/lv-ui/work/USR-COMMON-MOBILE-MENU/candidate/candidate-react.png',
  });

  await header.locator('.m-nav .gnb > li').nth(2).locator('.dep-01').click();
  await expect(header.locator('.m-nav .gnb > li.active')).toHaveCount(1);
  await expect(header.locator('.m-nav .gnb > li.active .dep-01')).toContainText('정산정보');
  await expect(header.locator('.m-nav .gnb > li.active .dep-02 a')).toHaveCount(2);
});
