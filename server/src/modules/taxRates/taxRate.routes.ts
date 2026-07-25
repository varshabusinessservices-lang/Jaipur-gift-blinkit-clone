import { Router } from 'express';
import * as taxRateController from './taxRate.controller';

export const taxRateRouter = Router();

taxRateRouter.get('/', taxRateController.getTaxRates);
taxRateRouter.get('/options', taxRateController.getTaxRateOptions);
taxRateRouter.get('/:id', taxRateController.getTaxRateById);
taxRateRouter.post('/', taxRateController.createTaxRate);
taxRateRouter.patch('/:id', taxRateController.updateTaxRate);
taxRateRouter.patch('/:id/default', taxRateController.setDefaultTaxRate);
taxRateRouter.patch('/:id/status', taxRateController.updateTaxRateStatus);
taxRateRouter.delete('/:id', taxRateController.deleteTaxRate);
taxRateRouter.post('/:id/restore', taxRateController.restoreTaxRate);
