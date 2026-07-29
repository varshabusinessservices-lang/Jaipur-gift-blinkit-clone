import { Request, Response } from 'express';
import { ReportService } from './report.service';
import { prisma } from '../../database/prisma';

export class ReportController {
  private static formatResponse(data: { summary: any; rows: any[] }, req: Request) {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 25;
    const total = data.rows.length;
    return {
      success: true,
      data,
      meta: {
        page,
        limit,
        total,
        from: req.query.from || null,
        to: req.query.to || null
      }
    };
  }

  static async getOverview(req: Request, res: Response) {
    try {
      const data = await ReportService.getOverviewReport(req.query as any);
      return res.json(ReportController.formatResponse(data, req));
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  static async getSales(req: Request, res: Response) {
    try {
      const data = await ReportService.getSalesReport(req.query as any);
      return res.json(ReportController.formatResponse(data, req));
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  static async getOrders(req: Request, res: Response) {
    try {
      const data = await ReportService.getOrderReport(req.query as any);
      return res.json(ReportController.formatResponse(data, req));
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  static async getPayments(req: Request, res: Response) {
    try {
      const data = await ReportService.getPaymentReport(req.query as any);
      return res.json(ReportController.formatResponse(data, req));
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  static async getWallet(req: Request, res: Response) {
    try {
      const data = await ReportService.getWalletReport();
      return res.json(ReportController.formatResponse(data, req));
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  static async getRewards(req: Request, res: Response) {
    try {
      const data = await ReportService.getRewardReport();
      return res.json(ReportController.formatResponse(data, req));
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  static async getReferrals(req: Request, res: Response) {
    try {
      const data = await ReportService.getReferralReport();
      return res.json(ReportController.formatResponse(data, req));
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  static async getRefunds(req: Request, res: Response) {
    try {
      const data = await ReportService.getRefundReport();
      return res.json(ReportController.formatResponse(data, req));
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  static async getCustomers(req: Request, res: Response) {
    try {
      const data = await ReportService.getCustomerReport();
      return res.json(ReportController.formatResponse(data, req));
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  static async getDelivery(req: Request, res: Response) {
    try {
      const data = await ReportService.getDeliveryReport();
      return res.json(ReportController.formatResponse(data, req));
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  static async getTaxes(req: Request, res: Response) {
    try {
      const data = await ReportService.getTaxReport();
      return res.json(ReportController.formatResponse(data, req));
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  static async exportReport(req: Request, res: Response) {
    try {
      const { reportType = 'sales', filters = {} } = req.body;
      let reportData: { summary: any; rows: any[] } = { summary: {}, rows: [] };

      switch (reportType) {
        case 'overview': reportData = await ReportService.getOverviewReport(filters); break;
        case 'sales': reportData = await ReportService.getSalesReport(filters); break;
        case 'orders': reportData = await ReportService.getOrderReport(filters); break;
        case 'payments': reportData = await ReportService.getPaymentReport(filters); break;
        case 'wallet': reportData = await ReportService.getWalletReport(); break;
        case 'rewards': reportData = await ReportService.getRewardReport(); break;
        case 'referrals': reportData = await ReportService.getReferralReport(); break;
        case 'refunds': reportData = await ReportService.getRefundReport(); break;
        case 'customers': reportData = await ReportService.getCustomerReport(); break;
        case 'delivery': reportData = await ReportService.getDeliveryReport(); break;
        case 'taxes': reportData = await ReportService.getTaxReport(); break;
        default: reportData = await ReportService.getSalesReport(filters); break;
      }

      const buffer = await ReportService.generateExcelWorkbook(reportType, filters, reportData.rows, reportData.summary);

      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `${reportType}-report-${dateStr}.xlsx`;

      // Record Export Job in DB
      try {
        await prisma.exportJob.create({
          data: {
            exportType: 'EXCEL',
            module: reportType.toUpperCase(),
            status: 'COMPLETED',
            filterParams: JSON.stringify(filters)
          }
        });
      } catch (err) {
        // Ignore db log error if schema differs slightly
      }

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Cache-Control', 'no-store');
      return res.send(buffer);
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  static async getExportHistory(req: Request, res: Response) {
    try {
      const jobs = await prisma.exportJob.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50
      });
      return res.json({
        success: true,
        data: {
          exports: jobs
        }
      });
    } catch (e: any) {
      return res.json({ success: true, data: { exports: [] } });
    }
  }

  static async downloadExportJob(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const job = await prisma.exportJob.findUnique({ where: { id } });
      if (!job) {
        return res.status(404).json({ success: false, error: 'Export job not found' });
      }

      // Re-generate export buffer for the job
      const filters = job.filterParams ? JSON.parse(job.filterParams) : {};
      const reportType = job.module.toLowerCase();
      let reportData: { summary: any; rows: any[] } = { summary: {}, rows: [] };

      switch (reportType) {
        case 'sales': reportData = await ReportService.getSalesReport(filters); break;
        case 'orders': reportData = await ReportService.getOrderReport(filters); break;
        default: reportData = await ReportService.getSalesReport(filters); break;
      }

      const buffer = await ReportService.generateExcelWorkbook(reportType, filters, reportData.rows, reportData.summary);
      const filename = `${reportType}-export-${job.id.slice(0, 8)}.xlsx`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Cache-Control', 'no-store');
      return res.send(buffer);
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }
}
