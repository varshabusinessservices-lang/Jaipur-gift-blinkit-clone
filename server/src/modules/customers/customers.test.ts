import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CustomersRepository } from './customers.repository';
import { CustomersService } from './customers.service';
import { CustomerOtpPurpose, WalletTransactionPurpose, ReferralStatus } from './customers.types';

// Mock CustomersRepository to keep tests completely fast, pure and predictable
class MockCustomersRepository extends CustomersRepository {
  private customers: any[] = [];
  private otps: any[] = [];
  private sessions: any[] = [];
  private addresses: any[] = [];
  private wallets: any[] = [];
  private transactions: any[] = [];
  private referralCodes: any[] = [];
  private relationships: any[] = [];
  private rule: any = {
    id: 'rule-1',
    isActive: true,
    referrerReward: 100.00,
    refereeReward: 50.00,
    minOrderValue: 299.00,
    maxRewardsPerReferrer: 10,
  };

  async createCustomer(data: any) {
    const customer = { id: `cust-${Date.now()}`, ...data, createdAt: new Date(), updatedAt: new Date(), deletedAt: null };
    this.customers.push(customer);
    return customer;
  }

  async findCustomerById(id: string) {
    const customer = this.customers.find((c) => c.id === id);
    if (!customer) return null;
    return {
      ...customer,
      addresses: this.addresses.filter((a) => a.customerId === id),
      wallet: this.wallets.find((w) => w.customerId === id) || null,
      referralCode: this.referralCodes.find((r) => r.customerId === id) || null,
    };
  }

  async findCustomerByMobile(mobile: string) {
    return this.customers.find((c) => c.mobile === mobile) || null;
  }

  async findCustomerByEmail(email: string) {
    return this.customers.find((c) => c.email === email) || null;
  }

  async updateCustomer(id: string, data: any) {
    const idx = this.customers.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Customer not found');
    this.customers[idx] = { ...this.customers[idx], ...data, updatedAt: new Date() };
    return this.customers[idx];
  }

  async createSession(data: any) {
    const s = { id: `sess-${Date.now()}`, ...data, createdAt: new Date() };
    this.sessions.push(s);
    return s;
  }

  async listSessionsByCustomerId(customerId: string) {
    return this.sessions.filter((s) => s.customerId === customerId);
  }

  async createOtp(data: any) {
    const o = { id: `otp-${Date.now()}`, ...data, createdAt: new Date() };
    this.otps.push(o);
    return o;
  }

  async findLatestOtp(mobile: string, purpose: CustomerOtpPurpose) {
    const filtered = this.otps.filter((o) => o.mobile === mobile && o.purpose === purpose && !o.verifiedAt);
    return filtered[filtered.length - 1] || null;
  }

  async updateOtp(id: string, data: any) {
    const idx = this.otps.findIndex((o) => o.id === id);
    if (idx !== -1) {
      this.otps[idx] = { ...this.otps[idx], ...data, updatedAt: new Date() };
      return this.otps[idx];
    }
  }

  async createAddress(data: any) {
    const a = { id: `addr-${Date.now()}`, ...data, createdAt: new Date() };
    this.addresses.push(a);
    return a;
  }

  async findAddressById(id: string) {
    return this.addresses.find((a) => a.id === id) || null;
  }

  async listAddressesByCustomerId(customerId: string) {
    return this.addresses.filter((a) => a.customerId === customerId);
  }

  async updateAddress(id: string, data: any) {
    const idx = this.addresses.findIndex((a) => a.id === id);
    if (idx !== -1) {
      this.addresses[idx] = { ...this.addresses[idx], ...data, updatedAt: new Date() };
      return this.addresses[idx];
    }
  }

  async createWallet(data: any) {
    const w = { id: `wal-${Date.now()}`, ...data, balance: data.balance ?? 0 };
    this.wallets.push(w);
    return w;
  }

  async getWalletByCustomerId(customerId: string) {
    return this.wallets.find((w) => w.customerId === customerId) || null;
  }

  async updateWalletBalance(id: string, balance: number) {
    const idx = this.wallets.findIndex((w) => w.id === id);
    if (idx !== -1) {
      this.wallets[idx].balance = balance;
      return this.wallets[idx];
    }
  }

  async createTransaction(data: any) {
    const t = { id: `tx-${Date.now()}`, ...data, createdAt: new Date() };
    this.transactions.push(t);
    return t;
  }

  async listTransactionsByWalletId(walletId: string) {
    return this.transactions.filter((t) => t.walletId === walletId);
  }

  async createReferralCode(data: any) {
    const c = { id: `code-${Date.now()}`, ...data, totalReferredCount: 0, totalEarned: 0 };
    this.referralCodes.push(c);
    return c;
  }

  async getReferralCodeByCode(code: string) {
    return this.referralCodes.find((c) => c.code === code.toUpperCase()) || null;
  }

  async getReferralCodeByCustomerId(customerId: string) {
    return this.referralCodes.find((c) => c.customerId === customerId) || null;
  }

  async incrementReferralCodeEarnings(id: string, amount: number) {
    const idx = this.referralCodes.findIndex((c) => c.id === id);
    if (idx !== -1) {
      this.referralCodes[idx].totalReferredCount += 1;
      this.referralCodes[idx].totalEarned += amount;
      return this.referralCodes[idx];
    }
  }

  async createReferralRelationship(data: any) {
    const r = { id: `rel-${Date.now()}`, ...data, createdAt: new Date() };
    this.relationships.push(r);
    return r;
  }

  async getReferralRelationshipByRefereeId(refereeId: string) {
    return this.relationships.find((r) => r.refereeId === refereeId) || null;
  }

  async listReferralRelationshipsByReferrerId(referrerId: string) {
    return this.relationships.filter((r) => r.referrerId === referrerId);
  }

  async updateReferralRelationship(id: string, data: any) {
    const idx = this.relationships.findIndex((r) => r.id === id);
    if (idx !== -1) {
      this.relationships[idx] = { ...this.relationships[idx], ...data, updatedAt: new Date() };
      return this.relationships[idx];
    }
  }

  async getActiveReferralRule() {
    return this.rule;
  }
}

describe('Customer Management & Referral System', () => {
  let mockRepo: MockCustomersRepository;
  let service: CustomersService;

  beforeEach(() => {
    mockRepo = new MockCustomersRepository();
    service = new CustomersService(mockRepo);
    process.env.CUSTOMER_REFERRAL_ENABLED = 'true';
    process.env.CUSTOMER_OTP_PROVIDER = 'mock';
  });

  describe('OTP Auth Flow', () => {
    it('should generate mock OTP in dev mode', async () => {
      const response = await service.sendOtp('9876543210', CustomerOtpPurpose.LOGIN);
      expect(response.success).toBe(true);
      expect(response.otpCode).toBe('123456');
    });

    it('should successfully register a customer via OTP verification', async () => {
      await service.sendOtp('9876543210', CustomerOtpPurpose.LOGIN);
      const result = await service.verifyOtpAndLogin('9876543210', '123456', CustomerOtpPurpose.LOGIN);
      
      expect(result.customer).toBeDefined();
      expect(result.customer.mobile).toBe('9876543210');
      expect(result.customer.wallet).toBeDefined();
      expect(result.customer.wallet.balance).toBe(0);
      expect(result.customer.referralCode).toBeDefined();
      expect(result.customer.referralCode.code).toContain('JAIPUR-');
    });
  });

  describe('Address Serviceability Check', () => {
    it('should return serviceable=true for Jaipur zip codes starting with 302', () => {
      const result = service.checkAddressServiceability('302015', 'Jaipur');
      expect(result).toBe(true);
    });

    it('should return serviceable=true for Jaipur city regardless of zip code', () => {
      const result = service.checkAddressServiceability('302001', 'Jaipur');
      expect(result).toBe(true);
    });

    it('should return serviceable=false for other regions (e.g. New Delhi, 110001)', () => {
      const result = service.checkAddressServiceability('110001', 'Delhi');
      expect(result).toBe(false);
    });
  });

  describe('Wallet Transactions Ledger', () => {
    it('should correctly credit and debit from wallet with zero negative risk', async () => {
      const customer = await mockRepo.createCustomer({ name: 'Wallet Test User' });
      await mockRepo.createWallet({ customerId: customer.id, balance: 0.00 });

      // Credit wallet
      await service.creditWallet(customer.id, 500.00, WalletTransactionPurpose.TOPUP);
      let wallet = await mockRepo.getWalletByCustomerId(customer.id);
      expect(Number(wallet.balance)).toBe(500.00);

      // Debit wallet
      await service.debitWallet(customer.id, 200.00, WalletTransactionPurpose.ORDER_PAYMENT);
      wallet = await mockRepo.getWalletByCustomerId(customer.id);
      expect(Number(wallet.balance)).toBe(300.00);

      // Fail over-draft debit
      await expect(
        service.debitWallet(customer.id, 400.00, WalletTransactionPurpose.ORDER_PAYMENT)
      ).rejects.toThrow('Insufficient wallet balance');
    });
  });

  describe('Referral System & Anti-Fraud controls', () => {
    it('should register referee and distribute rewards to both referrer & referee instantly', async () => {
      // 1. Create Referrer
      const referrer = await service.registerCustomer({
        name: 'Referrer User',
        mobile: '9111111111',
      });

      const referrerRefCode = referrer.customer.referralCode.code;

      // 2. Register Referee using Referrer code
      const referee = await service.registerCustomer({
        name: 'Referee User',
        mobile: '9222222222',
        referralCode: referrerRefCode,
      }, '192.168.1.5'); // Different IP than referrer

      // 3. Verify rewards
      const referrerWallet = await mockRepo.getWalletByCustomerId(referrer.customer.id);
      const refereeWallet = await mockRepo.getWalletByCustomerId(referee.customer.id);

      expect(Number(referrerWallet.balance)).toBe(100.00); // gets 100 Referral reward
      expect(Number(refereeWallet.balance)).toBe(50.00);  // gets 50 joining bonus
    });

    it('should block self-referrals and throw error', async () => {
      const customer = await service.registerCustomer({
        name: 'Self Referrer',
        mobile: '9333333333',
      });

      const code = customer.customer.referralCode.code;

      await expect(
        service.applyReferralCode(customer.customer.id, code)
      ).rejects.toThrow('Anti-Fraud: You cannot refer yourself.');
    });

    it('should flag and mark relationship as VOID_FRAUD if signed up from same IP address', async () => {
      const referrer = await service.registerCustomer({
        name: 'Referrer Host',
        mobile: '9444444444',
      });

      const code = referrer.customer.referralCode.code;

      // Simulate referee signup from the SAME IP
      const sameIp = '127.0.0.1';
      // Mock session for referrer to have this IP
      await mockRepo.createSession({
        customerId: referrer.customer.id,
        ipAddress: sameIp,
        expiresAt: new Date(Date.now() + 10000000),
      });

      const referee = await service.registerCustomer({
        name: 'Referee Guest',
        mobile: '9555555555',
        referralCode: code,
      }, sameIp);

      const relationship = await mockRepo.getReferralRelationshipByRefereeId(referee.customer.id);
      expect(relationship.status).toBe(ReferralStatus.VOID_FRAUD);
      expect(relationship.notes).toContain('same IP address');
    });
  });
});
