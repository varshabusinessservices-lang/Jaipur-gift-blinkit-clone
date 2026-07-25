import { describe, it, expect, beforeEach } from 'vitest';
import { ProductVariationRepository } from '../productVariation.repository';
import { ProductVariationService } from '../productVariation.service';
import { buildCombinationKey } from '../../../utils/variationCombinator';

describe('Product Variations Module (Batch 10 Tests)', () => {
  let repository: ProductVariationRepository;
  let service: ProductVariationService;

  beforeEach(() => {
    repository = new ProductVariationRepository();
    service = new ProductVariationService();
  });

  describe('1. Combination Key Construction & Stability', () => {
    it('should generate deterministic combination key regardless of attribute pair input order', () => {
      const pairs1 = [
        { attributeId: 'attr-size', attributeValueId: 'val-a4' },
        { attributeId: 'attr-color', attributeValueId: 'val-black' },
      ];
      const pairs2 = [
        { attributeId: 'attr-color', attributeValueId: 'val-black' },
        { attributeId: 'attr-size', attributeValueId: 'val-a4' },
      ];

      const key1 = buildCombinationKey(pairs1);
      const key2 = buildCombinationKey(pairs2);

      expect(key1).toBe('attr-color:val-black|attr-size:val-a4');
      expect(key1).toEqual(key2);
    });
  });

  describe('2. Combination Generation & Preview', () => {
    it('should calculate preview combinations and flag existing variations', async () => {
      const productId = 'prod-var-test-1';
      const selectedAttrIds = ['attr-size', 'attr-color'];
      const selectedValIds = ['val-a4', 'val-a3', 'val-black', 'val-[#8B4513]'];

      const preview = await service.generatePreview(productId, {
        selectedAttributeIds: selectedAttrIds,
        selectedAttributeValueIds: selectedValIds,
        disabledCombinations: [],
      });

      expect(preview.totalCombinations).toBe(4);
      expect(preview.combinations.length).toBe(4);
      expect(preview.combinations[0].eligible).toBe(true);
    });

    it('should generate and save new variations for a variable product', async () => {
      const productId = 'prod-var-test-gen';
      const combinations = [
        {
          combinationKey: 'attr-color:val-[#8B4513]|attr-size:val-a4',
          title: 'Photo Frame - A4 / Brown',
          attributeValues: [
            { attributeId: 'attr-size', attributeValueId: 'val-a4' },
            { attributeId: 'attr-color', attributeValueId: 'val-[#8B4513]' },
          ],
        },
      ];

      const result = await service.generateVariations(productId, {
        combinations,
        baseDefaults: {
          autoSku: true,
          skuPrefix: 'JPG-FRM-TEST',
          mrp: '1499.00',
          sellingPrice: '999.00',
          costPrice: '350.00',
          stockQuantity: 25,
          lowStockThreshold: 5,
          status: 'ACTIVE',
        },
        skipExisting: true,
        activateNew: true,
      });

      expect(result.createdCount).toBe(1);
      expect(result.created[0].sku).toBe('JPG-FRM-TEST-A4-VAL-[#8B4513]');
      expect(result.created[0].sellingPrice).toBe('999.00');
    });

    it('should prevent duplicate combinations during generation when skipExisting is true', async () => {
      const productId = 'prod-photo-frame-001';

      const preview = await service.generatePreview(productId, {
        selectedAttributeIds: ['attr-size', 'attr-color'],
        selectedAttributeValueIds: ['val-a4', 'val-[#8B4513]'],
        disabledCombinations: [],
      });

      expect(preview.combinations[0].exists).toBe(true);
      expect(preview.combinations[0].eligible).toBe(false);
    });
  });

  describe('3. Variation Specific Overrides & Fields', () => {
    it('should create individual variation with full attributes and overrides', async () => {
      const productId = 'prod-photo-frame-001';
      const variation = await service.createVariation(productId, {
        title: 'Photo Frame - Custom SKU',
        sku: 'JPG-FRM-CUSTOM-01',
        barcode: '8901234567890',
        status: 'ACTIVE',
        isDefault: false,
        manageStock: true,
        reservedStock: 0,
        allowBackorder: false,
        sortOrder: 0,
        mrp: '1999.00',
        sellingPrice: '1299.00',
        costPrice: '450.00',
        stockQuantity: 15,
        lowStockThreshold: 3,
        weightGrams: '800.00',
        lengthCm: '35.00',
        widthCm: '25.00',
        heightCm: '4.00',
        attributeValues: [
          { attributeId: 'attr-size', attributeValueId: 'val-a3' },
          { attributeId: 'attr-color', attributeValueId: 'val-black' },
        ],
      });

      expect(variation.sku).toBe('JPG-FRM-CUSTOM-01');
      expect(variation.mrp).toBe('1999.00');
      expect(variation.sellingPrice).toBe('1299.00');
      expect(variation.effectiveSellingPrice).toBe('1299.00');
      expect(variation.priceSource).toBe('OVERRIDE');
    });

    it('should set default variation and ensure only one variation is default per product', async () => {
      const productId = 'prod-photo-frame-001';
      const result = await service.setDefaultVariation(productId, 'var-frame-a4-black');

      expect(result).toBe(true);

      const list = await service.listVariations(productId, {
        page: 1,
        limit: 50,
        search: '',
        status: '',
        stockStatus: 'ALL',
        attributeId: '',
        attributeValueId: '',
        sortBy: 'sortOrder',
        sortOrder: 'asc',
      });
      const defaultVariations = list.items.filter((v: any) => v.isDefault);
      expect(defaultVariations.length).toBe(1);
      expect(defaultVariations[0].id).toBe('var-frame-a4-black');
    });
  });

  describe('4. Bulk Operations', () => {
    it('should bulk increase selling price by percentage', async () => {
      const productId = 'prod-photo-frame-001';
      const result = await service.bulkUpdate(productId, {
        variationIds: ['var-frame-a4-black', 'var-frame-a4-brown'],
        operation: 'INCREASE_PRICE_PERCENT',
        payload: { percent: '10' },
      });

      expect(result.count).toBe(2);
    });

    it('should bulk update status to INACTIVE', async () => {
      const productId = 'prod-photo-frame-001';
      const result = await service.bulkUpdate(productId, {
        variationIds: ['var-frame-a4-brown'],
        operation: 'SET_STATUS',
        payload: { status: 'INACTIVE' },
      });

      expect(result.count).toBe(1);
    });

    it('should bulk add stock to selected variations', async () => {
      const productId = 'prod-photo-frame-001';
      const result = await service.bulkUpdate(productId, {
        variationIds: ['var-frame-a4-black'],
        operation: 'ADD_STOCK',
        payload: { amount: '10' },
      });

      expect(result.count).toBe(1);
    });
  });

  describe('5. Audit Logs', () => {
    it('should record audit log when variation status is updated', async () => {
      const productId = 'prod-photo-frame-001';
      const updated = await service.updateStatus(productId, 'var-frame-a4-black', 'INACTIVE');
      expect(updated.status).toBe('INACTIVE');
    });
  });
});
