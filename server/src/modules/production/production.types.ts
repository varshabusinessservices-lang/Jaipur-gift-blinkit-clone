export type ProductionStatus =
  | 'NEW'
  | 'ARTWORK_PENDING'
  | 'ARTWORK_APPROVED'
  | 'PRINT_QUEUE'
  | 'PRINTING'
  | 'PRINTED'
  | 'QC_PENDING'
  | 'QC_PASSED'
  | 'QC_FAILED'
  | 'REPRINT_REQUIRED'
  | 'PACKING_QUEUE'
  | 'PACKING'
  | 'READY_FOR_DISPATCH'
  | 'CANCELLED';

export type MachineStatus = 'AVAILABLE' | 'BUSY' | 'OFFLINE' | 'MAINTENANCE';

export interface CreateProductionJobParams {
  orderId: string;
  customerId: string;
  priority?: string;
  assignedStore?: string;
  notes?: string;
}

export interface ArtworkReviewParams {
  itemId: string;
  action: 'APPROVE' | 'REJECT' | 'NEEDS_CORRECTION';
  notes?: string;
  staffName?: string;
}

export interface PrintAssignmentParams {
  itemId: string;
  machineId: string;
  station?: string;
  staffName?: string;
}

export interface QualityCheckParams {
  itemId: string;
  result: 'PASS' | 'FAIL' | 'NEEDS_REPRINT';
  notes?: string;
  images?: string[];
  staffName?: string;
}

export interface PackingParams {
  itemId: string;
  action: 'START' | 'COMPLETE';
  packageNotes?: string;
  staffName?: string;
}
