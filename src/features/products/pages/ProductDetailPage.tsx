import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProductDetail, useProductActions } from '../hooks/useProducts';
import { calculateTax } from '../../../utils/taxCalculator';
import {
  ArrowLeft,
  Edit,
  Copy,
  Trash2,
  Package,
  Layers,
  Truck,
  Image as ImageIcon,
  Globe,
  Sparkles,
  CheckCircle,
  Clock,
  ShieldCheck,
  Tag,
  DollarSign,
} from 'lucide-react';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { product, loading, error, refetch } = useProductDetail(id);
  const { duplicateProduct, softDeleteProduct } = useProductActions();

  const [activeTab, setActiveTab] = useState<'overview' | 'media' | 'seo'>('overview');

  if (loading) return <div className="p-12 text-center text-slate-500 text-sm">Loading product details...</div>;
  if (error || !product)
    return <div className="p-12 text-center text-red-600 text-sm">{error || 'Product not found'}</div>;

  const taxVal = product.taxRateValue ? parseFloat(String(product.taxRateValue)) : 18;
  const taxInfo = calculateTax({
    price: parseFloat(product.sellingPrice || '0'),
    quantity: 1,
    totalRate: taxVal,
    cgstRate: taxVal / 2,
    sgstRate: taxVal / 2,
    igstRate: taxVal,
    includesTax: product.priceIncludesTax,
    supplyType: 'INTRA_STATE',
  });

  const handleDuplicate = async () => {
    try {
      const dup = await duplicateProduct(product.id);
      alert(`Product duplicated successfully as Draft (${dup.title})`);
      navigate(`/admin/products/edit/${dup.id}`);
    } catch (err: any) {
      alert(err.message || 'Failed to duplicate product');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to move this product to Trash?')) return;
    try {
      await softDeleteProduct(product.id);
      alert('Product moved to trash');
      navigate('/admin/products');
    } catch (err: any) {
      alert(err.message || 'Failed to delete product');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/products')}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                {product.productType}
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  product.status === 'ACTIVE'
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {product.status}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">{product.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/admin/products/edit/${product.id}`}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
          >
            <Edit className="w-4 h-4" /> Edit
          </Link>
          <button
            onClick={handleDuplicate}
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Copy className="w-4 h-4" /> Duplicate
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Product Overview
        </button>
        <button
          onClick={() => setActiveTab('media')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'media'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Media Gallery ({product.media?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('seo')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'seo'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          SEO & Meta
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Image & Highlights */}
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-white p-2">
              <img
                src={
                  product.mainImageUrl ||
                  'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80'
                }
                alt={product.title}
                className="w-full aspect-square object-cover rounded-lg"
              />
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase">Product Badges</h3>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {product.badges?.map((b) => (
                  <span
                    key={b.id}
                    className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-100 flex items-center gap-1"
                  >
                    <Tag className="w-3 h-3 text-indigo-600" /> {b.badge}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Center & Right Column: Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pricing Box */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 border-b pb-2">Pricing & GST Breakdown</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="text-xs text-slate-500">Selling Price</span>
                  <p className="text-xl font-extrabold text-slate-900">₹{product.sellingPrice}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">MRP</span>
                  <p className="text-sm font-semibold text-slate-400 line-through">₹{product.mrp || '--'}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Cost Price (COGS)</span>
                  <p className="text-sm font-semibold text-slate-700">₹{product.costPrice || '--'}</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs grid grid-cols-3 gap-2 mt-2">
                <div>
                  <span className="text-slate-500">Tax Rate:</span> <strong>{product.taxRateName || 'GST 18%'}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Base Price:</span> <strong>₹{taxInfo.baseAmount}</strong>
                </div>
                <div>
                  <span className="text-slate-500">GST Tax:</span> <strong>₹{taxInfo.taxAmount}</strong>
                </div>
              </div>
            </div>

            {/* Inventory & Dispatch */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 border-b pb-2">Inventory & Jaipur Dispatch</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500">Stock Quantity</span>
                  <p className="text-sm font-bold text-slate-900">{product.stockQuantity ?? 'Unlimited'}</p>
                </div>
                <div>
                  <span className="text-slate-500">Available Stock</span>
                  <p className="text-sm font-bold text-emerald-700">{product.availableStock}</p>
                </div>
                <div>
                  <span className="text-slate-500">Same-Day Delivery</span>
                  <p className="text-xs font-bold text-slate-900">
                    {product.sameDayEligible ? 'Eligible (90-Min)' : 'Not Eligible'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Prep Time</span>
                  <p className="text-xs font-bold text-slate-900">{product.preparationTimeMinutes || 30} mins</p>
                </div>
              </div>
            </div>

            {/* Specifications & General Info */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 border-b pb-2">Specifications & Identifiers</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500">SKU:</span> <span className="font-mono">{product.sku || '--'}</span>
                </div>
                <div>
                  <span className="text-slate-500">Barcode:</span>{' '}
                  <span className="font-mono">{product.barcode || '--'}</span>
                </div>
                <div>
                  <span className="text-slate-500">Brand:</span> <span>{product.brandName || '--'}</span>
                </div>
                <div>
                  <span className="text-slate-500">Primary Category:</span>{' '}
                  <span>{product.primaryCategoryName || '--'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Media Tab */}
      {activeTab === 'media' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
          <h2 className="text-base font-bold text-slate-900">Product Media Gallery</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {product.media?.map((m) => (
              <div key={m.id} className="rounded-xl border border-slate-200 overflow-hidden bg-slate-100 relative">
                <img src={m.url} alt={m.altText || ''} className="w-full aspect-square object-cover" />
                {m.isPrimary && (
                  <span className="absolute top-2 left-2 text-[10px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-md">
                    PRIMARY
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEO Tab */}
      {activeTab === 'seo' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
          <h2 className="text-base font-bold text-slate-900">SEO & Metadata Details</h2>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-500 font-semibold">URL Slug:</span>
              <p className="font-mono text-indigo-600 text-sm mt-0.5">{product.slug}</p>
            </div>
            <div>
              <span className="text-slate-500 font-semibold">SEO Title:</span>
              <p className="font-medium text-slate-900 mt-0.5">{product.seoTitle || '--'}</p>
            </div>
            <div>
              <span className="text-slate-500 font-semibold">Meta Description:</span>
              <p className="text-slate-700 mt-0.5">{product.seoDescription || '--'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
