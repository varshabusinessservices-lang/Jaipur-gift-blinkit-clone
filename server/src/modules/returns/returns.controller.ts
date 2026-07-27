import { Request, Response } from 'express';
import { ReturnsService } from './returns.service';

const service = new ReturnsService();

export class ReturnsController {
  async createReturn(req: Request, res: Response) {
    try {
      const { orderId, orderItemId, customerId, reason, remarks, images, videos, requestedQuantity } = req.body;
      if (!orderId || !customerId || !reason) {
        return res.status(400).json({ error: 'orderId, customerId, and reason are required' });
      }
      const ret = await service.createReturnRequest({
        orderId,
        orderItemId,
        customerId,
        reason,
        remarks,
        images,
        videos,
        requestedQuantity,
      });
      return res.status(201).json({ success: true, data: ret });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async listReturns(req: Request, res: Response) {
    try {
      const { customerId, status } = req.query;
      const list = await service.listReturns({
        customerId: customerId ? String(customerId) : undefined,
        status: status ? String(status) : undefined,
      });
      return res.json({ success: true, data: list });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async getReturn(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const ret = await service.getReturnById(id);
      return res.json({ success: true, data: ret });
    } catch (err: any) {
      return res.status(404).json({ success: false, error: err.message });
    }
  }

  async adminUpdateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, adminId } = req.body;
      if (!status) return res.status(400).json({ error: 'status is required' });
      const updated = await service.adminUpdateReturnStatus(id, status, adminId);
      return res.json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async recordInspection(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { result, condition, damageType, missingParts, photos, inspectorNotes, inspectorId } = req.body;
      if (!result) return res.status(400).json({ error: 'result is required' });
      const inspection = await service.recordInspection({
        returnId: id,
        result,
        condition,
        damageType,
        missingParts,
        photos,
        inspectorNotes,
        inspectorId,
      });
      return res.status(201).json({ success: true, data: inspection });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async createReplacement(req: Request, res: Response) {
    try {
      const { id } = req.params; // returnId
      const { adminId } = req.body;
      const replacement = await service.createReplacement({ returnId: id, adminId });
      return res.status(201).json({ success: true, data: replacement });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async processRefund(req: Request, res: Response) {
    try {
      const { orderId, returnId, amount, mode, reference, createdBy, approvedBy } = req.body;
      if (!orderId || amount === undefined || !mode) {
        return res.status(400).json({ error: 'orderId, amount, and mode are required' });
      }
      const refund = await service.processRefund({
        orderId,
        returnId,
        amount: Number(amount),
        mode,
        reference,
        createdBy,
        approvedBy,
      });
      return res.status(201).json({ success: true, data: refund });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async listRefunds(req: Request, res: Response) {
    try {
      const { orderId } = req.query;
      const refunds = await service.listRefunds({ orderId: orderId ? String(orderId) : undefined });
      return res.json({ success: true, data: refunds });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }
}
