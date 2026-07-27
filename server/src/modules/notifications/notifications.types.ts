export type Channel = 'EMAIL' | 'SMS' | 'WHATSAPP' | 'PUSH' | 'IN_APP';
export type RecipientType = 'CUSTOMER' | 'STAFF' | 'ADMIN';
export type NotificationCategory = 'AUTHENTICATION' | 'ORDER' | 'PAYMENT' | 'PRODUCTION' | 'DELIVERY' | 'RETURN' | 'REFUND' | 'REPLACEMENT' | 'SUPPORT' | 'SECURITY' | 'SYSTEM';
export type NotificationStatus = 'QUEUED' | 'PROCESSING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED' | 'DEAD_LETTER' | 'CANCELLED' | 'SKIPPED';
export type Priority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
export type OutboxStatus = 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'FAILED' | 'DEAD_LETTER';

export interface DomainEventPayload {
  id: string;
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  storeId?: string;
  customerId?: string;
  actorId?: string;
  correlationId?: string;
  causationId?: string;
  payload: Record<string, any>;
  occurredAt: string;
  schemaVersion: string;
  sourceModule: string;
}

export interface NotificationRequest {
  eventId?: string;
  recipientType: RecipientType;
  recipientId?: string;
  customerId?: string;
  staffId?: string;
  channel: Channel;
  category: NotificationCategory;
  templateCode?: string;
  subject?: string;
  body: string;
  payload?: Record<string, any>;
  priority?: Priority;
  scheduledAt?: Date;
  idempotencyKey: string;
  metadata?: Record<string, any>;
}
