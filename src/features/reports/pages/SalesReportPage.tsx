import React from 'react';
import { GenericReportTablePage } from './GenericReportTablePage';

export function SalesReportPage() {
  return (
    <GenericReportTablePage
      title="Sales Reports"
      description="Detailed gross sales, net sales, discounts, and order breakdowns"
      endpoint="/admin/reports/sales"
      reportType="sales"
    />
  );
}
