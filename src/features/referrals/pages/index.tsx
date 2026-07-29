import { GenericAdminTablePage } from '../../../components/common/GenericAdminTablePage';
import { GenericAdminDashboardPage } from '../../../components/common/GenericAdminDashboardPage';
import { config } from '../../../config/env';

export const ReferralsDashboardPage = () => <GenericAdminDashboardPage title="Referrals Dashboard" description="Overview of referral program performance" endpoint={`/admin/referrals/summary`} />;
export const ReferralRelationshipsPage = () => <GenericAdminTablePage title="Referral Relationships" description="All referrer and referee connections" endpoint={`/admin/referrals/relationships`} dataKey="relationships" />;
export const ReferralCodesPage = () => <GenericAdminTablePage title="Referral Codes" description="Customer referral codes" endpoint={`/admin/referrals/codes`} dataKey="codes" />;
export const ReferralCreditsPage = () => <GenericAdminTablePage title="Referral Credits" description="Credits issued via referrals" endpoint={`/admin/referrals/credits`} dataKey="credits" />;
export const ReferralQualificationPage = () => <GenericAdminTablePage title="Referral Qualification" description="Pending and completed referral qualifications" endpoint={`/admin/referrals/qualifications`} dataKey="qualifications" />;
export const ReferralFraudReviewPage = () => <GenericAdminTablePage title="Referral Fraud Review" description="Referrals flagged for fraud" endpoint={`/admin/referrals/fraud`} dataKey="fraud" />;
export const ManualReviewQueuePage = () => <GenericAdminTablePage title="Manual Review Queue" description="Review cases pending manual approval" endpoint={`/admin/referrals/review-cases`} dataKey="reviewCases" />;
export const ReferralRecoveryPage = () => <GenericAdminTablePage title="Referral Recovery" description="Referral credit recovery cases" endpoint={`/admin/referrals/recovery`} dataKey="recovery" />;
export const ReferralReconciliationPage = () => <GenericAdminTablePage title="Referral Reconciliation" description="Referral program reconciliation reports" endpoint={`/admin/referrals/reconciliation`} dataKey="reconciliation" />;
export const ReferralNotificationsPage = () => <GenericAdminTablePage title="Referral Notifications" description="Notifications sent for referrals" endpoint={`/admin/referrals/notifications`} dataKey="notifications" />;
export const ReferralSettingsPage = () => <GenericAdminTablePage title="Referral Settings" description="View system referral settings" endpoint={`/admin/referrals/settings`} />;
