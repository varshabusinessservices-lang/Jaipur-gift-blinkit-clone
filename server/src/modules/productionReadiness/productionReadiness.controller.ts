import { Request, Response } from 'express';
import { ProductionReadinessService } from './productionReadiness.service';

export class ProductionReadinessController {
  private service = new ProductionReadinessService();

  getHealth = async (req: Request, res: Response) => {
    try {
      const data = await this.service.getHealthStatus();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  getMetrics = async (req: Request, res: Response) => {
    try {
      const data = await this.service.getMetrics();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  listWorkers = async (req: Request, res: Response) => {
    try {
      const data = await this.service.listWorkers();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  triggerWorker = async (req: Request, res: Response) => {
    try {
      const data = await this.service.triggerWorker(req.params.id);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(404).json({ success: false, error: err.message });
    }
  };

  getAuditLogs = async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const data = await this.service.getAuditLogs(limit);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };
}
