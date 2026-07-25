import { describe, it, expect, beforeEach, vi } from 'vitest';
import { calculateAddonPricing } from '../addonPricing';
import { ProductAddonService } from '../productAddon.service';

describe('Product Add-ons Module', () => {
  describe('Pure Addon Pricing Calculator', () => {
    it('should calculate FIXED price correctly without tax', () => {
      const res = calculateAddonPricing({
        baseProductPrice: '500.00',
        addon: {
          pricingType: 'FIXED',
          fixedPrice: '50.00',
          priceIncludesTax: false,
        },
        quantity: 2,
      });

      expect(res.basePrice).toBe('50.00');
      expect(res.quantitySubtotal).toBe('100.00');
      expect(res.totalAddonAmount).toBe('100.00');
      expect(res.taxAmount).toBe('0.00');
    });

    it('should calculate PERCENTAGE price correctly', () => {
      const res = calculateAddonPricing({
        baseProductPrice: '1000.00',
        addon: {
          pricingType: 'PERCENTAGE',
          percentageRate: '10.00',
          priceIncludesTax: false,
        },
        quantity: 1,
      });

      expect(res.basePrice).toBe('100.00');
      expect(res.totalAddonAmount).toBe('100.00');
    });

    it('should calculate FREE pricing as 0.00', () => {
      const res = calculateAddonPricing({
        baseProductPrice: '500.00',
        addon: {
          pricingType: 'FREE',
          fixedPrice: '50.00',
        },
        quantity: 3,
      });

      expect(res.basePrice).toBe('0.00');
      expect(res.totalAddonAmount).toBe('0.00');
    });

    it('should enforce CUSTOM_AMOUNT bounds', () => {
      const res = calculateAddonPricing({
        baseProductPrice: '500.00',
        addon: {
          pricingType: 'CUSTOM_AMOUNT',
          minimumAmount: '100.00',
          maximumAmount: '500.00',
        },
        customAmountInput: '50.00', // Under minimum
        quantity: 1,
      });

      expect(res.basePrice).toBe('100.00');
    });

    it('should apply Tax when price excludes tax', () => {
      const res = calculateAddonPricing({
        baseProductPrice: '1000.00',
        addon: {
          pricingType: 'FIXED',
          fixedPrice: '100.00',
          priceIncludesTax: false,
          taxRate: {
            totalRate: '18.00',
          },
        },
        quantity: 1,
      });

      expect(res.basePrice).toBe('100.00');
      expect(res.taxAmount).toBe('18.00');
      expect(res.totalAddonAmount).toBe('118.00');
    });

    it('should extract Tax correctly when price includes tax', () => {
      const res = calculateAddonPricing({
        baseProductPrice: '1000.00',
        addon: {
          pricingType: 'FIXED',
          fixedPrice: '118.00',
          priceIncludesTax: true,
          taxRate: {
            totalRate: '18.00',
          },
        },
        quantity: 1,
      });

      expect(res.basePrice).toBe('118.00');
      expect(res.taxAmount).toBe('18.00');
      expect(res.totalAddonAmount).toBe('118.00');
    });
  });

  describe('ProductAddonService Logic', () => {
    let service: ProductAddonService;
    let mockRepo: any;

    beforeEach(() => {
      mockRepo = {
        findBySlug: vi.fn().mockResolvedValue(null),
        findByCode: vi.fn().mockResolvedValue(null),
        findById: vi.fn(),
        create: vi.fn().mockImplementation((d) => Promise.resolve({ id: 'addon-1', ...d })),
        update: vi.fn().mockImplementation((id, d) => Promise.resolve({ id, ...d })),
        softDelete: vi.fn().mockResolvedValue({ id: 'addon-1', deletedAt: new Date() }),
        restore: vi.fn().mockResolvedValue({ id: 'addon-1', deletedAt: null }),
        createAuditLog: vi.fn().mockResolvedValue({}),
      };
      service = new ProductAddonService(mockRepo);
    });

    it('should reject creation when slug already exists', async () => {
      mockRepo.findBySlug.mockResolvedValue({ id: 'existing-id', slug: 'gift-wrap' });

      await expect(
        service.createAddon({
          name: 'Gift Wrap',
          slug: 'gift-wrap',
          inputType: 'CHECKBOX',
          pricingType: 'FIXED',
          fixedPrice: 50,
        })
      ).rejects.toThrow('Add-on with slug "gift-wrap" already exists');
    });

    it('should reject creation when RADIO inputType has no options', async () => {
      await expect(
        service.createAddon({
          name: 'Ribbon Color',
          inputType: 'RADIO',
          pricingType: 'FIXED',
          fixedPrice: 10,
          options: [],
        })
      ).rejects.toThrow('RADIO add-ons require at least one option');
    });

    it('should successfully create valid add-on', async () => {
      const created = await service.createAddon({
        name: 'Greeting Note',
        inputType: 'TEXTAREA',
        pricingType: 'FREE',
      });

      expect(created.name).toBe('Greeting Note');
      expect(mockRepo.create).toHaveBeenCalled();
      expect(mockRepo.createAuditLog).toHaveBeenCalled();
    });
  });
});
