import { describe, it, expect } from 'vitest';
import { DeliveryZonesService } from './deliveryZones.service';

describe('Delivery Zones Management Module', () => {
  const service = new DeliveryZonesService();

  it('should list delivery zones with optional filters', async () => {
    const zones = await service.listZones();
    expect(zones.length).toBeGreaterThan(0);
    expect(zones[0].zoneCode).toBeDefined();
  });

  it('should validate radius and polygon during zone creation', async () => {
    const invalidResult = await service.createZone({
      zoneName: 'Invalid Zone',
      radiusKm: -5,
    });
    expect(invalidResult.success).toBe(false);
    expect(invalidResult.errors).toContain('Invalid radius: must be greater than 0');
  });

  it('should check delivery availability for location or pincode', async () => {
    const availability = await service.checkDeliveryAvailability({
      latitude: 26.9124,
      longitude: 75.7873,
    });
    expect(availability.serviceable).toBe(true);
    expect(availability.zone).toBeDefined();
    expect(availability.deliveryCharge).toBeGreaterThan(0);
  });

  it('should return admin analytics summary', async () => {
    const analytics = await service.getAdminAnalytics();
    expect(analytics.totalZones).toBeGreaterThan(0);
    expect(analytics.activeZones).toBeGreaterThanOrEqual(0);
    expect(analytics.ordersToday).toBeGreaterThanOrEqual(0);
  });

  it('should return delivery pricing matrix', async () => {
    const matrix = service.getPricingMatrix();
    expect(matrix.length).toBeGreaterThan(0);
    expect(matrix[0].distanceRange).toBe('0-5 KM');
  });
});
