import { describe, it, expect } from 'vitest';
import { generateVariationCombinations } from '../../utils/variationCombinator';
import { productAttributeService } from './productAttribute.service';

describe('Product Attributes Module & Variation Combinator', () => {
  it('should generate correct Cartesian product for 2 attributes', () => {
    const selections = [
      {
        attributeId: 'attr-size',
        attributeName: 'Size',
        values: [
          { id: 'val-a4', name: 'A4' },
          { id: 'val-a3', name: 'A3' },
        ],
      },
      {
        attributeId: 'attr-colour',
        attributeName: 'Colour',
        values: [
          { id: 'val-black', name: 'Black' },
          { id: 'val-white', name: 'White' },
          { id: 'val-gold', name: 'Golden' },
        ],
      },
    ];

    const result = generateVariationCombinations(selections, 100);

    expect(result.totalCombinations).toBe(6);
    expect(result.exceededLimit).toBe(false);
    expect(result.combinations.length).toBe(6);

    expect(result.combinations[0].label).toBe('Black / A4');
    expect(result.combinations[0].combinationKey).toBe('attr-colour:val-black|attr-size:val-a4');
    expect(result.combinations[5].label).toBe('Golden / A3');
    expect(result.combinations[5].combinationKey).toBe('attr-colour:val-gold|attr-size:val-a3');
  });

  it('should enforce max limit and flag exceededLimit when combinations exceed maximum', () => {
    const selections = [
      {
        attributeId: 'attr-1',
        attributeName: 'Attr 1',
        values: Array.from({ length: 10 }, (_, i) => ({ id: `v1-${i}`, name: `V1-${i}` })),
      },
      {
        attributeId: 'attr-2',
        attributeName: 'Attr 2',
        values: Array.from({ length: 15 }, (_, i) => ({ id: `v2-${i}`, name: `V2-${i}` })),
      },
    ];

    const result = generateVariationCombinations(selections, 100);

    expect(result.totalCombinations).toBe(150);
    expect(result.exceededLimit).toBe(true);
    expect(result.combinations.length).toBe(0);
    expect(result.warningMessage).toContain('exceeding the maximum limit of 100');
  });

  it('should fetch mock attributes list', async () => {
    const result = await productAttributeService.getAttributes({
      page: 1,
      limit: 10,
      search: '',
      status: '',
      type: '',
      categoryId: '',
      includeDeleted: false,
      sortBy: 'sortOrder',
      sortOrder: 'asc',
    });
    expect(result).toBeDefined();
    expect(result.attributes.length).toBeGreaterThan(0);
    expect(result.attributes[0]).toHaveProperty('name');
    expect(result.attributes[0]).toHaveProperty('type');
  });
});
