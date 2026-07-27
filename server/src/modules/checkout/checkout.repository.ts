import fs from 'fs';
import path from 'path';
import { prisma, shouldAllowFallback } from '../../database/prisma';

const CHECKOUT_SESSIONS_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'checkout', 'checkout_sessions.json');
const WALLET_RESERVATIONS_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'checkout', 'wallet_reservations.json');
const COUPONS_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'checkout', 'coupons.json');
const SERVICE_AREAS_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'checkout', 'service_areas.json');

function ensureFile(filePath: string, defaultData: any = []) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    }
  } catch (err) {
    console.error(`Failed to ensure file ${filePath}:`, err);
  }
}

export class CheckoutRepository {
  constructor() {
    ensureFile(CHECKOUT_SESSIONS_FILE);
    ensureFile(WALLET_RESERVATIONS_FILE);
    ensureFile(COUPONS_FILE, [
      {
        id: 'coupon-1',
        code: 'JAIPUR50',
        discountType: 'PERCENTAGE',
        discountValue: 50,
        minOrderAmount: 299,
        maxDiscountAmount: 150,
        isActive: true,
        expiresAt: new Date(Date.now() + 8640000000).toISOString(),
      },
      {
        id: 'coupon-2',
        code: 'WELCOME100',
        discountType: 'FIXED',
        discountValue: 100,
        minOrderAmount: 499,
        maxDiscountAmount: 100,
        isActive: true,
        expiresAt: new Date(Date.now() + 8640000000).toISOString(),
      },
    ]);
    ensureFile(SERVICE_AREAS_FILE, [
      {
        id: 'sa-1',
        pincode: '302001',
        city: 'Jaipur',
        state: 'Rajasthan',
        storeId: null,
        isServiceable: true,
        isSameDayEligible: true,
      },
      {
        id: 'sa-2',
        pincode: '302015',
        city: 'Jaipur',
        state: 'Rajasthan',
        storeId: null,
        isServiceable: true,
        isSameDayEligible: true,
      },
      {
        id: 'sa-3',
        pincode: '302017',
        city: 'Jaipur',
        state: 'Rajasthan',
        storeId: null,
        isServiceable: true,
        isSameDayEligible: true,
      },
    ]);
  }

  // Checkout Sessions
  async createSession(data: any): Promise<any> {
    try {
      if (!shouldAllowFallback()) {
        const created = await prisma.checkoutSession.create({ data });
        return created;
      }
    } catch (err) {
      console.warn('Prisma create checkout session failed, falling back to JSON:', err);
    }

    const sessions = JSON.parse(fs.readFileSync(CHECKOUT_SESSIONS_FILE, 'utf-8') || '[]');
    const record = {
      ...data,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    sessions.push(record);
    fs.writeFileSync(CHECKOUT_SESSIONS_FILE, JSON.stringify(sessions, null, 2));
    return record;
  }

  async findSessionById(id: string): Promise<any> {
    try {
      if (!shouldAllowFallback()) {
        const found = await prisma.checkoutSession.findUnique({ where: { id } });
        if (found) return found;
      }
    } catch (err) {
      // fallback
    }

    const sessions = JSON.parse(fs.readFileSync(CHECKOUT_SESSIONS_FILE, 'utf-8') || '[]');
    return sessions.find((s: any) => s.id === id) || null;
  }

  async findSessionByCustomerId(customerId: string): Promise<any[]> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.checkoutSession.findMany({
          where: { customerId },
          orderBy: { createdAt: 'desc' },
        });
      }
    } catch (err) {}

    const sessions = JSON.parse(fs.readFileSync(CHECKOUT_SESSIONS_FILE, 'utf-8') || '[]');
    return sessions.filter((s: any) => s.customerId === customerId).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async findAllSessions(filters?: { status?: string; customerId?: string }): Promise<any[]> {
    try {
      if (!shouldAllowFallback()) {
        const where: any = {};
        if (filters?.status) where.status = filters.status;
        if (filters?.customerId) where.customerId = filters.customerId;
        return await prisma.checkoutSession.findMany({
          where,
          orderBy: { createdAt: 'desc' },
        });
      }
    } catch (err) {}

    let sessions = JSON.parse(fs.readFileSync(CHECKOUT_SESSIONS_FILE, 'utf-8') || '[]');
    if (filters?.status) {
      sessions = sessions.filter((s: any) => s.status === filters.status);
    }
    if (filters?.customerId) {
      sessions = sessions.filter((s: any) => s.customerId === filters.customerId);
    }
    return sessions.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateSession(id: string, data: any): Promise<any> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.checkoutSession.update({
          where: { id },
          data,
        });
      }
    } catch (err) {}

    const sessions = JSON.parse(fs.readFileSync(CHECKOUT_SESSIONS_FILE, 'utf-8') || '[]');
    const index = sessions.findIndex((s: any) => s.id === id);
    if (index === -1) throw new Error('Checkout session not found');
    sessions[index] = {
      ...sessions[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(CHECKOUT_SESSIONS_FILE, JSON.stringify(sessions, null, 2));
    return sessions[index];
  }

  // Wallet Reservations
  async createWalletReservation(data: any): Promise<any> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.walletReservation.create({ data });
      }
    } catch (err) {}

    const reservations = JSON.parse(fs.readFileSync(WALLET_RESERVATIONS_FILE, 'utf-8') || '[]');
    const record = {
      ...data,
      amount: String(data.amount),
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    reservations.push(record);
    fs.writeFileSync(WALLET_RESERVATIONS_FILE, JSON.stringify(reservations, null, 2));
    return record;
  }

  async findWalletReservationsByCheckout(checkoutId: string): Promise<any[]> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.walletReservation.findMany({ where: { checkoutId } });
      }
    } catch (err) {}

    const reservations = JSON.parse(fs.readFileSync(WALLET_RESERVATIONS_FILE, 'utf-8') || '[]');
    return reservations.filter((r: any) => r.checkoutId === checkoutId);
  }

  async updateWalletReservationStatus(id: string, status: string): Promise<any> {
    try {
      if (!shouldAllowFallback()) {
        return await prisma.walletReservation.update({
          where: { id },
          data: { status: status as any },
        });
      }
    } catch (err) {}

    const reservations = JSON.parse(fs.readFileSync(WALLET_RESERVATIONS_FILE, 'utf-8') || '[]');
    const index = reservations.findIndex((r: any) => r.id === id);
    if (index !== -1) {
      reservations[index].status = status;
      reservations[index].updatedAt = new Date().toISOString();
      fs.writeFileSync(WALLET_RESERVATIONS_FILE, JSON.stringify(reservations, null, 2));
      return reservations[index];
    }
    return null;
  }

  // Coupons
  async findCouponByCode(code: string): Promise<any> {
    try {
      if (!shouldAllowFallback()) {
        const found = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
        if (found) return found;
      }
    } catch (err) {}

    const coupons = JSON.parse(fs.readFileSync(COUPONS_FILE, 'utf-8') || '[]');
    return coupons.find((c: any) => c.code.toUpperCase() === code.toUpperCase()) || null;
  }

  // Service Areas
  async findServiceAreaByPincode(pincode: string): Promise<any> {
    try {
      if (!shouldAllowFallback()) {
        const found = await prisma.serviceArea.findUnique({ where: { pincode } });
        if (found) return found;
      }
    } catch (err) {}

    const areas = JSON.parse(fs.readFileSync(SERVICE_AREAS_FILE, 'utf-8') || '[]');
    return areas.find((a: any) => a.pincode === pincode) || null;
  }
}
