import { DeliveryZonesRepository } from './deliveryZones.repository';
import { DeliveryZone, DeliveryPricingRule } from './deliveryZones.types';

export class DeliveryZonesService {
  private repo = new DeliveryZonesRepository();

  private pricingMatrix: DeliveryPricingRule[] = [
    { distanceRange: '0-5 KM', normalCharge: 29, sameDayCharge: 49, expressCharge: 69, freeDeliveryThreshold: 499 },
    { distanceRange: '5-10 KM', normalCharge: 49, sameDayCharge: 79, expressCharge: 99, freeDeliveryThreshold: 799 },
    { distanceRange: '10-15 KM', normalCharge: 79, sameDayCharge: 119, expressCharge: 149, freeDeliveryThreshold: 1199 },
    { distanceRange: '15-20 KM', normalCharge: 119, sameDayCharge: 159, expressCharge: 199, freeDeliveryThreshold: 1599 },
  ];

  async listZones(filters?: { storeId?: string; status?: string; city?: string; search?: string }): Promise<DeliveryZone[]> {
    let zones = await this.repo.listZones();
    if (filters?.storeId) {
      zones = zones.filter(z => z.storeId === filters.storeId);
    }
    if (filters?.status !== undefined && filters.status !== '') {
      const activeBool = filters.status === 'true' || filters.status === 'active';
      zones = zones.filter(z => z.active === activeBool);
    }
    if (filters?.city) {
      zones = zones.filter(z => z.city.toLowerCase() === filters.city.toLowerCase());
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      const pincodes = await this.repo.listPincodes();
      const zoneIdsWithPin = pincodes.filter(p => p.pincode.includes(q)).map(p => p.deliveryZoneId);

      zones = zones.filter(z => 
        z.zoneName.toLowerCase().includes(q) ||
        z.zoneCode.toLowerCase().includes(q) ||
        z.city.toLowerCase().includes(q) ||
        z.storeId.toLowerCase().includes(q) ||
        zoneIdsWithPin.includes(z.id)
      );
    }
    return zones;
  }

  async getZoneById(id: string): Promise<DeliveryZone | null> {
    return this.repo.getZoneById(id);
  }

  async createZone(data: Partial<DeliveryZone>): Promise<{ success: boolean; zone?: DeliveryZone; errors?: string[] }> {
    const errors: string[] = [];
    const zones = await this.repo.listZones();

    if (data.zoneCode && zones.some(z => z.zoneCode === data.zoneCode)) {
      errors.push(`Duplicate zone code: ${data.zoneCode}`);
    }
    if (data.radiusKm !== undefined && data.radiusKm <= 0) {
      errors.push('Invalid radius: must be greater than 0');
    }
    if (data.zoneType === 'POLYGON' && (!data.polygonCoordinates || data.polygonCoordinates.length < 3)) {
      errors.push('Invalid polygon: at least 3 coordinate points required');
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    const zone = await this.repo.createZone(data);
    return { success: true, zone };
  }

  async updateZone(id: string, data: Partial<DeliveryZone>): Promise<{ success: boolean; zone?: DeliveryZone; errors?: string[] }> {
    const errors: string[] = [];
    const zones = await this.repo.listZones();

    if (data.zoneCode && zones.some(z => z.zoneCode === data.zoneCode && z.id !== id)) {
      errors.push(`Duplicate zone code: ${data.zoneCode}`);
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    const zone = await this.repo.updateZone(id, data);
    if (!zone) return { success: false, errors: ['Zone not found'] };
    return { success: true, zone };
  }

  async deleteZone(id: string): Promise<boolean> {
    return this.repo.deleteZone(id);
  }

  async duplicateZone(id: string): Promise<DeliveryZone | null> {
    const zone = await this.getZoneById(id);
    if (!zone) return null;
    const duplicated = await this.repo.createZone({
      ...zone,
      id: undefined,
      zoneCode: `${zone.zoneCode}-DUP`,
      zoneName: `${zone.zoneName} (Copy)`,
      ordersToday: 0,
      revenueToday: 0,
    });
    return duplicated;
  }

  getPricingMatrix(): DeliveryPricingRule[] {
    return this.pricingMatrix;
  }

  // Haversine formula to compute distance in KM
  private calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in KM
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  async checkDeliveryAvailability(query: { latitude?: number; longitude?: number; pincode?: string }): Promise<{
    serviceable: boolean;
    zone?: DeliveryZone;
    storeId?: string;
    estimatedDeliveryTimeMin: number;
    deliveryCharge: number;
    expressCharge: number;
    sameDayAvailable: boolean;
    expressAvailable: boolean;
    codAvailable: boolean;
    pickupAvailable: boolean;
    distanceKm: number;
    message?: string;
  }> {
    const zones = await this.listZones({ status: 'true' });
    let matchedZone: DeliveryZone | null = null;
    let distanceKm = 0;

    if (query.pincode) {
      const pincodes = await this.repo.listPincodes();
      const pinMatch = pincodes.find(p => p.pincode === query.pincode && p.active);
      if (pinMatch) {
        matchedZone = zones.find(z => z.id === pinMatch.deliveryZoneId) || null;
      }
    }

    if (!matchedZone && query.latitude !== undefined && query.longitude !== undefined) {
      // Find matching radius or polygon zones
      const qualifyingZones: Array<{ zone: DeliveryZone; distance: number }> = [];
      for (const z of zones) {
        const dist = this.calculateDistanceKm(query.latitude, query.longitude, z.centerLatitude, z.centerLongitude);
        if (dist <= z.radiusKm) {
          qualifyingZones.push({ zone: z, distance: dist });
        }
      }

      if (qualifyingZones.length > 0) {
        // Store Selection Rule: Highest Priority -> Shortest Distance -> Lowest Load
        qualifyingZones.sort((a, b) => {
          if (b.zone.priority !== a.zone.priority) {
            return b.zone.priority - a.zone.priority; // highest priority first
          }
          if (a.distance !== b.distance) {
            return a.distance - b.distance; // shortest distance first
          }
          return a.zone.ordersToday - b.zone.ordersToday; // lowest load first
        });

        matchedZone = qualifyingZones[0].zone;
        distanceKm = Number(qualifyingZones[0].distance.toFixed(2));
      }
    }

    if (!matchedZone) {
      return {
        serviceable: false,
        estimatedDeliveryTimeMin: 0,
        deliveryCharge: 0,
        expressCharge: 0,
        sameDayAvailable: false,
        expressAvailable: false,
        codAvailable: false,
        pickupAvailable: false,
        distanceKm: 0,
        message: 'Location is currently not serviceable by Jaipur Gifting delivery zones.',
      };
    }

    // Determine pricing rule based on distance
    let pricingRule = this.pricingMatrix[0];
    if (distanceKm > 5 && distanceKm <= 10) pricingRule = this.pricingMatrix[1];
    else if (distanceKm > 10 && distanceKm <= 15) pricingRule = this.pricingMatrix[2];
    else if (distanceKm > 15) pricingRule = this.pricingMatrix[3];

    return {
      serviceable: true,
      zone: matchedZone,
      storeId: matchedZone.storeId,
      estimatedDeliveryTimeMin: Math.round(15 + distanceKm * 3),
      deliveryCharge: pricingRule.normalCharge,
      expressCharge: pricingRule.expressCharge,
      sameDayAvailable: matchedZone.sameDayEnabled,
      expressAvailable: matchedZone.expressEnabled,
      codAvailable: matchedZone.codEnabled,
      pickupAvailable: matchedZone.pickupEnabled,
      distanceKm: distanceKm || 2.5,
    };
  }

  async getAdminAnalytics(): Promise<{
    totalZones: number;
    activeZones: number;
    sameDayZones: number;
    expressZones: number;
    disabledZones: number;
    ordersToday: number;
    revenueToday: number;
    zonesBreakdown: Array<{ zoneName: string; ordersToday: number; revenueToday: number; avgTime: number }>;
  }> {
    const zones = await this.repo.listZones();
    const totalZones = zones.length;
    const activeZones = zones.filter(z => z.active).length;
    const sameDayZones = zones.filter(z => z.sameDayEnabled).length;
    const expressZones = zones.filter(z => z.expressEnabled).length;
    const disabledZones = totalZones - activeZones;
    const ordersToday = zones.reduce((acc, z) => acc + z.ordersToday, 0);
    const revenueToday = zones.reduce((acc, z) => acc + z.revenueToday, 0);

    const zonesBreakdown = zones.map(z => ({
      zoneName: z.zoneName,
      ordersToday: z.ordersToday,
      revenueToday: z.revenueToday,
      avgTime: z.averageDeliveryTimeMin,
    }));

    return {
      totalZones,
      activeZones,
      sameDayZones,
      expressZones,
      disabledZones,
      ordersToday,
      revenueToday,
      zonesBreakdown,
    };
  }
}
