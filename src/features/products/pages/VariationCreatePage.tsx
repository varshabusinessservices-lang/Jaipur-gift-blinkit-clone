import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, ChevronRight, AlertCircle, Package, Tag, DollarSign, Truck } from 'lucide-react';
import { useProductDetail } from '../hooks/useProducts';
import { useCreateVariation } from '../hooks/useProductVariations';
import { CreateVariationInput } from '../types/productVariation';

export const VariationCreatePage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  const { product, loading: productLoading } = useProductDetail(productId || '');
  const createVariationMutation = useCreateVariation(productId || '');

  const [title, setTitle] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK'>('ACTIVE');
  const [isDefault, setIsDefault] = useState(false);
  const [mrp, setMrp] = useState('1499.00');
  const [sellingPrice, setSellingPrice] = useState('999.00');
  const [costPrice, setCostPrice] = useState('350.00');
  const [stockQuantity, setStockQuantity] = useState<number>(20);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(5);
  const [weightGrams, setWeightGrams] = useState('650.00');
  const [lengthCm, setLengthCm] = useState('30.00');
  const [widthCm, setWidthCm] = useState('21.00');
  const [heightCm, setHeightCm] = useState('3.00');
  const [preparationTimeMinutes, setPreparationTimeMinutes] = useState<number>(45);
  const [sameDayEligible, setSameDayEligible] = useState(true);

  // Selected values map: { attributeId: valueId }
  const [selectedAttributeValues, setSelectedAttributeValues] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const variationAttributes = (product?.attributeAssignments || []).filter(
    (pa: any) => pa.isVariationAttribute || pa.attribute?.isVariationAttribute
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const attributeValuePairs = Object.entries(selectedAttributeValues).map(([attributeId, attributeValueId]) => ({
      attributeId,
      attributeValueId,
    }));

    if (attributeValuePairs.length === 0) {
      setErrorMsg('Please select at least one attribute value.');
      return;
    }

    try {
      const input: CreateVariationInput = {
        title: title || undefined,
        sku: sku || null,
        barcode: barcode || null,
        status,
        isDefault,
        mrp,
        sellingPrice,
        costPrice,
        stockQuantity,
        lowStockThreshold,
        weightGrams,
        lengthCm,
        widthCm,
        heightCm,
        preparationTimeMinutes,
        sameDayEligible,
        attributeValues: attributeValuePairs,
      };

      await createVariationMutation.mutateAsync(input);
      navigate(`/admin/products/${productId}/variations`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create variation.');
    }
  };

  if (productLoading) {
    return <div className="p-8 text-center text-gray-500 font-medium">Loading product...</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <nav className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
          <Link to="/admin/products" className="hover:text-gray-900 transition-colors">
            Products
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to={`/admin/products/${productId}/variations`} className="hover:text-gray-900 transition-colors">
            {product?.title || 'Product'}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-900 font-medium">Add New Variation</span>
        </nav>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(`/admin/products/${productId}/variations`)}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add Manual Product Variation</h1>
            <p className="text-sm text-gray-500">Create a specific variation with custom pricing and stock settings</p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Attribute Values Selection */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Tag className="w-4 h-4 text-indigo-600" />
            <span>Variation Attributes</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {variationAttributes.map((pa: any) => {
              const attr = pa.attribute || { id: pa.attributeId, name: pa.attributeId };
              const vals = pa.valueAssignments || [];

              return (
                <div key={attr.id} className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                    {attr.name}
                  </label>
                  <select
                    value={selectedAttributeValues[attr.id] || ''}
                    onChange={(e) =>
                      setSelectedAttributeValues((prev) => ({ ...prev, [attr.id]: e.target.value }))
                    }
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select {attr.name}...</option>
                    {vals.map((va: any) => {
                      const valObj = va.attributeValue || {};
                      const valId = va.attributeValueId || valObj.id;
                      return (
                        <option key={valId} value={valId}>
                          {valObj.name || valId}
                        </option>
                      );
                    })}
                  </select>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-indigo-600" />
            <span>Pricing & Inventory</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">MRP (₹)</label>
              <input
                type="number"
                step="0.01"
                value={mrp}
                onChange={(e) => setMrp(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Selling Price (₹)</label>
              <input
                type="number"
                step="0.01"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Cost Price (₹)</label>
              <input
                type="number"
                step="0.01"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Stock Quantity</label>
              <input
                type="number"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Low Stock Threshold</label>
              <input
                type="number"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(`/admin/products/${productId}/variations`)}
            className="px-5 py-2.5 border border-gray-200 text-gray-700 font-semibold text-sm rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createVariationMutation.isPending}
            className="px-7 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-all flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{createVariationMutation.isPending ? 'Saving...' : 'Create Variation'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
