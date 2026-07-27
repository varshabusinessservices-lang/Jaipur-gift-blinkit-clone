import { EnterpriseStoreRepository } from './enterpriseStore.repository';

export class EnterpriseStoreService {
  private repo = new EnterpriseStoreRepository();

  async getDashboardOverview() {
    const stores = await this.repo.listStores();
    const vendors = await this.repo.listVendors();
    const transfers = await this.repo.listTransfers();
    const franchises = await this.repo.listFranchises();
    const printingJobs = await this.repo.listPrintingJobs();
    const purchaseOrders = await this.repo.listPurchaseOrders();
    const capacities = await this.repo.listCapacities();

    return {
      totalStores: stores.length,
      storeTypesBreakdown: stores.reduce((acc: any, s: any) => {
        acc[s.storeType] = (acc[s.storeType] || 0) + 1;
        return acc;
      }, {}),
      totalVendors: vendors.length,
      activeTransfers: transfers.filter((t: any) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED').length,
      totalFranchises: franchises.length,
      activePrintingJobs: printingJobs.filter((j: any) => j.status !== 'COMPLETE').length,
      totalPurchaseOrders: purchaseOrders.length,
      capacitiesSummary: capacities,
    };
  }

  // Stores
  async listStores() { return this.repo.listStores(); }
  async getStore(id: string) { return this.repo.getStoreById(id); }
  async createStore(data: any) { return this.repo.createStore(data); }
  async updateStore(id: string, data: any) { return this.repo.updateStore(id, data); }

  // Inventory
  async listInventory(storeId?: string) { return this.repo.listInventory(storeId); }
  async upsertInventory(data: any) { return this.repo.upsertInventory(data); }

  // Transfers
  async listTransfers(storeId?: string) { return this.repo.listTransfers(storeId); }
  async createTransfer(data: any) { return this.repo.createTransfer(data); }
  async updateTransferStatus(id: string, status: string, note?: string) { return this.repo.updateTransferStatus(id, status, note); }

  // Vendors & POs
  async listVendors() { return this.repo.listVendors(); }
  async createVendor(data: any) { return this.repo.createVendor(data); }
  async listPurchaseOrders() { return this.repo.listPurchaseOrders(); }
  async createPurchaseOrder(data: any) { return this.repo.createPurchaseOrder(data); }

  // Franchises
  async listFranchises() { return this.repo.listFranchises(); }
  async createFranchise(data: any) { return this.repo.createFranchise(data); }

  // Printing
  async listPrintingJobs() { return this.repo.listPrintingJobs(); }
  async createPrintingJob(data: any) { return this.repo.createPrintingJob(data); }
  async updatePrintingJobStatus(id: string, status: string) { return this.repo.updatePrintingJobStatus(id, status); }

  // Delivery Adapters
  async listDeliveryAdapters() { return this.repo.listDeliveryAdapters(); }
  async createDeliveryAdapter(data: any) { return this.repo.createDeliveryAdapter(data); }

  // Capacity
  async listCapacities(storeId?: string) { return this.repo.listCapacities(storeId); }
  async upsertCapacity(data: any) { return this.repo.upsertCapacity(data); }
}
