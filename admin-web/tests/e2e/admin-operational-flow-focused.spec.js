import { expect, test } from '@playwright/test';

async function expectReady(page, categoryTitle, pageTitle) {
  await expect(page.locator('.subVisual h2')).toHaveText(categoryTitle);
  await expect(page.locator('.subVisual h3')).toHaveText(pageTitle);
  await expect(page.locator('.subContents > .subBox.adminReactPage > .contentArea')).not.toBeEmpty();
}

async function clickFirstVisible(locator, label) {
  await expect(locator.first(), `${label} first actionable row`).toBeVisible();
  await locator.first().click();
}

test.describe('admin operating-data focused read flows', () => {
  test('moneybank contract request list opens detail without data changes', async ({ page }) => {
    await page.goto('/admin/moneybank/request');
    await expectReady(page, '머니뱅크 운영', '신청/승인');
    await expect(page.getByText('신청 접수 목록')).toBeVisible();

    await clickFirstVisible(page.locator('#fixTbody button.linkButton'), 'contract request');

    const detailPanel = page.locator('.detailPanel');
    await expect(detailPanel).toBeVisible();
    await expect(detailPanel.getByText('상태 상세')).toBeVisible();
    await expect(detailPanel.getByRole('table').first()).toBeVisible();
  });

  test('moneybank usage list navigates to usage detail tabs', async ({ page }) => {
    await page.goto('/admin/moneybank/management/usageList');
    await expectReady(page, '머니뱅크 운영', '이용 상세');

    await clickFirstVisible(page.locator('.managementUsageTable button', { hasText: '보기' }), 'management usage');
    await expect(page).toHaveURL(/\/admin\/moneybank\/management\/usageDetail\?mbid=/);
    await expectReady(page, '머니뱅크 운영', '이용 상세');
    await expect(page.getByText('회원 상세정보')).toBeVisible();

    for (const tabName of ['머니뱅크', '추가서류', '상환이력']) {
      await page.locator('.managementDetailTabs button').filter({ hasText: tabName }).click();
      await expect(page.locator('.managementDetailTabs li.active button')).toHaveText(tabName);
    }
  });

  test('settlement and redemption lists open operating detail panels', async ({ page }) => {
    await page.goto('/admin/moneybank/settlement');
    await expectReady(page, '머니뱅크 운영', '정산 관리');
    await clickFirstVisible(page.locator('.settlementTable button', { hasText: '보기' }), 'settlement');
    await expect(page.locator('.detailPanel')).toBeVisible();
    await expect(page.locator('.detailPanel').getByRole('link', { name: '정산 상세' })).toBeVisible();

    await page.goto('/admin/moneybank/redemption');
    await expectReady(page, '머니뱅크 운영', '계약/상환');
    await clickFirstVisible(page.locator('.redemptionTable .redemptionLvMbidButton'), 'redemption');
    await expect(page.locator('.detailPanel')).toBeVisible();
    await expect(page.locator('.detailPanel').getByRole('link', { name: '상환 상세' })).toBeVisible();
    await expect(page.locator('.redemptionOperationHistory')).toBeVisible();
  });

  test('support and preference lists open read details/edit panels', async ({ page }) => {
    await page.goto('/admin/cubici/supportMember/manageInquiry');
    await expectReady(page, '고객관리', '고객문의');
    await clickFirstVisible(page.locator('.inquiryTable button.linkButton'), 'customer inquiry');
    await expect(page.locator('.customerInquiryLvDetail')).toBeVisible();
    await expect(page.locator('.customerInquiryLvDetail')).not.toContainText('목록에서 문의를 선택하세요.');

    await page.goto('/admin/cubici/adminPreference/manageCharge');
    await expectReady(page, '환경설정', '요금제 관리');
    await clickFirstVisible(page.locator('.chargeManagementTable button', { hasText: '보기' }), 'charge');
    await expect(page.locator('.chargeEditorPanel h4')).toHaveText('요금제 수정');

    await page.goto('/admin/cubici/adminPreference/managePartner');
    await expectReady(page, '환경설정', '협력사 관리');
    await clickFirstVisible(page.locator('.partnerManagementTable button', { hasText: '상세보기' }), 'partner');
    await expect(page.locator('.partnerEditorPanel h4')).toHaveText('협력사 상세');
  });
});
