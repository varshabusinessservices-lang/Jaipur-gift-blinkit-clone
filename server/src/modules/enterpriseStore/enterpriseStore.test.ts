import { describe, it, expect } from 'vitest';
import { EnterpriseStoreRepository } from './enterpriseStore.repository';
import { EnterpriseStoreService } from './enterpriseStore.service';

describe('Enterprise Multi-Store System - Batch 23', () => {
  const repo = new EnterpriseStoreRepository();
  const service = new EnterpriseStoreService();

  it('should support store creation and isolation (Store Types: WAREHOUSE, RETAIL_STORE, FRANCHISE_STORE)', async () => {
    const store = await repo.createStore({
      storeName: 'Jaipur Central Warehouse',
      storeType: 'WAREHOUSE',
      gstin: '08AABCW1234K1ZU',
      address: 'Industrial Area, Jaipur',
      deliveryRadiusKm: 25,
    });
    expect(store.id).toBeDefined();
    expect(store.storeType).toBe('WAREHOUSE');

    const retrieved = await repo.getStoreById(store.id);
    expect(retrieved.storeName).toBe('Jaipur Central Warehouse');
  });

  it('should manage store inventory isolation and adjustments', async () => {
    const storeId = `store-${Date.now()}`;
    const prodId = 'prod-gift-box-1';

    await repo.upsertInventory({
      storeId,
      productId: prodId,
      available: 50,
      reserved: 5,
      inProduction: 10,
    });

    const inventory = await repo.listInventory(storeId);
    expect(inventory.length).toBe(1);
    expect(inventory[0].available).toBe(50);
    expect(inventory[0].reserved).toBe(5);
  });

  it('should handle store transfers (Request, Approve, Dispatch, Receive)', async () => {
    const sourceStoreId = 'store-source-1';
    const destStoreId = 'store-dest-1';

    const transfer = await repo.createTransfer({
      sourceStoreId,
      destinationStoreId: destStoreId,
      items: [{ productId: 'prod-1', quantity: 15 }],
      notes: 'Stock replenishment for festival season',
    });

    expect(transfer.transferNumber).toBeDefined();
    expect(transfer.status).toBe('REQUESTED');

    const approved = await repo.updateTransferStatus(transfer.id, 'APPROVED', 'Approved by Regional Manager');
    expect(approved.status).toBe('APPROVED');

    const dispatched = await repo.updateTransferStatus(transfer.id, 'DISPATCHED', 'Dispatched via logistics partner');
    expect(dispatched.status).toBe('DISPATCHED');

    const received = await repo.updateTransferStatus(transfer.id, 'RECEIVED', 'Received and inspected at destination store');
    expect(received.status).toBe('RECEIVED');
    expect(received.timeline.length).toBe(4);
  });

  it('should manage vendors and purchase orders', async () => {
    const vendor = await repo.createVendor({
      vendorName: 'Jaipur Gift Box Suppliers',
      vendorType: 'GIFT_SUPPLIER',
      gstin: '08AABCG9999K1Z5',
      paymentTerms: 'NET_30',
      leadTimeDays: 5,
    });
    expect(vendor.id).toBeDefined();

    const po = await repo.createPurchaseOrder({
      vendorId: vendor.id,
      items: [{ productId: 'prod-1', quantity: 100, unitPrice: 250 }],
      totalAmount: 25000,
      status: 'APPROVED',
    });
    expect(po.poNumber).toBeDefined();
    expect(po.totalAmount).toBe(25000);
  });

  it('should manage franchises with commission and royalty models', async () => {
    const franchise = await repo.createFranchise({
      franchiseOwner: 'Rajesh Sharma',
      storeName: 'Jaipur Gifting - Malviya Nagar Franchise',
      commissionPercentage: 12.5,
      royaltyPercentage: 5.0,
      status: 'ACTIVE',
    });
    expect(franchise.id).toBeDefined();
    expect(franchise.commissionPercentage).toBe(12.5);
  });

  it('should manage external printing partners workflow (Assign, Produce, Complete)', async () => {
    const job = await repo.createPrintingJob({
      partnerName: 'Apex Large Format Printing',
      printType: 'CANVAS_PRINT',
      specification: '24x36 Premium Matte Canvas',
      quantity: 5,
      status: 'ASSIGNED',
    });
    expect(job.id).toBeDefined();

    const updated = await repo.updatePrintingJobStatus(job.id, 'COMPLETE');
    expect(updated.status).toBe('COMPLETE');
  });

  it('should track store capacity limits to prevent overbooking', async () => {
    const storeId = `store-cap-${Date.now()}`;
    const cap = await repo.upsertCapacity({
      storeId,
      dailyProductionLimit: 200,
      hourlyDeliveryCapacity: 25,
      printingCapacity: 100,
      packingCapacity: 150,
    });
    expect(cap.dailyProductionLimit).toBe(200);

    const capacities = await repo.listCapacities(storeId);
    expect(capacities.length).toBe(1);
    expect(capacities[0].hourlyDeliveryCapacity).toBe(25);
  });

  it('should return enterprise multi-store dashboard overview and reports', async () => {
    const overview = await service.getDashboardOverview();
    expect(overview).toBeDefined();
    expect(overview.totalStores).toBeGreaterThanOrEqual(0);
    expect(overview.totalVendors).toBeGreaterThanOrEqual(0);
  });
});
