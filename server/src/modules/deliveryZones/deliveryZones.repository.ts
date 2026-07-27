import fs from 'fs';
import path from 'path';
import { DeliveryZone, DeliveryZonePincode } from './deliveryZones.types';

const ZONES_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'deliveryZones', 'delivery_zones.json');
const PINCODES_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'deliveryZones', 'delivery_zone_pincodes.json');

function ensureFile(filePath: string, defaultContent: any[]) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultContent, null, 2));
    }
  } catch (e) {}
}

export class DeliveryZonesRepository {
  constructor() {
    ensureFile(ZONES_FILE, []);
    ensureFile(PINCODES_FILE, []);
  }

  async listZones(): Promise<DeliveryZone[]> {
    try {
      const data = fs.readFileSync(ZONES_FILE, 'utf-8');
      return JSON.parse(data || '[]');
    } catch (e) {
      return [];
    }
  }

  async saveZones(zones: DeliveryZone[]): Promise<void> {
    try {
      fs.writeFileSync(ZONES_FILE, JSON.stringify(zones, null, 2));
    } catch (e) {}
  }

  async getZoneById(id: string): Promise<DeliveryZone | null> {
    const zones = await this.listZones();
    return zones.find(z => z.id === id) || null;
  }

  async createZone(data: Partial<DeliveryZone>): Promise<DeliveryZone> {
    const zones = await this.listZones();
    const newZone: DeliveryZone = {
      id: `zone-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      zoneCode: data.zoneCode || `JPR-Z-${Math.floor(Math.random() * 900 + 100)}`,
      zoneName: data.zoneName || 'New Delivery Zone',
      description: data.description || '',
      storeId: data.storeId || 'store-jaipur-central',
      country: data.country || 'India',
      state: data.state || 'Rajasthan',
      city: data.city || 'Jaipur',
      priority: data.priority ?? 5,
      zoneType: data.zoneType || 'RADIUS',
      centerLatitude: data.centerLatitude ?? 26.9124,
      centerLongitude: data.centerLongitude ?? 75.7873,
      radiusKm: data.radiusKm ?? 5,
      polygonCoordinates: data.polygonCoordinates || [],
      minimumOrderAmount: data.minimumOrderAmount ?? 199,
      deliveryCharge: data.deliveryCharge ?? 29,
      freeDeliveryAbove: data.freeDeliveryAbove ?? 499,
      expressCharge: data.expressCharge ?? 49,
      sameDayEnabled: data.sameDayEnabled ?? true,
      expressEnabled: data.expressEnabled ?? true,
      codEnabled: data.codEnabled ?? true,
      pickupEnabled: data.pickupEnabled ?? true,
      active: data.active ?? true,
      ordersToday: 0,
      revenueToday: 0,
      averageDeliveryTimeMin: 20,
      averageDistanceKm: 3.0,
      successRate: 99.0,
      cancellationRate: 1.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    zones.unshift(newZone);
    await this.saveZones(zones);
    return newZone;
  }

  async updateZone(id: string, data: Partial<DeliveryZone>): Promise<DeliveryZone | null> {
    const zones = await this.listZones();
    const index = zones.findIndex(z => z.id === id);
    if (index === -1) return null;
    zones[index] = {
      ...zones[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    await this.saveZones(zones);
    return zones[index];
  }

  async deleteZone(id: string): Promise<boolean> {
    const zones = await this.listZones();
    const filtered = zones.filter(z => z.id !== id);
    if (filtered.length === zones.length) return false;
    await this.saveZones(filtered);
    return true;
  }

  async listPincodes(): Promise<DeliveryZonePincode[]> {
    try {
      const data = fs.readFileSync(PINCODES_FILE, 'utf-8');
      return JSON.parse(data || '[]');
    } catch (e) {
      return [];
    }
  }

  async savePincodes(pincodes: DeliveryZonePincode[]): Promise<void> {
    try {
      fs.writeFileSync(PINCODES_FILE, JSON.stringify(pincodes, null, 2));
    } catch (e) {}
  }

  async getPincodesForZone(zoneId: string): Promise<DeliveryZonePincode[]> {
    const pins = await this.listPincodes();
    return pins.filter(p => p.deliveryZoneId === zoneId);
  }
}
