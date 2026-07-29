import React from 'react';
import { GenericReportTablePage } from './GenericReportTablePage';

export function OrderReportPage() {
  return (
    <GenericReportTablePage
      title="Order Reports"
      description="Order status, fulfillment, source, and customer delivery timelines"
      endpoint="/admin/reports/orders"
      reportType="orders"
    />
  );
}
