import { Request, Response } from 'express';
import { ProductionService } from './production.service';

const service = new ProductionService();

export class ProductionController {
  async initJob(req: Request, res: Response) {
    try {
      const { orderId } = req.body;
      if (!orderId) return res.status(400).json({ error: 'orderId is required' });
      const job = await service.createProductionJobForOrder(orderId);
      return res.status(201).json({ success: true, data: job });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async listJobs(req: Request, res: Response) {
    try {
      const { status, storeId, priority } = req.query;
      const jobs = await service.listJobs({
        status: status ? String(status) : undefined,
        storeId: storeId ? String(storeId) : undefined,
        priority: priority ? String(priority) : undefined,
      });
      return res.json({ success: true, data: jobs });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async getJob(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const job = await service.getJobById(id);
      return res.json({ success: true, data: job });
    } catch (err: any) {
      return res.status(404).json({ success: false, error: err.message });
    }
  }

  async reviewArtwork(req: Request, res: Response) {
    try {
      const { itemId } = req.params;
      const { action, notes, staffName } = req.body;
      const updated = await service.reviewArtwork({ itemId, action, notes, staffName });
      return res.json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async assignPrint(req: Request, res: Response) {
    try {
      const { itemId } = req.params;
      const { machineId, station, staffName } = req.body;
      const updated = await service.assignPrintAndStart({ itemId, machineId, station, staffName });
      return res.json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async completePrinting(req: Request, res: Response) {
    try {
      const { itemId } = req.params;
      const { staffName } = req.body;
      const updated = await service.completePrinting(itemId, staffName);
      return res.json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async qualityCheck(req: Request, res: Response) {
    try {
      const { itemId } = req.params;
      const { result, notes, images, staffName } = req.body;
      const updated = await service.performQualityCheck({ itemId, result, notes, images, staffName });
      return res.json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async reprint(req: Request, res: Response) {
    try {
      const { itemId } = req.params;
      const { reason, staffName } = req.body;
      const updated = await service.handleReprint(itemId, reason, staffName);
      return res.json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async packing(req: Request, res: Response) {
    try {
      const { itemId } = req.params;
      const { action, packageNotes, staffName } = req.body;
      const updated = await service.handlePacking({ itemId, action, packageNotes, staffName });
      return res.json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async getMachines(req: Request, res: Response) {
    try {
      const machines = await service.getMachines();
      return res.json({ success: true, data: machines });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async getStaff(req: Request, res: Response) {
    try {
      const staff = await service.getStaff();
      return res.json({ success: true, data: staff });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async customerStatus(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
      const job = await service.getJobByOrderId(orderId);
      const statusView = service.getCustomerStatusView(job?.status || 'NEW');
      return res.json({ success: true, data: { orderId, jobStatus: job?.status || 'NEW', customerView: statusView, items: job?.items || [] } });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }
}
