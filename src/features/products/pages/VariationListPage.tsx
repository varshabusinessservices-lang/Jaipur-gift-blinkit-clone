import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Layers,
  Plus,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Star,
  Edit2,
  Trash2,
  RotateCcw,
  RefreshCw,
  ChevronRight,
  ArrowLeft,
  Package,
  SlidersHorizontal,
  ShieldAlert,
} from 'lucide-react';
import { useProductDetail } from '../hooks/useProducts';
import {
  useProductVariationsList,
  useSetDefaultVariation,
  useUpdateVariationStatus,
  useDeleteVariation,
  useRestoreVariation,
  useBulkUpdateVariations,
} from '../hooks/useProductVariations';
import { ProductVariationDetail, ProductVariationFilterQuery } from '../types/productVariation';
import { VariationBulkEditModal } from '../components/VariationBulkEditModal';

export const VariationListPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  // Filters state
  const [filter, setFilter] = useState<ProductVariationFilterQuery>({
    page: 1,
    limit: 50,
    search: '',
    status: '',
    stockStatus: 'ALL',
    includeDeleted: false,
    sortBy: 'sortOrder',
    sortOrder: 'asc',
  });

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  // Queries & Mutations
  const { product, loading: productLoading } = useProductDetail(productId || '');
  const { data: variationsResult, isLoading: listLoading, refetch } = useProductVariationsList(
    productId || '',
    filter
  );

  const setDefaultMutation = useSetDefaultVariation(productId || '');
  const updateStatusMutation = useUpdateVariationStatus(productId || '');
  const deleteMutation = useDeleteVariation(productId || '');
  const restoreMutation = useRestoreVariation(productId || '');
  const bulkUpdateMutation = useBulkUpdateVariations(productId || '');

  const variations = variationsResult?.data || [];
  const meta = variationsResult?.meta || { total: 0, page: 1, limit: 50, totalPages: 1 };

  // Calculate quick stats
  const totalCount = meta.total || 0;
  const activeCount = variations.filter((v: ProductVariationDetail) => v.status === 'ACTIVE').length;
  const outOfStockCount = variations.filter(
    (v: ProductVariationDetail) => v.stockStatus === 'OUT_OF_STOCK' || v.status === 'OUT_OF_STOCK'
  ).length;
  const defaultVar = variations.find((v: ProductVariationDetail) => v.isDefault);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(variations.map((v: ProductVariationDetail) => v.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleSetDefault = async (variationId: string) => {
    try {
      await setDefaultMutation.mutateAsync(variationId);
    } catch (err: any) {
      alert(err.message || 'Failed to set default variation');
    }
  };

  const handleToggleStatus = async (variation: ProductVariationDetail) => {
    const nextStatus = variation.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await updateStatusMutation.mutateAsync({ variationId: variation.id, status: nextStatus });
    } catch (err: any) {
      alert(err.message || 'Failed to update variation status');
    }
  };

  const handleDelete = async (variationId: string) => {
    if (!window.confirm('Are you sure you want to soft delete this variation?')) return;
    try {
      await deleteMutation.mutateAsync(variationId);
    } catch (err: any) {
      alert(err.message || 'Failed to delete variation');
    }
  };

  const handleRestore = async (variationId: string) => {
    try {
      await restoreMutation.mutateAsync(variationId);
    } catch (err: any) {
      alert(err.message || 'Failed to restore variation');
    }
  };

  const handleApplyBulkUpdate = async (input: any) => {
    await bulkUpdateMutation.mutateAsync({
      ...input,
      variationIds: selectedIds,
    });
    setSelectedIds([]);
  };

  if (productLoading) {
    return <div className="p-8 text-center text-gray-500 font-medium">Loading product...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb & Top Bar */}
      <div>
        <nav className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
          <Link to="/admin/products" className="hover:text-gray-900 transition-colors">
            Products
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-900 font-medium truncate max-w-[250px]">{product?.title}</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-indigo-600 font-medium">Manage Variations</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/admin/products')}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span>Product Variations</span>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-gray-100 text-gray-700 rounded-full border border-gray-200">
                  {product?.sku || 'VARIABLE'}
                </span>
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Manage SKUs, prices, stock, images, and combination keys for <span className="font-semibold text-gray-800">{product?.title}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigate(`/admin/products/${productId}/variations/generate`)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-all flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Variations</span>
            </button>

            <button
              onClick={() => navigate(`/admin/products/${productId}/variations/new`)}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-semibold text-sm rounded-lg hover:bg-gray-50 shadow-sm transition-all flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Manually</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-gray-500">Total Variations</span>
            <p className="text-xl font-bold text-gray-900">{totalCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-gray-500">Active Published</span>
            <p className="text-xl font-bold text-gray-900">{activeCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-3">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-gray-500">Out of Stock</span>
            <p className="text-xl font-bold text-gray-900">{outOfStockCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <span className="text-xs font-medium text-gray-500">Default Variation</span>
            <p className="text-sm font-bold text-gray-900 truncate max-w-[140px]">
              {defaultVar ? defaultVar.title : 'None Set'}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, SKU or barcode..."
              value={filter.search || ''}
              onChange={(e) => setFilter((p) => ({ ...p, search: e.target.value, page: 1 }))}
              className="w-full pl-9 pr-3.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-3 flex-wrap gap-y-2">
            {/* Status filter */}
            <select
              value={filter.status || ''}
              onChange={(e) => setFilter((p) => ({ ...p, status: e.target.value, page: 1 }))}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>

            {/* Stock status filter */}
            <select
              value={filter.stockStatus || 'ALL'}
              onChange={(e) => setFilter((p) => ({ ...p, stockStatus: e.target.value as any, page: 1 }))}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700"
            >
              <option value="ALL">All Stock Levels</option>
              <option value="IN_STOCK">IN STOCK</option>
              <option value="LOW_STOCK">LOW STOCK</option>
              <option value="OUT_OF_STOCK">OUT OF STOCK</option>
            </select>

            {/* Include Deleted Toggle */}
            <label className="flex items-center space-x-1.5 text-xs text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={filter.includeDeleted}
                onChange={(e) => setFilter((p) => ({ ...p, includeDeleted: e.target.checked, page: 1 }))}
                className="w-3.5 h-3.5 text-indigo-600 rounded border-gray-300"
              />
              <span>Show Deleted</span>
            </label>

            <button
              onClick={() => refetch()}
              className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
              title="Refresh List"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Selected Items Batch Action Bar */}
        {selectedIds.length > 0 && (
          <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100 flex items-center justify-between text-xs text-indigo-900 font-medium">
            <span className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              <span>{selectedIds.length} variation{selectedIds.length > 1 ? 's' : ''} selected</span>
            </span>
            <button
              onClick={() => setIsBulkModalOpen(true)}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700 transition-colors"
            >
              Bulk Actions Modal
            </button>
          </div>
        )}
      </div>

      {/* Variations Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-500">
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === variations.length && variations.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                  />
                </th>
                <th className="p-4">Variation & Values</th>
                <th className="p-4">SKU / Barcode</th>
                <th className="p-4">Selling Price (MRP)</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Default</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {listLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500 font-medium">
                    Loading product variations...
                  </td>
                </tr>
              ) : variations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center">
                    <div className="max-w-sm mx-auto space-y-3">
                      <Layers className="w-10 h-10 text-gray-300 mx-auto" />
                      <h3 className="text-base font-semibold text-gray-900">No Variations Found</h3>
                      <p className="text-xs text-gray-500">
                        Generate variations automatically or add a manual variation to get started.
                      </p>
                      <button
                        onClick={() => navigate(`/admin/products/${productId}/variations/generate`)}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                        <span>Generate Combinations</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                variations.map((v: ProductVariationDetail) => (
                  <tr
                    key={v.id}
                    className={`hover:bg-gray-50/70 transition-colors ${
                      v.deletedAt ? 'opacity-60 bg-gray-50/40' : ''
                    }`}
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(v.id)}
                        onChange={() => handleSelectOne(v.id)}
                        className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                      />
                    </td>

                    {/* Title & Attribute Badges */}
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="font-bold text-gray-900 flex items-center space-x-2">
                          <span>{v.title}</span>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {(v.values || []).map((val) => (
                            <span
                              key={val.id}
                              className="px-2 py-0.5 text-[11px] font-semibold bg-gray-100 text-gray-700 rounded border border-gray-200"
                            >
                              {val.attributeName}: <span className="text-indigo-600">{val.valueName}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>

                    {/* SKU & Barcode */}
                    <td className="p-4 font-mono text-xs text-gray-600">
                      <div>{v.sku || <span className="text-gray-400">No SKU</span>}</div>
                      {v.barcode && <div className="text-[10px] text-gray-400">{v.barcode}</div>}
                    </td>

                    {/* Pricing */}
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <div className="font-bold text-gray-900">
                          ₹{v.effectiveSellingPrice || v.sellingPrice || '0.00'}
                        </div>
                        {v.effectiveMrp && (
                          <div className="text-xs text-gray-400 line-through">₹{v.effectiveMrp}</div>
                        )}
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                          {v.priceSource}
                        </span>
                      </div>
                    </td>

                    {/* Stock */}
                    <td className="p-4">
                      <div className="space-y-1">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                            v.stockStatus === 'IN_STOCK'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : v.stockStatus === 'LOW_STOCK'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {v.stockStatus === 'IN_STOCK' ? 'In Stock' : v.stockStatus === 'LOW_STOCK' ? 'Low Stock' : 'Out of Stock'}
                        </span>
                        <div className="text-xs text-gray-500 font-medium">
                          {v.availableStock !== null ? `${v.availableStock} available` : 'Unmanaged'}
                        </div>
                      </div>
                    </td>

                    {/* Default Button */}
                    <td className="p-4">
                      {v.isDefault ? (
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full flex items-center space-x-1 w-max">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span>Default</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSetDefault(v.id)}
                          disabled={v.status === 'INACTIVE' || !!v.deletedAt}
                          className="text-xs font-semibold text-gray-500 hover:text-indigo-600 disabled:opacity-30 transition-colors"
                        >
                          Set Default
                        </button>
                      )}
                    </td>

                    {/* Status Toggle */}
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleStatus(v)}
                        disabled={!!v.deletedAt}
                        className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
                          v.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {v.status}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {v.deletedAt ? (
                          <button
                            onClick={() => handleRestore(v.id)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Restore Variation"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => navigate(`/admin/products/${productId}/variations/${v.id}/edit`)}
                              className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Edit Variation"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(v.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Soft Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Operations Modal */}
      <VariationBulkEditModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        selectedCount={selectedIds.length}
        onApplyBulkUpdate={handleApplyBulkUpdate}
        isLoading={bulkUpdateMutation.isPending}
      />
    </div>
  );
};
