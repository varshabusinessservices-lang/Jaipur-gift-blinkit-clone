import { Request, Response } from 'express';
import { DeliveryService } from './delivery.service';

const service = new DeliveryService();

export class DeliveryController {
  async initTask(req: Request, res: Response) {
    try {
      const { orderId, storeId, deliveryPartner, deliveryMode, priority, pickupAddress, deliveryAddress, estimatedDistance, estimatedDuration } = req.body;
      if (!orderId) return res.status(400).json({ error: 'orderId is required' });
      const task = await service.createDeliveryTaskForOrder({
        orderId,
        storeId,
        deliveryPartner,
        deliveryMode,
        priority,
        pickupAddress,
        deliveryAddress,
        estimatedDistance,
        estimatedDuration,
      });
      return res.status(201).json({ success: true, data: task });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async listTasks(req: Request, res: Response) {
    try {
      const { status, riderId, storeId } = req.query;
      const tasks = await service.listTasks({
        status: status ? String(status) : undefined,
        riderId: riderId ? String(riderId) : undefined,
        storeId: storeId ? String(storeId) : undefined,
      });
      return res.json({ success: true, data: tasks });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async getTask(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const task = await service.getTaskById(id);
      return res.json({ success: true, data: task });
    } catch (err: any) {
      return res.status(404).json({ success: false, error: err.message });
    }
  }

  async assignRider(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { riderId } = req.body;
      if (!riderId) return res.status(400).json({ error: 'riderId is required' });
      const updated = await service.assignRider({ taskId: id, riderId });
      return res.json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async riderAccept(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updated = await service.riderAcceptTask(id);
      return res.json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async pickup(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updated = await service.markPickedUp(id);
      return res.json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async outForDelivery(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updated = await service.setOutForDelivery(id);
      return res.json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async arrived(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updated = await service.markArrived(id);
      return res.json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async verifyOtp(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { otp } = req.body;
      if (!otp) return res.status(400).json({ error: 'otp is required' });
      const updated = await service.verifyOtpAndDeliver({ taskId: id, otp });
      return res.json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async proofOfDelivery(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { photoUrl, recipientName, recipientRelation, signature, notes } = req.body;
      if (!recipientName) return res.status(400).json({ error: 'recipientName is required' });
      const updated = await service.recordProofOfDelivery({
        taskId: id,
        photoUrl,
        recipientName,
        recipientRelation,
        signature,
        notes,
      });
      return res.json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async exception(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { reason, notes } = req.body;
      if (!reason) return res.status(400).json({ error: 'reason is required' });
      const updated = await service.reportException({ taskId: id, reason, notes });
      return res.json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async getRiders(req: Request, res: Response) {
    try {
      const { storeId } = req.query;
      const riders = await service.getRiders(storeId ? String(storeId) : undefined);
      return res.json({ success: true, data: riders });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async customerTracking(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
      const task = await (service as any).repo.findTaskByOrderId(orderId);
      const orderRepo = new (await import('../orders/order.repository')).OrderRepository();
      const order = await orderRepo.findOrderById(orderId);
      const trackingView = service.getCustomerTrackingView(order?.status || 'NEW', task);
      return res.json({
        success: true,
        data: {
          orderId,
          orderStatus: order?.status || 'NEW',
          tracking: trackingView,
          task: task ? { taskNumber: task.taskNumber, status: task.status, estimatedDuration: task.estimatedDuration } : null,
        },
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }
}
