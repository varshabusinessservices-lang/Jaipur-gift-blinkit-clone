import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  useBrands, 
  useUpdateBrandStatus, 
  useUpdateBrandFeatured, 
  useDeleteBrand,
  useDuplicateBrand 
} from '../hooks/useBrands';
import { BrandFilterState, BrandStatus } from '../types/brand';
import { config } from '../../../config/env';
import { 
  Plus, Search, Filter, Trash2, Eye, Edit3, Star, CheckCircle2, 
  XCircle, Copy, RefreshCw, Tag, ChevronRight, AlertCircle, ArrowUpDown
} from 'lucide-react';

export function BrandListPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<BrandFilterState>({
    search: '',
    status: '',
    featured: '',
    page: 1,
    limit: 20,
    sortBy: 'sortOrder',
    sortOrder: 'asc',
  });

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const isMock = config.adminUseMockApi ?? config.useMockApi;

  const { data, isLoading, isError, error, refetch } = useBrands(filters);
  const updateStatusMutation = useUpdateBrandStatus();
  const updateFeaturedMutation = useUpdateBrandFeatured();
  const deleteMutation = useDeleteBrand();
  const duplicateMutation = useDuplicateBrand();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({ ...prev, status: e.target.value as BrandStatus | '', page: 1 }));
  };

  const handleFeaturedFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({ ...prev, featured: e.target.value, page: 1 }));
  };

  const handleToggleStatus = async (id: string, currentStatus: BrandStatus) => {
    const newStatus: BrandStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await updateStatusMutation.mutateAsync({ id, status: newStatus });
  };

  const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
    await updateFeaturedMutation.mutateAsync({ id, isFeatured: !currentFeatured });
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to soft delete brand "${name}"?`)) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleDuplicate = async (id: string) => {
    await duplicateMutation.mutateAsync(id);
  };

  const toggleSelectAll = () => {
    if (!data?.brands) return;
    if (selectedIds.length === data.brands.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.brands.map((b) => b.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
            <span>Catalog Management</span>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span className="text-slate-500">Brands</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            Brands Directory
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${
              isMock 
                ? 'bg-amber-50 text-amber-700 border-amber-200' 
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {isMock ? 'Mock API Mode' : 'Live MySQL API'}
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage in-house and third-party product brand identities, logos, and SEO metadata.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/brands/trash"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Trash2 className="h-4 w-4 text-slate-500" />
            Trash
          </Link>
          <Link
            to="/admin/brands/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-600/20"
          >
            <Plus className="h-4 w-4" />
            Add New Brand
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1">
          <div className="relative flex-1 md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, code, slug, or description..."
              value={filters.search}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filters.status}
              onChange={handleStatusFilterChange}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="ARCHIVED">Archived</option>
            </select>

            <select
              value={filters.featured}
              onChange={handleFeaturedFilterChange}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="">All Featured</option>
              <option value="true">Featured Only</option>
              <option value="false">Non-Featured Only</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => refetch()}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          title="Refresh List"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3">
            <RefreshCw className="h-6 w-6 animate-spin text-indigo-600" />
            <span>Loading brands directory...</span>
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-rose-600 bg-rose-50 border-b border-rose-100 flex flex-col items-center gap-2">
            <AlertCircle className="h-6 w-6" />
            <p className="font-medium">Error loading brands</p>
            <p className="text-sm text-rose-500">{(error as any)?.message || 'An unexpected error occurred'}</p>
          </div>
        ) : data?.brands.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <Tag className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">No brands found</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              {filters.search || filters.status || filters.featured
                ? 'No brands matched your filter criteria. Try adjusting your search query.'
                : 'Get started by creating your first product brand.'}
            </p>
            <Link
              to="/admin/brands/new"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create First Brand
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === data?.brands.length && data?.brands.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                  <th className="py-3.5 px-4">Brand</th>
                  <th className="py-3.5 px-4">Code / Slug</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-center">Featured</th>
                  <th className="py-3.5 px-4 text-center">Products</th>
                  <th className="py-3.5 px-4 text-center">Order</th>
                  <th className="py-3.5 px-4">Updated</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {data?.brands.map((brand) => (
                  <tr key={brand.id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(brand.id)}
                        onChange={() => toggleSelectOne(brand.id)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {brand.logoUrl ? (
                          <img
                            src={brand.logoUrl}
                            alt={brand.logoAltText || brand.name}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 bg-slate-100 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold text-base flex items-center justify-center flex-shrink-0">
                            {brand.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <Link
                            to={`/admin/brands/${brand.id}`}
                            className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1"
                          >
                            {brand.name}
                          </Link>
                          {brand.shortDescription && (
                            <p className="text-xs text-slate-400 line-clamp-1">{brand.shortDescription}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col font-mono text-xs">
                        <span className="text-slate-800">{brand.code || '—'}</span>
                        <span className="text-slate-400">{brand.slug}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        brand.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : brand.status === 'INACTIVE'
                          ? 'bg-slate-100 text-slate-600 border border-slate-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          brand.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'
                        }`} />
                        {brand.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleFeatured(brand.id, brand.isFeatured)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          brand.isFeatured
                            ? 'text-amber-500 hover:bg-amber-50'
                            : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'
                        }`}
                        title={brand.isFeatured ? 'Remove Featured' : 'Mark as Featured'}
                      >
                        <Star className={`h-4 w-4 ${brand.isFeatured ? 'fill-amber-400' : ''}`} />
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-center text-xs text-slate-400 font-mono">
                      {brand.productCount !== null ? brand.productCount : 'Deferred'}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-700">
                      {brand.sortOrder}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {new Date(brand.updatedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/admin/brands/${brand.id}`}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="View Brand Detail"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/admin/brands/${brand.id}/edit`}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Brand"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleToggleStatus(brand.id, brand.status)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title={brand.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        >
                          {brand.status === 'ACTIVE' ? (
                            <XCircle className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDuplicate(brand.id)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Duplicate Brand"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(brand.id, brand.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Soft Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {data && data.totalPages > 1 && (
          <div className="p-4 bg-slate-50/50 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500">
            <span>
              Showing page {data.page} of {data.totalPages} ({data.total} total items)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={data.page <= 1}
                onClick={() => setFilters((prev) => ({ ...prev, page: prev.page! - 1 }))}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 text-xs font-medium"
              >
                Previous
              </button>
              <button
                disabled={data.page >= data.totalPages}
                onClick={() => setFilters((prev) => ({ ...prev, page: prev.page! + 1 }))}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 text-xs font-medium"
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
