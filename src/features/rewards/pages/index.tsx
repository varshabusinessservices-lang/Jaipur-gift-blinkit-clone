import { GenericAdminTablePage } from '../../../components/common/GenericAdminTablePage';
import { GenericAdminDashboardPage } from '../../../components/common/GenericAdminDashboardPage';
import { config } from '../../../config/env';

export const RewardsDashboardPage = () => <GenericAdminDashboardPage title="Rewards Dashboard" description="Overview of rewards metrics" endpoint={`/admin/rewards/metrics`} />;
export const RewardTransactionsPage = () => <GenericAdminTablePage title="Reward Transactions" description="All reward transactions" endpoint={`/admin/rewards/transactions`} dataKey="transactions" />;
export const RewardConversionsPage = () => <GenericAdminTablePage title="Reward Conversions" description="Rewards converted to wallet balance" endpoint={`/admin/rewards/conversions`} dataKey="conversions" />;
export const ClaimableRewardsPage = () => <GenericAdminTablePage title="Claimable Rewards" description="Rewards available for claiming" endpoint={`/admin/rewards/claimable`} dataKey="rewards" />;
export const ConvertedRewardsPage = () => <GenericAdminTablePage title="Converted Rewards" description="Successfully converted rewards" endpoint={`/admin/rewards/converted`} dataKey="rewards" />;
export const RewardWalletLotsPage = () => <GenericAdminTablePage title="Reward Wallet Lots" description="Wallet lots created from rewards" endpoint={`/admin/rewards/wallet-lots`} dataKey="lots" />;
export const RewardExpiryPage = () => <GenericAdminTablePage title="Reward Expiry" description="Expired and expiring rewards" endpoint={`/admin/rewards/expiring`} dataKey="rewards" />;
export const RewardReversalsPage = () => <GenericAdminTablePage title="Reward Reversals" description="Reversed rewards due to refunds" endpoint={`/admin/rewards/reversals`} dataKey="reversals" />;
export const RewardNotificationsPage = () => <GenericAdminTablePage title="Reward Notifications" description="Notifications sent to users regarding rewards" endpoint={`/admin/rewards/notifications`} dataKey="notifications" />;
export const RewardRecoveryCasesPage = () => <GenericAdminTablePage title="Reward Recovery Cases" description="Cases where rewards need manual recovery" endpoint={`/admin/rewards/recovery-cases`} dataKey="cases" />;
export const RewardReconciliationPage = () => <GenericAdminTablePage title="Reward Reconciliation" description="Reward vs Wallet reconciliation" endpoint={`/admin/rewards/reconciliation`} dataKey="reconciliation" />;
export const RewardSettingsPage = () => <GenericAdminTablePage title="Reward Settings" description="View system reward settings" endpoint={`/admin/rewards`} dataKey="settings" />;
