import { Prisma } from '@prisma/client';
const Decimal = Prisma.Decimal;

export interface AddonPricingInput {
  baseProductPrice: string | number;
  variationPrice?: string | number | null;
  addon: {
    pricingType: string;
    fixedPrice?: string | number | null;
    percentageRate?: string | number | null;
    minimumAmount?: string | number | null;
    maximumAmount?: string | number | null;
    priceIncludesTax?: boolean;
    taxRate?: {
      totalRate: string | number;
      name?: string;
    } | null;
  };
  option?: {
    pricingType?: string | null;
    fixedPrice?: string | number | null;
    percentageRate?: string | number | null;
  } | null;
  assignmentOverride?: {
    priceOverride?: string | number | null;
    percentageOverride?: string | number | null;
    assignmentType?: string;
  } | null;
  customAmountInput?: string | number | null;
  quantity?: number;
}

export interface AddonPricingResult {
  basePrice: string;
  quantity: number;
  quantitySubtotal: string;
  taxRatePercent: string;
  priceIncludesTax: boolean;
  taxAmount: string;
  totalAddonAmount: string;
  pricingSource: 'OPTION' | 'ASSIGNMENT_OVERRIDE' | 'ADDON_DEFAULT' | 'CUSTOM_INPUT';
  assignmentSource: string;
}

export function calculateAddonPricing(input: AddonPricingInput): AddonPricingResult {
  const quantity = Math.max(1, input.quantity || 1);
  const effectiveProductPrice = new Decimal(
    input.variationPrice !== undefined && input.variationPrice !== null
      ? input.variationPrice
      : input.baseProductPrice || 0
  );

  let pricingType = input.addon.pricingType;
  if (input.option?.pricingType) {
    pricingType = input.option.pricingType;
  }

  let unitPrice = new Decimal(0);
  let pricingSource: AddonPricingResult['pricingSource'] = 'ADDON_DEFAULT';

  if (pricingType === 'FREE') {
    unitPrice = new Decimal(0);
    pricingSource = 'ADDON_DEFAULT';
  } else if (pricingType === 'CUSTOM_AMOUNT') {
    let customVal = new Decimal(input.customAmountInput || 0);
    const minVal = input.addon.minimumAmount !== null && input.addon.minimumAmount !== undefined
      ? new Decimal(input.addon.minimumAmount)
      : new Decimal(0);
    const maxVal = input.addon.maximumAmount !== null && input.addon.maximumAmount !== undefined
      ? new Decimal(input.addon.maximumAmount)
      : null;

    if (customVal.lessThan(minVal)) customVal = minVal;
    if (maxVal && customVal.greaterThan(maxVal)) customVal = maxVal;

    unitPrice = customVal;
    pricingSource = 'CUSTOM_INPUT';
  } else if (input.assignmentOverride?.priceOverride !== undefined && input.assignmentOverride?.priceOverride !== null) {
    unitPrice = new Decimal(input.assignmentOverride.priceOverride);
    pricingSource = 'ASSIGNMENT_OVERRIDE';
  } else if (input.option?.fixedPrice !== undefined && input.option?.fixedPrice !== null) {
    unitPrice = new Decimal(input.option.fixedPrice);
    pricingSource = 'OPTION';
  } else if (pricingType === 'PERCENTAGE') {
    let rate = new Decimal(0);
    if (input.assignmentOverride?.percentageOverride !== undefined && input.assignmentOverride?.percentageOverride !== null) {
      rate = new Decimal(input.assignmentOverride.percentageOverride);
      pricingSource = 'ASSIGNMENT_OVERRIDE';
    } else if (input.option?.percentageRate !== undefined && input.option?.percentageRate !== null) {
      rate = new Decimal(input.option.percentageRate);
      pricingSource = 'OPTION';
    } else if (input.addon.percentageRate !== undefined && input.addon.percentageRate !== null) {
      rate = new Decimal(input.addon.percentageRate);
      pricingSource = 'ADDON_DEFAULT';
    }
    unitPrice = effectiveProductPrice.mul(rate).div(100);
  } else {
    // FIXED or PER_QUANTITY
    if (input.addon.fixedPrice !== undefined && input.addon.fixedPrice !== null) {
      unitPrice = new Decimal(input.addon.fixedPrice);
    }
    pricingSource = 'ADDON_DEFAULT';
  }

  // Ensure non-negative price
  if (unitPrice.isNegative()) {
    unitPrice = new Decimal(0);
  }

  const subtotal = unitPrice.mul(quantity);

  // Tax computation
  const taxRateVal = input.addon.taxRate?.totalRate !== undefined && input.addon.taxRate?.totalRate !== null
    ? new Decimal(input.addon.taxRate.totalRate)
    : new Decimal(0);

  const priceIncludesTax = input.addon.priceIncludesTax !== false;
  let taxAmount = new Decimal(0);
  let finalTotal = subtotal;

  if (taxRateVal.greaterThan(0) && subtotal.greaterThan(0)) {
    if (priceIncludesTax) {
      // Subtotal includes tax -> Tax = subtotal - (subtotal / (1 + rate/100))
      const factor = new Decimal(1).add(taxRateVal.div(100));
      taxAmount = subtotal.sub(subtotal.div(factor));
      finalTotal = subtotal;
    } else {
      // Subtotal excludes tax -> Tax = subtotal * (rate/100)
      taxAmount = subtotal.mul(taxRateVal).div(100);
      finalTotal = subtotal.add(taxAmount);
    }
  }

  return {
    basePrice: unitPrice.toFixed(2),
    quantity,
    quantitySubtotal: subtotal.toFixed(2),
    taxRatePercent: taxRateVal.toFixed(2),
    priceIncludesTax,
    taxAmount: taxAmount.toFixed(2),
    totalAddonAmount: finalTotal.toFixed(2),
    pricingSource,
    assignmentSource: input.assignmentOverride?.assignmentType || 'GLOBAL',
  };
}
