import { Prisma } from '@prisma/client';

export interface RewardConfig {
  rewardsEnabled: boolean;
  manualClaimEnabled: boolean;
  selfLoadedSpendEarnsRewards: boolean;
  onlinePaymentEarnsRewards: boolean;
  codEarnsRewards: boolean;
  refundWalletEarnsRewards: boolean;
  rewardCoinsPer100: Prisma.Decimal;
  rewardCoinValue: Prisma.Decimal;
  minimumEligibleSpend: Prisma.Decimal;
  maxRewardPerOrder?: Prisma.Decimal | null;
  rewardCoolingDays: number;
  rewardAutoConvertDays: number;
  rewardExpiryDays: number;
  campaignMultiplierEnabled: boolean;
  campaignMultiplier: Prisma.Decimal;
  excludedCategories: string[];
  excludedProducts: string[];
  excludedBrands: string[];
  automaticConversionEnabled?: boolean;
  claimableRewardValidityDays?: number;
  rewardExpiryNotificationsEnabled?: boolean;
  rewardExpiryReminderDaysJson?: string;
  minimumBalanceForExpiryReminder?: Prisma.Decimal;
  notificationChannelsJson?: string;
  quietHoursStart?: number;
  quietHoursEnd?: number;
  customerTimezoneFallback?: string;
  maxRewardNotificationsPerDay?: number;
}

export interface OrderItemCalculationInput {
  id?: string;
  productId?: string;
  categoryId?: string;
  brandId?: string;
  unitPrice: Prisma.Decimal | number | string;
  quantity: number;
  discountAmount?: Prisma.Decimal | number | string;
  totalPrice?: Prisma.Decimal | number | string;
  status?: string; // e.g. 'CANCELLED', 'ACTIVE'
  refundedQuantity?: number;
  refundedAmount?: Prisma.Decimal | number | string;
  productType?: string; // e.g. 'GIFT_CARD', 'DONATION', 'PHYSICAL'
  isGiftCard?: boolean;
  isDonation?: boolean;
}

export interface OrderFeesCalculationInput {
  deliveryFee?: Prisma.Decimal | number | string;
  expressFee?: Prisma.Decimal | number | string;
  platformFee?: Prisma.Decimal | number | string;
  codFee?: Prisma.Decimal | number | string;
  packagingFee?: Prisma.Decimal | number | string;
  giftWrapFee?: Prisma.Decimal | number | string;
  donationAmount?: Prisma.Decimal | number | string;
  tipAmount?: Prisma.Decimal | number | string;
  topUpAmount?: Prisma.Decimal | number | string;
}

export interface PaymentSourceAllocationInput {
  sourceType: string; // 'UPI', 'CARD', 'NET_BANKING', 'ONLINE', 'COD', 'SELF_LOADED', 'REWARD', 'REFERRAL', 'PROMOTIONAL', 'REFUND'
  walletBucketType?: string; // 'SELF_LOADED', 'REWARD', 'REFERRAL_REFERRER', 'REFERRAL_NEW_USER', 'PROMOTIONAL', 'REFUND'
  amount: Prisma.Decimal | number | string;
}

export interface RewardCalculationInput {
  orderId?: string;
  totalOrderAmount?: Prisma.Decimal | number | string;
  items?: OrderItemCalculationInput[];
  fees?: OrderFeesCalculationInput;
  paymentSources?: PaymentSourceAllocationInput[];
}

export interface RewardCalculationResult {
  eligibleSpend: Prisma.Decimal;
  coins: Prisma.Decimal;
  walletValue: Prisma.Decimal;
  excludedAmount: Prisma.Decimal;
  multiplier: Prisma.Decimal;
  reason?: string;
  itemBreakdown?: Array<{
    productId?: string;
    description?: string;
    amount: Prisma.Decimal;
    isEligible: boolean;
    exclusionReason?: string;
  }>;
}

export interface ClaimRewardResult {
  success: boolean;
  rewardTransactionId: string;
  walletCreditLotId: string;
  walletLedgerEntryId?: string;
  convertedCoins: Prisma.Decimal;
  convertedValue: Prisma.Decimal;
  alreadyClaimed?: boolean;
}

export interface ReverseRewardResult {
  success: boolean;
  rewardTransactionId: string;
  status: string;
  reversedCoins: Prisma.Decimal;
  reversedValue: Prisma.Decimal;
  clawbackFromWalletAmount: Prisma.Decimal;
  unrecoveredAmount: Prisma.Decimal;
}
