export type ZoneType = 'RADIUS' | 'POLYGON';

export interface DeliveryZonePincode {
  id: string;
  deliveryZoneId: string;
  pincode: string;
  city: string;
  active: boolean;
}

export interface DeliveryZone {
  id: string;
  zoneCode: string;
  zoneName: string;
  description?: string;
  storeId: string;
  country: string;
  state: string;
  city: string;
  priority: number;
  zoneType: ZoneType;
  centerLatitude: number;
  centerLongitude: number;
  radiusKm: number;
  polygonCoordinates?: Array<{ lat: number; lng: number }>;
  minimumOrderAmount: number;
  deliveryCharge: number;
  freeDeliveryAbove: number;
  expressCharge: number;
  sameDayEnabled: boolean;
  expressEnabled: boolean;
  codEnabled: boolean;
  pickupEnabled: boolean;
  active: boolean;
  ordersToday: number;
  revenueToday: number;
  averageDeliveryTimeMin: number;
  averageDistanceKm: number;
  successRate: number;
  cancellationRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryPricingRule {
  distanceRange: string;
  normalCharge: number;
  sameDayCharge: number;
  expressCharge: number;
  freeDeliveryThreshold: number;
}
