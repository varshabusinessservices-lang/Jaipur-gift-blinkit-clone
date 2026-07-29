import { GenericAdminTablePage } from '../../../components/common/GenericAdminTablePage';
import { GenericAdminDashboardPage } from '../../../components/common/GenericAdminDashboardPage';
import { config } from '../../../config/env';

export const WalletDashboardPage = () => <GenericAdminDashboardPage title="Wallet Dashboard" description="Overview of wallet metrics and liabilities" endpoint={`/admin/wallet/metrics`} />;
export const WalletAccountsPage = () => <GenericAdminTablePage title="Wallet Accounts" description="Manage all customer wallet accounts" endpoint={`/admin/wallet/accounts`} dataKey="accounts" />;
export const WalletTransactionsPage = () => <GenericAdminTablePage title="Wallet Transactions" description="View all wallet transactions" endpoint={`/admin/wallet/transactions`} dataKey="transactions" />;
export const WalletLedgerPage = () => <GenericAdminTablePage title="Wallet Ledger" description="Detailed wallet ledger entries" endpoint={`/admin/wallet/ledger`} dataKey="ledger" />;
export const WalletCreditLotsPage = () => <GenericAdminTablePage title="Wallet Credit Lots" description="Manage credit lots and expirations" endpoint={`/admin/wallet/credit-lots`} dataKey="lots" />;
export const WalletReservationsPage = () => <GenericAdminTablePage title="Wallet Reservations" description="Active wallet balance reservations" endpoint={`/admin/wallet/reservations`} dataKey="reservations" />;
export const WalletTopupsPage = () => <GenericAdminTablePage title="Wallet Topups" description="Customer topup history and statuses" endpoint={`/admin/wallet/topups`} dataKey="topups" />;
export const WalletAdjustmentsPage = () => <GenericAdminTablePage title="Wallet Adjustments" description="Manual admin adjustments" endpoint={`/admin/wallet/adjustments`} dataKey="adjustments" />;
export const RefundWalletCreditsPage = () => <GenericAdminTablePage title="Refund Wallet Credits" description="View refunded credits" endpoint={`/admin/wallet/refunds`} dataKey="refunds" />;
export const ExpiringWalletBalancePage = () => <GenericAdminTablePage title="Expiring Wallet Balance" description="Balances expiring soon" endpoint={`/admin/wallet/expiring`} dataKey="expiring" />;
export const FinancialReconciliationPage = () => <GenericAdminTablePage title="Financial Reconciliation" description="Reconciliation reports and discrepancies" endpoint={`/admin/wallet/reconciliation`} dataKey="reconciliation" />;
