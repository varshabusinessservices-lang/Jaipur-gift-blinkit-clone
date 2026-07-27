import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { prisma, shouldAllowFallback } from '../../database/prisma';
import { Prisma } from '@prisma/client';
import {
  CartStatus,
  CartSource,
  CartItemStatus,
  CartItemInventoryStatus,
  PersonalisationResponseStatus,
} from './cart.types';

const CARTS_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'cart', 'carts.json');
const CART_ITEMS_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'cart', 'cart_items.json');
const CART_ADDONS_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'cart', 'cart_item_addons.json');
const CART_RESPONSES_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'cart', 'cart_personalisation_responses.json');
const CART_DISCOUNTS_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'cart', 'cart_discount_allocations.json');
const CLEANUP_RUNS_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'cart', 'cart_cleanup_runs.json');

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
    
    // Parse Dates
    return parsed.map((item: any) => {
      const cloned = { ...item };
      for (const key of Object.keys(cloned)) {
        if (typeof cloned[key] === 'string' && (
          key.endsWith('At') || 
          key.endsWith('expiresAt') || 
          key.endsWith('ExpiresAt') || 
          key.endsWith('lastActivityAt') || 
          key.endsWith('convertedAt') || 
          key.endsWith('abandonedAt') || 
          key.endsWith('completedAt') || 
          key.endsWith('deletedAt') || 
          key === 'createdAt' || 
          key === 'updatedAt'
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

export class CartRepository {
  // ==========================================
  // 1. CART METHODS
  // ==========================================
  async createCart(data: any): Promise<any> {
    try {
      return await prisma.cart.create({ data });
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const carts = readJsonFile<any>(CARTS_FILE);
      const newCart = {
        id: data.id || crypto.randomUUID(),
        currency: 'INR',
        status: CartStatus.ACTIVE,
        source: CartSource.WEBSITE,
        itemCountCached: 0,
        quantityTotalCached: 0,
        merchandiseSubtotalCached: 0,
        addOnTotalCached: 0,
        discountTotalCached: 0,
        taxTotalCached: 0,
        deliveryEstimateCached: 0,
        walletPreviewAmountCached: 0,
        grandTotalCached: 0,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      carts.push(newCart);
      writeJsonFile(CARTS_FILE, carts);
      return newCart;
    }
  }

  async findCartById(id: string, includeDeleted = false): Promise<any | null> {
    try {
      return await prisma.cart.findUnique({
        where: { id },
        include: {
          items: {
            include: { addOns: true, personalisationResponse: true }
          },
          discountAllocations: true,
        },
      });
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const carts = readJsonFile<any>(CARTS_FILE);
      const cart = carts.find((c) => c.id === id && (includeDeleted || !c.deletedAt));
      if (!cart) return null;
      return this.enrichCartWithItems(cart);
    }
  }

  async findCartByToken(publicToken: string): Promise<any | null> {
    try {
      return await prisma.cart.findUnique({
        where: { publicToken },
        include: {
          items: {
            include: { addOns: true, personalisationResponse: true }
          },
          discountAllocations: true,
        },
      });
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const carts = readJsonFile<any>(CARTS_FILE);
      const cart = carts.find((c) => c.publicToken === publicToken && !c.deletedAt);
      if (!cart) return null;
      return this.enrichCartWithItems(cart);
    }
  }

  async findCartByCustomerId(customerId: string): Promise<any | null> {
    try {
      return await prisma.cart.findFirst({
        where: { customerId, status: CartStatus.ACTIVE, deletedAt: null },
        include: {
          items: {
            include: { addOns: true, personalisationResponse: true }
          },
          discountAllocations: true,
        },
      });
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const carts = readJsonFile<any>(CARTS_FILE);
      const cart = carts.find((c) => c.customerId === customerId && c.status === CartStatus.ACTIVE && !c.deletedAt);
      if (!cart) return null;
      return this.enrichCartWithItems(cart);
    }
  }

  async findCartByAnonymousSessionId(anonymousSessionId: string): Promise<any | null> {
    try {
      return await prisma.cart.findFirst({
        where: { anonymousSessionId, status: CartStatus.ACTIVE, deletedAt: null },
        include: {
          items: {
            include: { addOns: true, personalisationResponse: true }
          },
          discountAllocations: true,
        },
      });
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const carts = readJsonFile<any>(CARTS_FILE);
      const cart = carts.find((c) => c.anonymousSessionId === anonymousSessionId && c.status === CartStatus.ACTIVE && !c.deletedAt);
      if (!cart) return null;
      return this.enrichCartWithItems(cart);
    }
  }

  async updateCart(id: string, data: any): Promise<any> {
    try {
      return await prisma.cart.update({
        where: { id },
        data,
      });
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const carts = readJsonFile<any>(CARTS_FILE);
      const idx = carts.findIndex((c) => c.id === id);
      if (idx === -1) throw new Error('Cart not found');
      
      const updated = {
        ...carts[idx],
        ...data,
        updatedAt: new Date(),
      };
      carts[idx] = updated;
      writeJsonFile(CARTS_FILE, carts);
      return updated;
    }
  }

  async listCarts(filters: any = {}): Promise<any[]> {
    try {
      const where: any = {};
      if (filters.status) where.status = filters.status;
      if (filters.source) where.source = filters.source;
      if (filters.customerId) where.customerId = filters.customerId;
      if (filters.anonymousSessionId) where.anonymousSessionId = filters.anonymousSessionId;
      if (filters.storeId) where.storeId = filters.storeId;
      if (filters.deletedAt === null) where.deletedAt = null;

      return await prisma.cart.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        include: {
          items: {
            include: { addOns: true, personalisationResponse: true }
          },
          discountAllocations: true,
        },
      });
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      let carts = readJsonFile<any>(CARTS_FILE);
      if (filters.status) carts = carts.filter((c) => c.status === filters.status);
      if (filters.source) carts = carts.filter((c) => c.source === filters.source);
      if (filters.customerId) carts = carts.filter((c) => c.customerId === filters.customerId);
      if (filters.anonymousSessionId) carts = carts.filter((c) => c.anonymousSessionId === filters.anonymousSessionId);
      if (filters.storeId) carts = carts.filter((c) => c.storeId === filters.storeId);
      if (filters.deletedAt === null) carts = carts.filter((c) => c.deletedAt === null);

      return carts.map((c) => this.enrichCartWithItems(c)).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    }
  }

  private enrichCartWithItems(cart: any): any {
    const items = readJsonFile<any>(CART_ITEMS_FILE).filter((i) => i.cartId === cart.id && !i.deletedAt);
    const addons = readJsonFile<any>(CART_ADDONS_FILE);
    const responses = readJsonFile<any>(CART_RESPONSES_FILE);
    const discounts = readJsonFile<any>(CART_DISCOUNTS_FILE).filter((d) => d.cartId === cart.id);

    const enrichedItems = items.map((item) => {
      const itemAddons = addons.filter((a) => a.cartItemId === item.id);
      const itemResponse = responses.find((r) => r.id === item.personalisationResponseId) || null;
      return {
        ...item,
        addOns: itemAddons,
        personalisationResponse: itemResponse,
      };
    });

    return {
      ...cart,
      items: enrichedItems,
      discountAllocations: discounts,
    };
  }

  // ==========================================
  // 2. CART ITEM METHODS
  // ==========================================
  async createCartItem(data: any): Promise<any> {
    try {
      return await prisma.cartItem.create({ data });
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const items = readJsonFile<any>(CART_ITEMS_FILE);
      const newItem = {
        id: data.id || crypto.randomUUID(),
        lineNumber: data.lineNumber || 1,
        quantity: data.quantity || 1,
        itemStatus: CartItemStatus.ACTIVE,
        inventoryStatus: CartItemInventoryStatus.AVAILABLE,
        requiresPersonalisation: data.requiresPersonalisation ?? false,
        personalisationComplete: data.personalisationComplete ?? false,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      items.push(newItem);
      writeJsonFile(CART_ITEMS_FILE, items);
      return newItem;
    }
  }

  async findCartItemById(id: string): Promise<any | null> {
    try {
      return await prisma.cartItem.findUnique({
        where: { id },
        include: { addOns: true, personalisationResponse: true },
      });
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const items = readJsonFile<any>(CART_ITEMS_FILE);
      const item = items.find((i) => i.id === id && !i.deletedAt);
      if (!item) return null;

      const addons = readJsonFile<any>(CART_ADDONS_FILE).filter((a) => a.cartItemId === id);
      const response = readJsonFile<any>(CART_RESPONSES_FILE).find((r) => r.id === item.personalisationResponseId) || null;

      return {
        ...item,
        addOns: addons,
        personalisationResponse: response,
      };
    }
  }

  async updateCartItem(id: string, data: any): Promise<any> {
    try {
      return await prisma.cartItem.update({
        where: { id },
        data,
      });
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const items = readJsonFile<any>(CART_ITEMS_FILE);
      const idx = items.findIndex((i) => i.id === id);
      if (idx === -1) throw new Error('CartItem not found');

      const updated = {
        ...items[idx],
        ...data,
        updatedAt: new Date(),
      };
      items[idx] = updated;
      writeJsonFile(CART_ITEMS_FILE, items);
      return updated;
    }
  }

  async deleteCartItem(id: string): Promise<any> {
    try {
      return await prisma.cartItem.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const items = readJsonFile<any>(CART_ITEMS_FILE);
      const idx = items.findIndex((i) => i.id === id);
      if (idx !== -1) {
        items[idx].deletedAt = new Date();
        writeJsonFile(CART_ITEMS_FILE, items);
      }
      return true;
    }
  }

  // ==========================================
  // 3. CART ITEM ADDON METHODS
  // ==========================================
  async createCartItemAddOn(data: any): Promise<any> {
    try {
      return await prisma.cartItemAddOn.create({ data });
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const addons = readJsonFile<any>(CART_ADDONS_FILE);
      const newAddon = {
        id: data.id || crypto.randomUUID(),
        quantity: data.quantity || 1,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      addons.push(newAddon);
      writeJsonFile(CART_ADDONS_FILE, addons);
      return newAddon;
    }
  }

  async deleteCartItemAddOnsByCartItemId(cartItemId: string): Promise<any> {
    try {
      return await prisma.cartItemAddOn.deleteMany({
        where: { cartItemId },
      });
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      let addons = readJsonFile<any>(CART_ADDONS_FILE);
      addons = addons.filter((a) => a.cartItemId !== cartItemId);
      writeJsonFile(CART_ADDONS_FILE, addons);
      return true;
    }
  }

  // ==========================================
  // 4. PERSONALISATION RESPONSE METHODS
  // ==========================================
  async createPersonalisationResponse(data: any): Promise<any> {
    try {
      return await prisma.cartPersonalisationResponse.create({ data });
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const responses = readJsonFile<any>(CART_RESPONSES_FILE);
      const newResponse = {
        id: data.id || crypto.randomUUID(),
        responseStatus: PersonalisationResponseStatus.DRAFT,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      responses.push(newResponse);
      writeJsonFile(CART_RESPONSES_FILE, responses);
      return newResponse;
    }
  }

  async updatePersonalisationResponse(id: string, data: any): Promise<any> {
    try {
      return await prisma.cartPersonalisationResponse.update({
        where: { id },
        data,
      });
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const responses = readJsonFile<any>(CART_RESPONSES_FILE);
      const idx = responses.findIndex((r) => r.id === id);
      if (idx === -1) throw new Error('Personalisation response not found');

      const updated = {
        ...responses[idx],
        ...data,
        updatedAt: new Date(),
      };
      responses[idx] = updated;
      writeJsonFile(CART_RESPONSES_FILE, responses);
      return updated;
    }
  }

  // ==========================================
  // 5. DISCOUNT ALLOCATION METHODS
  // ==========================================
  async createDiscountAllocation(data: any): Promise<any> {
    try {
      return await prisma.cartDiscountAllocation.create({ data });
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const discounts = readJsonFile<any>(CART_DISCOUNTS_FILE);
      const newDiscount = {
        id: data.id || crypto.randomUUID(),
        ...data,
        createdAt: new Date(),
      };
      discounts.push(newDiscount);
      writeJsonFile(CART_DISCOUNTS_FILE, discounts);
      return newDiscount;
    }
  }

  async deleteDiscountAllocationsByCartId(cartId: string): Promise<any> {
    try {
      return await prisma.cartDiscountAllocation.deleteMany({
        where: { cartId },
      });
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      let discounts = readJsonFile<any>(CART_DISCOUNTS_FILE);
      discounts = discounts.filter((d) => d.cartId !== cartId);
      writeJsonFile(CART_DISCOUNTS_FILE, discounts);
      return true;
    }
  }

  // ==========================================
  // 6. CLEANUP RUN METHODS
  // ==========================================
  async createCleanupRun(data: any): Promise<any> {
    try {
      return await prisma.cartCleanupRun.create({ data });
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const runs = readJsonFile<any>(CLEANUP_RUNS_FILE);
      const newRun = {
        id: data.id || crypto.randomUUID(),
        startedAt: new Date(),
        completedAt: null,
        ...data,
        createdAt: new Date(),
      };
      runs.push(newRun);
      writeJsonFile(CLEANUP_RUNS_FILE, runs);
      return newRun;
    }
  }

  async updateCleanupRun(id: string, data: any): Promise<any> {
    try {
      return await prisma.cartCleanupRun.update({
        where: { id },
        data,
      });
    } catch (err) {
      if (!shouldAllowFallback()) throw err;
      const runs = readJsonFile<any>(CLEANUP_RUNS_FILE);
      const idx = runs.findIndex((r) => r.id === id);
      if (idx === -1) throw new Error('Cleanup run not found');

      const updated = {
        ...runs[idx],
        ...data,
        updatedAt: new Date(),
      };
      runs[idx] = updated;
      writeJsonFile(CLEANUP_RUNS_FILE, runs);
      return updated;
    }
  }
}
