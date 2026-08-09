import { expect, test } from '../../../admin-web/node_modules/@playwright/test/index.mjs';

const baseUrl = process.env.CUBICI_M1_USER_URL ?? 'http://127.0.0.1:4310';
const session = {
  token_type: 'Bearer',
  access_token: 'uc04-modal-token',
  user: { user_no: 104, email: 'modal@cubici.test', user_type: 'USER', name: 'LV 사용자' },
};

function settlementItem(id, date, amount, overrides = {}) {
  return {
    settlements_id: id,
    shop_type: 'NAVER',
    shop_id: 'uc04-shop',
    settlement_type: '일반정산',
    settlement_date: `${date}T10:00:00`,
    reg_date: '2026-08-01T10:00:00',
    total_sale: amount + 12000,
    service_fee: 12000,
    settlement_target_amount: amount,
    settlement_amount: amount,
    pending_released_amount: 0,
    status: 'DONE',
    bank_name: '테스트은행',
    product_name: '테스트 상품',
    product_no: 'UC04-PRODUCT',
    orderer_name: '테스트 구매자',
    orderer_id: 'uc04-buyer',
    quantity: 1,
    ...overrides,
  };
}

async function installMocks(page) {
  await page.addInitScript((auth) => {
    window.localStorage.setItem('cubiciUserAuth', JSON.stringify(auth));
  }, session);
  await page.route('**/v1/api/**', async (route) => {
    const url = new URL(route.request().url());
    let body = {};
    if (url.pathname.endsWith('/accounts/me/shops')) {
      body = { total: 1, items: [{ id: 1, user_no: 104, shop_type: 'NAVER', shop_id: 'uc04-shop', status: 'Y', del_yn: 'N' }] };
    } else if (url.pathname.endsWith('/settlements')) {
      body = {
        limit: Number(url.searchParams.get('limit') ?? 10),
        offset: Number(url.searchParams.get('offset') ?? 0),
        total: 2,
        items: [
          settlementItem(202608050001, '2026-08-05', 76000),
          settlementItem(202608050002, '2026-08-05', 124000),
        ],
      };
    }
    await route.fulfill({ contentType: 'application/json', status: 200, body: JSON.stringify(body) });
  });
}

async function expectLvModalShell(dialog) {
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveCSS('background-color', 'rgba(0, 0, 0, 0.4)');
  const panel = dialog.locator(':scope > div');
  await expect(panel).toHaveCSS('border-radius', '20px');
  const header = panel.locator(':scope > header');
  await expect(header).toHaveCSS('background-color', 'rgb(1, 47, 109)');
  await expect(header.locator('.final-modal-title > img')).toBeVisible();
  await expect(header.getByRole('button', { name: '닫기' }).locator('img')).toBeVisible();
  await expect(header.getByRole('button', { name: '닫기' })).toBeFocused();
}

test('UC04 restores LV table and detail modal shells and close behavior on PC', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await installMocks(page);

  await page.goto(`${baseUrl}/cubici/calculateInfo/calendar`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: '2026-08-05 정산 상세' }).click();
  const calendarDialog = page.getByRole('dialog', { name: '일일 정산 상세내역' });
  await expectLvModalShell(calendarDialog);
  await page.screenshot({ path: '../docs/reference/lv-ui/work/USR-COMMON-MODAL-TABLE-PC/candidate/candidate-react.png' });
  await page.keyboard.press('Escape');
  await expect(calendarDialog).toBeHidden();

  await page.goto(`${baseUrl}/cubici/calculateInfo/details`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: '202608050001 상세 보기' }).click();
  const detailDialog = page.getByRole('dialog', { name: '정산 상세정보' });
  await expectLvModalShell(detailDialog);
  await expect(detailDialog).toContainText('76,000원');
  await page.screenshot({ path: '../docs/reference/lv-ui/work/USR-COMMON-MODAL-DETAIL-PC/candidate/candidate-react.png' });
  await detailDialog.dispatchEvent('mousedown');
  await expect(detailDialog).toBeHidden();
});

test('UC04 keeps the LV table modal usable on mobile without page overflow', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await installMocks(page);
  await page.goto(`${baseUrl}/cubici/calculateInfo/calendar`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: '2026-08-05 정산금액 상세' }).evaluate((button) => button.click());

  const dialog = page.getByRole('dialog', { name: '일일 정산 상세내역' });
  await expect(dialog).toBeVisible();
  const panel = dialog.locator('.u12-day-modal-panel');
  const panelBox = await panel.boundingBox();
  expect(panelBox.width).toBeLessThanOrEqual(336);
  expect(panelBox.height).toBeLessThanOrEqual(552);
  await expect(panel.locator(':scope > header')).toHaveCSS('background-color', 'rgb(1, 47, 109)');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.screenshot({ path: '../docs/reference/lv-ui/work/USR-COMMON-MODAL-TABLE-MOBILE/candidate/candidate-react.png' });
});
