import fs from 'fs';
import path from 'path';

const STORES_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'enterpriseStore', 'stores.json');
const INVENTORY_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'enterpriseStore', 'store_inventories.json');
const TRANSFERS_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'enterpriseStore', 'store_transfers.json');
const VENDORS_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'enterpriseStore', 'vendors.json');
const PO_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'enterpriseStore', 'purchase_orders.json');
const FRANCHISES_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'enterpriseStore', 'franchises.json');
const PRINT_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'enterpriseStore', 'printing_partners.json');
const DELIVERY_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'enterpriseStore', 'delivery_adapters.json');
const CAPACITY_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'enterpriseStore', 'store_capacities.json');

function ensureFile(filePath: string) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    }
  } catch (e) {}
}

export class EnterpriseStoreRepository {
  constructor() {
    ensureFile(STORES_FILE);
    ensureFile(INVENTORY_FILE);
    ensureFile(TRANSFERS_FILE);
    ensureFile(VENDORS_FILE);
    ensureFile(PO_FILE);
    ensureFile(FRANCHISES_FILE);
    ensureFile(PRINT_FILE);
    ensureFile(DELIVERY_FILE);
    ensureFile(CAPACITY_FILE);
  }

  // Stores
  async listStores(): Promise<any[]> {
    return JSON.parse(fs.readFileSync(STORES_FILE, 'utf-8') || '[]');
  }

  async getStoreById(id: string): Promise<any | null> {
    const stores = await this.listStores();
    return stores.find(s => s.id === id) || null;
  }

  async createStore(data: any): Promise<any> {
    const stores = await this.listStores();
    const newStore = {
      id: `store-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString(),
      ...data,
    };
    stores.push(newStore);
    fs.writeFileSync(STORES_FILE, JSON.stringify(stores, null, 2));
    return newStore;
  }

  async updateStore(id: string, data: any): Promise<any | null> {
    const stores = await this.listStores();
    const index = stores.findIndex(s => s.id === id);
    if (index === -1) return null;
    stores[index] = { ...stores[index], ...data, updatedAt: new Date().toISOString() };
    fs.writeFileSync(STORES_FILE, JSON.stringify(stores, null, 2));
    return stores[index];
  }

  // Inventory
  async listInventory(storeId?: string): Promise<any[]> {
    const items = JSON.parse(fs.readFileSync(INVENTORY_FILE, 'utf-8') || '[]');
    if (storeId) return items.filter((i: any) => i.storeId === storeId);
    return items;
  }

  async upsertInventory(data: { storeId: string; productId: string; available?: number; reserved?: number; inProduction?: number; damaged?: number; returned?: number; transferred?: number }): Promise<any> {
    const items = await this.listInventory();
    const index = items.findIndex(i => i.storeId === data.storeId && i.productId === data.productId);
    let record;
    if (index >= 0) {
      items[index] = {
        ...items[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      record = items[index];
    } else {
      record = {
        id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        available: 0,
        reserved: 0,
        inProduction: 0,
        damaged: 0,
        returned: 0,
        transferred: 0,
        ...data,
        updatedAt: new Date().toISOString(),
      };
      items.push(record);
    }
    fs.writeFileSync(INVENTORY_FILE, JSON.stringify(items, null, 2));
    return record;
  }

  // Store Transfers
  async listTransfers(storeId?: string): Promise<any[]> {
    const transfers = JSON.parse(fs.readFileSync(TRANSFERS_FILE, 'utf-8') || '[]');
    if (storeId) {
      return transfers.filter((t: any) => t.sourceStoreId === storeId || t.destinationStoreId === storeId);
    }
    return transfers;
  }

  async createTransfer(data: any): Promise<any> {
    const transfers = await this.listTransfers();
    const record = {
      id: `tr-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      transferNumber: `TR-${new Date().getFullYear()}-${String(transfers.length + 1).padStart(5, '0')}`,
      status: 'REQUESTED',
      timeline: [{ status: 'REQUESTED', timestamp: new Date().toISOString(), note: 'Transfer requested' }],
      createdAt: new Date().toISOString(),
      ...data,
    };
    transfers.push(record);
    fs.writeFileSync(TRANSFERS_FILE, JSON.stringify(transfers, null, 2));
    return record;
  }

  async updateTransferStatus(id: string, status: string, note?: string): Promise<any | null> {
    const transfers = await this.listTransfers();
    const index = transfers.findIndex(t => t.id === id);
    if (index === -1) return null;
    transfers[index].status = status;
    if (!transfers[index].timeline) transfers[index].timeline = [];
    transfers[index].timeline.push({ status, timestamp: new Date().toISOString(), note: note || `Status updated to ${status}` });
    transfers[index].updatedAt = new Date().toISOString();
    fs.writeFileSync(TRANSFERS_FILE, JSON.stringify(transfers, null, 2));
    return transfers[index];
  }

  // Vendors & POs
  async listVendors(): Promise<any[]> {
    return JSON.parse(fs.readFileSync(VENDORS_FILE, 'utf-8') || '[]');
  }

  async createVendor(data: any): Promise<any> {
    const vendors = await this.listVendors();
    const record = {
      id: `ven-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      status: 'ACTIVE',
      rating: 5.0,
      createdAt: new Date().toISOString(),
      ...data,
    };
    vendors.push(record);
    fs.writeFileSync(VENDORS_FILE, JSON.stringify(vendors, null, 2));
    return record;
  }

  async listPurchaseOrders(): Promise<any[]> {
    return JSON.parse(fs.readFileSync(PO_FILE, 'utf-8') || '[]');
  }

  async createPurchaseOrder(data: any): Promise<any> {
    const pos = await this.listPurchaseOrders();
    const record = {
      id: `po-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      poNumber: `PO-${new Date().getFullYear()}-${String(pos.length + 1).padStart(5, '0')}`,
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      ...data,
    };
    pos.push(record);
    fs.writeFileSync(PO_FILE, JSON.stringify(pos, null, 2));
    return record;
  }

  // Franchises
  async listFranchises(): Promise<any[]> {
    return JSON.parse(fs.readFileSync(FRANCHISES_FILE, 'utf-8') || '[]');
  }

  async createFranchise(data: any): Promise<any> {
    const franchises = await this.listFranchises();
    const record = {
      id: `fran-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      ...data,
    };
    franchises.push(record);
    fs.writeFileSync(FRANCHISES_FILE, JSON.stringify(franchises, null, 2));
    return record;
  }

  // Printing Partners
  async listPrintingJobs(): Promise<any[]> {
    return JSON.parse(fs.readFileSync(PRINT_FILE, 'utf-8') || '[]');
  }

  async createPrintingJob(data: any): Promise<any> {
    const jobs = await this.listPrintingJobs();
    const record = {
      id: `print-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      status: 'ASSIGNED',
      createdAt: new Date().toISOString(),
      ...data,
    };
    jobs.push(record);
    fs.writeFileSync(PRINT_FILE, JSON.stringify(jobs, null, 2));
    return record;
  }

  async updatePrintingJobStatus(id: string, status: string): Promise<any | null> {
    const jobs = await this.listPrintingJobs();
    const index = jobs.findIndex(j => j.id === id);
    if (index === -1) return null;
    jobs[index].status = status;
    jobs[index].updatedAt = new Date().toISOString();
    fs.writeFileSync(PRINT_FILE, JSON.stringify(jobs, null, 2));
    return jobs[index];
  }

  // Delivery Adapters
  async listDeliveryAdapters(): Promise<any[]> {
    return JSON.parse(fs.readFileSync(DELIVERY_FILE, 'utf-8') || '[]');
  }

  async createDeliveryAdapter(data: any): Promise<any> {
    const adapters = await this.listDeliveryAdapters();
    const record = {
      id: `del-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      isActive: true,
      createdAt: new Date().toISOString(),
      ...data,
    };
    adapters.push(record);
    fs.writeFileSync(DELIVERY_FILE, JSON.stringify(adapters, null, 2));
    return record;
  }

  // Capacities
  async listCapacities(storeId?: string): Promise<any[]> {
    const caps = JSON.parse(fs.readFileSync(CAPACITY_FILE, 'utf-8') || '[]');
    if (storeId) return caps.filter((c: any) => c.storeId === storeId);
    return caps;
  }

  async upsertCapacity(data: { storeId: string; dailyProductionLimit: number; hourlyDeliveryCapacity: number; printingCapacity: number; packingCapacity: number }): Promise<any> {
    const caps = await this.listCapacities();
    const index = caps.findIndex(c => c.storeId === data.storeId);
    let record;
    if (index >= 0) {
      caps[index] = { ...caps[index], ...data, updatedAt: new Date().toISOString() };
      record = caps[index];
    } else {
      record = {
        id: `cap-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        ...data,
        currentProduction: 0,
        currentDeliveries: 0,
        updatedAt: new Date().toISOString(),
      };
      caps.push(record);
    }
    fs.writeFileSync(CAPACITY_FILE, JSON.stringify(caps, null, 2));
    return record;
  }
}
