import React from 'react';
import { GenericReportTablePage } from './GenericReportTablePage';

export function TaxReportPage() {
  return (
    <GenericReportTablePage
      title="Tax Reports"
      description="GST breakdown, CGST, SGST, IGST, taxable sales, and tax liability"
      endpoint="/admin/reports/taxes"
      reportType="taxes"
    />
  );
}
