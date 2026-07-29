import React from 'react';
import { GenericReportTablePage } from './GenericReportTablePage';

export function PaymentReportPage() {
  return (
    <GenericReportTablePage
      title="Payment Reports"
      description="Gateway transactions, online payments, COD collected, and reconciliation statuses"
      endpoint="/admin/reports/payments"
      reportType="payments"
    />
  );
}
