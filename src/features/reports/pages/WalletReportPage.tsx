import React from 'react';
import { GenericReportTablePage } from './GenericReportTablePage';

export function WalletReportPage() {
  return (
    <GenericReportTablePage
      title="Wallet Reports"
      description="Total wallet liabilities, self-loaded balances, credits, debits, and ledger references"
      endpoint="/admin/reports/wallet"
      reportType="wallet"
    />
  );
}
