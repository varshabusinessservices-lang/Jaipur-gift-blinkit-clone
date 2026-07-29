import React from 'react';
import { GenericReportTablePage } from './GenericReportTablePage';

export function CustomerReportPage() {
  return (
    <GenericReportTablePage
      title="Customer Reports"
      description="Customer acquisition, total spend, wallet balances, and order histories"
      endpoint="/admin/reports/customers"
      reportType="customers"
    />
  );
}
