import { prisma } from '../../database/prisma';
import { 
  TaxRateFilterQuery, 
  CreateTaxRateDto, 
  UpdateTaxRateDto, 
  TaxRateOptionsQuery,
  TaxRateOption,
  TaxRateStatus
} from './taxRate.types';

// In-memory fallback tax rates
const memoryTaxRates: any[] = [
  {
    id: 'tax-001',
    storeId: null,
    name: 'GST 0% (Exempt / Nil)',
    code: 'TAX-GST-0',
    description: 'Zero rated tax slab for exempt handcrafted goods.',
    taxType: 'GST',
    totalRate: '0.0000',
    cgstRate: '0.0000',
    sgstRate: '0.0000',
    igstRate: '0.0000',
    cessRate: '0.0000',
    hsnCode: '9999',
    sacCode: null,
    priceIncludesTax: true,
    status: 'ACTIVE',
    isDefault: false,
    sortOrder: 1,
    effectiveFrom: new Date('2026-01-01'),
    effectiveUntil: null,
    createdByAdminId: 'super-admin-id',
    updatedByAdminId: 'super-admin-id',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    deletedAt: null,
  },
  {
    id: 'tax-002',
    storeId: null,
    name: 'GST 5%',
    code: 'TAX-GST-5',
    description: '5% GST slab (2.5% CGST + 2.5% SGST or 5% IGST).',
    taxType: 'GST',
    totalRate: '5.0000',
    cgstRate: '2.5000',
    sgstRate: '2.5000',
    igstRate: '5.0000',
    cessRate: '0.0000',
    hsnCode: '4901',
    sacCode: null,
    priceIncludesTax: true,
    status: 'ACTIVE',
    isDefault: false,
    sortOrder: 2,
    effectiveFrom: new Date('2026-01-01'),
    effectiveUntil: null,
    createdByAdminId: 'super-admin-id',
    updatedByAdminId: 'super-admin-id',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    deletedAt: null,
  },
  {
    id: 'tax-003',
    storeId: null,
    name: 'GST 12%',
    code: 'TAX-GST-12',
    description: '12% GST slab (6% CGST + 6% SGST or 12% IGST).',
    taxType: 'GST',
    totalRate: '12.0000',
    cgstRate: '6.0000',
    sgstRate: '6.0000',
    igstRate: '12.0000',
    cessRate: '0.0000',
    hsnCode: '4414',
    sacCode: null,
    priceIncludesTax: true,
    status: 'ACTIVE',
    isDefault: false,
    sortOrder: 3,
    effectiveFrom: new Date('2026-01-01'),
    effectiveUntil: null,
    createdByAdminId: 'super-admin-id',
    updatedByAdminId: 'super-admin-id',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    deletedAt: null,
  },
  {
    id: 'tax-004',
    storeId: null,
    name: 'GST 18% (Standard Default)',
    code: 'TAX-GST-18',
    description: 'Standard 18% GST rate for personalised gifts, photo frames and acrylics.',
    taxType: 'GST',
    totalRate: '18.0000',
    cgstRate: '9.0000',
    sgstRate: '9.0000',
    igstRate: '18.0000',
    cessRate: '0.0000',
    hsnCode: '3926',
    sacCode: null,
    priceIncludesTax: true,
    status: 'ACTIVE',
    isDefault: true,
    sortOrder: 4,
    effectiveFrom: new Date('2026-01-01'),
    effectiveUntil: null,
    createdByAdminId: 'super-admin-id',
    updatedByAdminId: 'super-admin-id',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    deletedAt: null,
  },
  {
    id: 'tax-005',
    storeId: null,
    name: 'GST 28%',
    code: 'TAX-GST-28',
    description: '28% GST luxury slab for premium high-end electronic gift accessories.',
    taxType: 'GST',
    totalRate: '28.0000',
    cgstRate: '14.0000',
    sgstRate: '14.0000',
    igstRate: '28.0000',
    cessRate: '0.0000',
    hsnCode: '8543',
    sacCode: null,
    priceIncludesTax: true,
    status: 'ACTIVE',
    isDefault: false,
    sortOrder: 5,
    effectiveFrom: new Date('2026-01-01'),
    effectiveUntil: null,
    createdByAdminId: 'super-admin-id',
    updatedByAdminId: 'super-admin-id',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    deletedAt: null,
  }
];

function formatTaxRecord(record: any) {
  if (!record) return null;
  return {
    ...record,
    totalRate: record.totalRate ? String(record.totalRate) : '0.0000',
    cgstRate: record.cgstRate ? String(record.cgstRate) : '0.0000',
    sgstRate: record.sgstRate ? String(record.sgstRate) : '0.0000',
    igstRate: record.igstRate ? String(record.igstRate) : '0.0000',
    cessRate: record.cessRate ? String(record.cessRate) : '0.0000',
  };
}

export class TaxRateRepository {
  async findTaxRates(filters: TaxRateFilterQuery) {
    const page = filters.page || 1;
    const limit = Math.min(100, Math.max(1, filters.limit || 20));
    const skip = (page - 1) * limit;

    try {
      const where: any = {};

      if (filters.includeDeleted !== 'true' && filters.includeDeleted !== true) {
        where.deletedAt = null;
      }

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.taxType) {
        where.taxType = filters.taxType;
      }

      if (filters.defaultOnly === 'true' || filters.defaultOnly === true) {
        where.isDefault = true;
      }

      if (filters.search) {
        const q = filters.search.trim();
        where.OR = [
          { name: { contains: q } },
          { code: { contains: q } },
          { hsnCode: { contains: q } },
          { sacCode: { contains: q } },
        ];
      }

      const sortBy = filters.sortBy || 'sortOrder';
      const sortOrder = filters.sortOrder || 'asc';

      const [total, items] = await Promise.all([
        prisma.taxRate.count({ where }),
        prisma.taxRate.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
        }),
      ]);

      return {
        taxRates: items.map(formatTaxRecord),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      };
    } catch (err) {
      let filtered = memoryTaxRates.filter((t) => {
        if (filters.includeDeleted !== 'true' && filters.includeDeleted !== true && t.deletedAt !== null) {
          return false;
        }
        if (filters.status && t.status !== filters.status) return false;
        if (filters.taxType && t.taxType !== filters.taxType) return false;
        if ((filters.defaultOnly === 'true' || filters.defaultOnly === true) && !t.isDefault) return false;
        if (filters.search) {
          const q = filters.search.toLowerCase();
          const matches =
            t.name.toLowerCase().includes(q) ||
            t.code.toLowerCase().includes(q) ||
            (t.hsnCode && t.hsnCode.toLowerCase().includes(q)) ||
            (t.sacCode && t.sacCode.toLowerCase().includes(q));
          if (!matches) return false;
        }
        return true;
      });

      const total = filtered.length;
      const paginated = filtered.slice(skip, skip + limit).map(formatTaxRecord);

      return {
        taxRates: paginated,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      };
    }
  }

  async findTaxRateById(id: string) {
    try {
      const item = await prisma.taxRate.findUnique({ where: { id } });
      return formatTaxRecord(item);
    } catch (err) {
      const item = memoryTaxRates.find((t) => t.id === id);
      return formatTaxRecord(item);
    }
  }

  async findTaxRateByCode(code: string, excludeId?: string) {
    if (!code) return null;
    try {
      const item = await prisma.taxRate.findFirst({
        where: {
          code,
          deletedAt: null,
          ...(excludeId ? { NOT: { id: excludeId } } : {}),
        },
      });
      return formatTaxRecord(item);
    } catch (err) {
      const item = memoryTaxRates.find(
        (t) => t.code === code && t.deletedAt === null && (!excludeId || t.id !== excludeId)
      );
      return formatTaxRecord(item);
    }
  }

  async createTaxRate(dto: CreateTaxRateDto, adminId?: string) {
    const isDefault = dto.isDefault ?? false;

    try {
      if (isDefault) {
        // Unset previous default in database
        await prisma.taxRate.updateMany({
          where: { isDefault: true, storeId: dto.storeId || null },
          data: { isDefault: false },
        });
      }

      const created = await prisma.taxRate.create({
        data: {
          storeId: dto.storeId || null,
          name: dto.name,
          code: dto.code.toUpperCase(),
          description: dto.description || null,
          taxType: dto.taxType || 'GST',
          totalRate: dto.totalRate,
          cgstRate: dto.cgstRate ?? 0,
          sgstRate: dto.sgstRate ?? 0,
          igstRate: dto.igstRate ?? 0,
          cessRate: dto.cessRate ?? 0,
          hsnCode: dto.hsnCode || null,
          sacCode: dto.sacCode || null,
          priceIncludesTax: dto.priceIncludesTax ?? true,
          status: dto.status || 'ACTIVE',
          isDefault,
          sortOrder: dto.sortOrder ?? 0,
          effectiveFrom: dto.effectiveFrom ? new Date(dto.effectiveFrom) : null,
          effectiveUntil: dto.effectiveUntil ? new Date(dto.effectiveUntil) : null,
          createdByAdminId: adminId || null,
          updatedByAdminId: adminId || null,
        },
      });

      await prisma.auditLog.create({
        data: {
          actorType: 'ADMIN',
          actorAdminId: adminId || null,
          action: 'TAX_RATE_CREATED',
          entityType: 'TAX_RATE',
          entityId: created.id,
          newValuesJson: JSON.stringify(created),
        },
      }).catch(() => {});

      return formatTaxRecord(created);
    } catch (err) {
      if (isDefault) {
        memoryTaxRates.forEach((t) => {
          if (t.storeId === (dto.storeId || null)) t.isDefault = false;
        });
      }

      const newTax = {
        id: `tax-${Date.now()}`,
        storeId: dto.storeId || null,
        name: dto.name,
        code: dto.code.toUpperCase(),
        description: dto.description || null,
        taxType: dto.taxType || 'GST',
        totalRate: String(dto.totalRate),
        cgstRate: String(dto.cgstRate ?? 0),
        sgstRate: String(dto.sgstRate ?? 0),
        igstRate: String(dto.igstRate ?? 0),
        cessRate: String(dto.cessRate ?? 0),
        hsnCode: dto.hsnCode || null,
        sacCode: dto.sacCode || null,
        priceIncludesTax: dto.priceIncludesTax ?? true,
        status: dto.status || 'ACTIVE',
        isDefault,
        sortOrder: dto.sortOrder ?? 0,
        effectiveFrom: dto.effectiveFrom ? new Date(dto.effectiveFrom) : null,
        effectiveUntil: dto.effectiveUntil ? new Date(dto.effectiveUntil) : null,
        createdByAdminId: adminId || 'super-admin-id',
        updatedByAdminId: adminId || 'super-admin-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      memoryTaxRates.push(newTax);
      return formatTaxRecord(newTax);
    }
  }

  async updateTaxRate(id: string, dto: UpdateTaxRateDto, adminId?: string) {
    const existing = await this.findTaxRateById(id);
    if (!existing) {
      throw new Error(`TAX_RATE_NOT_FOUND: Tax rate with ID ${id} not found`);
    }

    try {
      if (dto.isDefault) {
        await prisma.taxRate.updateMany({
          where: { isDefault: true, storeId: existing.storeId },
          data: { isDefault: false },
        });
      }

      const updated = await prisma.taxRate.update({
        where: { id },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.code !== undefined && { code: dto.code.toUpperCase() }),
          ...(dto.description !== undefined && { description: dto.description }),
          ...(dto.taxType !== undefined && { taxType: dto.taxType }),
          ...(dto.totalRate !== undefined && { totalRate: dto.totalRate }),
          ...(dto.cgstRate !== undefined && { cgstRate: dto.cgstRate }),
          ...(dto.sgstRate !== undefined && { sgstRate: dto.sgstRate }),
          ...(dto.igstRate !== undefined && { igstRate: dto.igstRate }),
          ...(dto.cessRate !== undefined && { cessRate: dto.cessRate }),
          ...(dto.hsnCode !== undefined && { hsnCode: dto.hsnCode }),
          ...(dto.sacCode !== undefined && { sacCode: dto.sacCode }),
          ...(dto.priceIncludesTax !== undefined && { priceIncludesTax: dto.priceIncludesTax }),
          ...(dto.status !== undefined && { status: dto.status }),
          ...(dto.isDefault !== undefined && { isDefault: dto.isDefault }),
          ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
          ...(dto.effectiveFrom !== undefined && {
            effectiveFrom: dto.effectiveFrom ? new Date(dto.effectiveFrom) : null,
          }),
          ...(dto.effectiveUntil !== undefined && {
            effectiveUntil: dto.effectiveUntil ? new Date(dto.effectiveUntil) : null,
          }),
          updatedByAdminId: adminId || null,
        },
      });

      await prisma.auditLog.create({
        data: {
          actorType: 'ADMIN',
          actorAdminId: adminId || null,
          action: 'TAX_RATE_UPDATED',
          entityType: 'TAX_RATE',
          entityId: id,
          oldValuesJson: JSON.stringify(existing),
          newValuesJson: JSON.stringify(updated),
        },
      }).catch(() => {});

      return formatTaxRecord(updated);
    } catch (err) {
      if (dto.isDefault) {
        memoryTaxRates.forEach((t) => {
          if (t.storeId === existing.storeId) t.isDefault = false;
        });
      }

      const idx = memoryTaxRates.findIndex((t) => t.id === id);
      if (idx !== -1) {
        memoryTaxRates[idx] = {
          ...memoryTaxRates[idx],
          ...dto,
          code: dto.code ? dto.code.toUpperCase() : memoryTaxRates[idx].code,
          effectiveFrom: dto.effectiveFrom !== undefined ? (dto.effectiveFrom ? new Date(dto.effectiveFrom) : null) : memoryTaxRates[idx].effectiveFrom,
          effectiveUntil: dto.effectiveUntil !== undefined ? (dto.effectiveUntil ? new Date(dto.effectiveUntil) : null) : memoryTaxRates[idx].effectiveUntil,
          updatedByAdminId: adminId || memoryTaxRates[idx].updatedByAdminId,
          updatedAt: new Date(),
        };
        return formatTaxRecord(memoryTaxRates[idx]);
      }
      throw new Error(`Failed to update tax rate ${id}`);
    }
  }

  async setDefaultTaxRate(id: string, adminId?: string) {
    const existing = await this.findTaxRateById(id);
    if (!existing) {
      throw new Error(`TAX_RATE_NOT_FOUND: Tax rate with ID ${id} not found`);
    }
    if (existing.status !== 'ACTIVE') {
      throw new Error('TAX_RATE_DEFAULT_CONFLICT: An inactive tax rate cannot be set as default');
    }
    return this.updateTaxRate(id, { isDefault: true }, adminId);
  }

  async updateTaxRateStatus(id: string, status: TaxRateStatus, adminId?: string) {
    const existing = await this.findTaxRateById(id);
    if (!existing) {
      throw new Error(`TAX_RATE_NOT_FOUND: Tax rate with ID ${id} not found`);
    }
    if (status !== 'ACTIVE' && existing.isDefault) {
      throw new Error('TAX_RATE_DEFAULT_CONFLICT: Cannot deactivate the default tax rate. Set another tax rate as default first.');
    }
    return this.updateTaxRate(id, { status }, adminId);
  }

  async deleteTaxRate(id: string, adminId?: string) {
    const existing = await this.findTaxRateById(id);
    if (!existing) {
      throw new Error(`TAX_RATE_NOT_FOUND: Tax rate with ID ${id} not found`);
    }
    if (existing.isDefault) {
      throw new Error('TAX_RATE_DELETE_BLOCKED: Cannot delete default tax rate. Set another tax rate as default first.');
    }

    try {
      const updated = await prisma.taxRate.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          status: 'INACTIVE',
          isDefault: false,
          updatedByAdminId: adminId || null,
        },
      });

      await prisma.auditLog.create({
        data: {
          actorType: 'ADMIN',
          actorAdminId: adminId || null,
          action: 'TAX_RATE_SOFT_DELETED',
          entityType: 'TAX_RATE',
          entityId: id,
          oldValuesJson: JSON.stringify(existing),
        },
      }).catch(() => {});

      return { success: true, message: 'Tax rate soft deleted successfully' };
    } catch (err) {
      const item = memoryTaxRates.find((t) => t.id === id);
      if (item) {
        item.deletedAt = new Date();
        item.status = 'INACTIVE';
        item.isDefault = false;
      }
      return { success: true, message: 'Tax rate soft deleted successfully' };
    }
  }

  async restoreTaxRate(id: string, adminId?: string) {
    const existing = await this.findTaxRateById(id);
    if (!existing) {
      throw new Error(`TAX_RATE_NOT_FOUND: Tax rate with ID ${id} not found`);
    }

    try {
      const updated = await prisma.taxRate.update({
        where: { id },
        data: {
          deletedAt: null,
          status: 'INACTIVE',
          updatedByAdminId: adminId || null,
        },
      });

      await prisma.auditLog.create({
        data: {
          actorType: 'ADMIN',
          actorAdminId: adminId || null,
          action: 'TAX_RATE_RESTORED',
          entityType: 'TAX_RATE',
          entityId: id,
          newValuesJson: JSON.stringify(updated),
        },
      }).catch(() => {});

      return formatTaxRecord(updated);
    } catch (err) {
      const item = memoryTaxRates.find((t) => t.id === id);
      if (item) {
        item.deletedAt = null;
        item.status = 'INACTIVE';
      }
      return formatTaxRecord(item);
    }
  }

  async getOptions(query: TaxRateOptionsQuery): Promise<TaxRateOption[]> {
    try {
      const where: any = { deletedAt: null };
      if (query.activeOnly === 'true' || query.activeOnly === true || query.activeOnly === undefined) {
        where.status = 'ACTIVE';
      }
      if (query.storeId) {
        where.storeId = query.storeId;
      }
      if (query.search) {
        where.name = { contains: query.search.trim() };
      }

      const items = await prisma.taxRate.findMany({
        where,
        orderBy: { sortOrder: 'asc' },
      });

      return items.map((t) => ({
        id: t.id,
        name: t.name,
        code: t.code,
        totalRate: String(t.totalRate),
        priceIncludesTax: t.priceIncludesTax,
        status: t.status as TaxRateStatus,
        selectable: t.status === 'ACTIVE',
      }));
    } catch (err) {
      let filtered = memoryTaxRates.filter((t) => t.deletedAt === null);
      if (query.activeOnly === 'true' || query.activeOnly === true || query.activeOnly === undefined) {
        filtered = filtered.filter((t) => t.status === 'ACTIVE');
      }
      if (query.search) {
        const q = query.search.toLowerCase();
        filtered = filtered.filter((t) => t.name.toLowerCase().includes(q));
      }
      return filtered.map((t) => ({
        id: t.id,
        name: t.name,
        code: t.code,
        totalRate: String(t.totalRate),
        priceIncludesTax: t.priceIncludesTax,
        status: t.status,
        selectable: t.status === 'ACTIVE',
      }));
    }
  }
}
