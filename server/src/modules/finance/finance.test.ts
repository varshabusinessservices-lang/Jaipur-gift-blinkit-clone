import { describe, it, expect } from 'vitest';
import { FinanceRepository } from './finance.repository';
import { FinanceService } from './finance.service';

describe('Finance and Reporting Engine - Batch 22', () => {
  const repo = new FinanceRepository();
  const service = new FinanceService();

  it('should create ledger entry and calculate running balance', async () => {
    const entry = await repo.createLedgerEntry({
      transactionType: 'SALE',
      referenceType: 'ORDER',
      referenceId: 'ord-123',
      customerId: 'cust-1',
      orderId: 'ord-123',
      storeId: 'store-jaipur-1',
      credit: 1500,
      narration: 'Order sale #ORD-123',
    });
    expect(entry).toBeDefined();
    expect(entry.ledgerNumber).toMatch(/^LED-/);
    expect(entry.runningBalance).toBeGreaterThan(0);
  });

  it('should maintain wallet history and balances', async () => {
    const custId = `cust-test-wallet-${Date.now()}`;
    await repo.createWalletEntry({
      customerId: custId,
      transactionType: 'REFERRAL_CREDIT',
      amount: 100,
      narration: 'Referral bonus',
    });
    const history = await repo.getWalletHistory(custId);
    expect(history.length).toBeGreaterThan(0);
    const balance = await repo.getWalletBalance(custId);
    expect(balance).toBe(100);
  });

  it('should calculate GST correctly (inclusive and exclusive)', async () => {
    const gst1 = await service.calculateGst(1180, 18, true);
    expect(gst1.baseAmount).toBe(1000);
    expect(gst1.taxAmount).toBe(180);
    expect(gst1.cgst).toBe(90);
    expect(gst1.sgst).toBe(90);

    const gst2 = await service.calculateGst(1000, 18, false);
    expect(gst2.baseAmount).toBe(1000);
    expect(gst2.taxAmount).toBe(180);
  });

  it('should create settlements', async () => {
    const settlement = await repo.createSettlement({
      entityType: 'STORE',
      entityId: 'store-jaipur-1',
      amount: 50000,
      commission: 2500,
    });
    expect(settlement).toBeDefined();
    expect(settlement.settlementNumber).toMatch(/^SET-/);
    expect(settlement.netAmount).toBe(47500);
  });

  it('should generate revenue and order reports', async () => {
    const report = await service.generateReport('revenue', { range: 'monthly' });
    expect(report).toBeDefined();
    expect(report.type).toBe('revenue');
    expect(report.metrics).toBeDefined();
  });

  it('should generate product, customer, production, delivery, and return reports', async () => {
    const prodRep = await service.generateReport('products', {});
    expect(prodRep.type).toBe('products');

    const custRep = await service.generateReport('customers', {});
    expect(custRep.type).toBe('customers');

    const prodJobRep = await service.generateReport('production', {});
    expect(prodJobRep.type).toBe('production');

    const delRep = await service.generateReport('delivery', {});
    expect(delRep.type).toBe('delivery');

    const retRep = await service.generateReport('returns', {});
    expect(retRep.type).toBe('returns');
  });

  it('should return dashboard KPIs', async () => {
    const summary = await service.getDashboardSummary();
    expect(summary).toBeDefined();
    expect(summary.todaysRevenue).toBeDefined();
    expect(summary.todaysOrders).toBeDefined();
    expect(summary.monthlyRevenue).toBeDefined();
  });

  it('should create export jobs for CSV, EXCEL, and PDF', async () => {
    const jobCsv = await repo.createExportJob({ exportType: 'CSV', module: 'FINANCE' });
    expect(jobCsv.status).toBe('COMPLETED');
    expect(jobCsv.fileUrl).toContain('.csv');

    const jobExcel = await repo.createExportJob({ exportType: 'EXCEL', module: 'ORDERS' });
    expect(jobExcel.fileUrl).toContain('.xlsx');

    const jobPdf = await repo.createExportJob({ exportType: 'PDF', module: 'GST' });
    expect(jobPdf.fileUrl).toContain('.pdf');
  });
});
