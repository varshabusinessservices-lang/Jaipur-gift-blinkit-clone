import React from 'react';
import { GenericReportTablePage } from './GenericReportTablePage';

export function RewardReportPage() {
  return (
    <GenericReportTablePage
      title="Reward Reports"
      description="Reward transactions, coin earnings, cooling periods, and reward liabilities"
      endpoint="/admin/reports/rewards"
      reportType="rewards"
    />
  );
}
