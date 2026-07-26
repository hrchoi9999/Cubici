import { AdminLayout } from './components/layout/AdminLayout.jsx';
import { AdminDashboardPage } from './pages/AdminDashboardPage.jsx';
import { RedemptionManagementPage } from './pages/RedemptionManagementPage.jsx';
import { SettlementManagementPage } from './pages/SettlementManagementPage.jsx';

export default function App() {
  const path = window.location.pathname;
  const isSettlementPage = path.includes('/admin/moneybank/settlement');
  const isRedemptionPage = path.includes('/admin/moneybank/redemption');
  const activePageId = isSettlementPage ? 'settlement' : isRedemptionPage ? 'redemption' : 'request';

  return (
    <AdminLayout activeCategoryId="moneybankOperation" activePageId={activePageId}>
      {isSettlementPage ? <SettlementManagementPage /> : null}
      {isRedemptionPage ? <RedemptionManagementPage /> : null}
      {!isSettlementPage && !isRedemptionPage ? <AdminDashboardPage /> : null}
    </AdminLayout>
  );
}
