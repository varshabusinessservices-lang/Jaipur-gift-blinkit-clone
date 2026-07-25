import { BrandRepository } from './brand.repository';
import { 
  BrandFilterQuery, 
  CreateBrandDto, 
  UpdateBrandDto, 
  BrandReorderItem,
  BrandOptionsQuery,
  BrandStatus
} from './brand.types';

export function slugifyBrandName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function isValidUrl(url: string): boolean {
  if (!url) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export class BrandService {
  private repository: BrandRepository;

  constructor() {
    this.repository = new BrandRepository();
  }

  async getBrands(filters: BrandFilterQuery) {
    return this.repository.findBrands(filters);
  }

  async getBrandById(id: string) {
    const brand = await this.repository.findBrandById(id);
    if (!brand) {
      throw new Error(`BRAND_NOT_FOUND: Brand with ID ${id} not found`);
    }
    return brand;
  }

  async createBrand(dto: CreateBrandDto, adminId?: string) {
    if (!dto.name || dto.name.trim().length < 2 || dto.name.trim().length > 120) {
      throw new Error('Brand name must be between 2 and 120 characters');
    }

    const slug = dto.slug ? dto.slug.trim().toLowerCase() : slugifyBrandName(dto.name);
    if (slug.length < 2 || slug.length > 160 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      throw new Error('Slug must be between 2 and 160 characters and contain lowercase alphanumeric characters and hyphens only');
    }

    // Check duplicate slug
    const existingSlug = await this.repository.findBrandBySlug(slug);
    if (existingSlug) {
      throw new Error('BRAND_SLUG_EXISTS: A brand with this slug already exists');
    }

    // Code validation
    let code: string | null = null;
    if (dto.code && dto.code.trim()) {
      code = dto.code.trim().toUpperCase();
      if (code.length < 2 || code.length > 50) {
        throw new Error('Brand code must be between 2 and 50 characters');
      }
      const existingCode = await this.repository.findBrandByCode(code);
      if (existingCode) {
        throw new Error('BRAND_CODE_EXISTS: A brand with this code already exists');
      }
    }

    // URL validation
    if (dto.websiteUrl && !isValidUrl(dto.websiteUrl)) {
      throw new Error('Invalid website URL format. Must begin with http:// or https://');
    }

    return this.repository.createBrand({ ...dto, slug, code }, adminId);
  }

  async updateBrand(id: string, dto: UpdateBrandDto, adminId?: string) {
    const existing = await this.repository.findBrandById(id);
    if (!existing) {
      throw new Error(`BRAND_NOT_FOUND: Brand with ID ${id} not found`);
    }

    let slug = dto.slug ? dto.slug.trim().toLowerCase() : undefined;
    if (slug) {
      if (slug.length < 2 || slug.length > 160 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
        throw new Error('Slug must be between 2 and 160 characters and contain lowercase alphanumeric characters and hyphens only');
      }
      const existingSlug = await this.repository.findBrandBySlug(slug, id);
      if (existingSlug) {
        throw new Error('BRAND_SLUG_EXISTS: A brand with this slug already exists');
      }
    }

    let code: string | null | undefined = undefined;
    if (dto.code !== undefined) {
      if (dto.code && dto.code.trim()) {
        code = dto.code.trim().toUpperCase();
        if (code.length < 2 || code.length > 50) {
          throw new Error('Brand code must be between 2 and 50 characters');
        }
        const existingCode = await this.repository.findBrandByCode(code, id);
        if (existingCode) {
          throw new Error('BRAND_CODE_EXISTS: A brand with this code already exists');
        }
      } else {
        code = null;
      }
    }

    if (dto.websiteUrl !== undefined && dto.websiteUrl !== null && dto.websiteUrl !== '') {
      if (!isValidUrl(dto.websiteUrl)) {
        throw new Error('Invalid website URL format. Must begin with http:// or https://');
      }
    }

    return this.repository.updateBrand(id, { ...dto, ...(slug && { slug }), ...(code !== undefined && { code }) }, adminId);
  }

  async updateBrandStatus(id: string, status: BrandStatus, adminId?: string) {
    return this.repository.updateBrandStatus(id, status, adminId);
  }

  async updateBrandFeatured(id: string, isFeatured: boolean, adminId?: string) {
    return this.repository.updateBrandFeatured(id, isFeatured, adminId);
  }

  async reorderBrands(items: BrandReorderItem[], adminId?: string) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('Reorder items array is required');
    }
    return this.repository.reorderBrands(items, adminId);
  }

  async deleteBrand(id: string, adminId?: string) {
    return this.repository.deleteBrand(id, adminId);
  }

  async restoreBrand(id: string, adminId?: string) {
    const existing = await this.repository.findBrandById(id);
    if (!existing) {
      throw new Error(`BRAND_NOT_FOUND: Brand with ID ${id} not found`);
    }

    // Check slug conflict upon restore
    const slugConflict = await this.repository.findBrandBySlug(existing.slug, id);
    if (slugConflict) {
      // Resolve slug conflict by appending restored timestamp
      const newSlug = `${existing.slug}-restored-${Date.now()}`;
      await this.repository.updateBrand(id, { slug: newSlug }, adminId);
    }

    return this.repository.restoreBrand(id, adminId);
  }

  async getOptions(query: BrandOptionsQuery) {
    return this.repository.getOptions(query);
  }
}
