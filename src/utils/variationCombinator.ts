export interface AttributeValueInput {
  id: string;
  name: string;
  status?: string;
}

export interface AttributeSelectionInput {
  attributeId: string;
  attributeName: string;
  values: AttributeValueInput[];
}

export interface CombinationValueRef {
  attributeId: string;
  attributeName: string;
  valueId: string;
  valueName: string;
}

export interface VariationCombination {
  combinationKey: string;
  label: string;
  attributeValues: CombinationValueRef[];
}

export interface CombinationResult {
  success: boolean;
  totalCombinations: number;
  maxLimit: number;
  exceededLimit: boolean;
  combinations: VariationCombination[];
  warningMessage?: string;
}

export function buildCombinationKey(pairs: { attributeId: string; valueId?: string; attributeValueId?: string }[]): string {
  const normalized = pairs.map((p) => ({
    attributeId: p.attributeId,
    valueId: p.valueId || p.attributeValueId || '',
  }));

  const sorted = [...normalized].sort((a, b) => a.attributeId.localeCompare(b.attributeId));
  return sorted.map((p) => `${p.attributeId}:${p.valueId}`).join('|');
}

export function generateVariationCombinations(
  selections: AttributeSelectionInput[],
  maxLimit: number = 100
): CombinationResult {
  const validSelections = selections
    .map((sel) => ({
      ...sel,
      values: sel.values.filter((v) => !v.status || v.status === 'ACTIVE'),
    }))
    .filter((sel) => sel.values.length > 0);

  if (validSelections.length === 0) {
    return {
      success: true,
      totalCombinations: 0,
      maxLimit,
      exceededLimit: false,
      combinations: [],
    };
  }

  let totalCount = 1;
  for (const sel of validSelections) {
    totalCount *= sel.values.length;
  }

  if (totalCount > maxLimit) {
    return {
      success: false,
      totalCombinations: totalCount,
      maxLimit,
      exceededLimit: true,
      combinations: [],
      warningMessage: `Selection produces ${totalCount} combinations, exceeding the maximum limit of ${maxLimit}. Please reduce selected attribute values.`,
    };
  }

  const sortedSelections = [...validSelections].sort((a, b) =>
    a.attributeId.localeCompare(b.attributeId)
  );

  function cartesian(
    depth: number,
    current: CombinationValueRef[]
  ): CombinationValueRef[][] {
    if (depth === sortedSelections.length) {
      return [current];
    }

    const currentAttr = sortedSelections[depth];
    const results: CombinationValueRef[][] = [];

    for (const val of currentAttr.values) {
      const item: CombinationValueRef = {
        attributeId: currentAttr.attributeId,
        attributeName: currentAttr.attributeName,
        valueId: val.id,
        valueName: val.name,
      };
      const subResults = cartesian(depth + 1, [...current, item]);
      results.push(...subResults);
    }

    return results;
  }

  const rawCombinations = cartesian(0, []);

  const combinations: VariationCombination[] = rawCombinations.map((combo) => {
    const combinationKey = combo
      .map((item) => `${item.attributeId}:${item.valueId}`)
      .join('|');

    const label = combo.map((item) => item.valueName).join(' / ');

    return {
      combinationKey,
      label,
      attributeValues: combo,
    };
  });

  return {
    success: true,
    totalCombinations: combinations.length,
    maxLimit,
    exceededLimit: false,
    combinations,
  };
}
