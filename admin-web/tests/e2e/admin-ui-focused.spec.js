import { expect, test } from '@playwright/test';

const MASTER_ADMIN_EMAIL = process.env.CUBICI_MASTER_ADMIN_EMAIL ?? 'admin@example.com';

const routes = [
  ['/admin/cubici/infoIntegrated/cubici_tab1', '통합정보', '큐빅아이'],
  ['/admin/cubici/infoIntegrated/moneybank_tab1', '통합정보', '머니뱅크'],
  ['/admin/cubici/manageMember/member_tab1', '회원관리', '회원현황'],
  ['/admin/cubici/manageMember/member_tab2', '회원관리', '회원현황'],
  ['/admin/cubici/manageMember/member_tab3', '회원관리', '회원현황'],
  ['/admin/cubici/manageMember/userstatus?code=36', '회원관리', '회원현황'],
  ['/admin/cubici/manageMember/payment_tab1', '회원관리', '결제관리'],
  ['/admin/cubici/manageMember/payment_tab2', '회원관리', '결제관리'],
  ['/admin/moneybank/cubici/management/info_tab1', '머니뱅크 관리', '통합 현황'],
  ['/admin/moneybank/management/usageList', '머니뱅크 관리', '이용상세'],
  ['/admin/moneybank/request', '머니뱅크 운영', '신청 접수'],
  ['/admin/moneybank/approval_tab1', '머니뱅크 운영', '심사 승인'],
  ['/admin/moneybank/approval_tab2', '머니뱅크 운영', '계약 관리'],
  ['/admin/moneybank/settlement', '머니뱅크 운영', '정산 관리'],
  ['/admin/moneybank/redemption', '머니뱅크 운영', '상환 관리'],
  ['/admin/moneybank/manage', '머니뱅크 운영', '프리즘 지표 관리'],
  ['/admin/cubici/supportMember/manageInquiry', '고객관리', '고객문의'],
  ['/admin/cubici/supportMember/manageSms', '고객관리', '문자/이메일'],
  ['/admin/cubici/supportMember/manageEmail', '고객관리', '문자/이메일'],
  ['/admin/cubici/supportMember/manageBoard_tab1', '고객관리', '고객 공지 관리'],
  ['/admin/cubici/supportMember/manageBoard_tab2', '고객관리', '고객 공지 관리'],
  ['/admin/cubici/adminMonitor/error_report', '모니터링', 'Error Log'],
  ['/admin/cubici/adminMonitor/server_monitor', '모니터링', '서버 관리'],
  ['/admin/cubici/adminMonitor/fintech_trade', '모니터링', '펌뱅킹 전문'],
  ['/admin/cubici/adminPreference/adminRegister_tab1', '환경설정', '관리자 등록'],
  ['/admin/cubici/adminPreference/manageCharge', '환경설정', '요금제 관리'],
  ['/admin/cubici/adminPreference/managePromotion', '환경설정', '연계코드 관리'],
  ['/admin/cubici/adminPreference/managePartner', '환경설정', '협력사 관리'],
  ['/admin/cubici/adminPreference/manageMoneybank_tab1', '환경설정', '머니뱅크 관리'],
  ['/admin/cubici/adminPreference/manageMoneybank_tab2', '환경설정', '머니뱅크 관리'],
  ['/admin/cubici/adminPreference/prizmConfig', '환경설정', 'Prism System'],
  ['/admin/cubici/adminPreference/prizmRawData', '환경설정', 'Prism System'],
];

test.describe('admin legacy-like UI focused smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/v1/api/accounts/admin-me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user_no: 1,
          email: MASTER_ADMIN_EMAIL,
          user_type: 'ADMIN_USER',
          name: '관리자',
          phone: null,
          biz_num: null,
          biz_name: null,
        }),
      });
    });
    await page.addInitScript((masterAdminEmail) => {
      window.localStorage.setItem(
        'cubiciAdminAuth',
        JSON.stringify({
          token_type: 'Bearer',
          access_token: 'test-token',
          user: {
            email: masterAdminEmail,
            user_type: 'ADMIN_USER',
          },
        }),
      );
    }, MASTER_ADMIN_EMAIL);
  });

  for (const [path, categoryTitle, pageTitle] of routes) {
    test(`${path} renders mapped admin layout`, async ({ page }) => {
      const pageErrors = [];
      page.on('pageerror', (error) => pageErrors.push(error.message));

      await page.goto(path);

      const mainContent = page.locator('.subContents > .subBox.adminReactPage > .contentArea');

      await expect(page.locator('#wrap.adminReactWrap')).toBeVisible();
      await expect(page.locator('#header')).toBeVisible();
      await expect(page.locator('.snbArea')).toBeVisible();
      await expect(page.locator('.subContents')).toBeVisible();
      await expect(mainContent).toBeVisible();
      await expect(page.locator('.subVisual h2')).toHaveText(categoryTitle);
      await expect(page.locator('.subVisual h3')).toHaveText(pageTitle);
      await expect(page.locator('.subVisual h2')).not.toHaveText('Route 점검');
      await expect(page.locator('.subVisual h3')).not.toHaveText('미구현 경로');
      await expect(page.locator('#snb > li.active > .snbCategoryButton')).toHaveText(categoryTitle);
      await expect(page.locator('#snb > li.active li.active a')).toHaveText(pageTitle);
      await expect(mainContent).not.toBeEmpty();
      await expect(mainContent).not.toContainText('미구현 또는 route alias 미매핑');

      const layout = await page.evaluate(() => {
        const sidebar = document.querySelector('.snbArea')?.getBoundingClientRect();
        const contents = document.querySelector('.subContents')?.getBoundingClientRect();
        const bodyOverflow = document.body.scrollWidth - document.documentElement.clientWidth;
        return {
          sidebarRight: sidebar?.right ?? 0,
          contentsLeft: contents?.left ?? 0,
          bodyOverflow,
        };
      });
      expect(layout.contentsLeft).toBeGreaterThanOrEqual(layout.sidebarRight - 2);
      expect(layout.bodyOverflow).toBeLessThanOrEqual(80);
      expect(pageErrors).toEqual([]);
    });
  }

  test('sidebar opens non-active legacy submenus without changing page route', async ({ page }) => {
    await page.goto('/admin/moneybank/request');
    await page.getByRole('button', { name: '회원관리' }).click();
    await expect(page.locator('#memberInfo')).toHaveClass(/open/);
    await expect(page.locator('#memberInfo a', { hasText: '회원현황' })).toBeVisible();
    await expect(page.locator('#memberInfo a', { hasText: '결제관리' })).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/moneybank\/request$/);
  });
});
