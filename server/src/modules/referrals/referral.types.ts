import { Prisma } from '@prisma/client';

export enum ReferralRelationshipStatus {
  INVITED = 'INVITED',
  REGISTERED = 'REGISTERED',
  MOBILE_VERIFIED = 'MOBILE_VERIFIED',
  NEW_USER_CREDIT_ISSUED = 'NEW_USER_CREDIT_ISSUED',
  FIRST_ORDER_STARTED = 'FIRST_ORDER_STARTED',
  FIRST_ORDER_PLACED = 'FIRST_ORDER_PLACED',
  FIRST_ORDER_PAID = 'FIRST_ORDER_PAID',
  FIRST_ORDER_DELIVERED = 'FIRST_ORDER_DELIVERED',
  COOLING_PERIOD = 'COOLING_PERIOD',
  QUALIFIED = 'QUALIFIED',
  REWARDED = 'REWARDED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  REVERSED = 'REVERSED',
  FRAUD_HOLD = 'FRAUD_HOLD',
  MANUAL_REVIEW = 'MANUAL_REVIEW',
  EXPIRED = 'EXPIRED',
}

export enum ReferralCreditType {
  NEW_USER = 'NEW_USER',
  REFERRER = 'REFERRER',
}

export enum ReferralRiskOutcome {
  LOW_RISK = 'LOW_RISK',
  MEDIUM_RISK = 'MEDIUM_RISK',
  HIGH_RISK = 'HIGH_RISK',
  BLOCKED = 'BLOCKED',
}

export interface ReferralConfigSnapshot {
  referralEnabled: boolean;
  referralCodeLength: number;
  referralCodePrefix?: string;
  referrerRewardAmount: Prisma.Decimal;
  newUserRewardAmount: Prisma.Decimal;
  minimumFirstOrderValue: Prisma.Decimal;
  firstOrderOverrideEnabled: boolean;
  firstOrderOverrideMaximumAmount: Prisma.Decimal;
  newUserCreditExpiryDays: number;
  referrerCreditExpiryDays: number;
  referralCoolingDays: number;
  monthlyReferralLimit: number;
  lifetimeReferralLimit: number;
  maxReferralsPerDevice: number;
  riskOtpThreshold: number;
  manualReviewThreshold: number;
  blockThreshold: number;
}

export interface ReferralCustomerSummary {
  referralCode: string;
  shareUrl: string;
  shareMessage: string;
  newUserBenefitText: string;
  referrerBenefitText: string;
  minimumFirstOrder: number;
  totalInvited: number;
  totalRegistered: number;
  totalMobileVerified: number;
  totalFirstOrders: number;
  totalQualified: number;
  totalRewarded: number;
  totalRejected: number;
  totalUnderReview: number;
  totalEarnedAmount: number;
  availableReferralBalance: number;
  expiringReferralBalance: number;
  currentMonthSuccessfulReferrals: number;
}

export interface JobProcessorOptions {
  batchSize?: number;
  cursor?: string;
  asOf?: Date;
  dryRun?: boolean;
  relationshipId?: string;
  customerId?: string;
}

export interface JobProcessorResult {
  jobName: string;
  scannedCount: number;
  successCount: number;
  skippedCount: number;
  failedCount: number;
  errorSummary?: string;
  details?: any[];
}
