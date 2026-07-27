import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { CustomersRepository } from './customers.repository';
import {
  CustomerStatus,
  CustomerOtpPurpose,
  WalletTransactionType,
  WalletTransactionPurpose,
  ReferralStatus,
  AddressLabel,
} from './customers.types';
import { prisma, shouldAllowFallback } from '../../database/prisma';

export class CustomersService {
  private repo: CustomersRepository;

  constructor(repo: CustomersRepository) {
    this.repo = repo;
  }

  // ==========================================
  // 1. REGISTRATION & LOGIN (OTP / EMAIL-PASSWORD)
  // ==========================================
  
  async sendOtp(mobile: string, purpose: CustomerOtpPurpose): Promise<{ success: boolean; message: string; otpCode?: string }> {
    // Generate a beautiful 6 digit OTP code
    const length = parseInt(process.env.CUSTOMER_OTP_LENGTH || '6', 10);
    const otpCode = process.env.CUSTOMER_OTP_PROVIDER === 'live' ? 
      Math.floor(100000 + Math.random() * 900000).toString().substring(0, length) : 
      '123456'; // Default mock code for dev and demo mode

    const hash = await bcrypt.hash(otpCode, 10);
    const expiryMinutes = parseInt(process.env.CUSTOMER_OTP_EXPIRY_MINUTES || '5', 10);
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    const latestOtp = await this.repo.findLatestOtp(mobile, purpose);
    
    if (latestOtp) {
      // Check cooldown
      const cooldownSec = parseInt(process.env.CUSTOMER_OTP_RESEND_COOLDOWN_SECONDS || '60', 10);
      const timeSinceLast = Date.now() - latestOtp.createdAt.getTime();
      if (timeSinceLast < cooldownSec * 1000) {
        throw new Error(`Please wait ${cooldownSec - Math.floor(timeSinceLast/1000)} seconds before resending OTP.`);
      }

      // Check max resends
      const maxResends = parseInt(process.env.CUSTOMER_OTP_MAX_RESENDS || '5', 10);
      if (latestOtp.resendCount >= maxResends) {
        throw new Error('Maximum OTP resends reached. Please try again later.');
      }

      await this.repo.updateOtp(latestOtp.id, {
        otpHash: hash,
        expiresAt,
        resendCount: latestOtp.resendCount + 1,
        lastSentAt: new Date(),
      });
    } else {
      await this.repo.createOtp({
        mobile,
        purpose,
        otpHash: hash,
        expiresAt,
        attemptCount: 0,
        resendCount: 0,
        lastSentAt: new Date(),
      });
    }

    // If mock, we return the otpCode for easy manual flow, else hide it
    const showOtp = process.env.CUSTOMER_OTP_PROVIDER !== 'live' || process.env.DEV_SHOW_OTP === 'true';
    return {
      success: true,
      message: `OTP sent successfully to ${mobile}`,
      ...(showOtp ? { otpCode } : {}),
    };
  }

  async verifyOtpAndLogin(
    mobile: string,
    otpCode: string,
    purpose: CustomerOtpPurpose,
    ipAddress?: string,
    userAgent?: string,
    claimUploadSessionToken?: string
  ): Promise<{ customer: any; accessToken: string; refreshToken: string }> {
    const latestOtp = await this.repo.findLatestOtp(mobile, purpose);
    if (!latestOtp) {
      throw new Error('No active OTP request found for this mobile number.');
    }

    // Check attempts limit
    const maxAttempts = parseInt(process.env.CUSTOMER_OTP_MAX_ATTEMPTS || '5', 10);
    if (latestOtp.attemptCount >= maxAttempts) {
      throw new Error('Maximum verification attempts exceeded. Please request a new OTP.');
    }

    // Increment attempt count
    await this.repo.updateOtp(latestOtp.id, {
      attemptCount: latestOtp.attemptCount + 1,
    });

    const isMatch = await bcrypt.compare(otpCode, latestOtp.otpHash);
    if (!isMatch) {
      throw new Error('Incorrect OTP. Please check and try again.');
    }

    // Mark verified
    await this.repo.updateOtp(latestOtp.id, {
      verifiedAt: new Date(),
    });

    // Find or register customer
    let customer = await this.repo.findCustomerByMobile(mobile);
    if (!customer) {
      // Auto-register mobile OTP customer
      customer = await this.repo.createCustomer({
        mobile,
        name: `Guest Customer ${mobile.slice(-4)}`,
        status: CustomerStatus.ACTIVE,
        isVerified: true,
      });

      // Automatically initialize their wallet & referral systems!
      await this.initializeNewCustomerSystems(customer.id);
    }

    if (customer.status === CustomerStatus.BLOCKED) {
      throw new Error('Your account has been blocked. Please contact support.');
    }

    // Handle anonymous upload session claiming if requested
    if (claimUploadSessionToken) {
      await this.claimAnonymousUploadSession(customer.id, claimUploadSessionToken);
    }

    const tokens = await this.generateCustomerSession(customer.id, ipAddress, userAgent);
    const fullCustomer = await this.repo.findCustomerById(customer.id);

    return {
      customer: fullCustomer,
      ...tokens,
    };
  }

  async registerCustomer(
    data: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ customer: any; accessToken: string; refreshToken: string }> {
    // 1. Check uniqueness
    if (data.mobile) {
      const existingMobile = await this.repo.findCustomerByMobile(data.mobile);
      if (existingMobile) throw new Error('A customer with this mobile number already exists');
    }

    if (data.email) {
      const existingEmail = await this.repo.findCustomerByEmail(data.email);
      if (existingEmail) throw new Error('A customer with this email address already exists');
    }

    // 2. Hash password if email login enabled and password provided
    let passwordHash: string | undefined;
    if (data.password) {
      passwordHash = await bcrypt.hash(data.password, 10);
    }

    // 3. Create customer record
    const customer = await this.repo.createCustomer({
      name: data.name,
      mobile: data.mobile || null,
      email: data.email || null,
      passwordHash: passwordHash || null,
      isVerified: !!data.mobile, // Verified if registered via mobile
      status: CustomerStatus.ACTIVE,
    });

    // Initialize systems
    await this.initializeNewCustomerSystems(customer.id);

    // 4. Handle referral link / code if provided
    if (data.referralCode) {
      await this.applyReferralCode(customer.id, data.referralCode, ipAddress);
    }

    // 5. Handle anonymous upload session claiming
    if (data.claimUploadSessionToken) {
      await this.claimAnonymousUploadSession(customer.id, data.claimUploadSessionToken);
    }

    const tokens = await this.generateCustomerSession(customer.id, ipAddress, userAgent);
    const fullCustomer = await this.repo.findCustomerById(customer.id);

    return {
      customer: fullCustomer,
      ...tokens,
    };
  }

  async loginPassword(
    data: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ customer: any; accessToken: string; refreshToken: string }> {
    const customer = await this.repo.findCustomerByEmail(data.email);
    if (!customer) {
      throw new Error('Invalid email or password.');
    }

    if (customer.status === CustomerStatus.BLOCKED) {
      throw new Error('Your account has been blocked. Please contact support.');
    }

    if (!customer.passwordHash) {
      throw new Error('This account was created via Mobile OTP. Please login using OTP.');
    }

    const isMatch = await bcrypt.compare(data.password, customer.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid email or password.');
    }

    // Handle session claiming
    if (data.claimUploadSessionToken) {
      await this.claimAnonymousUploadSession(customer.id, data.claimUploadSessionToken);
    }

    const tokens = await this.generateCustomerSession(customer.id, ipAddress, userAgent);
    const fullCustomer = await this.repo.findCustomerById(customer.id);

    return {
      customer: fullCustomer,
      ...tokens,
    };
  }

  // ==========================================
  // 2. TOKEN & SESSION UTILS
  // ==========================================
  
  private async generateCustomerSession(customerId: string, ipAddress?: string, userAgent?: string) {
    const accessSecret = process.env.CUSTOMER_ACCESS_TOKEN_SECRET || 'customer-jwt-access-secret-key-1234';
    const refreshSecret = process.env.CUSTOMER_REFRESH_TOKEN_SECRET || 'customer-jwt-refresh-secret-key-1234';

    const accessExpiry = parseInt(process.env.CUSTOMER_ACCESS_TOKEN_EXPIRY_MINUTES || '15', 10);
    const refreshExpiry = parseInt(process.env.CUSTOMER_REFRESH_TOKEN_EXPIRY_DAYS || '30', 10);

    const accessToken = jwt.sign({ customerId }, accessSecret, { expiresIn: `${accessExpiry}m` });
    const refreshToken = jwt.sign({ customerId }, refreshSecret, { expiresIn: `${refreshExpiry}d` });

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date(Date.now() + refreshExpiry * 24 * 60 * 60 * 1000);

    await this.repo.createSession({
      customerId,
      refreshTokenHash: hashedRefreshToken,
      userAgent: userAgent || null,
      ipAddress: ipAddress || null,
      expiresAt,
      lastActivityAt: new Date(),
    });

    return { accessToken, refreshToken };
  }

  async refreshCustomerSession(refreshToken: string, ipAddress?: string, userAgent?: string) {
    const refreshSecret = process.env.CUSTOMER_REFRESH_TOKEN_SECRET || 'customer-jwt-refresh-secret-key-1234';
    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, refreshSecret);
    } catch {
      throw new Error('Invalid or expired refresh token.');
    }

    // Since we hash the token in database, let's find the session.
    // In low density or mock mode we list customer sessions and verify with bcrypt
    const sessions = await this.repo.listSessionsByCustomerId(decoded.customerId);
    let matchedSession: any = null;

    for (const s of sessions) {
      const isMatch = await bcrypt.compare(refreshToken, s.refreshTokenHash);
      if (isMatch) {
        matchedSession = s;
        break;
      }
    }

    if (!matchedSession) {
      throw new Error('Refresh token is invalid or has been revoked.');
    }

    // Revoke old session
    await this.repo.revokeSession(matchedSession.id);

    // Generate fresh session
    return this.generateCustomerSession(decoded.customerId, ipAddress, userAgent);
  }

  // ==========================================
  // 3. ANONYMOUS SESSION CLAIMING
  // ==========================================
  
  async claimAnonymousUploadSession(customerId: string, publicToken: string): Promise<boolean> {
    try {
      // Find session directly via prisma or raw JSON to claim it
      // Let's use Prisma first, fall back to writing JSON if db fails in mock mode
      let sessionClaimed = false;
      try {
        const dbSession = await prisma.uploadSession.findUnique({ where: { publicToken } });
        if (dbSession) {
          await prisma.uploadSession.update({
            where: { id: dbSession.id },
            data: { customerId },
          });
          sessionClaimed = true;
          console.log(`[claiming]: Successfully claimed session ${dbSession.id} to customer ${customerId} (Prisma)`);
        }
      } catch (prismaErr) {
        if (!shouldAllowFallback()) throw prismaErr;
        
        // Fallback JSON handling
        const UPLOADS_SESSION_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'customerUploads', 'uploadSessions.json');
        if (fs.existsSync(UPLOADS_SESSION_FILE)) {
          const sessions = JSON.parse(fs.readFileSync(UPLOADS_SESSION_FILE, 'utf-8'));
          const idx = sessions.findIndex((s: any) => s.publicToken === publicToken);
          if (idx !== -1) {
            sessions[idx].customerId = customerId;
            sessions[idx].updatedAt = new Date().toISOString();
            fs.writeFileSync(UPLOADS_SESSION_FILE, JSON.stringify(sessions, null, 2), 'utf-8');
            sessionClaimed = true;
            console.log(`[claiming]: Successfully claimed session ${sessions[idx].id} to customer ${customerId} (JSON)`);
          }
        }
      }
      return sessionClaimed;
    } catch (err) {
      console.error('[claiming]: Error claiming anonymous upload session:', err);
      return false;
    }
  }

  // ==========================================
  // 4. ADDRESS SERVICEABILITY & MANAGEMENT
  // ==========================================
  
  async addAddress(customerId: string, addressData: any): Promise<any> {
    // Serviceability Check Foundation
    const isServiceable = this.checkAddressServiceability(addressData.postalCode, addressData.city);

    // If address is marked default, unset previous default addresses
    if (addressData.isDefault) {
      const existing = await this.repo.listAddressesByCustomerId(customerId);
      for (const addr of existing) {
        if (addr.isDefault) {
          await this.repo.updateAddress(addr.id, { isDefault: false });
        }
      }
    }

    return await this.repo.createAddress({
      customerId,
      ...addressData,
      isServiceable,
    });
  }

  async updateAddress(customerId: string, addressId: string, addressData: any): Promise<any> {
    const existing = await this.repo.findAddressById(addressId);
    if (!existing || existing.customerId !== customerId) {
      throw new Error('Address not found or unauthorized');
    }

    const isServiceable = addressData.postalCode || addressData.city ? 
      this.checkAddressServiceability(addressData.postalCode || existing.postalCode, addressData.city || existing.city) : 
      existing.isServiceable;

    if (addressData.isDefault) {
      const existingAddresses = await this.repo.listAddressesByCustomerId(customerId);
      for (const addr of existingAddresses) {
        if (addr.isDefault && addr.id !== addressId) {
          await this.repo.updateAddress(addr.id, { isDefault: false });
        }
      }
    }

    return await this.repo.updateAddress(addressId, {
      ...addressData,
      isServiceable,
    });
  }

  checkAddressServiceability(postalCode: string, city: string): boolean {
    // JAIPUR GIFTING SERVICEABILITY RULE:
    // Only Jaipur is serviceable.
    // Jaipur postal codes strictly start with "302" (e.g. 302001, 302015, etc.)
    const isJaipurCity = city.toLowerCase().trim() === 'jaipur';
    const isJaipurZip = postalCode.startsWith('302') && postalCode.length === 6;

    return isJaipurCity || isJaipurZip;
  }

  // ==========================================
  // 5. WALLET LEDGER & SYSTEM INITIALIZATION
  // ==========================================
  
  private async initializeNewCustomerSystems(customerId: string) {
    // 1. Create default customer wallet
    await this.repo.createWallet({
      customerId,
      balance: 0.00,
      currency: 'INR',
    });

    // 2. Create customer referral code e.g. "JAIPUR-XXXX"
    const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const code = `JAIPUR-${randomSuffix}`;
    await this.repo.createReferralCode({
      customerId,
      code,
    });
  }

  async creditWallet(customerId: string, amount: number, purpose: WalletTransactionPurpose, referenceId?: string, description?: string): Promise<any> {
    const wallet = await this.repo.getWalletByCustomerId(customerId);
    if (!wallet) throw new Error('Customer wallet not found');

    const newBalance = Number(wallet.balance) + amount;
    const updatedWallet = await this.repo.updateWalletBalance(wallet.id, newBalance);

    await this.repo.createTransaction({
      walletId: wallet.id,
      amount,
      type: WalletTransactionType.CREDIT,
      purpose,
      referenceId: referenceId || null,
      description: description || `Wallet credited with ₹${amount}`,
    });

    return updatedWallet;
  }

  async debitWallet(customerId: string, amount: number, purpose: WalletTransactionPurpose, referenceId?: string, description?: string): Promise<any> {
    const wallet = await this.repo.getWalletByCustomerId(customerId);
    if (!wallet) throw new Error('Customer wallet not found');

    const allowNegative = process.env.CUSTOMER_WALLET_NEGATIVE_BALANCE_ALLOWED === 'true';
    if (!allowNegative && Number(wallet.balance) < amount) {
      throw new Error('Insufficient wallet balance');
    }

    const newBalance = Number(wallet.balance) - amount;
    const updatedWallet = await this.repo.updateWalletBalance(wallet.id, newBalance);

    await this.repo.createTransaction({
      walletId: wallet.id,
      amount,
      type: WalletTransactionType.DEBIT,
      purpose,
      referenceId: referenceId || null,
      description: description || `Wallet debited with ₹${amount}`,
    });

    return updatedWallet;
  }

  // ==========================================
  // 6. REFERRAL CODE, RULES, RELATIONSHIP, ANTI-FRAUD
  // ==========================================
  
  async applyReferralCode(refereeId: string, referralCodeString: string, ipAddress?: string): Promise<any> {
    if (!process.env.CUSTOMER_REFERRAL_ENABLED || process.env.CUSTOMER_REFERRAL_ENABLED === 'false') {
      return null;
    }

    const referralCode = await this.repo.getReferralCodeByCode(referralCodeString);
    if (!referralCode) {
      throw new Error('Invalid referral code');
    }

    const referrerId = referralCode.customerId;
    if (referrerId === refereeId) {
      throw new Error('Anti-Fraud: You cannot refer yourself.');
    }

    // Fetch rule
    const rule = await this.repo.getActiveReferralRule();
    if (!rule || !rule.isActive) {
      console.log('[referrals]: No active referral program rules configured.');
      return null;
    }

    // Anti-Fraud check: Check if there is already a referral relationship for referee
    const existingRelationship = await this.repo.getReferralRelationshipByRefereeId(refereeId);
    if (existingRelationship) {
      throw new Error('You have already been referred.');
    }

    // Anti-Fraud check: Same IP Address registration
    let status = ReferralStatus.PENDING;
    let notes = '';

    if (ipAddress) {
      const sessions = await this.repo.listSessionsByCustomerId(referrerId);
      const isSameIp = sessions.some((s) => s.ipAddress === ipAddress);
      if (isSameIp) {
        status = ReferralStatus.VOID_FRAUD;
        notes = 'Flagged: Referee signed up from the same IP address as Referrer.';
      }
    }

    // Create referral relationship record
    const relationship = await this.repo.createReferralRelationship({
      referrerId,
      refereeId,
      referralCodeId: referralCode.id,
      status,
      rewardAmountReferrer: Number(rule.referrerReward),
      rewardAmountReferee: Number(rule.refereeReward),
      notes: notes || null,
    });

    // Reward referee instantly if status is clean (or upon registration bonus)
    if (status !== ReferralStatus.VOID_FRAUD && Number(rule.refereeReward) > 0) {
      await this.creditWallet(
        refereeId,
        Number(rule.refereeReward),
        WalletTransactionPurpose.REFERRAL_REWARD,
        relationship.id,
        `Welcome Referral Reward for joining via code ${referralCodeString}`
      );
    }

    // Increments referrer's pending count
    await this.repo.incrementReferralCodeEarnings(referralCode.id, Number(rule.referrerReward));

    // Reward referrer if rule demands instant or wait till first order.
    // For this foundation block, we reward instantly if referral code verified and clean.
    if (status !== ReferralStatus.VOID_FRAUD && Number(rule.referrerReward) > 0) {
      // Check max limits
      if (referralCode.totalReferredCount < rule.maxRewardsPerReferrer) {
        await this.creditWallet(
          referrerId,
          Number(rule.referrerReward),
          WalletTransactionPurpose.REFERRAL_REWARD,
          relationship.id,
          `Referral reward for inviting friend (User ID: ${refereeId.slice(-6)})`
        );
        await this.repo.updateReferralRelationship(relationship.id, {
          status: ReferralStatus.REWARDED,
        });
      } else {
        await this.repo.updateReferralRelationship(relationship.id, {
          status: ReferralStatus.VOID_FRAUD,
          notes: `Referrer reached max referral rewards threshold of ${rule.maxRewardsPerReferrer}`,
        });
      }
    }

    return relationship;
  }
}
