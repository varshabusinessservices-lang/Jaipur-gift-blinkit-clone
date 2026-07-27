import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit2,
  Palette,
  Image as ImageIcon,
  Tag,
  SlidersHorizontal,
  CheckCircle2,
  Sparkles,
  Layers,
  Info,
  AlertTriangle,
  Code,
  List,
} from 'lucide-react';
import { useProductAttribute, useProductAttributes, useGenerateCombinations } from '../hooks/useProductAttributes';
import { generateVariationCombinations, AttributeSelectionInput, VariationCombination } from '../../../utils/variationCombinator';

export const ProductAttributeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: attr, isLoading, isError } = useProductAttribute(id || '');
  const { data: allAttrs } = useProductAttributes({ limit: 50 });
  const generateMutation = useGenerateCombinations();

  // Selected values for variation test widget
  const [selectedAttributeMap, setSelectedAttributeMap] = useState<Record<string, string[]>>({});
  const [combinationResults, setCombinationResults] = useState<{
    totalCombinations: number;
    exceededLimit: boolean;
    combinations: VariationCombination[];
    warningMessage?: string;
  } | null>(null);

  const handleToggleValueSelection = (attributeId: string, valueId: string) => {
    setSelectedAttributeMap((prev) => {
      const current = prev[attributeId] || [];
      const updated = current.includes(valueId)
        ? current.filter((v) => v !== valueId)
        : [...current, valueId];
      return { ...prev, [attributeId]: updated };
    });
  };

  const handleRunCombinationPreview = () => {
    if (!allAttrs) return;

    const selections: AttributeSelectionInput[] = [];

    Object.entries(selectedAttributeMap).forEach(([attrId, valIds]) => {
      const vIds = valIds as string[];
      if (vIds.length === 0) return;
      const targetAttr = allAttrs.attributes.find((a) => a.id === attrId);
      if (!targetAttr) return;

      const chosenValues = targetAttr.values.filter((v) => vIds.includes(v.id));
      if (chosenValues.length > 0) {
        selections.push({
          attributeId: targetAttr.id,
          attributeName: targetAttr.name,
          values: chosenValues.map((v) => ({ id: v.id, name: v.name, status: v.status })),
        });
      }
    });

    const result = generateVariationCombinations(selections, 100);
    setCombinationResults(result);
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-stone-500">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-amber-500 border-t-transparent"></div>
        <p className="mt-2 text-sm font-medium">Loading attribute details...</p>
      </div>
    );
  }

  if (isError || !attr) {
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 rounded-xl m-6">
        <p className="font-semibold">Failed to load attribute details.</p>
        <Link to="/admin/product-attributes" className="mt-2 inline-block text-sm text-amber-700 underline font-medium">
          Return to Attributes List
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/product-attributes"
            className="p-2 text-stone-500 hover:text-stone-900 rounded-lg bg-white border border-stone-200 hover:bg-stone-50 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-stone-900 tracking-tight">{attr.name}</h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  attr.status === 'ACTIVE'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-stone-100 text-stone-700'
                }`}
              >
                {attr.status}
              </span>
            </div>
            <p className="text-sm text-stone-500 mt-0.5 font-mono">
              Slug: {attr.slug} {attr.code ? `• Code: ${attr.code}` : ''}
            </p>
          </div>
        </div>

        <Link
          to={`/admin/product-attributes/${attr.id}/edit`}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 shadow-sm transition"
        >
          <Edit2 className="w-4 h-4" /> Edit Attribute
        </Link>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">Display Configuration</h3>
          <div>
            <div className="text-xs text-stone-500">Display Type</div>
            <div className="text-sm font-bold text-stone-900 mt-0.5">{attr.type}</div>
          </div>
          <div>
            <div className="text-xs text-stone-500">Total Values</div>
            <div className="text-sm font-bold text-stone-900 mt-0.5">{attr.valueCount} ({attr.activeValueCount} Active)</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">Behaviour Settings</h3>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {attr.isVariationAttribute && (
              <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                Variation Driver
              </span>
            )}
            {attr.isFilterable && (
              <span className="px-2 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded">
                Filterable
              </span>
            )}
            {attr.isRequiredByDefault && (
              <span className="px-2 py-0.5 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded">
                Required
              </span>
            )}
            {attr.showOnProductPage && (
              <span className="px-2 py-0.5 text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200 rounded">
                Product Page
              </span>
            )}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">Product Usage</h3>
          <div>
            <div className="text-xs text-stone-500">Usage Status</div>
            <div className="text-sm font-semibold text-stone-600 mt-0.5">Deferred (Products Module Pending)</div>
          </div>
          <div>
            <div className="text-xs text-stone-500">Assigned Categories</div>
            <div className="text-sm font-bold text-stone-900 mt-0.5">{attr.assignedCategoryCount} Categories</div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h2 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
            <List className="w-5 h-5 text-amber-600" /> Attribute Values
          </h2>
          <span className="text-xs text-stone-500">{attr.values.length} configured options</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {attr.values.map((v) => (
            <div
              key={v.id}
              className="p-3.5 bg-stone-50 rounded-lg border border-stone-200 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                {attr.type === 'COLOUR_SWATCH' && v.colourHex && (
                  <span
                    className="w-6 h-6 rounded-full border border-stone-300 shadow-sm shrink-0"
                    style={{ backgroundColor: v.colourHex }}
                  />
                )}
                <div>
                  <div className="text-sm font-semibold text-stone-900">{v.name}</div>
                  <div className="text-xs text-stone-500 font-mono">
                    {v.displayValue || v.name} {v.code ? `(${v.code})` : ''}
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-white text-stone-600 border border-stone-200">
                {v.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Variation Combination Generator Tool */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div>
            <h2 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" /> Product Variation Combination Utility
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Select attributes and test Cartesian variation combination generation in real time.
            </p>
          </div>
          <button
            onClick={handleRunCombinationPreview}
            className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition"
          >
            Generate Combinations
          </button>
        </div>

        {/* Attribute Selection checklist */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allAttrs?.attributes.map((otherAttr) => (
            <div key={otherAttr.id} className="p-3 bg-stone-50 rounded-lg border border-stone-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                <span>{otherAttr.name} ({otherAttr.type})</span>
                <span className="text-stone-400 font-normal">{otherAttr.values.length} values</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {otherAttr.values.map((val) => {
                  const isSelected = ((selectedAttributeMap as Record<string, string[]>)[otherAttr.id] || []).includes(val.id);
                  return (
                    <button
                      key={val.id}
                      type="button"
                      onClick={() => handleToggleValueSelection(otherAttr.id, val.id)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md border transition ${
                        isSelected
                          ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                          : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                      }`}
                    >
                      {val.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Results output */}
        {combinationResults && (
          <div className="mt-4 p-4 bg-stone-900 text-white rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400">
                Generated Variations: {combinationResults.totalCombinations} (Limit: 100)
              </span>
              {combinationResults.exceededLimit && (
                <span className="text-xs bg-red-500/20 text-red-300 border border-red-500/40 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Exceeded Limit
                </span>
              )}
            </div>

            {combinationResults.warningMessage ? (
              <p className="text-xs text-red-300 bg-red-950/50 p-2.5 rounded border border-red-800/50">
                {combinationResults.warningMessage}
              </p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2">
                {combinationResults.combinations.map((combo, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs py-1 px-2.5 bg-stone-800 rounded border border-stone-700 font-mono"
                  >
                    <span className="font-semibold text-amber-300">{combo.label}</span>
                    <span className="text-stone-400 text-[10px]">{combo.combinationKey}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
