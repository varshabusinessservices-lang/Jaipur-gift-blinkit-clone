import { Router } from 'express';
import { EnterpriseStoreController } from './enterpriseStore.controller';

const router = Router();
const controller = new EnterpriseStoreController();

router.get('/dashboard', controller.getDashboard);

// Stores
router.get('/stores', controller.listStores);
router.post('/stores', controller.createStore);
router.put('/stores/:id', controller.updateStore);

// Inventory
router.get('/inventory', controller.listInventory);
router.post('/inventory', controller.upsertInventory);

// Transfers
router.get('/transfers', controller.listTransfers);
router.post('/transfers', controller.createTransfer);
router.patch('/transfers/:id/status', controller.updateTransferStatus);

// Vendors & POs
router.get('/vendors', controller.listVendors);
router.post('/vendors', controller.createVendor);
router.get('/purchase-orders', controller.listPurchaseOrders);
router.post('/purchase-orders', controller.createPurchaseOrder);

// Franchises
router.get('/franchises', controller.listFranchises);
router.post('/franchises', controller.createFranchise);

// Printing Partners
router.get('/printing-jobs', controller.listPrintingJobs);
router.post('/printing-jobs', controller.createPrintingJob);
router.patch('/printing-jobs/:id/status', controller.updatePrintingJobStatus);

// Delivery Adapters
router.get('/delivery-adapters', controller.listDeliveryAdapters);
router.post('/delivery-adapters', controller.createDeliveryAdapter);

// Capacity
router.get('/capacities', controller.listCapacities);
router.post('/capacities', controller.upsertCapacity);

export default router;
