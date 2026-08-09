export async function installMockAdminAuth(page) {
  await page.route('**/v1/api/accounts/me**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user_no: 1,
        email: 'admin@example.com',
        user_type: 'ADMIN_USER',
        name: '관리자',
      }),
    });
  });

  await page.addInitScript(() => {
    window.localStorage.setItem('cubiciAdminAuth', JSON.stringify({
      token_type: 'Bearer',
      access_token: 'admin-preference-mock-token',
      user: { email: 'admin@example.com', user_type: 'ADMIN_USER' },
    }));
  });
}
