import { TaxRateRepository } from './taxRate.repository';
import { 
  TaxRateFilterQuery, 
  CreateTaxRateDto, 
  UpdateTaxRateDto, 
  TaxRateOptionsQuery,
  TaxRateStatus
} from './taxRate.types';

export class TaxRateService {
  private repository: TaxRateRepository;

  constructor() {
    this.repository = new TaxRateRepository();
  }

  async getTaxRates(filters: TaxRateFilterQuery) {
    return this.repository.findTaxRates(filters);
  }

  async getTaxRateById(id: string) {
    const item = await this.repository.findTaxRateById(id);
    if (!item) {
      throw new Error(`TAX_RATE_NOT_FOUND: Tax rate with ID ${id} not found`);
    }
    return item;
  }

  async createTaxRate(dto: CreateTaxRateDto, adminId?: string) {
    if (!dto.name || !dto.name.trim()) {
      throw new Error('Tax rate name is required');
    }

    if (!dto.code || !dto.code.trim()) {
      throw new Error('Tax rate code is required');
    }

    const code = dto.code.trim().toUpperCase();
    const existingCode = await this.repository.findTaxRateByCode(code);
    if (existingCode) {
      throw new Error('TAX_RATE_CODE_EXISTS: A tax rate with this code already exists');
    }

    const totalRate = Number(dto.totalRate);
    if (isNaN(totalRate) || totalRate < 0 || totalRate > 100) {
      throw new Error('Total tax rate must be a valid number between 0 and 100');
    }

    const cgstRate = Number(dto.cgstRate ?? 0);
    const sgstRate = Number(dto.sgstRate ?? 0);
    const igstRate = Number(dto.igstRate ?? 0);
    const cessRate = Number(dto.cessRate ?? 0);

    if ([cgstRate, sgstRate, igstRate, cessRate].some((r) => isNaN(r) || r < 0 || r > 100)) {
      throw new Error('TAX_RATE_INVALID_COMPONENTS: Tax component rates must be numbers between 0 and 100');
    }

    // Effective dates validation
    if (dto.effectiveFrom && dto.effectiveUntil) {
      const from = new Date(dto.effectiveFrom).getTime();
      const until = new Date(dto.effectiveUntil).getTime();
      if (until <= from) {
        throw new Error('TAX_RATE_INVALID_EFFECTIVE_PERIOD: Effective until date must be after effective from date');
      }
    }

    if (dto.isDefault && dto.status === 'INACTIVE') {
      throw new Error('TAX_RATE_DEFAULT_CONFLICT: An inactive tax rate cannot be marked as default');
    }

    return this.repository.createTaxRate({ ...dto, code, totalRate, cgstRate, sgstRate, igstRate, cessRate }, adminId);
  }

  async updateTaxRate(id: string, dto: UpdateTaxRateDto, adminId?: string) {
    const existing = await this.repository.findTaxRateById(id);
    if (!existing) {
      throw new Error(`TAX_RATE_NOT_FOUND: Tax rate with ID ${id} not found`);
    }

    let code = dto.code ? dto.code.trim().toUpperCase() : undefined;
    if (code) {
      const existingCode = await this.repository.findTaxRateByCode(code, id);
      if (existingCode) {
        throw new Error('TAX_RATE_CODE_EXISTS: A tax rate with this code already exists');
      }
    }

    if (dto.totalRate !== undefined) {
      const totalRate = Number(dto.totalRate);
      if (isNaN(totalRate) || totalRate < 0 || totalRate > 100) {
        throw new Error('Total tax rate must be a valid number between 0 and 100');
      }
    }

    const effectiveFrom = dto.effectiveFrom !== undefined ? (dto.effectiveFrom ? new Date(dto.effectiveFrom) : null) : existing.effectiveFrom;
    const effectiveUntil = dto.effectiveUntil !== undefined ? (dto.effectiveUntil ? new Date(dto.effectiveUntil) : null) : existing.effectiveUntil;

    if (effectiveFrom && effectiveUntil) {
      if (new Date(effectiveUntil).getTime() <= new Date(effectiveFrom).getTime()) {
        throw new Error('TAX_RATE_INVALID_EFFECTIVE_PERIOD: Effective until date must be after effective from date');
      }
    }

    if (dto.isDefault && (dto.status === 'INACTIVE' || (!dto.status && existing.status === 'INACTIVE'))) {
      throw new Error('TAX_RATE_DEFAULT_CONFLICT: An inactive tax rate cannot be marked as default');
    }

    return this.repository.updateTaxRate(id, { ...dto, ...(code && { code }) }, adminId);
  }

  async setDefaultTaxRate(id: string, adminId?: string) {
    return this.repository.setDefaultTaxRate(id, adminId);
  }

  async updateTaxRateStatus(id: string, status: TaxRateStatus, adminId?: string) {
    return this.repository.updateTaxRateStatus(id, status, adminId);
  }

  async deleteTaxRate(id: string, adminId?: string) {
    return this.repository.deleteTaxRate(id, adminId);
  }

  async restoreTaxRate(id: string, adminId?: string) {
    return this.repository.restoreTaxRate(id, adminId);
  }

  async getOptions(query: TaxRateOptionsQuery) {
    return this.repository.getOptions(query);
  }
}
