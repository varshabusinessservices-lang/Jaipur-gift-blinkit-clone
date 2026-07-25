import { describe, it, expect } from 'vitest';
import { productService } from '../src/modules/products/products.service';
import { CreateProductSchema, ProductFilterQuerySchema } from '../src/modules/products/products.types';
import { calculateTax } from '../src/utils/taxCalculator';

describe('Product Management Module Tests', () => {
  it('should list mock products with pagination', async () => {
    const query = ProductFilterQuerySchema.parse({
      page: 1,
      limit: 10,
    });
    const res = await productService.listProducts(query);

    expect(res.products).toBeDefined();
    expect(res.products.length).toBeGreaterThan(0);
    expect(res.pagination.total).toBeGreaterThan(0);
  });

  it('should get product by ID', async () => {
    const product = await productService.getProductById('prod-001');
    expect(product).toBeDefined();
    expect(product.id).toBe('prod-001');
    expect(product.productType).toBe('PERSONALISED');
    expect(product.title).toContain('Personalised A4 Baby Birth');
  });

  it('should create a new simple product', async () => {
    const dto = CreateProductSchema.parse({
      productType: 'SIMPLE',
      status: 'DRAFT',
      visibility: 'PUBLIC',
      condition: 'NEW',
      title: 'Artisan Wood Engraved Name Plaque',
      primaryCategoryId: 'cat-personalised-frames',
      mrp: 999,
      sellingPrice: 799,
      costPrice: 250,
      manageStock: true,
      stockQuantity: 25,
      sameDayEligible: true,
      isPersonalised: true,
      mainImageFileId: 'img-test-01',
    });

    const newProduct = await productService.createProduct(dto);

    expect(newProduct.id).toBeDefined();
    expect(newProduct.title).toBe('Artisan Wood Engraved Name Plaque');
    expect(newProduct.slug).toBe('artisan-wood-engraved-name-plaque');
    expect(newProduct.sellingPrice).toBe('799.00');
    expect(newProduct.isPersonalised).toBe(true);
    expect(newProduct.badges.some((b) => b.badge === 'PERSONALISED')).toBe(true);
  });

  it('should throw error when selling price is greater than MRP', async () => {
    const dto = CreateProductSchema.parse({
      productType: 'SIMPLE',
      status: 'DRAFT',
      visibility: 'PUBLIC',
      condition: 'NEW',
      title: 'Invalid Price Test Item',
      primaryCategoryId: 'cat-personalised-frames',
      mrp: 500,
      sellingPrice: 600, // Invalid: selling price > MRP
    });

    await expect(productService.createProduct(dto)).rejects.toThrow(
      'Selling price (600) cannot be greater than MRP (500)'
    );
  });

  it('should throw error when duplicate slug is specified', async () => {
    const dto = CreateProductSchema.parse({
      productType: 'SIMPLE',
      status: 'DRAFT',
      visibility: 'PUBLIC',
      condition: 'NEW',
      title: 'Duplicate Slug Test',
      slug: 'personalised-a4-baby-birth-details-frame', // Existing slug
      primaryCategoryId: 'cat-personalised-frames',
    });

    await expect(productService.createProduct(dto)).rejects.toThrow('already exists');
  });

  it('should duplicate a product as Draft with cleared SKU', async () => {
    const duplicated = await productService.duplicateProduct('prod-001');
    expect(duplicated).toBeDefined();
    expect(duplicated?.title).toContain('(Copy)');
    expect(duplicated?.status).toBe('DRAFT');
    expect(duplicated?.sku).toBeNull();
    expect(duplicated?.slug).toContain('copy');
  });

  it('should soft delete and restore a product', async () => {
    const dto = CreateProductSchema.parse({
      productType: 'SIMPLE',
      status: 'DRAFT',
      visibility: 'PUBLIC',
      condition: 'NEW',
      title: 'Product to be deleted',
      primaryCategoryId: 'cat-soft-toys',
    });

    const created = await productService.createProduct(dto);

    // Delete
    const deleted = await productService.softDeleteProduct(created.id);
    expect(deleted).toBe(true);

    // Verify deleted
    await expect(productService.getProductById(created.id)).rejects.toThrow('not found');

    // Restore
    const restored = await productService.restoreProduct(created.id);
    expect(restored).toBeDefined();
    expect(restored?.status).toBe('INACTIVE');
    expect(restored?.deletedAt).toBeNull();
  });

  it('should calculate GST tax breakdown accurately using pure tax calculator', () => {
    const taxInclusive = calculateTax({
      price: 1180,
      quantity: 1,
      totalRate: 18,
      cgstRate: 9,
      sgstRate: 9,
      igstRate: 18,
      includesTax: true,
      supplyType: 'INTRA_STATE',
    });

    expect(taxInclusive.baseAmount).toBe('1000.00');
    expect(taxInclusive.taxAmount).toBe('180.00');
    expect(taxInclusive.cgstAmount).toBe('90.00');
    expect(taxInclusive.sgstAmount).toBe('90.00');
    expect(taxInclusive.totalAmount).toBe('1180.00');

    const taxExclusive = calculateTax({
      price: 1000,
      quantity: 1,
      totalRate: 18,
      cgstRate: 9,
      sgstRate: 9,
      igstRate: 18,
      includesTax: false,
      supplyType: 'INTER_STATE',
    });

    expect(taxExclusive.baseAmount).toBe('1000.00');
    expect(taxExclusive.taxAmount).toBe('180.00');
    expect(taxExclusive.igstAmount).toBe('180.00');
    expect(taxExclusive.cgstAmount).toBe('0.00');
    expect(taxExclusive.totalAmount).toBe('1180.00');
  });
});
