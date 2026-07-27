export type DeliveryStatus =
  | 'NEW'
  | 'ASSIGNING'
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'READY_FOR_PICKUP'
  | 'PICKED_UP'
  | 'OUT_FOR_DELIVERY'
  | 'ARRIVED'
  | 'OTP_PENDING'
  | 'DELIVERED'
  | 'FAILED'
  | 'RETURN_TO_STORE'
  | 'CANCELLED';

export type RiderStatus = 'OFFLINE' | 'AVAILABLE' | 'BUSY' | 'ON_BREAK' | 'DELIVERING';

export interface CreateDeliveryTaskParams {
  orderId: string;
  storeId?: string;
  deliveryPartner?: string;
  deliveryMode?: string;
  priority?: string;
  pickupAddress?: string;
  deliveryAddress?: string;
  estimatedDistance?: number;
  estimatedDuration?: number;
}

export interface AssignRiderParams {
  taskId: string;
  riderId: string;
}

export interface VerifyOtpParams {
  taskId: string;
  otp: string;
}

export interface ProofOfDeliveryParams {
  taskId: string;
  photoUrl?: string;
  recipientName: string;
  recipientRelation?: string;
  signature?: string;
  notes?: string;
}

export interface DeliveryExceptionParams {
  taskId: string;
  reason: string;
  notes?: string;
}
