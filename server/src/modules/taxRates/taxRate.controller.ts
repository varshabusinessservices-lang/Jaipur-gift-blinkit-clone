import { Request, Response } from 'express';
import { TaxRateService } from './taxRate.service';
import { TaxRateFilterQuery, CreateTaxRateDto, UpdateTaxRateDto } from './taxRate.types';

const taxRateService = new TaxRateService();

export const getTaxRates = async (req: Request, res: Response) => {
  try {
    const filters: TaxRateFilterQuery = {
      search: req.query.search as string,
      status: req.query.status as any,
      taxType: req.query.taxType as any,
      defaultOnly: req.query.defaultOnly as string,
      includeDeleted: req.query.includeDeleted as string,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 20,
      sortBy: (req.query.sortBy as any) || 'sortOrder',
      sortOrder: (req.query.sortOrder as any) || 'asc',
    };

    const result = await taxRateService.getTaxRates(filters);
    res.json({
      success: true,
      data: result.taxRates,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch tax rates' });
  }
};

export const getTaxRateOptions = async (req: Request, res: Response) => {
  try {
    const options = await taxRateService.getOptions({
      activeOnly: req.query.activeOnly as string,
      search: req.query.search as string,
      storeId: req.query.storeId as string,
    });
    res.json({
      success: true,
      data: options,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch tax rate options' });
  }
};

export const getTaxRateById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const taxRate = await taxRateService.getTaxRateById(id);
    res.json({
      success: true,
      data: taxRate,
    });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message || 'Tax rate not found' });
  }
};

export const createTaxRate = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const dto: CreateTaxRateDto = req.body;
    const taxRate = await taxRateService.createTaxRate(dto, user?.id);

    res.status(201).json({
      success: true,
      message: 'Tax rate created successfully',
      data: taxRate,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to create tax rate' });
  }
};

export const updateTaxRate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const dto: UpdateTaxRateDto = req.body;

    const taxRate = await taxRateService.updateTaxRate(id, dto, user?.id);
    res.json({
      success: true,
      message: 'Tax rate updated successfully',
      data: taxRate,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to update tax rate' });
  }
};

export const setDefaultTaxRate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    const taxRate = await taxRateService.setDefaultTaxRate(id, user?.id);
    res.json({
      success: true,
      message: 'Default tax rate updated successfully',
      data: taxRate,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to set default tax rate' });
  }
};

export const updateTaxRateStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = (req as any).user;

    const taxRate = await taxRateService.updateTaxRateStatus(id, status, user?.id);
    res.json({
      success: true,
      message: 'Tax rate status updated successfully',
      data: taxRate,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to update tax rate status' });
  }
};

export const deleteTaxRate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    const result = await taxRateService.deleteTaxRate(id, user?.id);
    res.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to delete tax rate' });
  }
};

export const restoreTaxRate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    const taxRate = await taxRateService.restoreTaxRate(id, user?.id);
    res.json({
      success: true,
      message: 'Tax rate restored successfully',
      data: taxRate,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to restore tax rate' });
  }
};
