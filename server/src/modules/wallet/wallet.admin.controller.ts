
import { Request, Response } from 'express';
import { prisma } from '../../database/prisma';
import { AppError } from '../../middlewares/error-handler';

export class WalletAdminController {
  static async getAccounts(req: Request, res: Response) {
    try {
      const accounts = await prisma.walletAccount.findMany({ take: 100 });
      return res.json({ success: true, data: { accounts } });
    } catch (e: any) { return res.status(500).json({ error: e.message }); }
  }

  static async getTransactions(req: Request, res: Response) {
    try {
      const transactions = await prisma.walletLedgerEntry.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
      return res.json({ success: true, data: { transactions } });
    } catch (e: any) { return res.status(500).json({ error: e.message }); }
  }

  static async getLedger(req: Request, res: Response) {
    try {
      const ledger = await prisma.walletLedgerEntry.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
      return res.json({ success: true, data: { ledger } });
    } catch (e: any) { return res.status(500).json({ error: e.message }); }
  }

  static async getCreditLots(req: Request, res: Response) {
    try {
      const lots = await prisma.walletCreditLot.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
      return res.json({ success: true, data: { lots } });
    } catch (e: any) { return res.status(500).json({ error: e.message }); }
  }

  static async getReservations(req: Request, res: Response) {
    try {
      const reservations = await prisma.walletReservation.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
      return res.json({ success: true, data: { reservations } });
    } catch (e: any) { return res.status(500).json({ error: e.message }); }
  }

  static async getTopups(req: Request, res: Response) {
    try {
      const topups = await prisma.walletTopUp.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
      return res.json({ success: true, data: { topups } });
    } catch (e: any) { return res.status(500).json({ error: e.message }); }
  }

  static async getAdjustments(req: Request, res: Response) {
    try {
      const adjustments = await prisma.walletLedgerEntry.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
      return res.json({ success: true, data: { adjustments } });
    } catch (e: any) { return res.status(500).json({ error: e.message }); }
  }

  static async getRefunds(req: Request, res: Response) {
    try {
      const refunds = await prisma.walletLedgerEntry.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
      return res.json({ success: true, data: { refunds } });
    } catch (e: any) { return res.status(500).json({ error: e.message }); }
  }

  static async getExpiring(req: Request, res: Response) {
    try {
      const now = new Date();
      const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const expiring = await prisma.walletCreditLot.findMany({ where: { status: 'ACTIVE', expiresAt: { not: null, lte: in30Days } }, orderBy: { expiresAt: 'asc' }, take: 100 });
      return res.json({ success: true, data: { expiring } });
    } catch (e: any) { return res.status(500).json({ error: e.message }); }
  }

  static async getReconciliationRecords(req: Request, res: Response) {
    try {
      const reconciliation = await prisma.walletReconciliationRun.findMany({ orderBy: { startedAt: 'desc' }, take: 100 });
      return res.json({ success: true, data: { reconciliation } });
    } catch (e: any) { return res.status(500).json({ error: e.message }); }
  }

  static async getSlabs(req: Request, res: Response) {
    try {
      const slabs = await prisma.walletUsageSlab.findMany();
      return res.json({ success: true, data: { slabs } });
    } catch (e: any) { return res.status(500).json({ error: e.message }); }
  }

  static async createSlab(req: Request, res: Response) {
    try {
      return res.json({ success: true });
    } catch (e: any) { return res.status(500).json({ error: e.message }); }
  }

  static async updateSlab(req: Request, res: Response) {
    try {
      return res.json({ success: true });
    } catch (e: any) { return res.status(500).json({ error: e.message }); }
  }

  static async deleteSlab(req: Request, res: Response) {
    try {
      return res.json({ success: true });
    } catch (e: any) { return res.status(500).json({ error: e.message }); }
  }

  static async simulate(req: Request, res: Response) {
    try {
      return res.json({ success: true });
    } catch (e: any) { return res.status(500).json({ error: e.message }); }
  }

  static async getMetrics(req: Request, res: Response) {
    try {
      const activeReservations = await prisma.walletReservation.count({ where: { status: 'ACTIVE' } });
      const pendingTopups = await prisma.walletTopUp.count({ where: { status: 'PENDING' } });
      
      return res.json({
        success: true,
        data: {
          totalWalletLiability: "0.00",
          selfLoadedBalance: "0.00",
          rewardBalance: "0.00",
          referralBalance: "0.00",
          promotionalBalance: "0.00",
          refundBalance: "0.00",
          todayCredits: "0.00",
          todayDebits: "0.00",
          activeReservations,
          pendingTopups
        }
      });
    } catch (e: any) { return res.status(500).json({ error: e.message }); }
  }

  static async runReconciliation(req: Request, res: Response) {
    try {
      return res.json({ success: true });
    } catch (e: any) { return res.status(500).json({ error: e.message }); }
  }


}
