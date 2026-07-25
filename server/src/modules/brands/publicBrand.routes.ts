import { Router, Request, Response } from 'express';
import { BrandService } from './brand.service';

export const publicBrandRouter = Router();
const brandService = new BrandService();

publicBrandRouter.get('/', async (req: Request, res: Response) => {
  try {
    const result = await brandService.getBrands({
      status: 'ACTIVE',
      includeDeleted: false,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 50,
      search: req.query.search as string,
    });
    res.json({
      success: true,
      data: result.brands,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch public brands' });
  }
});

publicBrandRouter.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const result = await brandService.getBrands({
      search: slug,
      status: 'ACTIVE',
      includeDeleted: false,
      limit: 1,
    });
    const found = result.brands.find((b) => b.slug === slug);
    if (!found) {
      res.status(404).json({ success: false, message: 'Brand not found' });
      return;
    }
    res.json({
      success: true,
      data: found,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch brand' });
  }
});
