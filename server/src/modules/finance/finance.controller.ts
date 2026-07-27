import { Request, Response } from 'express';
import { FinanceRepository } from './finance.repository';
import { FinanceService } from './finance.service';

const repo = new FinanceRepository();
const service = new FinanceService();

export class FinanceController {
  async getDashboard(req: Request, res: Response) {
    try {
      const summary = await service.getDashboardSummary();
      return res.json({ success: true, data: summary });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async getLedger(req: Request, res: Response) {
    try {
      const { storeId, customerId, transactionType, limit } = req.query;
      const items = await repo.listLedgerEntries({
        storeId: storeId as string,
        customerId: customerId as string,
        transactionType: transactionType as string,
        limit: limit ? Number(limit) : 50,
      });
      return res.json({ success: true, data: items });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async getRevenue(req: Request, res: Response) {
    try {
      const report = await service.generateReport('revenue', req.query);
      return res.json({ success: true, data: report });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async getSettlements(req: Request, res: Response) {
    try {
      const items = await repo.listSettlements(req.query);
      return res.json({ success: true, data: items });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async getWalletHistory(req: Request, res: Response) {
    try {
      const customerId = (req as any).user?.id || req.query.customerId || 'cust-demo-123';
      const history = await repo.getWalletHistory(customerId as string);
      const balance = await repo.getWalletBalance(customerId as string);
      return res.json({ success: true, data: { customerId, balance, history } });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async adminWalletList(req: Request, res: Response) {
    try {
      const wallets = JSON.parse(require('fs').readFileSync(require('path').join(process.cwd(), 'server', 'src', 'modules', 'finance', 'wallet_ledgers.json'), 'utf-8') || '[]');
      return res.json({ success: true, data: wallets });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async getOrderReport(req: Request, res: Response) {
    try {
      const report = await service.generateReport('orders', req.query);
      return res.json({ success: true, data: report });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async getProductReport(req: Request, res: Response) {
    try {
      const report = await service.generateReport('products', req.query);
      return res.json({ success: true, data: report });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async getCustomerReport(req: Request, res: Response) {
    try {
      const report = await service.generateReport('customers', req.query);
      return res.json({ success: true, data: report });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async getProductionReport(req: Request, res: Response) {
    try {
      const report = await service.generateReport('production', req.query);
      return res.json({ success: true, data: report });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async getDeliveryReport(req: Request, res: Response) {
    try {
      const report = await service.generateReport('delivery', req.query);
      return res.json({ success: true, data: report });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async getReturnReport(req: Request, res: Response) {
    try {
      const report = await service.generateReport('returns', req.query);
      return res.json({ success: true, data: report });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async createExport(req: Request, res: Response) {
    try {
      const { exportType, module, filterParams } = req.body;
      const job = await repo.createExportJob({
        exportType: exportType || 'CSV',
        module: module || 'FINANCE',
        filterParams: filterParams || {},
      });
      return res.json({ success: true, data: job });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}
