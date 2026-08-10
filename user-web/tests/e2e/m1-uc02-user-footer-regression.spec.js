import { expect, test } from '../../../admin-web/node_modules/@playwright/test/index.mjs';

const baseUrl = process.env.CUBICI_M1_USER_URL ?? 'http://127.0.0.1:4310';
const session = {
  access_token: 'uc02-footer-token',
  token_type: 'Bearer',
  user: {
    user_no: 102,
    email: 'footer@cubici.test',
    name: '홍길동',
    user_type: 'USER',
  },
};

const publicPcRoutes = ['/main', '/login', '/mainSignUp'];
const authenticatedPcRoutes = [
  '/main',
  '/cubici/integratedInfo/tab1',
  '/cubici/salesInfo/sales',
  '/cubici/calculateInfo/calendar',
  '/moneybank/intro/advpay',
  '/moneybank/advPay/request',
  '/moneybank/current',
  '/board/notice/index',
  '/board/qa/index',
  '/board/faq/index',
  '/cubici/mypage/companyInfo',
  '/chargeInfo',
  '/board/notice/UC02',
  '/uc02-not-found',
];

async function installMocks(page) {
  await page.route('**/v1/api/**', (route) => route.fulfill({
    contentType: 'application/json',
    status: 200,
    body: JSON.stringify({ items: [], total: 0 }),
  }));
}

async function expectApprovedFooter(page) {
  const footer = page.locator('#Footer.footer-wrap');
  await expect(footer).toBeVisible();
  await expect(footer).toHaveCSS('background-color', 'rgb(0, 46, 110)');
  await expect(footer).toHaveCSS('padding', '32px 0px');
  await expect(footer.locator('.footer-logo')).toBeHidden();
  await expect(footer.locator('.footer-txt')).toHaveCSS('padding-left', '90px');
  await expect(footer.locator('.desc')).toHaveCSS('text-align', 'left');
  await expect(footer.getByText('AI 기반의 공급망 금융 서비스 큐빅아이', { exact: true })).toBeVisible();
  await expect(footer.locator('.address li')).toHaveCount(5);
  await expect(footer.getByText('(주)한국공급망데이터', { exact: true })).toBeVisible();
  await expect(footer.getByText('02-6925-6373', { exact: true })).toBeVisible();
  await expect(footer.getByRole('link', { name: 'admin@koreascf.com' })).toHaveAttribute('href', 'mailto:admin@koreascf.com');
  await expect(footer.getByText('412-87-03180', { exact: true })).toBeVisible();
  await expect(footer.getByText('서울시 강동구 올림픽로 752, 5층', { exact: true })).toBeVisible();
  await expect(footer).not.toContainText('서비스 소개');
  await expect(footer).not.toContainText('통신판매업 신고번호');
  await expect(footer).not.toContainText('Copyright');

  const layout = await footer.evaluate((node) => {
    const rect = node.getBoundingClientRect();
    return {
      right: rect.right,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    };
  });
  expect(layout.right).toBeLessThanOrEqual(layout.clientWidth + 1);
  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth + 1);
}

test('UC02 keeps the approved footer contract across public and authenticated PC routes', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await installMocks(page);

  for (const route of publicPcRoutes) {
    await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded' });
    await expectApprovedFooter(page);
  }

  await page.evaluate((value) => window.localStorage.setItem('cubiciUserAuth', JSON.stringify(value)), session);
  for (const route of authenticatedPcRoutes) {
    await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded' });
    await expectApprovedFooter(page);
  }

  await page.goto(`${baseUrl}/main`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const footer = page.locator('#Footer.footer-wrap');
  await footer.scrollIntoViewIfNeeded();
  await footer.screenshot({ path: '../docs/reference/lv-ui/work/USR-COMMON-FOOTER-PC/candidate/candidate-react.png' });
});

test('UC02 hides the desktop footer on mobile routes without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await installMocks(page);
  await page.goto(`${baseUrl}/main`, { waitUntil: 'domcontentloaded' });
  await page.evaluate((value) => window.localStorage.setItem('cubiciUserAuth', JSON.stringify(value)), session);

  const routes = [
    '/main',
    '/cubici/integratedInfo/tab1',
    '/cubici/salesInfo/sales',
    '/moneybank/intro/advpay',
    '/board/notice/index',
    '/uc02-not-found',
  ];
  for (const route of routes) {
    await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#Footer.footer-wrap')).toBeHidden();
    await expect(page.locator('.mobile-gnb-wrap')).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  }
});
