import { productRepository } from './products.repository';
import { ProductVariationRepository } from './productVariation.repository';
import {
  ProductFilterQuery,
  ProductOptionsQuery,
  CreateProductDTO,
  UpdateProductDTO,
  UpdateInventoryDTO,
  UpdateDeliverySettingsDTO,
  ProductStatus,
  ProductVisibility,
} from './products.types';
import { generateVariationCombinations, AttributeSelectionInput } from '../../utils/variationCombinator';
import { calculateTax } from '../../utils/taxCalculator';

export class ProductService {
  /**
   * Helper to convert title to slug
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async listProducts(query: ProductFilterQuery) {
    return productRepository.findMany(query);
  }

  async getProductById(id: string, includeDeleted = false) {
    const product = await productRepository.findById(id, includeDeleted);
    if (!product) {
      const error: any = new Error(`Product with ID '${id}' not found`);
      error.statusCode = 404;
      error.code = 'PRODUCT_NOT_FOUND';
      throw error;
    }
    return product;
  }

  async getProductOptions(query: ProductOptionsQuery) {
    return productRepository.getOptions(query);
  }

  async createProduct(data: CreateProductDTO, adminUserId?: string) {
    // 1. Slug handling & uniqueness
    let slug = data.slug ? this.slugify(data.slug) : this.slugify(data.title);
    if (!slug) {
      slug = `product-${Date.now()}`;
    }

    const existingSlug = await productRepository.findBySlug(slug);
    if (existingSlug) {
      const error: any = new Error(`Product with slug '${slug}' already exists`);
      error.statusCode = 409;
      error.code = 'PRODUCT_SLUG_EXISTS';
      throw error;
    }

    // 2. SKU Uniqueness check
    if (data.sku) {
      const existingSku = await productRepository.findBySku(data.sku);
      if (existingSku) {
        const error: any = new Error(`Product with SKU '${data.sku}' already exists`);
        error.statusCode = 409;
        error.code = 'PRODUCT_SKU_EXISTS';
        throw error;
      }
    }

    // 3. Price Validation
    if (data.mrp !== undefined && data.mrp !== null && data.sellingPrice !== undefined && data.sellingPrice !== null) {
      if (data.sellingPrice > data.mrp) {
        const error: any = new Error(`Selling price (${data.sellingPrice}) cannot be greater than MRP (${data.mrp})`);
        error.statusCode = 400;
        error.code = 'PRODUCT_PRICE_INVALID';
        throw error;
      }
    }

    if (data.costPrice !== undefined && data.costPrice !== null && data.sellingPrice !== undefined && data.sellingPrice !== null) {
      if (data.costPrice < 0) {
        const error: any = new Error('Cost price cannot be negative');
        error.statusCode = 400;
        error.code = 'PRODUCT_PRICE_INVALID';
        throw error;
      }
    }

    // 4. Primary Category Check
    if (!data.primaryCategoryId) {
      const error: any = new Error('Primary category ID is required');
      error.statusCode = 400;
      error.code = 'PRODUCT_PRIMARY_CATEGORY_REQUIRED';
      throw error;
    }

    // 5. Main Image requirement for publishing
    if (data.status === 'ACTIVE') {
      const hasMainImage = data.mainImageFileId || (data.media && data.media.length > 0);
      if (!hasMainImage) {
        const error: any = new Error('At least one main product image is required to publish product');
        error.statusCode = 400;
        error.code = 'PRODUCT_MAIN_IMAGE_REQUIRED';
        throw error;
      }
    }

    return productRepository.create({ ...data, slug }, adminUserId);
  }

  async updateProduct(id: string, data: UpdateProductDTO, adminUserId?: string) {
    const existing = await this.getProductById(id);

    // 1. Slug uniqueness check
    if (data.slug) {
      const formattedSlug = this.slugify(data.slug);
      const existingSlug = await productRepository.findBySlug(formattedSlug, id);
      if (existingSlug) {
        const error: any = new Error(`Product with slug '${formattedSlug}' already exists`);
        error.statusCode = 409;
        error.code = 'PRODUCT_SLUG_EXISTS';
        throw error;
      }
      data.slug = formattedSlug;
    }

    // 2. SKU uniqueness check
    if (data.sku) {
      const existingSku = await productRepository.findBySku(data.sku, id);
      if (existingSku) {
        const error: any = new Error(`Product with SKU '${data.sku}' already exists`);
        error.statusCode = 409;
        error.code = 'PRODUCT_SKU_EXISTS';
        throw error;
      }
    }

    // 3. Price Validation
    const effectiveMrp = data.mrp !== undefined ? data.mrp : (existing.mrp ? parseFloat(existing.mrp) : null);
    const effectiveSelling = data.sellingPrice !== undefined ? data.sellingPrice : (existing.sellingPrice ? parseFloat(existing.sellingPrice) : null);

    if (effectiveMrp !== null && effectiveSelling !== null && effectiveSelling > effectiveMrp) {
      const error: any = new Error(`Selling price (${effectiveSelling}) cannot be greater than MRP (${effectiveMrp})`);
      error.statusCode = 400;
      error.code = 'PRODUCT_PRICE_INVALID';
      throw error;
    }

    // 4. Status change validation
    const targetStatus = data.status || existing.status;
    if (targetStatus === 'ACTIVE') {
      const hasImage = data.mainImageFileId || existing.mainImageFileId || (existing.media && existing.media.length > 0);
      if (!hasImage) {
        const error: any = new Error('At least one main product image is required to publish product');
        error.statusCode = 400;
        error.code = 'PRODUCT_MAIN_IMAGE_REQUIRED';
        throw error;
      }

      if ((existing.productType === 'VARIABLE' || data.productType === 'VARIABLE') && process.env.PRODUCT_ACTIVE_VARIATION_REQUIRED !== 'false') {
        const repo = new ProductVariationRepository();
        const activeCount = await repo.countActiveVariations(id);
        if (activeCount === 0) {
          const error: any = new Error('VARIABLE products require at least one active variation to be published');
          error.statusCode = 400;
          error.code = 'PRODUCT_ACTIVE_VARIATION_REQUIRED';
          throw error;
        }
      }
    }

    return productRepository.update(id, data, adminUserId);
  }

  async updateProductStatus(id: string, status: ProductStatus, adminUserId?: string) {
    const existing = await this.getProductById(id);

    if (status === 'ACTIVE') {
      const hasImage = existing.mainImageFileId || (existing.media && existing.media.length > 0);
      if (!hasImage) {
        const error: any = new Error('At least one main product image is required to publish product');
        error.statusCode = 400;
        error.code = 'PRODUCT_MAIN_IMAGE_REQUIRED';
        throw error;
      }

      if (existing.productType === 'VARIABLE' && process.env.PRODUCT_ACTIVE_VARIATION_REQUIRED !== 'false') {
        const repo = new ProductVariationRepository();
        const activeCount = await repo.countActiveVariations(id);
        if (activeCount === 0) {
          const error: any = new Error('VARIABLE products require at least one active variation to be published');
          error.statusCode = 400;
          error.code = 'PRODUCT_ACTIVE_VARIATION_REQUIRED';
          throw error;
        }
      }
    }

    return productRepository.updateStatus(id, status, adminUserId);
  }

  async updateProductVisibility(id: string, visibility: ProductVisibility, adminUserId?: string) {
    await this.getProductById(id);
    return productRepository.updateVisibility(id, visibility, adminUserId);
  }

  async updateProductFeatured(id: string, isFeatured: boolean, adminUserId?: string) {
    await this.getProductById(id);
    return productRepository.updateFeatured(id, isFeatured, adminUserId);
  }

  async updateInventory(id: string, data: UpdateInventoryDTO, adminUserId?: string) {
    await this.getProductById(id);
    return productRepository.updateInventory(id, data, adminUserId);
  }

  async updateDeliverySettings(id: string, data: UpdateDeliverySettingsDTO, adminUserId?: string) {
    await this.getProductById(id);
    return productRepository.updateDeliverySettings(id, data, adminUserId);
  }

  async softDeleteProduct(id: string, adminUserId?: string) {
    await this.getProductById(id);
    return productRepository.softDelete(id, adminUserId);
  }

  async restoreProduct(id: string, adminUserId?: string) {
    await this.getProductById(id, true);
    return productRepository.restore(id, adminUserId);
  }

  async duplicateProduct(id: string, adminUserId?: string) {
    await this.getProductById(id);
    return productRepository.duplicate(id, adminUserId);
  }

  /**
   * Preview Variation Combinations for Variable Products
   */
  async previewVariationCombinations(selections: AttributeSelectionInput[], maxLimit = 100) {
    return generateVariationCombinations(selections, maxLimit);
  }

  /**
   * Calculate Product Tax Breakdown
   */
  async calculateProductTax(input: {
    price: number;
    quantity: number;
    taxRateId?: string;
    totalRate?: number;
    priceIncludesTax: boolean;
    supplyType: 'INTRA_STATE' | 'INTER_STATE';
  }) {
    let totalRate = input.totalRate || 18; // Default GST 18%
    let cgstRate = totalRate / 2;
    let sgstRate = totalRate / 2;
    let igstRate = totalRate;

    return calculateTax({
      price: input.price,
      quantity: input.quantity,
      totalRate,
      cgstRate,
      sgstRate,
      igstRate,
      includesTax: input.priceIncludesTax,
      supplyType: input.supplyType,
    });
  }
}

export const productService = new ProductService();
