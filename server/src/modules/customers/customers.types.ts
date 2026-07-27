import { z } from 'zod';

export enum CustomerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
}

export enum AddressLabel {
  HOME = 'HOME',
  WORK = 'WORK',
  OTHER = 'OTHER',
}

export enum CustomerOtpPurpose {
  REGISTRATION = 'REGISTRATION',
  LOGIN = 'LOGIN',
  RESET = 'RESET',
}

export enum WalletTransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

export enum WalletTransactionPurpose {
  REFERRAL_REWARD = 'REFERRAL_REWARD',
  REFUND = 'REFUND',
  TOPUP = 'TOPUP',
  ORDER_PAYMENT = 'ORDER_PAYMENT',
  BONUS = 'BONUS',
}

export enum ReferralStatus {
  PENDING = 'PENDING',
  REWARDED = 'REWARDED',
  VOID_FRAUD = 'VOID_FRAUD',
}

// 1. SCHEMAS FOR VALIDATION

export const RegisterCustomerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  referralCode: z.string().trim().toUpperCase().optional().or(z.literal('')),
  claimUploadSessionToken: z.string().optional(),
});

export const LoginOtpRequestSchema = z.object({
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number'),
  purpose: z.nativeEnum(CustomerOtpPurpose).default(CustomerOtpPurpose.LOGIN),
});

export const LoginOtpVerifySchema = z.object({
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number'),
  otpCode: z.string().length(6, 'OTP must be exactly 6 digits'),
  purpose: z.nativeEnum(CustomerOtpPurpose).default(CustomerOtpPurpose.LOGIN),
  claimUploadSessionToken: z.string().optional(),
});

export const LoginPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string(),
  claimUploadSessionToken: z.string().optional(),
});

export const UpdateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
});

export const CustomerAddressSchema = z.object({
  name: z.string().min(2, 'Recipient name is required'),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Invalid recipient mobile number'),
  addressLine1: z.string().min(5, 'Address line 1 must be at least 5 characters'),
  addressLine2: z.string().optional(),
  landmark: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().regex(/^\d{6}$/, 'Invalid 6-digit postal code'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  label: z.nativeEnum(AddressLabel).default(AddressLabel.HOME),
  customLabel: z.string().optional(),
  deliveryInstructions: z.string().optional(),
  isDefault: z.boolean().default(false),
});

export const AdminUpdateCustomerSchema = z.object({
  status: z.nativeEnum(CustomerStatus).optional(),
  tags: z.array(z.string()).optional(),
  internalNotes: z.string().optional(),
});

export const WalletTopupSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  description: z.string().optional(),
});

export const ClaimSessionSchema = z.object({
  publicToken: z.string(),
});
