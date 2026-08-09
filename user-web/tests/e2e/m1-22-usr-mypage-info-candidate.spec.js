import { expect, test } from '../../../admin-web/node_modules/@playwright/test/index.mjs';

const baseUrl = process.env.CUBICI_M1_MYPAGE_URL ?? 'http://127.0.0.1:4310';
const sourceUrl = process.env.CUBICI_LV_SOURCE_URL ?? 'http://127.0.0.1:4311/c6p1.html';
const accessPath = '/cubici/mypage/profile';
const companyPath = '/cubici/mypage/companyInfo';
const baseUser = {
  user_no: 122,
  email: 'lv-mypage@cubici.test',
  user_type: 'USER',
  name: '홍길동',
  phone: '010-1234-5678',
  biz_name: 'LV 온라인상사',
  biz_num: '123-45-67890',
  biz_setup_date: '20240102',
  biz_type: 'GENERAL',
  sectors: '종합상품 셀러',
  partner_code: 'LV2401',
};
const session = {
  token_type: 'Bearer',
  access_token: 'm1-22-user-token',
  expires_in: 3600,
  user: baseUser,
};

async function installMocks(page) {
  const companyUpdates = [];
  await page.addInitScript((auth) => {
    window.localStorage.setItem('cubiciUserAuth', JSON.stringify(auth));
  }, session);
  await page.route('**/v1/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.pathname.endsWith('/accounts/me/shops')) {
      await route.fulfill({ contentType: 'application/json', status: 200, body: JSON.stringify({ total: 0, items: [] }) });
      return;
    }
    if (url.pathname.endsWith('/accounts/me/company') && request.method() === 'PUT') {
      const payload = request.postDataJSON();
      companyUpdates.push(payload);
      await route.fulfill({
        contentType: 'application/json',
        status: 200,
        body: JSON.stringify({ updated: true, user: { ...baseUser, ...payload } }),
      });
      return;
    }
    await route.fulfill({ contentType: 'application/json', status: 200, body: JSON.stringify({ total: 0, items: [] }) });
  });
  return companyUpdates;
}

test('M1-22 captures the final-source joined mypage reference', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(sourceUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  await expect(page.locator('.visual-tit')).toHaveText('마이페이지');
  await expect(page.locator('.sub-nav > li')).toHaveCount(3);
  await expect(page.locator('.join-tit')).toHaveText('가입 정보 접속 안내');
  await expect(page.locator('.sec-2 .sub-tit')).toHaveText('기본 정보');
  await page.screenshot({
    fullPage: true,
    path: '../docs/reference/lv-ui/work/USR-MYPAGE-COMPANY-PC/reference/lv-reference-rendered.png',
  });

  await page.setViewportSize({ width: 360, height: 640 });
  await page.reload({ waitUntil: 'networkidle' });
  const sourceOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(sourceOverflow).toBeLessThanOrEqual(1);
  await page.screenshot({
    fullPage: true,
    path: '../docs/reference/lv-ui/work/USR-MYPAGE-COMPANY-MOBILE/reference/lv-reference-rendered.png',
  });
});

test('M1-22 restores the LV joined-information access screen', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await installMocks(page);
  await page.goto(`${baseUrl}${accessPath}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  await expect(page.locator('.react-final-sub-visual .visual-tit')).toHaveText('마이페이지');
  await expect(page.locator('.react-final-sub-visual .visual-desc')).toHaveCount(0);
  await expect(page.locator('.react-final-tabs .sub-nav > li')).toHaveCount(3);
  await expect(page.locator('.react-final-tabs .sub-nav > li').first()).toHaveClass(/active/);
  await expect(page.getByRole('heading', { name: '가입 정보 접속 안내' })).toBeVisible();
  await expect(page.getByLabel('가입정보 인증번호')).toHaveValue('******');
  await expect(page.getByRole('button', { name: '인증번호 받기' })).toBeVisible();
  await expect(page.locator('.react-legacy-mypage-panel')).toHaveCount(0);
  const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(pageOverflow).toBeLessThanOrEqual(1);

  await page.screenshot({
    fullPage: true,
    path: '../docs/reference/lv-ui/work/USR-MYPAGE-ACCESS-PC/candidate/candidate-react.png',
  });
  await page.getByRole('button', { name: '인증번호 받기' }).click();
  await expect(page.locator('.u22-access-panel .auth-message')).toContainText('아직 연결되지 않았습니다.');
});

test('M1-22 restores joined basic information and preserves company update', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  const updates = await installMocks(page);
  await page.goto(`${baseUrl}${companyPath}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  await expect(page.locator('.react-final-tabs .sub-nav > li').first()).toHaveClass(/active/);
  await expect(page.getByRole('heading', { name: '기본 정보' })).toBeVisible();
  await expect(page.locator('.u22-basic-info .table-item')).toHaveCount(7);
  await expect(page.getByLabel('회사명')).toHaveValue('LV 온라인상사');
  await expect(page.getByLabel('아이디')).toHaveValue('lv-mypage@cubici.test');
  await expect(page.getByLabel('대표자명')).toHaveValue('홍길동');
  await expect(page.getByLabel('사업자 유형')).toHaveValue('일반사업자');
  await expect(page.getByLabel('등록핸드폰 변경')).toHaveValue('010-1234-5678');
  await expect(page.getByRole('button', { name: '수정 확인' })).toBeVisible();
  await expect(page.getByRole('link', { name: '취소' })).toHaveAttribute('href', accessPath);
  const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(pageOverflow).toBeLessThanOrEqual(1);

  await page.screenshot({
    fullPage: true,
    path: '../docs/reference/lv-ui/work/USR-MYPAGE-COMPANY-PC/candidate/candidate-react.png',
  });

  await page.getByLabel('등록핸드폰 변경').fill('010-9999-8888');
  await page.getByRole('button', { name: '수정 확인' }).click();
  await expect(page.locator('.u22-company-info > .auth-message')).toHaveText('회사정보가 저장되었습니다.');
  expect(updates).toHaveLength(1);
  expect(updates[0]).toMatchObject({
    name: '홍길동',
    phone: '010-9999-8888',
    biz_name: 'LV 온라인상사',
    biz_num: '123-45-67890',
    biz_setup_date: '20240102',
    biz_type: 'GENERAL',
    sectors: '종합상품 셀러',
    partner_code: 'LV2401',
  });
});

test('M1-22 renders both joined-information states without mobile overflow', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  await installMocks(page);

  await page.goto(`${baseUrl}${accessPath}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const activeTabBounds = await page.locator('.react-final-tabs .sub-nav > li.active').boundingBox();
  expect(activeTabBounds.x).toBeGreaterThanOrEqual(0);
  expect(activeTabBounds.x + activeTabBounds.width).toBeLessThanOrEqual(360);
  let overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.screenshot({
    fullPage: true,
    path: '../docs/reference/lv-ui/work/USR-MYPAGE-ACCESS-MOBILE/candidate/candidate-react.png',
  });

  await page.goto(`${baseUrl}${companyPath}`, { waitUntil: 'networkidle' });
  await expect(page.locator('.u22-basic-info .table-item')).toHaveCount(7);
  await expect(page.getByLabel('등록핸드폰 변경')).toBeVisible();
  overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.screenshot({
    fullPage: true,
    path: '../docs/reference/lv-ui/work/USR-MYPAGE-COMPANY-MOBILE/candidate/candidate-react.png',
  });
  await context.close();
});
