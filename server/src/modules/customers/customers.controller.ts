import { Request, Response, NextFunction } from 'express';
import { CustomersRepository } from './customers.repository';
import { CustomersService } from './customers.service';
import {
  RegisterCustomerSchema,
  LoginOtpRequestSchema,
  LoginOtpVerifySchema,
  LoginPasswordSchema,
  UpdateProfileSchema,
  CustomerAddressSchema,
  AdminUpdateCustomerSchema,
  WalletTopupSchema,
  WalletTransactionPurpose,
} from './customers.types';

const repo = new CustomersRepository();
export const customersService = new CustomersService(repo);

// ==========================================
// PUBLIC CUSTOMER CONTROLLERS
// ==========================================

export async function requestOtp(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = LoginOtpRequestSchema.parse(req.body);
    const result = await customersService.sendOtp(validated.mobile, validated.purpose);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function verifyOtp(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = LoginOtpVerifySchema.parse(req.body);
    const ip = req.ip || req.socket.remoteAddress;
    const ua = req.headers['user-agent'];
    const result = await customersService.verifyOtpAndLogin(
      validated.mobile,
      validated.otpCode,
      validated.purpose,
      ip,
      ua,
      validated.claimUploadSessionToken
    );
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = RegisterCustomerSchema.parse(req.body);
    const ip = req.ip || req.socket.remoteAddress;
    const ua = req.headers['user-agent'];
    const result = await customersService.registerCustomer(validated, ip, ua);
    res.status(201).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function loginPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = LoginPasswordSchema.parse(req.body);
    const ip = req.ip || req.socket.remoteAddress;
    const ua = req.headers['user-agent'];
    const result = await customersService.loginPassword(validated, ip, ua);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function getProfile(req: any, res: Response, next: NextFunction) {
  try {
    const customerId = req.customer?.id;
    if (!customerId) return res.status(401).json({ error: 'Unauthorized' });

    const customer = await repo.findCustomerById(customerId);
    res.json({ success: true, customer });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: any, res: Response, next: NextFunction) {
  try {
    const customerId = req.customer?.id;
    if (!customerId) return res.status(401).json({ error: 'Unauthorized' });

    const validated = UpdateProfileSchema.parse(req.body);
    const updated = await repo.updateCustomer(customerId, validated);
    res.json({ success: true, customer: updated });
  } catch (err) {
    next(err);
  }
}

// ==========================================
// ADDRESS CONTROLLERS
// ==========================================

export async function getAddresses(req: any, res: Response, next: NextFunction) {
  try {
    const customerId = req.customer?.id;
    if (!customerId) return res.status(401).json({ error: 'Unauthorized' });

    const addresses = await repo.listAddressesByCustomerId(customerId);
    res.json({ success: true, addresses });
  } catch (err) {
    next(err);
  }
}

export async function addAddress(req: any, res: Response, next: NextFunction) {
  try {
    const customerId = req.customer?.id;
    if (!customerId) return res.status(401).json({ error: 'Unauthorized' });

    const validated = CustomerAddressSchema.parse(req.body);
    const address = await customersService.addAddress(customerId, validated);
    res.status(201).json({ success: true, address });
  } catch (err) {
    next(err);
  }
}

export async function updateAddress(req: any, res: Response, next: NextFunction) {
  try {
    const customerId = req.customer?.id;
    if (!customerId) return res.status(401).json({ error: 'Unauthorized' });

    const addressId = req.params.id;
    const validated = CustomerAddressSchema.parse(req.body);
    const address = await customersService.updateAddress(customerId, addressId, validated);
    res.json({ success: true, address });
  } catch (err) {
    next(err);
  }
}

export async function deleteAddress(req: any, res: Response, next: NextFunction) {
  try {
    const customerId = req.customer?.id;
    if (!customerId) return res.status(401).json({ error: 'Unauthorized' });

    const addressId = req.params.id;
    const existing = await repo.findAddressById(addressId);
    if (!existing || existing.customerId !== customerId) {
      return res.status(404).json({ error: 'Address not found or unauthorized' });
    }

    await repo.deleteAddress(addressId);
    res.json({ success: true, message: 'Address deleted successfully' });
  } catch (err) {
    next(err);
  }
}

// ==========================================
// WALLET CONTROLLERS
// ==========================================

export async function getWalletLedger(req: any, res: Response, next: NextFunction) {
  try {
    const customerId = req.customer?.id;
    if (!customerId) return res.status(401).json({ error: 'Unauthorized' });

    const wallet = await repo.getWalletByCustomerId(customerId);
    if (!wallet) return res.status(404).json({ error: 'Wallet not found' });

    const transactions = await repo.listTransactionsByWalletId(wallet.id);
    res.json({ success: true, wallet, transactions });
  } catch (err) {
    next(err);
  }
}

export async function topupWallet(req: any, res: Response, next: NextFunction) {
  try {
    const customerId = req.customer?.id;
    if (!customerId) return res.status(401).json({ error: 'Unauthorized' });

    const validated = WalletTopupSchema.parse(req.body);
    const updatedWallet = await customersService.creditWallet(
      customerId,
      validated.amount,
      WalletTransactionPurpose.TOPUP,
      undefined,
      validated.description || `Wallet Online Topup`
    );
    res.json({ success: true, wallet: updatedWallet });
  } catch (err) {
    next(err);
  }
}

// ==========================================
// REFERRAL CONTROLLERS
// ==========================================

export async function getReferralsInfo(req: any, res: Response, next: NextFunction) {
  try {
    const customerId = req.customer?.id;
    if (!customerId) return res.status(401).json({ error: 'Unauthorized' });

    const referralCode = await repo.getReferralCodeByCustomerId(customerId);
    const relationships = await repo.listReferralRelationshipsByReferrerId(customerId);
    const rule = await repo.getActiveReferralRule();

    res.json({
      success: true,
      referralCode: referralCode?.code,
      totalReferredCount: referralCode?.totalReferredCount || 0,
      totalEarned: referralCode?.totalEarned || 0,
      referrals: relationships,
      programRules: rule ? {
        referrerReward: rule.referrerReward,
        refereeReward: rule.refereeReward,
        minOrderValue: rule.minOrderValue,
      } : null
    });
  } catch (err) {
    next(err);
  }
}

// ==========================================
// ADMIN CUSTOMER CONTROLLERS
// ==========================================

export async function adminListCustomers(req: Request, res: Response, next: NextFunction) {
  try {
    const filters = {
      status: req.query.status,
      search: req.query.search,
    };
    const result = await repo.listCustomers(filters);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function adminGetCustomerDetail(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id;
    const customer = await repo.findCustomerById(id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const sessions = await repo.listSessionsByCustomerId(id);
    const referrals = await repo.listReferralRelationshipsByReferrerId(id);

    res.json({ success: true, customer, sessions, referrals });
  } catch (err) {
    next(err);
  }
}

export async function adminUpdateCustomer(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id;
    const validated = AdminUpdateCustomerSchema.parse(req.body);
    
    const updateData: any = {};
    if (validated.status) updateData.status = validated.status;
    if (validated.tags) updateData.tagsJson = JSON.stringify(validated.tags);
    if (validated.internalNotes !== undefined) updateData.internalNotes = validated.internalNotes;

    const updated = await repo.updateCustomer(id, updateData);
    res.json({ success: true, customer: updated });
  } catch (err) {
    next(err);
  }
}

export async function adminGetWalletLedger(req: Request, res: Response, next: NextFunction) {
  try {
    const customerId = req.params.id;
    const wallet = await repo.getWalletByCustomerId(customerId);
    if (!wallet) return res.status(404).json({ error: 'Wallet not found' });

    const transactions = await repo.listTransactionsByWalletId(wallet.id);
    res.json({ success: true, wallet, transactions });
  } catch (err) {
    next(err);
  }
}

export async function adminUpdateWallet(req: Request, res: Response, next: NextFunction) {
  try {
    const customerId = req.params.id;
    const validated = WalletTopupSchema.parse(req.body);
    const updatedWallet = await customersService.creditWallet(
      customerId,
      validated.amount,
      WalletTransactionPurpose.BONUS,
      undefined,
      validated.description || 'Admin credited bonus'
    );
    res.json({ success: true, wallet: updatedWallet });
  } catch (err) {
    next(err);
  }
}

export async function adminSeedReferralRule(req: Request, res: Response, next: NextFunction) {
  try {
    const rule = await repo.createReferralRule({
      isActive: true,
      referrerReward: 100.00, // Rs. 100
      refereeReward: 50.00,  // Rs. 50
      minOrderValue: 299.00,  // Rs. 299 minimum order limit
      maxRewardsPerReferrer: 10,
    });
    res.json({ success: true, rule });
  } catch (err) {
    next(err);
  }
}
