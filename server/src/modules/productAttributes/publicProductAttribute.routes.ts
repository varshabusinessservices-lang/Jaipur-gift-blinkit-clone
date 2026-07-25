import { Router, Request, Response, NextFunction } from 'express';
import { productAttributeService } from './productAttribute.service';

export const publicProductAttributeRouter = Router();

publicProductAttributeRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const options = await productAttributeService.getOptions({ activeOnly: true });
    res.json({
      success: true,
      data: options,
    });
  } catch (err) {
    next(err);
  }
});

publicProductAttributeRouter.get('/category/:categoryId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const options = await productAttributeService.getOptions({
      activeOnly: true,
      categoryId: req.params.categoryId,
      includeInherited: true,
    });
    res.json({
      success: true,
      data: options,
    });
  } catch (err) {
    next(err);
  }
});
