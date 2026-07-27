import { Request, Response } from 'express';
import { OrderService } from './order.service';

const orderService = new OrderService();

export class OrderController {
  async createOrder(req: Request, res: Response) {
    try {
      const customerId = (req as any).customer?.id || req.body.customerId;
      if (!customerId) {
        return res.status(401).json({ error: 'Customer authentication required (No guest orders)' });
      }
      const { checkoutSessionId, paymentGateway, gatewayOrderId, gatewayPaymentId, gatewaySignature } = req.body;
      if (!checkoutSessionId) {
        return res.status(400).json({ error: 'checkoutSessionId is required' });
      }

      const order = await orderService.createOrderFromCheckout({
        checkoutSessionId,
        customerId,
        paymentGateway,
        gatewayOrderId,
        gatewayPaymentId,
        gatewaySignature,
      });

      return res.status(201).json({ success: true, data: order });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async getCustomerOrders(req: Request, res: Response) {
    try {
      const customerId = (req as any).customer?.id || req.query.customerId;
      if (!customerId) {
        return res.status(401).json({ error: 'Customer authentication required' });
      }
      const orders = await orderService.getOrdersByCustomer(String(customerId));
      return res.json({ success: true, data: orders });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async getOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const order = await orderService.getOrderById(id);
      return res.json({ success: true, data: order });
    } catch (err: any) {
      return res.status(404).json({ success: false, error: err.message });
    }
  }

  async getOrderTimeline(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const order = await orderService.getOrderById(id);
      return res.json({ success: true, data: order.timelines });
    } catch (err: any) {
      return res.status(404).json({ success: false, error: err.message });
    }
  }

  async getOrderInvoice(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const order = await orderService.getOrderById(id);
      return res.json({ success: true, data: order.invoices?.[0] || null });
    } catch (err: any) {
      return res.status(404).json({ success: false, error: err.message });
    }
  }

  async cancelOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const order = await orderService.cancelOrder(id, reason);
      return res.json({ success: true, data: order });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async razorpayWebhook(req: Request, res: Response) {
    try {
      await orderService.handleRazorpayWebhook(req.body);
      return res.json({ success: true, received: true });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  // Admin controllers
  async adminListOrders(req: Request, res: Response) {
    try {
      const { status, customerId } = req.query;
      const orders = await orderService.adminListOrders({
        status: status ? String(status) : undefined,
        customerId: customerId ? String(customerId) : undefined,
      });
      return res.json({ success: true, data: orders });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async adminGetOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const order = await orderService.getOrderById(id);
      return res.json({ success: true, data: order });
    } catch (err: any) {
      return res.status(404).json({ success: false, error: err.message });
    }
  }

  async adminUpdateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, paymentStatus } = req.body;
      const order = await orderService.adminUpdateStatus(id, status, paymentStatus);
      return res.json({ success: true, data: order });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async adminGetStats(req: Request, res: Response) {
    try {
      const stats = await orderService.getOrderStats();
      return res.json({ success: true, data: stats });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }
}
