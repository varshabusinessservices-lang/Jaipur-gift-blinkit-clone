import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { prisma, shouldAllowFallback } from '../../database/prisma';
import {
  CustomerStatus,
  AddressLabel,
  CustomerOtpPurpose,
  WalletTransactionType,
  WalletTransactionPurpose,
  ReferralStatus,
} from './customers.types';

const CUSTOMERS_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'customers', 'customers.json');
const ADDRESSES_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'customers', 'customer_addresses.json');
const SESSIONS_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'customers', 'customer_sessions.json');
const OTPS_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'customers', 'customer_otps.json');
const WALLETS_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'customers', 'customer_wallets.json');
const TRANSACTIONS_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'customers', 'wallet_transactions.json');
const REFERRAL_CODES_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'customers', 'customer_referral_codes.json');
const REFERRAL_RELATIONSHIPS_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'customers', 'customer_referral_relationships.json');
const REFERRAL_RULES_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'customers', 'referral_rules.json');

// Helper to ensure files exist
function ensureJsonFile(filePath: string, defaultData: any = []) {
  if (!fs.existsSync(filePath)) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf-8');
  }
}

// Helpers to read/write JSON data
function readJsonFile<T>(filePath: string): T[] {
  ensureJsonFile(filePath);
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    return parsed.map((item: any) => {
      const cloned = { ...item };
      for (const key of Object.keys(cloned)) {
        if (typeof cloned[key] === 'string' && (
          key.endsWith('At') || 
          key.endsWith('ExpiresAt') || 
          key.endsWith('expiresAt') || 
          key.endsWith('lastActivityAt') || 
          key.endsWith('revokedAt') || 
          key.endsWith('lastSentAt') || 
          key.endsWith('verifiedAt')
        )) {
          cloned[key] = new Date(cloned[key]);
        }
      }
      return cloned;
    });
  } catch (err) {
    return [];
  }
}

function writeJsonFile<T>(filePath: string, data: T[]) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export class CustomersRepository {
  // ==========================================
  // 1. CUSTOMER METHODS
  // ==========================================
  async createCustomer(data: any): Promise<any> {
    try {
      return await prisma.customer.create({ data });
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const customers = readJsonFile<any>(CUSTOMERS_FILE);
      const newCustomer = {
        id: crypto.randomUUID(),
        ...data,
        isVerified: data.isVerified ?? false,
        status: data.status ?? CustomerStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      customers.push(newCustomer);
      writeJsonFile(CUSTOMERS_FILE, customers);
      return newCustomer;
    }
  }

  async findCustomerById(id: string): Promise<any | null> {
    try {
      return await prisma.customer.findUnique({
        where: { id },
        include: {
          addresses: true,
          walletAccount: true,
        }
      });
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const customers = readJsonFile<any>(CUSTOMERS_FILE);
      const customer = customers.find((c) => c.id === id && !c.deletedAt);
      if (!customer) return null;

      // Attach nested items if exists
      const addresses = readJsonFile<any>(ADDRESSES_FILE).filter((a) => a.customerId === id && !a.deletedAt);
      const wallet = readJsonFile<any>(WALLETS_FILE).find((w) => w.customerId === id) || null;
      const referralCode = readJsonFile<any>(REFERRAL_CODES_FILE).find((r) => r.customerId === id) || null;

      return { ...customer, addresses, wallet, referralCode };
    }
  }

  async findCustomerByMobile(mobile: string): Promise<any | null> {
    try {
      return await prisma.customer.findUnique({ where: { mobile } });
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const customers = readJsonFile<any>(CUSTOMERS_FILE);
      return customers.find((c) => c.mobile === mobile && !c.deletedAt) || null;
    }
  }

  async findCustomerByEmail(email: string): Promise<any | null> {
    try {
      return await prisma.customer.findUnique({ where: { email } });
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const customers = readJsonFile<any>(CUSTOMERS_FILE);
      return customers.find((c) => c.email && c.email.toLowerCase() === email.toLowerCase() && !c.deletedAt) || null;
    }
  }

  async updateCustomer(id: string, data: any): Promise<any> {
    try {
      return await prisma.customer.update({ where: { id }, data });
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const customers = readJsonFile<any>(CUSTOMERS_FILE);
      const idx = customers.findIndex((c) => c.id === id && !c.deletedAt);
      if (idx === -1) throw new Error('Customer not found');
      
      const updated = {
        ...customers[idx],
        ...data,
        updatedAt: new Date(),
      };
      customers[idx] = updated;
      writeJsonFile(CUSTOMERS_FILE, customers);
      return updated;
    }
  }

  async listCustomers(filters: any = {}): Promise<{ items: any[]; total: number }> {
    try {
      const where: any = { deletedAt: null };
      if (filters.status) where.status = filters.status;
      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search } },
          { mobile: { contains: filters.search } },
          { email: { contains: filters.search } },
        ];
      }
      
      const total = await prisma.customer.count({ where });
      const items = await prisma.customer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          walletAccount: true,
        }
      });
      return { items, total };
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      let customers = readJsonFile<any>(CUSTOMERS_FILE).filter((c) => !c.deletedAt);
      if (filters.status) {
        customers = customers.filter((c) => c.status === filters.status);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        customers = customers.filter((c) => 
          (c.name && c.name.toLowerCase().includes(searchLower)) ||
          (c.mobile && c.mobile.includes(searchLower)) ||
          (c.email && c.email.toLowerCase().includes(searchLower))
        );
      }
      return {
        items: customers.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
        total: customers.length,
      };
    }
  }

  // ==========================================
  // 2. SESSION METHODS
  // ==========================================
  async createSession(data: any): Promise<any> {
    try {
      return await prisma.customerSession.create({ data });
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const sessions = readJsonFile<any>(SESSIONS_FILE);
      const newSession = {
        id: crypto.randomUUID(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      sessions.push(newSession);
      writeJsonFile(SESSIONS_FILE, sessions);
      return newSession;
    }
  }

  async findSessionByTokenHash(refreshTokenHash: string): Promise<any | null> {
    try {
      return await prisma.customerSession.findFirst({
        where: { refreshTokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
        include: { customer: true }
      });
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const sessions = readJsonFile<any>(SESSIONS_FILE);
      const session = sessions.find((s) => s.refreshTokenHash === refreshTokenHash && !s.revokedAt && s.expiresAt.getTime() > Date.now());
      if (!session) return null;
      const customer = await this.findCustomerById(session.customerId);
      return { ...session, customer };
    }
  }

  async revokeSession(id: string): Promise<any> {
    try {
      return await prisma.customerSession.update({
        where: { id },
        data: { revokedAt: new Date() },
      });
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const sessions = readJsonFile<any>(SESSIONS_FILE);
      const idx = sessions.findIndex((s) => s.id === id);
      if (idx !== -1) {
        sessions[idx].revokedAt = new Date();
        writeJsonFile(SESSIONS_FILE, sessions);
      }
      return true;
    }
  }

  async updateSessionActivity(id: string): Promise<any> {
    try {
      return await prisma.customerSession.update({
        where: { id },
        data: { lastActivityAt: new Date() },
      });
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const sessions = readJsonFile<any>(SESSIONS_FILE);
      const idx = sessions.findIndex((s) => s.id === id);
      if (idx !== -1) {
        sessions[idx].lastActivityAt = new Date();
        writeJsonFile(SESSIONS_FILE, sessions);
      }
      return true;
    }
  }

  async listSessionsByCustomerId(customerId: string): Promise<any[]> {
    try {
      return await prisma.customerSession.findMany({
        where: { customerId, revokedAt: null, expiresAt: { gt: new Date() } },
        orderBy: { lastActivityAt: 'desc' },
      });
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const sessions = readJsonFile<any>(SESSIONS_FILE);
      return sessions
        .filter((s) => s.customerId === customerId && !s.revokedAt && s.expiresAt.getTime() > Date.now())
        .sort((a, b) => b.lastActivityAt.getTime() - a.lastActivityAt.getTime());
    }
  }

  // ==========================================
  // 3. OTP METHODS
  // ==========================================
  async createOtp(data: any): Promise<any> {
    try {
      return await prisma.customerOtp.create({ data });
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const otps = readJsonFile<any>(OTPS_FILE);
      const newOtp = {
        id: crypto.randomUUID(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      otps.push(newOtp);
      writeJsonFile(OTPS_FILE, otps);
      return newOtp;
    }
  }

  async findLatestOtp(mobile: string, purpose: CustomerOtpPurpose): Promise<any | null> {
    try {
      return await prisma.customerOtp.findFirst({
        where: { mobile, purpose, verifiedAt: null, expiresAt: { gt: new Date() } },
        orderBy: { createdAt: 'desc' },
      });
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const otps = readJsonFile<any>(OTPS_FILE);
      const filtered = otps
        .filter((o) => o.mobile === mobile && o.purpose === purpose && !o.verifiedAt && o.expiresAt.getTime() > Date.now())
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      return filtered[0] || null;
    }
  }

  async updateOtp(id: string, data: any): Promise<any> {
    try {
      return await prisma.customerOtp.update({ where: { id }, data });
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const otps = readJsonFile<any>(OTPS_FILE);
      const idx = otps.findIndex((o) => o.id === id);
      if (idx === -1) throw new Error('OTP not found');
      
      const updated = {
        ...otps[idx],
        ...data,
        updatedAt: new Date(),
      };
      otps[idx] = updated;
      writeJsonFile(OTPS_FILE, otps);
      return updated;
    }
  }

  // ==========================================
  // 4. ADDRESS METHODS
  // ==========================================
  async createAddress(data: any): Promise<any> {
    try {
      return await prisma.customerAddress.create({ data });
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const addresses = readJsonFile<any>(ADDRESSES_FILE);
      const newAddress = {
        id: crypto.randomUUID(),
        ...data,
        isDefault: data.isDefault ?? false,
        isServiceable: data.isServiceable ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      addresses.push(newAddress);
      writeJsonFile(ADDRESSES_FILE, addresses);
      return newAddress;
    }
  }

  async findAddressById(id: string): Promise<any | null> {
    try {
      return await prisma.customerAddress.findUnique({ where: { id } });
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const addresses = readJsonFile<any>(ADDRESSES_FILE);
      return addresses.find((a) => a.id === id && !a.deletedAt) || null;
    }
  }

  async listAddressesByCustomerId(customerId: string): Promise<any[]> {
    try {
      return await prisma.customerAddress.findMany({
        where: { customerId, deletedAt: null },
        orderBy: { isDefault: 'desc' },
      });
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const addresses = readJsonFile<any>(ADDRESSES_FILE);
      return addresses
        .filter((a) => a.customerId === customerId && !a.deletedAt)
        .sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
    }
  }

  async updateAddress(id: string, data: any): Promise<any> {
    try {
      return await prisma.customerAddress.update({ where: { id }, data });
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const addresses = readJsonFile<any>(ADDRESSES_FILE);
      const idx = addresses.findIndex((a) => a.id === id && !a.deletedAt);
      if (idx === -1) throw new Error('Address not found');

      const updated = {
        ...addresses[idx],
        ...data,
        updatedAt: new Date(),
      };
      addresses[idx] = updated;
      writeJsonFile(ADDRESSES_FILE, addresses);
      return updated;
    }
  }

  async deleteAddress(id: string): Promise<boolean> {
    try {
      await prisma.customerAddress.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      return true;
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const addresses = readJsonFile<any>(ADDRESSES_FILE);
      const idx = addresses.findIndex((a) => a.id === id && !a.deletedAt);
      if (idx === -1) return false;
      addresses[idx].deletedAt = new Date();
      writeJsonFile(ADDRESSES_FILE, addresses);
      return true;
    }
  }

  // ==========================================
  // 5. WALLET & TRANSACTION METHODS
  // ==========================================
  async createWallet(data: any): Promise<any> {
    try {
      return await prisma.walletAccount.create({ data: { customerId: data.customerId, status: 'ACTIVE' } });
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const wallets = readJsonFile<any>(WALLETS_FILE);
      const newWallet = {
        id: crypto.randomUUID(),
        ...data,
        balance: data.balance ?? 0,
        currency: data.currency ?? 'INR',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      wallets.push(newWallet);
      writeJsonFile(WALLETS_FILE, wallets);
      return newWallet;
    }
  }

  async getWalletByCustomerId(customerId: string): Promise<any | null> {
    try {
      return await prisma.walletAccount.findUnique({ where: { customerId } });
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const wallets = readJsonFile<any>(WALLETS_FILE);
      return wallets.find((w) => w.customerId === customerId) || null;
    }
  }

  async updateWalletBalance(id: string, balance: number): Promise<any> {
    try {
      return await prisma.walletAccount.update({
        where: { id },
        data: { cachedAvailableBalance: balance },
      });
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const wallets = readJsonFile<any>(WALLETS_FILE);
      const idx = wallets.findIndex((w) => w.id === id);
      if (idx === -1) throw new Error('Wallet not found');
      
      wallets[idx].balance = balance;
      wallets[idx].updatedAt = new Date();
      writeJsonFile(WALLETS_FILE, wallets);
      return wallets[idx];
    }
  }

  async createTransaction(data: any): Promise<any> {
    try {
      return await prisma.walletLedgerEntry.create({
        data: {
          walletAccountId: String(data.walletId || 'acc_default'),
          customerId: data.customerId,
          transactionType: 'CREDIT',
          direction: 'CREDIT',
          amount: data.amount || 0,
          bucketType: 'SELF_LOADED',
        } as any,
      });
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const transactions = readJsonFile<any>(TRANSACTIONS_FILE);
      const newTx = {
        id: crypto.randomUUID(),
        ...data,
        createdAt: new Date(),
      };
      transactions.push(newTx);
      writeJsonFile(TRANSACTIONS_FILE, transactions);
      return newTx;
    }
  }

  async listTransactionsByWalletId(walletId: string): Promise<any[]> {
    try {
      return await prisma.walletLedgerEntry.findMany({
        where: { walletAccountId: walletId },
        orderBy: { createdAt: 'desc' },
      });
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const transactions = readJsonFile<any>(TRANSACTIONS_FILE);
      return transactions
        .filter((t) => t.walletId === walletId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
  }

  // ==========================================
  // 6. REFERRAL METHODS
  // ==========================================
  async createReferralCode(data: any): Promise<any> {
    const codes = readJsonFile<any>(REFERRAL_CODES_FILE);
    const newCode = {
      id: crypto.randomUUID(),
      ...data,
      totalReferredCount: 0,
      totalEarned: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    codes.push(newCode);
    writeJsonFile(REFERRAL_CODES_FILE, codes);
    return newCode;
  }

  async getReferralCodeByCode(code: string): Promise<any | null> {
    const codes = readJsonFile<any>(REFERRAL_CODES_FILE);
    const item = codes.find((c: any) => c.code === code.toUpperCase()) || null;
    if (!item) return null;
    const customer = await this.findCustomerById(item.customerId);
    return { ...item, customer };
  }

  async getReferralCodeByCustomerId(customerId: string): Promise<any | null> {
    const codes = readJsonFile<any>(REFERRAL_CODES_FILE);
    return codes.find((c: any) => c.customerId === customerId) || null;
  }

  async incrementReferralCodeEarnings(id: string, amount: number): Promise<any> {
    const codes = readJsonFile<any>(REFERRAL_CODES_FILE);
    const idx = codes.findIndex((c: any) => c.id === id);
    if (idx !== -1) {
      codes[idx].totalReferredCount = (codes[idx].totalReferredCount || 0) + 1;
      codes[idx].totalEarned = Number(codes[idx].totalEarned || 0) + amount;
      codes[idx].updatedAt = new Date();
      writeJsonFile(REFERRAL_CODES_FILE, codes);
    }
    return codes[idx];
  }

  async createReferralRelationship(data: any): Promise<any> {
    try {
      return await prisma.referralRelationship.create({ data });
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const relationships = readJsonFile<any>(REFERRAL_RELATIONSHIPS_FILE);
      const newRel = {
        id: crypto.randomUUID(),
        ...data,
        status: data.status ?? ReferralStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      relationships.push(newRel);
      writeJsonFile(REFERRAL_RELATIONSHIPS_FILE, relationships);
      return newRel;
    }
  }

  async getReferralRelationshipByRefereeId(refereeId: string): Promise<any | null> {
    try {
      return await prisma.referralRelationship.findFirst({ where: { newCustomerId: refereeId } });
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const relationships = readJsonFile<any>(REFERRAL_RELATIONSHIPS_FILE);
      return relationships.find((r: any) => r.newCustomerId === refereeId || r.refereeId === refereeId) || null;
    }
  }

  async listReferralRelationshipsByReferrerId(referrerId: string): Promise<any[]> {
    try {
      return await prisma.referralRelationship.findMany({
        where: { referrerId },
        orderBy: { createdAt: 'desc' },
      });
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const relationships = readJsonFile<any>(REFERRAL_RELATIONSHIPS_FILE);
      return relationships
        .filter((r) => r.referrerId === referrerId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
  }

  async updateReferralRelationship(id: string, data: any): Promise<any> {
    try {
      return await prisma.referralRelationship.update({ where: { id }, data });
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const relationships = readJsonFile<any>(REFERRAL_RELATIONSHIPS_FILE);
      const idx = relationships.findIndex((r) => r.id === id);
      if (idx === -1) throw new Error('Referral relationship not found');

      const updated = {
        ...relationships[idx],
        ...data,
        updatedAt: new Date(),
      };
      relationships[idx] = updated;
      writeJsonFile(REFERRAL_RELATIONSHIPS_FILE, relationships);
      return updated;
    }
  }

  // ==========================================
  // 7. REFERRAL RULE METHODS
  // ==========================================
  async getActiveReferralRule(): Promise<any | null> {
    try {
      return await prisma.referralRule.findFirst({ where: { isActive: true } });
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const rules = readJsonFile<any>(REFERRAL_RULES_FILE);
      return rules.find((r) => r.isActive === true) || null;
    }
  }

  async createReferralRule(data: any): Promise<any> {
    try {
      return await prisma.referralRule.create({ data });
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const rules = readJsonFile<any>(REFERRAL_RULES_FILE);
      const newRule = {
        id: crypto.randomUUID(),
        ...data,
        isActive: data.isActive ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      rules.push(newRule);
      writeJsonFile(REFERRAL_RULES_FILE, rules);
      return newRule;
    }
  }
}
