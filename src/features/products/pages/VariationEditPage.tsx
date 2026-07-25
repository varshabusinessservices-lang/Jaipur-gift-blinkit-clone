import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, ChevronRight, AlertCircle, Package, Tag, DollarSign, Truck, Image as ImageIcon, Star } from 'lucide-react';
import { useProductDetail } from '../hooks/useProducts';
import { useProductVariationDetail, useUpdateVariation, useSetDefaultVariation } from '../hooks/useProductVariations';

export const VariationEditPage: React.FC = () => {
  const { productId, variationId } = useParams<{ productId: string; variationId: string }>();
  const navigate = useNavigate();

  const { product, loading: productLoading } = useProductDetail(productId || '');
  const { data: variation, isLoading: variationLoading } = useProductVariationDetail(productId || '', variationId || '');
  const updateMutation = useUpdateVariation(productId || '', variationId || '');
  const setDefaultMutation = useSetDefaultVariation(productId || '');

  const [title, setTitle] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK' | 'ARCHIVED'>('ACTIVE');
  const [isDefault, setIsDefault] = useState(false);
  const [mrp, setMrp] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState<number | ''>('');
  const [lowStockThreshold, setLowStockThreshold] = useState<number | ''>('');
  const [weightGrams, setWeightGrams] = useState('');
  const [lengthCm, setLengthCm] = useState('');
  const [widthCm, setWidthCm] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [preparationTimeMinutes, setPreparationTimeMinutes] = useState<number | ''>('');
  const [sameDayEligible, setSameDayEligible] = useState(true);
  const [mainImageFileId, setMainImageFileId] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (variation) {
      setTitle(variation.title || '');
      setSku(variation.sku || '');
      setBarcode(variation.barcode || '');
      setStatus(variation.status);
      setIsDefault(variation.isDefault);
      setMrp(variation.mrp || '');
      setSellingPrice(variation.sellingPrice || '');
      setCostPrice(variation.costPrice || '');
      setStockQuantity(variation.stockQuantity ?? '');
      setLowStockThreshold(variation.lowStockThreshold ?? '');
      setWeightGrams(variation.weightGrams || '');
      setLengthCm(variation.lengthCm || '');
      setWidthCm(variation.widthCm || '');
      setHeightCm(variation.heightCm || '');
      setPreparationTimeMinutes(variation.preparationTimeMinutes ?? '');
      setSameDayEligible(variation.sameDayEligible ?? true);
      setMainImageFileId(variation.mainImageFileId || '');
    }
  }, [variation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      if (isDefault && !variation?.isDefault) {
        await setDefaultMutation.mutateAsync(variationId || '');
      }

      await updateMutation.mutateAsync({
        title,
        sku: sku || null,
        barcode: barcode || null,
        status,
        mrp: mrp ? mrp : null,
        sellingPrice: sellingPrice ? sellingPrice : null,
        costPrice: costPrice ? costPrice : null,
        stockQuantity: stockQuantity !== '' ? Number(stockQuantity) : null,
        lowStockThreshold: lowStockThreshold !== '' ? Number(lowStockThreshold) : null,
        weightGrams: weightGrams ? weightGrams : null,
        lengthCm: lengthCm ? lengthCm : null,
        widthCm: widthCm ? widthCm : null,
        heightCm: heightCm ? heightCm : null,
        preparationTimeMinutes: preparationTimeMinutes !== '' ? Number(preparationTimeMinutes) : null,
        sameDayEligible,
        mainImageFileId: mainImageFileId || null,
      });

      navigate(`/admin/products/${productId}/variations`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update variation.');
    }
  };

  if (productLoading || variationLoading) {
    return <div className="p-8 text-center text-gray-500 font-medium">Loading variation details...</div>;
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
          <span className="text-gray-900 font-medium">Edit Variation</span>
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
                <span>{variation?.title}</span>
                {variation?.isDefault && (
                  <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 rounded-full flex items-center space-x-1">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span>DEFAULT VARIATION</span>
                  </span>
                )}
              </h1>
              <p className="text-xs text-gray-500 font-mono mt-0.5">{variation?.combinationKey}</p>
            </div>
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
        {/* Core Attributes */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Tag className="w-4 h-4 text-indigo-600" />
            <span>Variation Identifiers</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">SKU</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-sm font-mono text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Barcode</label>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-sm font-mono text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Tax */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-indigo-600" />
              <span>Pricing & Override Settings</span>
            </h2>
            <span className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-700 font-semibold rounded-full">
              Source: {variation?.priceSource}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Variation MRP (₹)</label>
              <input
                type="number"
                step="0.01"
                value={mrp}
                onChange={(e) => setMrp(e.target.value)}
                placeholder={`Product Default: ₹${product?.mrp || '1499.00'}`}
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
                placeholder={`Product Default: ₹${product?.sellingPrice || '999.00'}`}
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
                placeholder={`Product Default: ₹${product?.costPrice || '350.00'}`}
                className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Stock & Fulfillment */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-4 h-4 text-indigo-600" />
            <span>Stock & Logistics</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Stock Quantity</label>
              <input
                type="number"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Low Stock Threshold</label>
              <input
                type="number"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value === '' ? '' : Number(e.target.value))}
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
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center space-x-2 text-sm text-gray-900 font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
              />
              <span>Set as Default Variation for this Product</span>
            </label>
          </div>
        </div>

        {/* Buttons */}
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
            disabled={updateMutation.isPending}
            className="px-7 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-all flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{updateMutation.isPending ? 'Saving...' : 'Save Variation Updates'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
