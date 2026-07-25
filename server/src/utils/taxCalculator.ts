export type SupplyType = 'INTRA_STATE' | 'INTER_STATE';

export interface TaxCalculationInput {
  price: number | string;
  quantity: number;
  totalRate: number | string;
  cgstRate?: number | string;
  sgstRate?: number | string;
  igstRate?: number | string;
  cessRate?: number | string;
  includesTax: boolean;
  supplyType: SupplyType;
}

export interface TaxCalculationResult {
  baseAmount: string;
  cgstAmount: string;
  sgstAmount: string;
  igstAmount: string;
  cessAmount: string;
  taxAmount: string;
  totalAmount: string;
}

/**
 * Pure tax calculation utility supporting Indian GST rules:
 * - Tax-inclusive pricing
 * - Tax-exclusive pricing
 * - Intra-state CGST + SGST split
 * - Inter-state IGST
 * - Cess calculation
 * Returns formatted monetary values as strings with 2 decimal places.
 */
export function calculateTax(input: TaxCalculationInput): TaxCalculationResult {
  const price = Number(input.price) || 0;
  const quantity = Math.max(1, Number(input.quantity) || 1);
  const totalRate = Math.max(0, Number(input.totalRate) || 0);
  const cgstRate = Math.max(0, Number(input.cgstRate) || 0);
  const sgstRate = Math.max(0, Number(input.sgstRate) || 0);
  const igstRate = Math.max(0, Number(input.igstRate) || 0);
  const cessRate = Math.max(0, Number(input.cessRate) || 0);
  const { includesTax, supplyType } = input;

  const grossOrBasePrice = price * quantity;

  let baseAmount: number;
  let taxAmount: number;
  let totalAmount: number;

  if (includesTax) {
    // Price already includes total tax rate + cess rate
    const combinedRatePercent = totalRate + cessRate;
    const combinedTaxFactor = 1 + combinedRatePercent / 100;
    
    if (combinedTaxFactor <= 0) {
      baseAmount = grossOrBasePrice;
      taxAmount = 0;
    } else {
      baseAmount = grossOrBasePrice / combinedTaxFactor;
      taxAmount = grossOrBasePrice - baseAmount;
    }
    totalAmount = grossOrBasePrice;
  } else {
    // Tax is calculated on top of base price
    baseAmount = grossOrBasePrice;
    const mainTaxAmount = baseAmount * (totalRate / 100);
    const cessAmountVal = baseAmount * (cessRate / 100);
    taxAmount = mainTaxAmount + cessAmountVal;
    totalAmount = baseAmount + taxAmount;
  }

  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;
  let cessAmount = 0;

  if (supplyType === 'INTRA_STATE') {
    // Intra-state split: CGST + SGST
    cgstAmount = baseAmount * (cgstRate / 100);
    sgstAmount = baseAmount * (sgstRate / 100);
    igstAmount = 0;
  } else {
    // Inter-state: IGST
    cgstAmount = 0;
    sgstAmount = 0;
    igstAmount = baseAmount * (igstRate / 100);
  }

  cessAmount = baseAmount * (cessRate / 100);

  return {
    baseAmount: baseAmount.toFixed(2),
    cgstAmount: cgstAmount.toFixed(2),
    sgstAmount: sgstAmount.toFixed(2),
    igstAmount: igstAmount.toFixed(2),
    cessAmount: cessAmount.toFixed(2),
    taxAmount: taxAmount.toFixed(2),
    totalAmount: totalAmount.toFixed(2),
  };
}
