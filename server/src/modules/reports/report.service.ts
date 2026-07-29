import { prisma } from '../../database/prisma';
import * as XLSX from 'xlsx';

export class ReportService {
  static async getOverviewReport(filters: { from?: string; to?: string; storeId?: string }) {
    try {
      const db = prisma as any;
      const orders = await db.order?.findMany?.({ take: 500 }) || [];

      let grossSalesNum = 0;
      let netSalesNum = 0;
      let totalOrders = orders.length;
      let deliveredOrders = 0;
      let cancelledOrders = 0;
      let onlineCollectedNum = 0;
      let codCollectedNum = 0;
      let walletPaymentNum = 0;

      for (const ord of orders) {
        const total = Number(ord.totalAmount || 0);
        grossSalesNum += total;
        if (ord.status === 'DELIVERED' || ord.orderStatus === 'DELIVERED') deliveredOrders++;
        if (ord.status === 'CANCELLED' || ord.orderStatus === 'CANCELLED') cancelledOrders++;
        else netSalesNum += total;

        if (ord.paymentMethod === 'ONLINE' || ord.paymentMethod === 'RAZORPAY') {
          onlineCollectedNum += total;
        } else if (ord.paymentMethod === 'COD' || ord.paymentMethod === 'CASH') {
          if (ord.paymentStatus === 'PAID') codCollectedNum += total;
        } else if (ord.paymentMethod === 'WALLET') {
          walletPaymentNum += total;
        }
      }

      const aov = totalOrders > 0 ? (grossSalesNum / totalOrders).toFixed(2) : "0.00";

      return {
        summary: {
          grossSales: grossSalesNum.toFixed(2),
          netSales: netSalesNum.toFixed(2),
          totalOrders,
          deliveredOrders,
          cancelledOrders,
          averageOrderValue: aov,
          onlinePaymentCollected: onlineCollectedNum.toFixed(2),
          walletPaymentUsed: walletPaymentNum.toFixed(2),
          codCollected: codCollectedNum.toFixed(2),
          refundAmount: "0.00",
          walletLiability: "0.00",
          rewardLiability: "0.00",
          referralLiability: "0.00",
          outstandingPaymentAmount: "0.00"
        },
        rows: []
      };
    } catch (e: any) {
      console.error('getOverviewReport error:', e);
      return {
        summary: {
          grossSales: "0.00",
          netSales: "0.00",
          totalOrders: 0,
          deliveredOrders: 0,
          cancelledOrders: 0,
          averageOrderValue: "0.00",
          onlinePaymentCollected: "0.00",
          walletPaymentUsed: "0.00",
          codCollected: "0.00",
          refundAmount: "0.00",
          walletLiability: "0.00",
          rewardLiability: "0.00",
          referralLiability: "0.00",
          outstandingPaymentAmount: "0.00"
        },
        rows: []
      };
    }
  }

  static async getSalesReport(filters: { from?: string; to?: string; storeId?: string }) {
    try {
      const db = prisma as any;
      const orders = await db.order?.findMany?.({ take: 100, orderBy: { createdAt: 'desc' } }) || [];

      let totalGross = 0;
      let totalNet = 0;

      const rows = orders.map((ord: any) => {
        const gross = Number(ord.totalAmount || 0);
        const net = gross;
        totalGross += gross;
        totalNet += net;

        return {
          date: ord.createdAt ? new Date(ord.createdAt).toISOString().split('T')[0] : '-',
          orderId: ord.id || '-',
          storeName: 'Main Store',
          paymentMethod: ord.paymentMethod || 'ONLINE',
          grossSales: gross.toFixed(2),
          productDiscount: "0.00",
          deliveryFees: "0.00",
          taxes: "0.00",
          refunds: "0.00",
          netSales: net.toFixed(2),
          orderCount: 1,
          averageOrderValue: gross.toFixed(2)
        };
      });

      return {
        summary: {
          totalGrossSales: totalGross.toFixed(2),
          totalNetSales: totalNet.toFixed(2),
          orderCount: orders.length
        },
        rows
      };
    } catch (e: any) {
      return { summary: { totalGrossSales: "0.00", totalNetSales: "0.00", orderCount: 0 }, rows: [] };
    }
  }

  static async getOrderReport(filters: { from?: string; to?: string }) {
    try {
      const db = prisma as any;
      const orders = await db.order?.findMany?.({ take: 100, orderBy: { createdAt: 'desc' } }) || [];

      const rows = orders.map((ord: any) => ({
        orderId: ord.id || '-',
        customerName: ord.customerName || 'Customer',
        mobile: ord.customerPhone || '-',
        orderSource: ord.source || 'WEB',
        store: 'Main Store',
        orderValue: Number(ord.totalAmount || 0).toFixed(2),
        paymentStatus: ord.paymentStatus || 'PENDING',
        orderStatus: ord.status || ord.orderStatus || 'PENDING',
        deliveryStatus: ord.deliveryStatus || 'PENDING',
        deliveryType: ord.deliveryType || 'STANDARD',
        createdDate: ord.createdAt ? new Date(ord.createdAt).toISOString() : '-'
      }));

      return {
        summary: { totalOrders: orders.length },
        rows
      };
    } catch (e: any) {
      return { summary: { totalOrders: 0 }, rows: [] };
    }
  }

  static async getPaymentReport(filters: { from?: string; to?: string }) {
    try {
      const db = prisma as any;
      const payments = await db.walletTopUp?.findMany?.({ take: 100, orderBy: { createdAt: 'desc' } }) || [];

      let totalCollected = 0;
      const rows = payments.map((p: any) => {
        const amt = Number(p.amount || 0);
        totalCollected += amt;
        return {
          paymentId: p.id || '-',
          orderId: p.orderId || '-',
          customer: p.customerId || '-',
          paymentGateway: p.gateway || 'Razorpay',
          paymentMethod: p.paymentMethod || 'ONLINE',
          totalAmount: amt.toFixed(2),
          paymentStatus: p.status || 'SUCCESS',
          createdDate: p.createdAt ? new Date(p.createdAt).toISOString() : '-'
        };
      });

      return {
        summary: {
          totalCollected: totalCollected.toFixed(2),
          reconciledAmount: totalCollected.toFixed(2)
        },
        rows
      };
    } catch (e: any) {
      return { summary: { totalCollected: "0.00", reconciledAmount: "0.00" }, rows: [] };
    }
  }

  static async getWalletReport() {
    try {
      const db = prisma as any;
      const accounts = await db.walletAccount?.findMany?.({ take: 100 }) || [];

      let totalLiability = 0;
      const rows = accounts.map((acc: any) => {
        const bal = Number(acc.balance || acc.cachedAvailableBalance || 0);
        totalLiability += bal;
        return {
          walletAccount: acc.id || '-',
          customer: acc.customerId || '-',
          balance: bal.toFixed(2),
          updatedAt: acc.updatedAt ? new Date(acc.updatedAt).toISOString() : '-'
        };
      });

      return {
        summary: {
          totalWalletLiability: totalLiability.toFixed(2),
          totalAccounts: accounts.length
        },
        rows
      };
    } catch (e: any) {
      return { summary: { totalWalletLiability: "0.00", totalAccounts: 0 }, rows: [] };
    }
  }

  static async getRewardReport() {
    try {
      const db = prisma as any;
      const txs = await db.rewardTransaction?.findMany?.({ take: 100, orderBy: { createdAt: 'desc' } }) || [];

      const rows = txs.map((tx: any) => ({
        transactionId: tx.id || '-',
        accountId: tx.accountId || '-',
        coinsEarned: tx.coinsEarned || 0,
        type: tx.type || 'EARNED',
        date: tx.createdAt ? new Date(tx.createdAt).toISOString() : '-'
      }));

      return {
        summary: { totalTransactions: txs.length },
        rows
      };
    } catch (e: any) {
      return { summary: { totalTransactions: 0 }, rows: [] };
    }
  }

  static async getReferralReport() {
    try {
      const db = prisma as any;
      const rels = await db.referralRelationship?.findMany?.({ take: 100, orderBy: { createdAt: 'desc' } }) || [];

      const rows = rels.map((rel: any) => ({
        relationshipId: rel.id || '-',
        referrerId: rel.referrerId || '-',
        refereeId: rel.refereeId || rel.newCustomerId || '-',
        status: rel.status || 'PENDING',
        date: rel.createdAt ? new Date(rel.createdAt).toISOString() : '-'
      }));

      return {
        summary: { totalReferrals: rels.length },
        rows
      };
    } catch (e: any) {
      return { summary: { totalReferrals: 0 }, rows: [] };
    }
  }

  static async getRefundReport() {
    try {
      const db = prisma as any;
      const refunds = await db.refundRecord?.findMany?.({ take: 100, orderBy: { createdAt: 'desc' } }) || [];

      let totalRefundsNum = 0;
      const rows = refunds.map((ref: any) => {
        const amt = Number(ref.refundAmount || 0);
        totalRefundsNum += amt;
        return {
          refundId: ref.id || '-',
          orderId: ref.orderId || '-',
          refundAmount: amt.toFixed(2),
          status: ref.status || 'COMPLETED',
          date: ref.createdAt ? new Date(ref.createdAt).toISOString() : '-'
        };
      });

      return {
        summary: { totalRefundsAmount: totalRefundsNum.toFixed(2) },
        rows
      };
    } catch (e: any) {
      return { summary: { totalRefundsAmount: "0.00" }, rows: [] };
    }
  }

  static async getCustomerReport() {
    try {
      const db = prisma as any;
      const customers = await db.customer?.findMany?.({ take: 100, orderBy: { createdAt: 'desc' } }) || [];

      const rows = customers.map((c: any) => ({
        customerId: c.id || '-',
        name: c.name || 'Customer',
        mobile: c.mobile || '-',
        email: c.email || '-',
        registeredDate: c.createdAt ? new Date(c.createdAt).toISOString() : '-'
      }));

      return {
        summary: { totalCustomers: customers.length },
        rows
      };
    } catch (e: any) {
      return { summary: { totalCustomers: 0 }, rows: [] };
    }
  }

  static async getDeliveryReport() {
    try {
      return { summary: { totalDeliveries: 0 }, rows: [] };
    } catch (e: any) {
      return { summary: { totalDeliveries: 0 }, rows: [] };
    }
  }

  static async getTaxReport() {
    try {
      const db = prisma as any;
      const orders = await db.order?.findMany?.({ take: 100, orderBy: { createdAt: 'desc' } }) || [];

      let totalTaxable = 0;
      const rows = orders.map((ord: any) => {
        const taxable = Number(ord.totalAmount || 0);
        totalTaxable += taxable;
        return {
          orderId: ord.id || '-',
          taxableAmount: taxable.toFixed(2),
          gst: "0.00",
          date: ord.createdAt ? new Date(ord.createdAt).toISOString() : '-'
        };
      });

      return {
        summary: { taxableSales: totalTaxable.toFixed(2) },
        rows
      };
    } catch (e: any) {
      return { summary: { taxableSales: "0.00" }, rows: [] };
    }
  }

  static async generateExcelWorkbook(reportType: string, filters: any, rows: any[], summary: any) {
    const wb = XLSX.utils.book_new();

    const summaryData = [
      ['Report Type', reportType.toUpperCase()],
      ['Generated At', new Date().toISOString()],
      ['Filters', JSON.stringify(filters || {})],
      [],
      ['Summary Metric', 'Value'],
      ...Object.entries(summary).map(([k, v]) => [k, v])
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

    const sanitizedRows = rows.map(row => {
      const sanitized: any = {};
      for (const [k, v] of Object.entries(row)) {
        if (v !== null && v !== undefined) {
          const sVal = String(v);
          if (/^[=+\-@]/.test(sVal)) {
            sanitized[k] = "'" + sVal;
          } else {
            sanitized[k] = v;
          }
        } else {
          sanitized[k] = '-';
        }
      }
      return sanitized;
    });

    const wsData = XLSX.utils.json_to_sheet(sanitizedRows.length > 0 ? sanitizedRows : [{ message: 'No data found' }]);
    XLSX.utils.book_append_sheet(wb, wsData, 'Data');

    return XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
  }
}
