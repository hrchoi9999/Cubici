import { expect, test } from '../../../admin-web/node_modules/@playwright/test/index.mjs';

const baseUrl = process.env.CUBICI_M1_USER_URL ?? 'http://127.0.0.1:4310';
const session = {
  access_token: 'uc01-header-token',
  token_type: 'Bearer',
  user: {
    user_no: 101,
    email: 'header@cubici.test',
    name: '홍길동',
    user_type: 'USER',
  },
};

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

test('UC01 preserves the approved public, login, and authenticated PC header states', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await installMocks(page);
  await page.goto(`${baseUrl}/main`, { waitUntil: 'networkidle' });

  const header = page.locator('.react-final-header');
  await expect(header.locator('.pc-header')).toHaveCSS('background-color', 'rgb(0, 46, 110)');
  await expect(header.locator('.pc-header .gnb > li')).toHaveCount(5);
  await expect(header.getByRole('link', { name: '로그인' })).toBeVisible();
  await expect(header.getByRole('link', { name: '회원가입' })).toBeVisible();
  await page.screenshot({ clip: { x: 0, y: 0, width: 1920, height: 90 }, path: '../docs/reference/lv-ui/work/USR-COMMON-HEADER-PC-PUBLIC/candidate/candidate-react.png' });

  await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle' });
  await expect(header.locator('.pc-header')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(header.locator('.login-user-icon')).toBeVisible();
  await page.screenshot({ clip: { x: 0, y: 0, width: 1920, height: 90 }, path: '../docs/reference/lv-ui/work/USR-COMMON-HEADER-PC-LOGIN/candidate/candidate-react.png' });

  await page.evaluate((value) => window.localStorage.setItem('cubiciUserAuth', JSON.stringify(value)), session);
  await page.goto(`${baseUrl}/main`, { waitUntil: 'networkidle' });
  const pcHeader = header.locator('.pc-header');
  await expect(pcHeader.getByText('홍길동')).toBeVisible();
  await expect(pcHeader.getByRole('button', { name: '로그아웃' })).toBeVisible();
  await expect(pcHeader.getByRole('link', { name: '마이페이지' })).toBeVisible();
  await expect(pcHeader.locator('.logo img')).toBeVisible();
  await expect(pcHeader.locator('.nav')).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ clip: { x: 0, y: 0, width: 1920, height: 90 }, path: '../docs/reference/lv-ui/work/USR-COMMON-HEADER-PC-AUTH/candidate/candidate-react.png' });

  await header.locator('.pc-header .nav').hover();
  await expect(header.locator('.pc-header')).toHaveClass(/active/);
  await expect(header.locator('.pc-header .lnb').first()).toHaveCSS('height', '250px');
  await expect(header.locator('.pc-header .gnb > li').last().locator('.dep-02 > li')).toHaveCount(5);
  await expect(header.locator('.pc-header').getByRole('link', { name: '블로그' })).toHaveAttribute('href', 'https://blog.naver.com/cubici2020');
  await page.screenshot({ clip: { x: 0, y: 0, width: 1920, height: 340 }, path: '../docs/reference/lv-ui/work/USR-COMMON-HEADER-PC-OPEN/candidate/candidate-react.png' });
});

test('UC01 activates the correct PC menu for detail, derived, and legacy mobile routes', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await installMocks(page);
  await setAuthenticatedSession(page);
  const cases = [
    ['/moneybank/current/MB-UC01', '머니뱅크'],
    ['/board/notice/NOTICE-UC01', '고객지원'],
    ['/m/cubici/infoIntegrated/tab2', '통합정보'],
  ];

  for (const [path, expectedGroup] of cases) {
    await page.goto(`${baseUrl}${path}`, { waitUntil: 'domcontentloaded' });
    const activeGroups = page.locator('.pc-header .gnb > li.active');
    await expect(activeGroups).toHaveCount(1);
    await expect(activeGroups.locator('.dep-01')).toContainText(expectedGroup);
  }
});

test('UC01 keeps the mobile header and drawer state responsive and route-aware', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await installMocks(page);
  await page.goto(`${baseUrl}/board/faq/FAQ-UC01`, { waitUntil: 'domcontentloaded' });

  const header = page.locator('.react-final-header');
  const openButton = header.getByRole('button', { name: '전체 메뉴 열기' });
  await expect(header.locator('.mobile-header')).toBeVisible();
  await expect(header.locator('.pc-header')).toBeHidden();
  await expect(header.locator('.mobile-header .login-info a')).toHaveAttribute('href', '/login');
  await expect(openButton).toHaveAttribute('aria-expanded', 'false');
  await header.locator('.mobile-header .logo-wrap').screenshot({ path: '../docs/reference/lv-ui/work/USR-COMMON-HEADER-MOBILE-CLOSED/candidate/candidate-react.png' });

  await openButton.click();
  await expect(openButton).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('body')).toHaveClass(/fixed/);
  await expect(header.locator('.m-nav')).toHaveCSS('top', '0px');
  const activeMobileGroup = header.locator('.m-nav .gnb > li.active .dep-01');
  await expect(activeMobileGroup).toContainText('고객지원');
  await expect(activeMobileGroup).toBeInViewport();
  const activeMobileLinks = header.locator('.m-nav .gnb > li.active .dep-02 a');
  await expect(activeMobileLinks).toHaveCount(5);
  await expect(activeMobileLinks.last()).toHaveAttribute('href', 'https://blog.naver.com/cubici2020');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.screenshot({ path: '../docs/reference/lv-ui/work/USR-COMMON-HEADER-MOBILE-DRAWER/candidate/candidate-react.png' });

  await header.getByRole('button', { name: '전체 메뉴 닫기' }).click();
  await expect(openButton).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('body')).not.toHaveClass(/fixed/);

  await openButton.click();
  await page.setViewportSize({ width: 1200, height: 800 });
  await expect(page.locator('body')).not.toHaveClass(/fixed/);
  await expect(header).not.toHaveClass(/mo-open/);
});

test('UC01 clears the session and returns to the public main after logout', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await installMocks(page);
  await setAuthenticatedSession(page);
  await page.goto(`${baseUrl}/cubici/integratedInfo/tab1`, { waitUntil: 'domcontentloaded' });
  await page.locator('.pc-header').getByRole('button', { name: '로그아웃' }).click();

  await expect(page).toHaveURL(`${baseUrl}/main`);
  expect(await page.evaluate(() => window.localStorage.getItem('cubiciUserAuth'))).toBeNull();
  await expect(page.locator('.pc-header').getByRole('link', { name: '로그인' })).toBeVisible();
  await expect(page.locator('.pc-header').getByRole('link', { name: '회원가입' })).toBeVisible();
});
