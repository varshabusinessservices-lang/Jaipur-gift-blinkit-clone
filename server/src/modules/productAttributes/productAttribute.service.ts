import {
  CreateAttributeDTO,
  UpdateAttributeDTO,
  CreateAttributeValueDTO,
  UpdateAttributeValueDTO,
  CreateAttributeGroupDTO,
  AttributeFilterQuery,
  ProductAttributeStatus,
  HEX_COLOUR_REGEX,
  AttributeErrorCode,
} from './productAttribute.types';
import { productAttributeRepository } from './productAttribute.repository';
import { generateVariationCombinations, AttributeSelectionInput } from '../../utils/variationCombinator';

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
    .substring(0, 140);
}

export class ProductAttributeService {
  async getAttributes(query: AttributeFilterQuery) {
    return productAttributeRepository.findMany(query);
  }

  async getOptions(query: { activeOnly?: boolean; variationOnly?: boolean; categoryId?: string; includeInherited?: boolean }) {
    const listQuery: AttributeFilterQuery = {
      page: 1,
      limit: 100,
      search: '',
      type: '',
      status: query.activeOnly ? 'ACTIVE' : '',
      variationOnly: query.variationOnly,
      categoryId: query.categoryId || '',
      includeDeleted: false,
      sortBy: 'sortOrder',
      sortOrder: 'asc',
    };

    const result = await productAttributeRepository.findMany(listQuery);

    return result.attributes.map((attr) => ({
      attributeId: attr.id,
      name: attr.name,
      type: attr.type,
      variationEligibility: attr.isVariationAttribute,
      filterableStatus: attr.isFilterable,
      requiredStatus: attr.isRequiredByDefault,
      values: attr.values
        .filter((v) => !query.activeOnly || v.status === 'ACTIVE')
        .map((v) => ({
          valueId: v.id,
          name: v.name,
          displayValue: v.displayValue || v.name,
          colourHex: v.colourHex,
          imageFileId: v.imageFileId,
          status: v.status,
          sortOrder: v.sortOrder,
        })),
      categoryAssignments: attr.categoryAssignments,
    }));
  }

  async getAttributeById(id: string) {
    const attr = await productAttributeRepository.findById(id);
    if (!attr) {
      const err = new Error('Product attribute not found');
      (err as any).statusCode = 404;
      (err as any).code = AttributeErrorCode.ATTRIBUTE_NOT_FOUND;
      throw err;
    }
    return attr;
  }

  async createAttribute(dto: CreateAttributeDTO, adminUserId?: string) {
    const slug = dto.slug ? slugify(dto.slug) : slugify(dto.name);
    if (!slug) {
      const err = new Error('Invalid attribute name or slug');
      (err as any).statusCode = 400;
      throw err;
    }

    // Check slug collision
    const existingSlug = await productAttributeRepository.findBySlug(slug);
    if (existingSlug) {
      const err = new Error(`Attribute with slug '${slug}' already exists`);
      (err as any).statusCode = 400;
      (err as any).code = AttributeErrorCode.ATTRIBUTE_SLUG_EXISTS;
      throw err;
    }

    // Check code collision if code given
    if (dto.code) {
      const existingCode = await productAttributeRepository.findByCode(dto.code);
      if (existingCode) {
        const err = new Error(`Attribute with code '${dto.code}' already exists`);
        (err as any).statusCode = 400;
        (err as any).code = AttributeErrorCode.ATTRIBUTE_CODE_EXISTS;
        throw err;
      }
    }

    // Validate type specific requirements for initial values
    if (dto.values && dto.values.length > 0) {
      for (const val of dto.values) {
        if (dto.type === 'COLOUR_SWATCH') {
          if (!val.colourHex) {
            const err = new Error(`Colour swatch value '${val.name}' requires a hex colour code`);
            (err as any).statusCode = 400;
            (err as any).code = AttributeErrorCode.ATTRIBUTE_VALUE_COLOUR_REQUIRED;
            throw err;
          }
          if (!HEX_COLOUR_REGEX.test(val.colourHex)) {
            const err = new Error(`Invalid hex colour code '${val.colourHex}' for value '${val.name}'`);
            (err as any).statusCode = 400;
            (err as any).code = AttributeErrorCode.ATTRIBUTE_VALUE_COLOUR_REQUIRED;
            throw err;
          }
        }
        if (dto.type === 'IMAGE_SWATCH') {
          if (!val.imageFileId) {
            const err = new Error(`Image swatch value '${val.name}' requires an image file asset ID`);
            (err as any).statusCode = 400;
            (err as any).code = AttributeErrorCode.ATTRIBUTE_VALUE_IMAGE_REQUIRED;
            throw err;
          }
        }
      }
    }

    return productAttributeRepository.create({ ...dto, slug }, adminUserId);
  }

  async updateAttribute(id: string, dto: UpdateAttributeDTO, adminUserId?: string) {
    const attr = await this.getAttributeById(id);

    if (dto.slug && dto.slug !== attr.slug) {
      const newSlug = slugify(dto.slug);
      const existingSlug = await productAttributeRepository.findBySlug(newSlug);
      if (existingSlug && existingSlug.id !== id) {
        const err = new Error(`Attribute slug '${newSlug}' is already taken`);
        (err as any).statusCode = 400;
        (err as any).code = AttributeErrorCode.ATTRIBUTE_SLUG_EXISTS;
        throw err;
      }
      dto.slug = newSlug;
    }

    if (dto.code && dto.code !== attr.code) {
      const existingCode = await productAttributeRepository.findByCode(dto.code);
      if (existingCode && existingCode.id !== id) {
        const err = new Error(`Attribute code '${dto.code}' is already taken`);
        (err as any).statusCode = 400;
        (err as any).code = AttributeErrorCode.ATTRIBUTE_CODE_EXISTS;
        throw err;
      }
    }

    return productAttributeRepository.update(id, dto, adminUserId);
  }

  async updateStatus(id: string, status: ProductAttributeStatus, adminUserId?: string) {
    return this.updateAttribute(id, { status }, adminUserId);
  }

  async deleteAttribute(id: string, adminUserId?: string) {
    const attr = await this.getAttributeById(id);
    return productAttributeRepository.delete(id, adminUserId);
  }

  async restoreAttribute(id: string, adminUserId?: string) {
    return productAttributeRepository.restore(id, adminUserId);
  }

  // Values business operations
  async createValue(attributeId: string, dto: CreateAttributeValueDTO, adminUserId?: string) {
    const attr = await this.getAttributeById(attributeId);

    if (attr.type === 'COLOUR_SWATCH') {
      if (!dto.colourHex || !HEX_COLOUR_REGEX.test(dto.colourHex)) {
        const err = new Error('Colour swatch attribute requires a valid colourHex (#RGB or #RRGGBB)');
        (err as any).statusCode = 400;
        (err as any).code = AttributeErrorCode.ATTRIBUTE_VALUE_COLOUR_REQUIRED;
        throw err;
      }
    }

    if (attr.type === 'IMAGE_SWATCH') {
      if (!dto.imageFileId) {
        const err = new Error('Image swatch attribute requires an image file asset ID');
        (err as any).statusCode = 400;
        (err as any).code = AttributeErrorCode.ATTRIBUTE_VALUE_IMAGE_REQUIRED;
        throw err;
      }
    }

    const valSlug = dto.slug ? slugify(dto.slug) : slugify(dto.name);
    const slugExists = attr.values.some((v) => v.slug === valSlug);
    if (slugExists) {
      const err = new Error(`Value with slug '${valSlug}' already exists in this attribute`);
      (err as any).statusCode = 400;
      (err as any).code = AttributeErrorCode.ATTRIBUTE_VALUE_SLUG_EXISTS;
      throw err;
    }

    return productAttributeRepository.createValue(attributeId, { ...dto, slug: valSlug }, adminUserId);
  }

  async updateValue(attributeId: string, valueId: string, dto: UpdateAttributeValueDTO, adminUserId?: string) {
    const attr = await this.getAttributeById(attributeId);
    const existingValue = attr.values.find((v) => v.id === valueId);
    if (!existingValue) {
      const err = new Error('Attribute value not found');
      (err as any).statusCode = 404;
      (err as any).code = AttributeErrorCode.ATTRIBUTE_VALUE_NOT_FOUND;
      throw err;
    }

    if (attr.type === 'COLOUR_SWATCH' && dto.colourHex) {
      if (!HEX_COLOUR_REGEX.test(dto.colourHex)) {
        const err = new Error('Invalid hex colour code');
        (err as any).statusCode = 400;
        (err as any).code = AttributeErrorCode.ATTRIBUTE_VALUE_COLOUR_REQUIRED;
        throw err;
      }
    }

    return productAttributeRepository.updateValue(attributeId, valueId, dto, adminUserId);
  }

  async deleteValue(attributeId: string, valueId: string, adminUserId?: string) {
    return productAttributeRepository.deleteValue(attributeId, valueId, adminUserId);
  }

  // Groups
  async getGroups() {
    return productAttributeRepository.findGroups();
  }

  async createGroup(dto: CreateAttributeGroupDTO) {
    return productAttributeRepository.createGroup(dto);
  }

  // Combinations Generator Utility Endpoint
  async generateCombinations(selections: AttributeSelectionInput[], maxLimitOverride?: number) {
    const envLimit = parseInt(process.env.PRODUCT_MAX_VARIATION_COMBINATIONS || '100', 10);
    const limit = maxLimitOverride || envLimit || 100;
    return generateVariationCombinations(selections, limit);
  }
}

export const productAttributeService = new ProductAttributeService();
