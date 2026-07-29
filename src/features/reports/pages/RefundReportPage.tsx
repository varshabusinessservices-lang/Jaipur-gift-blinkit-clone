import React from 'react';
import { GenericReportTablePage } from './GenericReportTablePage';

export function RefundReportPage() {
  return (
    <GenericReportTablePage
      title="Refund Reports"
      description="Refund amounts, gateway refunds, wallet restorations, and return reasons"
      endpoint="/admin/reports/refunds"
      reportType="refunds"
    />
  );
}
