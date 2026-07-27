import { Request, Response } from 'express';
import { CheckoutService } from './checkout.service';

const checkoutService = new CheckoutService();

export class CheckoutController {
  async createSession(req: Request, res: Response) {
    try {
      const customerId = (req as any).customer?.id || req.body.customerId;
      if (!customerId) {
        return res.status(401).json({ error: 'Customer authentication required (No guest checkout)' });
      }
      const { cartId, storeId } = req.body;
      if (!cartId) {
        return res.status(400).json({ error: 'cartId is required' });
      }
      const session = await checkoutService.createCheckoutSession({ customerId, cartId, storeId });
      return res.status(201).json({ success: true, data: session });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async getSession(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const session = await checkoutService.getSessionById(id);
      return res.json({ success: true, data: session });
    } catch (err: any) {
      return res.status(404).json({ success: false, error: err.message });
    }
  }

  async getCustomerSessions(req: Request, res: Response) {
    try {
      const customerId = (req as any).customer?.id || req.query.customerId;
      if (!customerId) {
        return res.status(401).json({ error: 'Customer authentication required' });
      }
      const sessions = await checkoutService.getSessionsByCustomer(String(customerId));
      return res.json({ success: true, data: sessions });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async validateCheckout(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await checkoutService.validateCheckout(id);
      return res.json({ success: true, data: result });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async updateAddress(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await checkoutService.updateCheckoutAddress(id, req.body);
      return res.json({ success: true, data: result });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async checkServiceability(req: Request, res: Response) {
    try {
      const { pincode } = req.query;
      if (!pincode) return res.status(400).json({ error: 'pincode query required' });
      const result = await checkoutService.checkServiceability(String(pincode));
      return res.json({ success: true, data: result });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async getDeliverySlots(req: Request, res: Response) {
    try {
      const { pincode, mode } = req.query;
      const slots = await checkoutService.getAvailableDeliverySlots(String(pincode || '302001'), (mode as any) || 'SAME_DAY');
      return res.json({ success: true, data: slots });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async calculatePricing(req: Request, res: Response) {
    try {
      const { subtotal, mode, weightKg } = req.body;
      const pricing = await checkoutService.calculateDeliveryPricing({
        subtotal: Number(subtotal || 0),
        mode: mode || 'SAME_DAY',
        weightKg: Number(weightKg || 1),
      });
      return res.json({ success: true, data: pricing });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async previewWallet(req: Request, res: Response) {
    try {
      const customerId = (req as any).customer?.id || req.body.customerId;
      const { amount } = req.body;
      const preview = await checkoutService.previewWallet(customerId, Number(amount || 0));
      return res.json({ success: true, data: preview });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async applyCoupon(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { code } = req.body;
      const session = await checkoutService.applyCoupon(id, code);
      return res.json({ success: true, data: session });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async createRazorpayOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { amount } = req.body;
      const session = await checkoutService.createRazorpayOrderSnapshot(id, Number(amount || 0));
      return res.json({ success: true, data: session });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async recordConsent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const session = await checkoutService.recordConsent(id, req.body);
      return res.json({ success: true, data: session });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async resolvePaymentMethods(req: Request, res: Response) {
    try {
      const result = await checkoutService.resolvePaymentMethods(req.body);
      return res.json({ success: true, data: result });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  // Admin Controllers
  async adminListSessions(req: Request, res: Response) {
    try {
      const { status, customerId } = req.query;
      const sessions = await checkoutService.adminListSessions({
        status: status ? String(status) : undefined,
        customerId: customerId ? String(customerId) : undefined,
      });
      return res.json({ success: true, data: sessions });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async adminGetSession(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const session = await checkoutService.adminGetSession(id);
      return res.json({ success: true, data: session });
    } catch (err: any) {
      return res.status(404).json({ success: false, error: err.message });
    }
  }

  async adminUpdateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const session = await checkoutService.adminUpdateStatus(id, status);
      return res.json({ success: true, data: session });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async adminGetStats(req: Request, res: Response) {
    try {
      const stats = await checkoutService.adminGetStats();
      return res.json({ success: true, data: stats });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }
}
