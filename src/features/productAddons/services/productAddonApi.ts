import axios from 'axios';
import { config } from '../../../config/env';
import {
  ProductAddon,
  AddonGroup,
  ProductAddonFilterState,
} from '../types/productAddon';

const API_BASE = `${config.apiBaseUrl}/admin`;

// Initial Mock Seed Data
let mockAddonsStore: ProductAddon[] = [
  {
    id: 'addon-1',
    name: 'Gift Packing',
    slug: 'gift-packing',
    code: 'ADD-GP-01',
    shortDescription: 'Standard gift wrapping paper with ribbon',
    description: 'Beautiful decorative paper wrapping with satin ribbon bow.',
    inputType: 'CHECKBOX',
    pricingType: 'FIXED',
    fixedPrice: '49.00',
    priceIncludesTax: true,
    status: 'ACTIVE',
    isRequired: false,
    allowQuantity: false,
    minimumQuantity: 0,
    manageStock: true,
    stockQuantity: 250,
    reservedStock: 0,
    lowStockThreshold: 20,
    allowBackorder: true,
    customerLabel: 'Add Standard Gift Packing (₹49)',
    internalLabel: 'Gift Packing - Standard',
    sortOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignments: [{ id: 'asgn-1', assignmentType: 'GLOBAL', sortOrder: 1, status: 'ACTIVE' }],
    options: [],
  },
  {
    id: 'addon-2',
    name: 'Premium Gift Packing',
    slug: 'premium-gift-packing',
    code: 'ADD-GP-02',
    shortDescription: 'Velvet gift wrap box with personalized greeting label',
    description: 'Luxury rigid box packaging with magnetic clasp and custom gold foil label.',
    inputType: 'CHECKBOX',
    pricingType: 'FIXED',
    fixedPrice: '99.00',
    priceIncludesTax: true,
    status: 'ACTIVE',
    isRequired: false,
    allowQuantity: false,
    minimumQuantity: 0,
    manageStock: true,
    stockQuantity: 80,
    reservedStock: 0,
    lowStockThreshold: 10,
    allowBackorder: false,
    customerLabel: 'Upgrade to Premium Gift Box Packing (₹99)',
    internalLabel: 'Gift Packing - Premium Velvet',
    sortOrder: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignments: [{ id: 'asgn-2', assignmentType: 'GLOBAL', sortOrder: 2, status: 'ACTIVE' }],
    options: [],
  },
  {
    id: 'addon-3',
    name: 'Greeting Note',
    slug: 'greeting-note',
    code: 'ADD-GN-01',
    shortDescription: 'Free handwritten personal message note',
    description: 'We handwrite your message on a mini craft gift note card.',
    inputType: 'TEXTAREA',
    pricingType: 'FREE',
    priceIncludesTax: true,
    status: 'ACTIVE',
    isRequired: false,
    allowQuantity: false,
    minimumQuantity: 0,
    manageStock: false,
    reservedStock: 0,
    allowBackorder: false,
    placeholder: 'Type your personal gift message here (max 250 characters)...',
    helpText: 'Handwritten neatly on craft paper note.',
    customerLabel: 'Include Free Personal Message Note',
    internalLabel: 'Free Greeting Note',
    sortOrder: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignments: [{ id: 'asgn-3', assignmentType: 'GLOBAL', sortOrder: 3, status: 'ACTIVE' }],
    options: [],
  },
  {
    id: 'addon-4',
    name: 'Printed Greeting Card',
    slug: 'printed-greeting-card',
    code: 'ADD-GC-01',
    shortDescription: 'High gloss printed greeting card with envelope',
    description: 'Select a theme card printed on 300 GSM cardstock.',
    inputType: 'DROPDOWN',
    pricingType: 'FIXED',
    fixedPrice: '29.00',
    priceIncludesTax: true,
    status: 'ACTIVE',
    isRequired: false,
    allowQuantity: false,
    minimumQuantity: 0,
    manageStock: false,
    reservedStock: 0,
    allowBackorder: false,
    customerLabel: 'Add Printed Greeting Card (₹29)',
    internalLabel: 'Greeting Card Printed',
    sortOrder: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignments: [{ id: 'asgn-4', assignmentType: 'GLOBAL', sortOrder: 4, status: 'ACTIVE' }],
    options: [
      { id: 'opt-1', name: 'Happy Birthday Card', isDefault: true, status: 'ACTIVE', sortOrder: 1, fixedPrice: '29.00' },
      { id: 'opt-2', name: 'Happy Anniversary Card', isDefault: false, status: 'ACTIVE', sortOrder: 2, fixedPrice: '29.00' },
      { id: 'opt-3', name: 'Congratulations Card', isDefault: false, status: 'ACTIVE', sortOrder: 3, fixedPrice: '29.00' },
      { id: 'opt-4', name: 'With Love Card', isDefault: false, status: 'ACTIVE', sortOrder: 4, fixedPrice: '29.00' },
    ],
  },
  {
    id: 'addon-5',
    name: 'Red Rose Bouquet Stem',
    slug: 'red-rose',
    code: 'ADD-FL-01',
    shortDescription: 'Fresh Dutch red rose stem added to parcel',
    description: 'Fresh long-stem red rose carefully padded in floral tube.',
    inputType: 'QUANTITY',
    pricingType: 'PER_QUANTITY',
    fixedPrice: '30.00',
    priceIncludesTax: true,
    status: 'ACTIVE',
    isRequired: false,
    allowQuantity: true,
    minimumQuantity: 1,
    maximumQuantity: 10,
    defaultQuantity: 1,
    manageStock: true,
    stockQuantity: 50,
    reservedStock: 0,
    lowStockThreshold: 5,
    allowBackorder: false,
    customerLabel: 'Add Fresh Red Roses (₹30 each)',
    internalLabel: 'Dutch Red Rose Stem',
    sortOrder: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignments: [{ id: 'asgn-5', assignmentType: 'GLOBAL', sortOrder: 5, status: 'ACTIVE' }],
    options: [],
  },
  {
    id: 'addon-6',
    name: 'Photo Retouching & Color Enhancer',
    slug: 'photo-retouching',
    code: 'ADD-PS-01',
    shortDescription: 'Professional studio color & skin smoothing enhancement',
    description: 'Our senior graphics artist manually enhances contrast, brightness, and removes blemishes.',
    inputType: 'CHECKBOX',
    pricingType: 'FIXED',
    fixedPrice: '99.00',
    priceIncludesTax: true,
    status: 'ACTIVE',
    isRequired: false,
    allowQuantity: false,
    minimumQuantity: 0,
    manageStock: false,
    reservedStock: 0,
    allowBackorder: false,
    customerLabel: 'Add Pro Photo Retouching & HD Color Correction (₹99)',
    internalLabel: 'Photo Retouching - Artist Service',
    sortOrder: 6,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignments: [{ id: 'asgn-6', assignmentType: 'ALL_PERSONALISED_PRODUCTS', sortOrder: 1, status: 'ACTIVE' }],
    options: [],
  },
  {
    id: 'addon-7',
    name: 'Urgent Same-Day Design Proof',
    slug: 'urgent-design-proof',
    code: 'ADD-EX-01',
    shortDescription: 'Get WhatsApp design proof preview in under 2 hours',
    description: 'Priority queue placement for design team. Proof sent via WhatsApp within 2 hours.',
    inputType: 'CHECKBOX',
    pricingType: 'FIXED',
    fixedPrice: '149.00',
    priceIncludesTax: true,
    status: 'ACTIVE',
    isRequired: false,
    allowQuantity: false,
    minimumQuantity: 0,
    manageStock: false,
    reservedStock: 0,
    allowBackorder: false,
    customerLabel: 'Express WhatsApp Design Proof within 2 Hours (₹149)',
    internalLabel: 'Express Design Proof',
    sortOrder: 7,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignments: [{ id: 'asgn-7', assignmentType: 'GLOBAL', sortOrder: 7, status: 'ACTIVE' }],
    options: [],
  },
  {
    id: 'addon-8',
    name: 'Custom Gift Contribution',
    slug: 'custom-contribution',
    code: 'ADD-CM-01',
    shortDescription: 'Add a custom tip or extra contribution to artisan designers',
    description: 'Support local Jaipur craftsmen and digital artists with a custom tip.',
    inputType: 'NUMBER',
    pricingType: 'CUSTOM_AMOUNT',
    minimumAmount: '10.00',
    maximumAmount: '1000.00',
    defaultAmount: '50.00',
    priceIncludesTax: true,
    status: 'ACTIVE',
    isRequired: false,
    allowQuantity: false,
    minimumQuantity: 0,
    manageStock: false,
    reservedStock: 0,
    allowBackorder: false,
    customerLabel: 'Optional Artisan Designer Tip / Contribution',
    internalLabel: 'Artisan Support Tip',
    sortOrder: 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignments: [{ id: 'asgn-8', assignmentType: 'GLOBAL', sortOrder: 8, status: 'ACTIVE' }],
    options: [],
  },
];

let mockAddonGroupsStore: AddonGroup[] = [
  {
    id: 'group-1',
    name: 'Gift Wrapping & Presentation Bundle',
    slug: 'gift-wrapping-bundle',
    description: 'Combined packing options and greeting cards',
    selectionType: 'SINGLE',
    minimumSelections: 0,
    maximumSelections: 1,
    isRequired: false,
    status: 'ACTIVE',
    sortOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      { id: 'gi-1', addonId: 'addon-1', sortOrder: 1, isDefault: true, addon: mockAddonsStore[0] },
      { id: 'gi-2', addonId: 'addon-2', sortOrder: 2, isDefault: false, addon: mockAddonsStore[1] },
    ],
  },
  {
    id: 'group-2',
    name: 'Personalisation Enhancements',
    slug: 'personalisation-enhancements',
    description: 'Design proofs, photo touchups, and background removal',
    selectionType: 'MULTIPLE',
    minimumSelections: 0,
    maximumSelections: 3,
    isRequired: false,
    status: 'ACTIVE',
    sortOrder: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      { id: 'gi-3', addonId: 'addon-6', sortOrder: 1, isDefault: false, addon: mockAddonsStore[5] },
      { id: 'gi-4', addonId: 'addon-7', sortOrder: 2, isDefault: false, addon: mockAddonsStore[6] },
    ],
  },
];

export const productAddonApi = {
  /**
   * List Product Add-ons
   */
  async getAddons(params?: ProductAddonFilterState) {
    if (config.adminUseMockApi) {
      let filtered = [...mockAddonsStore];
      if (!params?.includeDeleted) {
        filtered = filtered.filter((a) => !a.deletedAt);
      }
      if (params?.search) {
        const s = params.search.toLowerCase();
        filtered = filtered.filter(
          (a) =>
            a.name.toLowerCase().includes(s) ||
            a.slug.toLowerCase().includes(s) ||
            (a.code && a.code.toLowerCase().includes(s))
        );
      }
      if (params?.status) {
        filtered = filtered.filter((a) => a.status === params.status);
      }
      if (params?.inputType) {
        filtered = filtered.filter((a) => a.inputType === params.inputType);
      }
      if (params?.pricingType) {
        filtered = filtered.filter((a) => a.pricingType === params.pricingType);
      }

      const page = params?.page || 1;
      const limit = params?.limit || 20;
      const total = filtered.length;
      const start = (page - 1) * limit;
      const items = filtered.slice(start, start + limit);

      return {
        success: true,
        data: items,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      };
    }

    const response = await axios.get(`${API_BASE}/product-addons`, { params });
    return response.data;
  },

  /**
   * Get Single Product Add-on
   */
  async getAddonById(id: string) {
    if (config.adminUseMockApi) {
      const addon = mockAddonsStore.find((a) => a.id === id);
      if (!addon) throw new Error('Product Add-on not found');
      return { success: true, data: addon };
    }

    const response = await axios.get(`${API_BASE}/product-addons/${id}`);
    return response.data;
  },

  /**
   * Create Product Add-on
   */
  async createAddon(data: Partial<ProductAddon>) {
    if (config.adminUseMockApi) {
      const newAddon: ProductAddon = {
        id: `addon-${Date.now()}`,
        name: data.name || 'New Add-on',
        slug: data.slug || (data.name || 'new').toLowerCase().replace(/\s+/g, '-'),
        code: data.code || null,
        shortDescription: data.shortDescription || null,
        description: data.description || null,
        inputType: data.inputType || 'CHECKBOX',
        pricingType: data.pricingType || 'FIXED',
        fixedPrice: data.fixedPrice !== undefined ? String(data.fixedPrice) : '0.00',
        percentageRate: data.percentageRate !== undefined ? String(data.percentageRate) : null,
        minimumAmount: data.minimumAmount !== undefined ? String(data.minimumAmount) : null,
        maximumAmount: data.maximumAmount !== undefined ? String(data.maximumAmount) : null,
        defaultAmount: data.defaultAmount !== undefined ? String(data.defaultAmount) : null,
        priceIncludesTax: data.priceIncludesTax !== false,
        status: data.status || 'ACTIVE',
        isRequired: data.isRequired || false,
        allowQuantity: data.allowQuantity || false,
        minimumQuantity: data.minimumQuantity || 0,
        maximumQuantity: data.maximumQuantity || null,
        defaultQuantity: data.defaultQuantity || null,
        manageStock: data.manageStock || false,
        stockQuantity: data.stockQuantity || null,
        reservedStock: 0,
        lowStockThreshold: data.lowStockThreshold || null,
        allowBackorder: data.allowBackorder || false,
        placeholder: data.placeholder || null,
        helpText: data.helpText || null,
        customerLabel: data.customerLabel || null,
        internalLabel: data.internalLabel || null,
        sortOrder: data.sortOrder || mockAddonsStore.length + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        options: data.options || [],
        assignments: data.assignments || [{ id: `asgn-${Date.now()}`, assignmentType: 'GLOBAL', sortOrder: 1, status: 'ACTIVE' }],
      };

      mockAddonsStore.unshift(newAddon);
      return { success: true, message: 'Add-on created successfully', data: newAddon };
    }

    const response = await axios.post(`${API_BASE}/product-addons`, data);
    return response.data;
  },

  /**
   * Update Product Add-on
   */
  async updateAddon(id: string, data: Partial<ProductAddon>) {
    if (config.adminUseMockApi) {
      const idx = mockAddonsStore.findIndex((a) => a.id === id);
      if (idx === -1) throw new Error('Add-on not found');

      mockAddonsStore[idx] = {
        ...mockAddonsStore[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      return { success: true, message: 'Add-on updated successfully', data: mockAddonsStore[idx] };
    }

    const response = await axios.patch(`${API_BASE}/product-addons/${id}`, data);
    return response.data;
  },

  /**
   * Update Status
   */
  async updateAddonStatus(id: string, status: string) {
    if (config.adminUseMockApi) {
      const idx = mockAddonsStore.findIndex((a) => a.id === id);
      if (idx === -1) throw new Error('Add-on not found');

      mockAddonsStore[idx].status = status as any;
      mockAddonsStore[idx].updatedAt = new Date().toISOString();
      return { success: true, message: `Status updated to ${status}`, data: mockAddonsStore[idx] };
    }

    const response = await axios.patch(`${API_BASE}/product-addons/${id}/status`, { status });
    return response.data;
  },

  /**
   * Soft Delete Add-on
   */
  async deleteAddon(id: string) {
    if (config.adminUseMockApi) {
      const idx = mockAddonsStore.findIndex((a) => a.id === id);
      if (idx === -1) throw new Error('Add-on not found');

      mockAddonsStore[idx].deletedAt = new Date().toISOString();
      mockAddonsStore[idx].status = 'INACTIVE';
      return { success: true, message: 'Add-on deleted', data: mockAddonsStore[idx] };
    }

    const response = await axios.delete(`${API_BASE}/product-addons/${id}`);
    return response.data;
  },

  /**
   * Restore Add-on
   */
  async restoreAddon(id: string) {
    if (config.adminUseMockApi) {
      const idx = mockAddonsStore.findIndex((a) => a.id === id);
      if (idx === -1) throw new Error('Add-on not found');

      mockAddonsStore[idx].deletedAt = null;
      mockAddonsStore[idx].status = 'INACTIVE';
      return { success: true, message: 'Add-on restored', data: mockAddonsStore[idx] };
    }

    const response = await axios.post(`${API_BASE}/product-addons/${id}/restore`);
    return response.data;
  },

  /**
   * Duplicate Add-on
   */
  async duplicateAddon(id: string) {
    if (config.adminUseMockApi) {
      const existing = mockAddonsStore.find((a) => a.id === id);
      if (!existing) throw new Error('Add-on not found');

      const duplicated: ProductAddon = {
        ...existing,
        id: `addon-${Date.now()}`,
        name: `${existing.name} (Copy)`,
        slug: `${existing.slug}-copy-${Date.now().toString().slice(-4)}`,
        code: existing.code ? `${existing.code}_COPY` : null,
        status: 'INACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockAddonsStore.unshift(duplicated);
      return { success: true, message: 'Add-on duplicated successfully', data: duplicated };
    }

    const response = await axios.post(`${API_BASE}/product-addons/${id}/duplicate`);
    return response.data;
  },

  /**
   * Addon Groups Endpoints
   */
  async getGroups(params?: any) {
    if (config.adminUseMockApi) {
      let filtered = [...mockAddonGroupsStore];
      if (!params?.includeDeleted) {
        filtered = filtered.filter((g) => !g.deletedAt);
      }
      return {
        success: true,
        data: filtered,
        meta: { page: 1, limit: 20, total: filtered.length, totalPages: 1 },
      };
    }

    const response = await axios.get(`${API_BASE}/addon-groups`, { params });
    return response.data;
  },

  async getGroupById(id: string) {
    if (config.adminUseMockApi) {
      const group = mockAddonGroupsStore.find((g) => g.id === id);
      if (!group) throw new Error('Add-on Group not found');
      return { success: true, data: group };
    }

    const response = await axios.get(`${API_BASE}/addon-groups/${id}`);
    return response.data;
  },

  async createGroup(data: Partial<AddonGroup>) {
    if (config.adminUseMockApi) {
      const newGroup: AddonGroup = {
        id: `group-${Date.now()}`,
        name: data.name || 'New Group',
        slug: data.slug || (data.name || 'group').toLowerCase().replace(/\s+/g, '-'),
        description: data.description || null,
        selectionType: data.selectionType || 'SINGLE',
        minimumSelections: data.minimumSelections || 0,
        maximumSelections: data.maximumSelections || null,
        isRequired: data.isRequired || false,
        status: data.status || 'ACTIVE',
        sortOrder: data.sortOrder || mockAddonGroupsStore.length + 1,
        items: data.items || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockAddonGroupsStore.unshift(newGroup);
      return { success: true, message: 'Add-on group created', data: newGroup };
    }

    const response = await axios.post(`${API_BASE}/addon-groups`, data);
    return response.data;
  },

  async updateGroup(id: string, data: Partial<AddonGroup>) {
    if (config.adminUseMockApi) {
      const idx = mockAddonGroupsStore.findIndex((g) => g.id === id);
      if (idx === -1) throw new Error('Add-on group not found');

      mockAddonGroupsStore[idx] = {
        ...mockAddonGroupsStore[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      return { success: true, message: 'Group updated', data: mockAddonGroupsStore[idx] };
    }

    const response = await axios.patch(`${API_BASE}/addon-groups/${id}`, data);
    return response.data;
  },

  async deleteGroup(id: string) {
    if (config.adminUseMockApi) {
      const idx = mockAddonGroupsStore.findIndex((g) => g.id === id);
      if (idx === -1) throw new Error('Group not found');

      mockAddonGroupsStore[idx].deletedAt = new Date().toISOString();
      mockAddonGroupsStore[idx].status = 'INACTIVE';
      return { success: true, message: 'Group deleted', data: mockAddonGroupsStore[idx] };
    }

    const response = await axios.delete(`${API_BASE}/addon-groups/${id}`);
    return response.data;
  },

  async restoreGroup(id: string) {
    if (config.adminUseMockApi) {
      const idx = mockAddonGroupsStore.findIndex((g) => g.id === id);
      if (idx === -1) throw new Error('Group not found');

      mockAddonGroupsStore[idx].deletedAt = null;
      mockAddonGroupsStore[idx].status = 'INACTIVE';
      return { success: true, message: 'Group restored', data: mockAddonGroupsStore[idx] };
    }

    const response = await axios.post(`${API_BASE}/addon-groups/${id}/restore`);
    return response.data;
  },
};
