import { Request, Response } from 'express';
import { DeliveryZonesService } from './deliveryZones.service';

export class DeliveryZonesController {
  private service = new DeliveryZonesService();

  listZones = async (req: Request, res: Response) => {
    try {
      const { storeId, status, city, search } = req.query;
      const data = await this.service.listZones({
        storeId: storeId as string,
        status: status as string,
        city: city as string,
        search: search as string,
      });
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  getZoneById = async (req: Request, res: Response) => {
    try {
      const data = await this.service.getZoneById(req.params.id);
      if (!data) {
        return res.status(404).json({ success: false, error: 'Delivery zone not found' });
      }
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  createZone = async (req: Request, res: Response) => {
    try {
      const result = await this.service.createZone(req.body);
      if (!result.success) {
        return res.status(400).json({ success: false, errors: result.errors });
      }
      res.status(201).json({ success: true, data: result.zone });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  updateZone = async (req: Request, res: Response) => {
    try {
      const result = await this.service.updateZone(req.params.id, req.body);
      if (!result.success) {
        return res.status(400).json({ success: false, errors: result.errors });
      }
      res.json({ success: true, data: result.zone });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  deleteZone = async (req: Request, res: Response) => {
    try {
      const ok = await this.service.deleteZone(req.params.id);
      if (!ok) {
        return res.status(404).json({ success: false, error: 'Delivery zone not found' });
      }
      res.json({ success: true, message: 'Delivery zone deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  duplicateZone = async (req: Request, res: Response) => {
    try {
      const data = await this.service.duplicateZone(req.params.id);
      if (!data) {
        return res.status(404).json({ success: false, error: 'Delivery zone not found' });
      }
      res.status(201).json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  checkZone = async (req: Request, res: Response) => {
    try {
      const { latitude, longitude, pincode } = req.body;
      const availability = await this.service.checkDeliveryAvailability({
        latitude: latitude !== undefined ? parseFloat(latitude) : undefined,
        longitude: longitude !== undefined ? parseFloat(longitude) : undefined,
        pincode: pincode ? String(pincode) : undefined,
      });
      res.json({ success: true, data: availability });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  getAnalytics = async (req: Request, res: Response) => {
    try {
      const data = await this.service.getAdminAnalytics();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  getPricingMatrix = async (req: Request, res: Response) => {
    try {
      const data = this.service.getPricingMatrix();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };
}
