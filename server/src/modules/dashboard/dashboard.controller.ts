import { Request, Response } from 'express';
import { dashboardFilterSchema } from './dashboard.schemas';
import { dashboardService } from './dashboard.service';

export async function getOverview(req: Request, res: Response): Promise<void> {
  try {
    const filter = dashboardFilterSchema.parse(req.query);
    const adminName = (req as any).admin?.name || 'Super Admin';
    const data = await dashboardService.getOverview(filter, adminName);
    res.json({
      success: true,
      message: 'Dashboard overview retrieved successfully',
      data,
      meta: dashboardService.getMeta(filter),
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Invalid dashboard parameters' });
  }
}

export async function getSummary(req: Request, res: Response): Promise<void> {
  try {
    const filter = dashboardFilterSchema.parse(req.query);
    const data = await dashboardService.getSummary(filter);
    res.json({
      success: true,
      message: 'Dashboard summary retrieved',
      data,
      meta: dashboardService.getMeta(filter),
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Invalid parameters' });
  }
}

export async function getRevenueOrders(req: Request, res: Response): Promise<void> {
  try {
    const filter = dashboardFilterSchema.parse(req.query);
    const data = await dashboardService.getRevenueOrders(filter);
    res.json({
      success: true,
      message: 'Dashboard revenue and orders retrieved',
      data,
      meta: dashboardService.getMeta(filter),
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Invalid parameters' });
  }
}

export async function getOrderHistory(req: Request, res: Response): Promise<void> {
  try {
    const filter = dashboardFilterSchema.parse(req.query);
    const data = await dashboardService.getOrderHistory(filter);
    res.json({
      success: true,
      message: 'Order history retrieved',
      data,
      meta: dashboardService.getMeta(filter),
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Invalid parameters' });
  }
}

export async function getOrderFunnel(req: Request, res: Response): Promise<void> {
  try {
    const filter = dashboardFilterSchema.parse(req.query);
    const data = await dashboardService.getOrderFunnel(filter);
    res.json({
      success: true,
      message: 'Order status funnel retrieved',
      data,
      meta: dashboardService.getMeta(filter),
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Invalid parameters' });
  }
}

export async function getCustomerInsights(req: Request, res: Response): Promise<void> {
  try {
    const filter = dashboardFilterSchema.parse(req.query);
    const data = await dashboardService.getCustomerInsights(filter);
    res.json({
      success: true,
      message: 'Customer insights retrieved',
      data,
      meta: dashboardService.getMeta(filter),
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Invalid parameters' });
  }
}

export async function getTopProducts(req: Request, res: Response): Promise<void> {
  try {
    const filter = dashboardFilterSchema.parse(req.query);
    const data = await dashboardService.getTopProducts(filter);
    res.json({
      success: true,
      message: 'Top products retrieved',
      data,
      meta: dashboardService.getMeta(filter),
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Invalid parameters' });
  }
}

export async function getTopCategories(req: Request, res: Response): Promise<void> {
  try {
    const filter = dashboardFilterSchema.parse(req.query);
    const data = await dashboardService.getTopCategories(filter);
    res.json({
      success: true,
      message: 'Top categories retrieved',
      data,
      meta: dashboardService.getMeta(filter),
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Invalid parameters' });
  }
}

export async function getTopDeliveryBoys(req: Request, res: Response): Promise<void> {
  try {
    const filter = dashboardFilterSchema.parse(req.query);
    const data = await dashboardService.getTopDeliveryBoys(filter);
    res.json({
      success: true,
      message: 'Top delivery boys retrieved',
      data,
      meta: dashboardService.getMeta(filter),
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Invalid parameters' });
  }
}

export async function getRecentOrders(req: Request, res: Response): Promise<void> {
  try {
    const limit = Math.min(25, Math.max(1, parseInt((req.query.limit as string) || '10', 10)));
    const data = await dashboardService.getRecentOrders(limit);
    res.json({
      success: true,
      message: 'Recent orders retrieved',
      data,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Invalid parameters' });
  }
}

export async function getPersonalisationAttention(req: Request, res: Response): Promise<void> {
  try {
    const data = await dashboardService.getPersonalisationAttention();
    res.json({
      success: true,
      message: 'Personalisation attention items retrieved',
      data,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
}

export async function getDeliveryOverview(req: Request, res: Response): Promise<void> {
  try {
    const filter = dashboardFilterSchema.parse(req.query);
    const data = await dashboardService.getDeliveryOverview(filter);
    res.json({
      success: true,
      message: 'Delivery overview retrieved',
      data,
      meta: dashboardService.getMeta(filter),
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Invalid parameters' });
  }
}

export async function getOvernightOrders(req: Request, res: Response): Promise<void> {
  try {
    const data = await dashboardService.getOvernightOrders();
    res.json({
      success: true,
      message: 'Overnight orders retrieved',
      data,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
}

export async function getLowStock(req: Request, res: Response): Promise<void> {
  try {
    const data = await dashboardService.getLowStock();
    res.json({
      success: true,
      message: 'Low stock items retrieved',
      data,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
}
