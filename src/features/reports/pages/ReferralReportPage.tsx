import React from 'react';
import { GenericReportTablePage } from './GenericReportTablePage';

export function ReferralReportPage() {
  return (
    <GenericReportTablePage
      title="Referral Reports"
      description="Referral registrations, qualifications, referrer credits, and credit expirations"
      endpoint="/admin/reports/referrals"
      reportType="referrals"
    />
  );
}
