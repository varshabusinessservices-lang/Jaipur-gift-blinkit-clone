import { Request, Response } from 'express';
import { EnterpriseStoreService } from './enterpriseStore.service';

export class EnterpriseStoreController {
  private service = new EnterpriseStoreService();

  getDashboard = async (req: Request, res: Response) => {
    try {
      const data = await this.service.getDashboardOverview();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  listStores = async (req: Request, res: Response) => {
    try {
      const data = await this.service.listStores();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  createStore = async (req: Request, res: Response) => {
    try {
      const data = await this.service.createStore(req.body);
      res.status(201).json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  updateStore = async (req: Request, res: Response) => {
    try {
      const data = await this.service.updateStore(req.params.id, req.body);
      if (!data) return res.status(404).json({ success: false, error: 'Store not found' });
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  listInventory = async (req: Request, res: Response) => {
    try {
      const data = await this.service.listInventory(req.query.storeId as string);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  upsertInventory = async (req: Request, res: Response) => {
    try {
      const data = await this.service.upsertInventory(req.body);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  listTransfers = async (req: Request, res: Response) => {
    try {
      const data = await this.service.listTransfers(req.query.storeId as string);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  createTransfer = async (req: Request, res: Response) => {
    try {
      const data = await this.service.createTransfer(req.body);
      res.status(201).json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  updateTransferStatus = async (req: Request, res: Response) => {
    try {
      const { status, note } = req.body;
      const data = await this.service.updateTransferStatus(req.params.id, status, note);
      if (!data) return res.status(404).json({ success: false, error: 'Transfer not found' });
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  listVendors = async (req: Request, res: Response) => {
    try {
      const data = await this.service.listVendors();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  createVendor = async (req: Request, res: Response) => {
    try {
      const data = await this.service.createVendor(req.body);
      res.status(201).json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  listPurchaseOrders = async (req: Request, res: Response) => {
    try {
      const data = await this.service.listPurchaseOrders();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  createPurchaseOrder = async (req: Request, res: Response) => {
    try {
      const data = await this.service.createPurchaseOrder(req.body);
      res.status(201).json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  listFranchises = async (req: Request, res: Response) => {
    try {
      const data = await this.service.listFranchises();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  createFranchise = async (req: Request, res: Response) => {
    try {
      const data = await this.service.createFranchise(req.body);
      res.status(201).json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  listPrintingJobs = async (req: Request, res: Response) => {
    try {
      const data = await this.service.listPrintingJobs();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  createPrintingJob = async (req: Request, res: Response) => {
    try {
      const data = await this.service.createPrintingJob(req.body);
      res.status(201).json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  updatePrintingJobStatus = async (req: Request, res: Response) => {
    try {
      const data = await this.service.updatePrintingJobStatus(req.params.id, req.body.status);
      if (!data) return res.status(404).json({ success: false, error: 'Printing job not found' });
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  listDeliveryAdapters = async (req: Request, res: Response) => {
    try {
      const data = await this.service.listDeliveryAdapters();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  createDeliveryAdapter = async (req: Request, res: Response) => {
    try {
      const data = await this.service.createDeliveryAdapter(req.body);
      res.status(201).json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  listCapacities = async (req: Request, res: Response) => {
    try {
      const data = await this.service.listCapacities(req.query.storeId as string);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  upsertCapacity = async (req: Request, res: Response) => {
    try {
      const data = await this.service.upsertCapacity(req.body);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };
}
