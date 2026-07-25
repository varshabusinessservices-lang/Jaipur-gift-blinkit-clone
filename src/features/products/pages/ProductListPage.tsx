import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useProductList, useProductActions } from '../hooks/useProducts';
import { ProductStatus, ProductVisibility, ProductType } from '../types/product';
import {
  Plus,
  Search,
  Filter,
  Package,
  Layers,
  Gift,
  Sparkles,
  MoreVertical,
  Copy,
  Edit,
  Eye,
  Trash2,
  Trash,
  RotateCcw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Sparkle,
} from 'lucide-react';

export function ProductListPage() {
  const navigate = useNavigate();
  const { products, pagination, loading, error, query, setQuery, refetch } = useProductList({
    page: 1,
    limit: 10,
    includeDeleted: false,
  });

  const { updateStatus, updateVisibility, duplicateProduct, softDeleteProduct } = useProductActions();

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const handleStatusChange = async (id: string, newStatus: ProductStatus) => {
    try {
      await updateStatus(id, newStatus);
      refetch();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const dup = await duplicateProduct(id);
      alert(`Product duplicated successfully as Draft (${dup.title})`);
      refetch();
    } catch (err: any) {
      alert(err.message || 'Failed to duplicate product');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to move this product to the Trash?')) return;
    try {
      await softDeleteProduct(id);
      refetch();
    } catch (err: any) {
      alert(err.message || 'Failed to move product to trash');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Product Catalog Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage variable products, personalised gifting items, gift hampers & instant Jaipur inventory.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/products/trash"
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Trash className="w-4 h-4 text-slate-500" /> Trash Bin
          </Link>
          <Link
            to="/admin/products/create"
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by product title, SKU, internal code..."
              value={query.search || ''}
              onChange={(e) => setQuery((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={query.productType || ''}
              onChange={(e) => setQuery((prev) => ({ ...prev, productType: e.target.value, page: 1 }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Product Types</option>
              <option value="SIMPLE">Simple Product</option>
              <option value="VARIABLE">Variable Product</option>
              <option value="COMBO">Combo Product</option>
              <option value="GIFT_SET">Gift Set / Hamper</option>
              <option value="PERSONALISED">Personalised Product</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={query.status || ''}
              onChange={(e) => setQuery((prev) => ({ ...prev, status: e.target.value, page: 1 }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active (Published)</option>
              <option value="DRAFT">Draft</option>
              <option value="INACTIVE">Inactive</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </div>

          {/* Stock Filter */}
          <div>
            <select
              value={query.stockStatus || 'ALL'}
              onChange={(e) => setQuery((prev) => ({ ...prev, stockStatus: e.target.value as any, page: 1 }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Stock Levels</option>
              <option value="IN_STOCK">In Stock</option>
              <option value="LOW_STOCK">Low Stock</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">Loading products catalog...</div>
        ) : error ? (
          <div className="p-12 text-center text-red-600 text-sm">{error}</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Package className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No products found matching filters.</p>
            <button
              onClick={() => setQuery({ page: 1, limit: 10 })}
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Product Info</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Primary Category</th>
                  <th className="py-3.5 px-4 text-right">Selling Price</th>
                  <th className="py-3.5 px-4 text-center">Stock</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {products.map((product) => {
                  return (
                    <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Product Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              product.mainImageUrl ||
                              'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80'
                            }
                            alt={product.title}
                            className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <Link
                              to={`/admin/products/${product.id}`}
                              className="font-bold text-slate-900 hover:text-indigo-600 line-clamp-1"
                            >
                              {product.title}
                            </Link>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                              {product.sku && <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">{product.sku}</span>}
                              {product.isPersonalised && (
                                <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" /> Personalised
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Product Type */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-800">
                          {product.productType}
                        </span>
                      </td>

                      {/* Primary Category */}
                      <td className="py-3.5 px-4 text-xs text-slate-600 font-medium">
                        {product.primaryCategoryName || 'Unassigned'}
                      </td>

                      {/* Pricing */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="text-sm font-bold text-slate-900">
                          ₹{product.sellingPrice || '0.00'}
                        </div>
                        {product.mrp && parseFloat(product.mrp) > parseFloat(product.sellingPrice || '0') && (
                          <div className="text-xs text-slate-400 line-through">₹{product.mrp}</div>
                        )}
                      </td>

                      {/* Stock Level */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                            product.stockStatus === 'IN_STOCK'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : product.stockStatus === 'LOW_STOCK'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-red-50 text-red-800 border border-red-200'
                          }`}
                        >
                          {product.manageStock ? `${product.stockQuantity || 0} left` : 'In Stock'}
                        </span>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <select
                          value={product.status}
                          onChange={(e) => handleStatusChange(product.id, e.target.value as ProductStatus)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                            product.status === 'ACTIVE'
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                              : product.status === 'DRAFT'
                              ? 'bg-slate-100 border-slate-300 text-slate-700'
                              : 'bg-amber-50 border-amber-300 text-amber-800'
                          }`}
                        >
                          <option value="DRAFT">DRAFT</option>
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="INACTIVE">INACTIVE</option>
                          <option value="OUT_OF_STOCK">OUT OF STOCK</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {product.productType === 'VARIABLE' && (
                            <Link
                              to={`/admin/products/${product.id}/variations`}
                              title="Manage Product Variations"
                              className="px-2 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-colors flex items-center space-x-1"
                            >
                              <Layers className="w-3.5 h-3.5" />
                              <span>Variations</span>
                            </Link>
                          )}
                          <Link
                            to={`/admin/products/${product.id}`}
                            title="View Detail"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/admin/products/edit/${product.id}`}
                            title="Edit Product"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDuplicate(product.id)}
                            title="Duplicate as Draft"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(product.id)}
                            title="Soft Delete"
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span>
              Showing Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong> ({pagination.total} Total Products)
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setQuery((prev) => ({ ...prev, page: prev.page! - 1 }))}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-md font-medium text-slate-700 disabled:opacity-50 hover:bg-slate-100"
              >
                Previous
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setQuery((prev) => ({ ...prev, page: prev.page! + 1 }))}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-md font-medium text-slate-700 disabled:opacity-50 hover:bg-slate-100"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
