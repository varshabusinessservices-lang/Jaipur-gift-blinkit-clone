import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Package,
  Layers,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useProductDetail } from '../hooks/useProducts';
import {
  useGenerateVariationPreview,
  useGenerateVariations,
} from '../hooks/useProductVariations';
import { VariationPreviewItem, BaseDefaults } from '../types/productVariation';

export const VariationGeneratePage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  const { product, loading: productLoading } = useProductDetail(productId || '');
  const generatePreviewMutation = useGenerateVariationPreview(productId || '');
  const generateVariationsMutation = useGenerateVariations(productId || '');

  // Step state
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Selected values map: { attributeId: string[] }
  const [selectedValues, setSelectedValues] = useState<Record<string, string[]>>({});
  const [disabledKeys, setDisabledKeys] = useState<string[]>([]);

  // Base Defaults State
  const [defaults, setDefaults] = useState<BaseDefaults>({
    autoSku: true,
    skuPrefix: '',
    mrp: '1499.00',
    sellingPrice: '999.00',
    costPrice: '350.00',
    stockQuantity: 20,
    lowStockThreshold: 5,
    status: 'INACTIVE',
    preparationTimeMinutes: 45,
    sameDayEligible: true,
  });

  const [skipExisting, setSkipExisting] = useState(true);
  const [previewData, setPreviewData] = useState<VariationPreviewItem[]>([]);
  const [totalCombinationsCount, setTotalCombinationsCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Extract variation attributes from product assigned attributes
  const variationAttributes = (product?.attributeAssignments || []).filter(
    (pa: any) => pa.isVariationAttribute || pa.attribute?.isVariationAttribute
  );

  // Initialize selected values on first load
  React.useEffect(() => {
    if (variationAttributes.length > 0 && Object.keys(selectedValues).length === 0) {
      const initial: Record<string, string[]> = {};
      variationAttributes.forEach((pa: any) => {
        const valIds = (pa.valueAssignments || []).map((va: any) => va.attributeValueId || va.attributeValue?.id);
        initial[pa.attributeId] = valIds;
      });
      setSelectedValues(initial);
      if (product?.sku && !defaults.skuPrefix) {
        setDefaults((prev) => ({ ...prev, skuPrefix: product.sku || '' }));
      }
    }
  }, [product]);

  const handleToggleValue = (attrId: string, valId: string) => {
    setSelectedValues((prev) => {
      const current = prev[attrId] || [];
      const updated = current.includes(valId)
        ? current.filter((id) => id !== valId)
        : [...current, valId];
      return { ...prev, [attrId]: updated };
    });
  };

  const handleSelectAllForAttr = (attrId: string, allValIds: string[]) => {
    setSelectedValues((prev) => ({ ...prev, [attrId]: allValIds }));
  };

  const handleDeselectAllForAttr = (attrId: string) => {
    setSelectedValues((prev) => ({ ...prev, [attrId]: [] }));
  };

  const handleRunPreview = async () => {
    setErrorMsg(null);
    const selectedAttrIds = Object.keys(selectedValues).filter((id) => (selectedValues[id] || []).length > 0);
    const allSelectedValIds = Object.values(selectedValues).flat();

    if (selectedAttrIds.length === 0) {
      setErrorMsg('Please select at least one value for an attribute.');
      return;
    }

    try {
      const res = await generatePreviewMutation.mutateAsync({
        selectedAttributeIds: selectedAttrIds,
        selectedAttributeValueIds: allSelectedValIds,
        disabledCombinations: disabledKeys,
      });

      setPreviewData(res.combinations);
      setTotalCombinationsCount(res.totalCombinations);
      setStep(2);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate variation preview.');
    }
  };

  const handleSaveVariations = async () => {
    setErrorMsg(null);
    const eligibleCombinations = previewData
      .filter((p) => p.eligible)
      .map((p) => ({
        combinationKey: p.combinationKey,
        title: p.label,
        attributeValues: p.attributeValues.map((av) => ({
          attributeId: av.attributeId,
          attributeValueId: av.valueId,
        })),
      }));

    if (eligibleCombinations.length === 0) {
      setErrorMsg('No eligible combinations to save.');
      return;
    }

    try {
      await generateVariationsMutation.mutateAsync({
        combinations: eligibleCombinations,
        baseDefaults: defaults,
        skipExisting,
        activateNew: defaults.status === 'ACTIVE',
      });

      navigate(`/admin/products/${productId}/variations`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save generated variations.');
    }
  };

  if (productLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-3 text-gray-500 font-medium">
          <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
          <span>Loading product attribute configuration...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Breadcrumb & Header */}
      <div>
        <nav className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
          <Link to="/admin/products" className="hover:text-gray-900 transition-colors">
            Products
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to={`/admin/products/${productId}/variations`} className="hover:text-gray-900 transition-colors truncate max-w-[200px]">
            {product?.title || 'Product'}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-900 font-medium">Generate Combinations</span>
        </nav>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(`/admin/products/${productId}/variations`)}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span>Generate Product Variations</span>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                  Batch Generator
                </span>
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Automatically generate all attribute-based variation combinations for variable product
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Wizard Steps Navigation */}
      <div className="grid grid-cols-3 gap-3 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
        <button
          onClick={() => setStep(1)}
          className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${
            step === 1
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">1</span>
          <span>Select Attribute Values</span>
        </button>

        <button
          onClick={() => step > 1 && setStep(2)}
          disabled={step < 2}
          className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${
            step === 2
              ? 'bg-indigo-600 text-white shadow-sm'
              : step > 2
              ? 'text-gray-900 hover:bg-gray-50'
              : 'text-gray-400 cursor-not-allowed'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">2</span>
          <span>Review Combinations ({previewData.length})</span>
        </button>

        <button
          onClick={() => step === 2 && setStep(3)}
          disabled={step < 3 && previewData.length === 0}
          className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${
            step === 3
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-gray-400 cursor-not-allowed'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">3</span>
          <span>Base Defaults & Save</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STEP 1: SELECT ATTRIBUTE VALUES */}
      {step === 1 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-lg font-bold text-gray-900">1. Assigned Variation Attributes</h2>
            <p className="text-sm text-gray-500">
              Select which attribute values to include in the Cartesian product generation.
            </p>
          </div>

          {variationAttributes.length === 0 ? (
            <div className="p-8 text-center bg-amber-50 rounded-xl border border-amber-200 space-y-3">
              <ShieldAlert className="w-8 h-8 text-amber-600 mx-auto" />
              <h3 className="font-semibold text-amber-900">No Variation Attributes Assigned</h3>
              <p className="text-xs text-amber-700 max-w-md mx-auto">
                This product currently has no variation attributes assigned. Please edit the product attributes in product settings first.
              </p>
              <Link
                to={`/admin/products/edit/${productId}`}
                className="inline-flex items-center px-4 py-2 bg-amber-600 text-white text-xs font-semibold rounded-lg hover:bg-amber-700 transition-colors"
              >
                Edit Product Attributes
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {variationAttributes.map((pa: any) => {
                const attr = pa.attribute || { id: pa.attributeId, name: pa.attributeId };
                const vals = pa.valueAssignments || [];
                const currentSelected = selectedValues[attr.id] || [];

                return (
                  <div key={attr.id} className="p-5 bg-gray-50/70 rounded-xl border border-gray-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-gray-900 text-base">{attr.name}</span>
                        <span className="px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-700 rounded-full">
                          {currentSelected.length} / {vals.length} selected
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <button
                          type="button"
                          onClick={() => handleSelectAllForAttr(attr.id, vals.map((v: any) => v.attributeValueId || v.attributeValue?.id))}
                          className="text-indigo-600 font-semibold hover:underline"
                        >
                          Select All
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          type="button"
                          onClick={() => handleDeselectAllForAttr(attr.id)}
                          className="text-gray-500 font-medium hover:underline"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {vals.map((va: any) => {
                        const valObj = va.attributeValue || {};
                        const valId = va.attributeValueId || valObj.id;
                        const isChecked = currentSelected.includes(valId);

                        return (
                          <button
                            key={valId}
                            type="button"
                            onClick={() => handleToggleValue(attr.id, valId)}
                            className={`px-3.5 py-2 rounded-lg text-sm font-medium border transition-all flex items-center space-x-2 ${
                              isChecked
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            {valObj.colourHex && (
                              <span
                                className="w-3 h-3 rounded-full border border-black/20"
                                style={{ backgroundColor: valObj.colourHex }}
                              />
                            )}
                            <span>{valObj.name || valId}</span>
                            {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-white ml-1" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Maximum allowed variation combinations per product is <span className="font-bold text-gray-900">100</span>.
                </p>
                <button
                  type="button"
                  onClick={handleRunPreview}
                  disabled={generatePreviewMutation.isPending}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-all flex items-center space-x-2"
                >
                  {generatePreviewMutation.isPending ? (
                    <span>Calculating Preview...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Combination Preview</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: REVIEW COMBINATIONS */}
      {step === 2 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">2. Combination Preview</h2>
              <p className="text-sm text-gray-500">
                Review generated attribute combinations. Existing variations are flagged automatically.
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-indigo-600">{previewData.length}</span>
              <p className="text-xs text-gray-500">Total Generated</p>
            </div>
          </div>

          {/* List of Preview Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
            {previewData.map((item) => (
              <div
                key={item.combinationKey}
                className={`p-3.5 rounded-xl border text-sm transition-all flex items-center justify-between ${
                  item.exists
                    ? 'bg-amber-50/60 border-amber-200 text-amber-900'
                    : 'bg-gray-50 border-gray-200 text-gray-900'
                }`}
              >
                <div>
                  <div className="font-semibold text-gray-900 flex items-center space-x-2">
                    <span>{item.label}</span>
                    {item.exists && (
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-200 text-amber-900 rounded">
                        Already Exists
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 font-mono">{item.combinationKey}</p>
                </div>

                <div>
                  {item.eligible ? (
                    <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full">
                      Ready
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 text-xs font-semibold bg-gray-200 text-gray-600 rounded-full">
                      Skipped
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 border border-gray-200 text-gray-700 font-semibold text-sm rounded-lg hover:bg-gray-50"
            >
              Back to Attribute Selection
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-all flex items-center space-x-2"
            >
              <span>Next: Configure Defaults</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: BASE DEFAULTS & SAVE */}
      {step === 3 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-lg font-bold text-gray-900">3. Base Defaults & Auto SKU Pattern</h2>
            <p className="text-sm text-gray-500">
              Set starting prices, stock, and SKU generation settings for newly generated variations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Auto SKU Pattern */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                SKU Generation Prefix
              </label>
              <input
                type="text"
                value={defaults.skuPrefix}
                onChange={(e) => setDefaults((p) => ({ ...p, skuPrefix: e.target.value }))}
                className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-sm font-mono text-gray-900 focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. JPG-FRM-VAR"
              />
              <p className="text-xs text-gray-500">
                Sample Generated SKU: <span className="font-mono text-indigo-600 font-bold">{defaults.skuPrefix || 'SKU'}-A4-BLK</span>
              </p>
            </div>

            {/* Base Prices */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Base MRP (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={defaults.mrp || ''}
                    onChange={(e) => setDefaults((p) => ({ ...p, mrp: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Selling Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={defaults.sellingPrice || ''}
                    onChange={(e) => setDefaults((p) => ({ ...p, sellingPrice: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Initial Stock & Status */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Initial Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={defaults.stockQuantity ?? ''}
                    onChange={(e) => setDefaults((p) => ({ ...p, stockQuantity: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Default Status
                  </label>
                  <select
                    value={defaults.status}
                    onChange={(e) => setDefaults((p) => ({ ...p, status: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="INACTIVE">INACTIVE (Review before publishing)</option>
                    <option value="ACTIVE">ACTIVE (Published immediately)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Same Day & Skip options */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
              <label className="flex items-center space-x-2 text-sm text-gray-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={skipExisting}
                  onChange={(e) => setSkipExisting(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                />
                <span className="font-semibold">Skip Existing Combinations (Prevent duplicates)</span>
              </label>

              <label className="flex items-center space-x-2 text-sm text-gray-900 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={!!defaults.sameDayEligible}
                  onChange={(e) => setDefaults((p) => ({ ...p, sameDayEligible: e.target.checked }))}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                />
                <span>Enable 90-Min Jaipur Delivery</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-2 border border-gray-200 text-gray-700 font-semibold text-sm rounded-lg hover:bg-gray-50"
            >
              Back to Preview
            </button>
            <button
              type="button"
              onClick={handleSaveVariations}
              disabled={generateVariationsMutation.isPending}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-lg shadow-md transition-all flex items-center space-x-2"
            >
              {generateVariationsMutation.isPending ? (
                <span>Generating Variations in Database...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Save Generated Variations</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
