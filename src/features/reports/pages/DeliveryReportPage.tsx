import React from 'react';
import { GenericReportTablePage } from './GenericReportTablePage';

export function DeliveryReportPage() {
  return (
    <GenericReportTablePage
      title="Delivery Reports"
      description="Delivery task fulfillment, delivery zones, delivery boys, and timings"
      endpoint="/admin/reports/delivery"
      reportType="delivery"
    />
  );
}
