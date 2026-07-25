import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Eye,
  RotateCcw,
  SlidersHorizontal,
  Tag,
  Palette,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  useProductAttributes,
  useUpdateAttributeStatus,
  useDeleteAttribute,
  useRestoreAttribute,
} from '../hooks/useProductAttributes';
import { AttributeFilterQuery, ProductAttributeType, ProductAttributeStatus } from '../types/productAttribute';
import { config } from '../../../config/env';

export const ProductAttributeListPage: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<AttributeFilterQuery>({
    page: 1,
    limit: 20,
    search: '',
    status: '',
    type: '',
    includeDeleted: false,
    sortBy: 'sortOrder',
    sortOrder: 'asc',
  });

  const { data, isLoading, isError, refetch } = useProductAttributes(filters);
  const updateStatusMutation = useUpdateAttributeStatus();
  const deleteMutation = useDeleteAttribute();
  const restoreMutation = useRestoreAttribute();

  const isMock = config.adminUseMockApi ?? config.useMockApi;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({ ...prev, status: e.target.value, page: 1 }));
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({ ...prev, type: e.target.value, page: 1 }));
  };

  const handleToggleDeleted = () => {
    setFilters((prev) => ({ ...prev, includeDeleted: !prev.includeDeleted, page: 1 }));
  };

  const handleStatusToggle = async (id: string, currentStatus: ProductAttributeStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await updateStatusMutation.mutateAsync({ id, status: nextStatus });
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to soft-delete the attribute "${name}"?`)) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleRestore = async (id: string) => {
    await restoreMutation.mutateAsync(id);
  };

  const getTypeBadge = (type: ProductAttributeType) => {
    switch (type) {
      case 'COLOUR_SWATCH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
            <Palette className="w-3 h-3" /> Colour Swatch
          </span>
        );
      case 'IMAGE_SWATCH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <ImageIcon className="w-3 h-3" /> Image Swatch
          </span>
        );
      case 'BUTTON':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <Tag className="w-3 h-3" /> Button
          </span>
        );
      case 'DROPDOWN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <SlidersHorizontal className="w-3 h-3" /> Dropdown
          </span>
        );
      case 'RADIO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
            <CheckCircle2 className="w-3 h-3" /> Radio
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-700 border border-stone-200">
            Text
          </span>
        );
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Product Attributes</h1>
            {isMock && (
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                Mock Mode
              </span>
            )}
          </div>
          <p className="text-sm text-stone-500 mt-1">
            Manage global product specifications, colour swatches, image swatches, and variation drivers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/attribute-groups"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 shadow-sm transition"
          >
            <Layers className="w-4 h-4 text-stone-500" /> Attribute Groups
          </Link>
          <Link
            to="/admin/product-attributes/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 shadow-sm transition"
          >
            <Plus className="w-4 h-4" /> Add Attribute
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm space-y-3 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
        <div className="flex-1 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.search}
              onChange={handleSearchChange}
              placeholder="Search by attribute name, slug, code..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filters.type}
              onChange={handleTypeChange}
              className="py-2 px-3 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-700"
            >
              <option value="">All Types</option>
              <option value="TEXT">Text</option>
              <option value="COLOUR_SWATCH">Colour Swatch</option>
              <option value="IMAGE_SWATCH">Image Swatch</option>
              <option value="BUTTON">Button</option>
              <option value="DROPDOWN">Dropdown</option>
              <option value="RADIO">Radio</option>
            </select>

            <select
              value={filters.status}
              onChange={handleStatusChange}
              className="py-2 px-3 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-700"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-stone-200">
          <button
            onClick={handleToggleDeleted}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition ${
              filters.includeDeleted
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            {filters.includeDeleted ? 'Showing Deleted' : 'Show Trash'}
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-stone-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-amber-500 border-t-transparent"></div>
            <p className="mt-2 text-sm font-medium">Loading attributes...</p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-red-600 bg-red-50">
            <p className="font-semibold">Failed to load product attributes</p>
            <button
              onClick={() => refetch()}
              className="mt-2 text-xs text-amber-700 underline font-medium"
            >
              Try Again
            </button>
          </div>
        ) : !data || data.attributes.length === 0 ? (
          <div className="p-12 text-center text-stone-500">
            <Sparkles className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-stone-800">No Product Attributes Found</h3>
            <p className="text-sm text-stone-500 mt-1 max-w-sm mx-auto">
              {filters.search
                ? 'No attributes match your current filter criteria.'
                : 'Get started by creating your first global product attribute.'}
            </p>
            <Link
              to="/admin/product-attributes/new"
              className="inline-flex items-center gap-2 px-4 py-2 mt-4 text-sm font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 shadow-sm transition"
            >
              <Plus className="w-4 h-4" /> Create Attribute
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-medium text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-4">Name & Code</th>
                  <th className="py-3.5 px-4">Display Type</th>
                  <th className="py-3.5 px-4">Values</th>
                  <th className="py-3.5 px-4">Behaviour</th>
                  <th className="py-3.5 px-4">Categories</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {data.attributes.map((attr) => (
                  <tr key={attr.id} className="hover:bg-stone-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-900">
                        <Link to={`/admin/product-attributes/${attr.id}`} className="hover:text-amber-600 transition">
                          {attr.name}
                        </Link>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                        <span className="font-mono">{attr.slug}</span>
                        {attr.code && (
                          <span className="bg-stone-100 text-stone-600 px-1.5 py-0.2 rounded font-mono text-[10px]">
                            {attr.code}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">{getTypeBadge(attr.type)}</td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-stone-100 text-stone-800 text-xs font-semibold rounded-full">
                          {attr.valueCount} values
                        </span>
                        {attr.type === 'COLOUR_SWATCH' && (
                          <div className="flex -space-x-1 overflow-hidden">
                            {attr.values.slice(0, 4).map((v) => (
                              <span
                                key={v.id}
                                className="inline-block w-4 h-4 rounded-full border border-white shadow-sm"
                                style={{ backgroundColor: v.colourHex || '#cccccc' }}
                                title={v.name}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {attr.isVariationAttribute && (
                          <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                            Variation Driver
                          </span>
                        )}
                        {attr.isFilterable && (
                          <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded">
                            Filterable
                          </span>
                        )}
                        {attr.isRequiredByDefault && (
                          <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded">
                            Required
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-stone-600">
                      {attr.assignedCategoryCount > 0 ? (
                        <span className="font-medium text-stone-800">{attr.assignedCategoryCount} Categories</span>
                      ) : (
                        <span className="text-stone-400">Global (All)</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {attr.deletedAt ? (
                        <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-full">
                          Deleted
                        </span>
                      ) : (
                        <button
                          onClick={() => handleStatusToggle(attr.id, attr.status)}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-full border transition ${
                            attr.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                          }`}
                        >
                          {attr.status}
                        </button>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/admin/product-attributes/${attr.id}`}
                          className="p-1.5 text-stone-500 hover:text-stone-900 rounded hover:bg-stone-100"
                          title="View Details & Combination Generator"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {!attr.deletedAt ? (
                          <>
                            <Link
                              to={`/admin/product-attributes/${attr.id}/edit`}
                              className="p-1.5 text-stone-500 hover:text-amber-600 rounded hover:bg-stone-100"
                              title="Edit Attribute"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(attr.id, attr.name)}
                              className="p-1.5 text-stone-500 hover:text-red-600 rounded hover:bg-stone-100"
                              title="Soft Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleRestore(attr.id)}
                            className="p-1.5 text-emerald-600 hover:text-emerald-800 rounded hover:bg-emerald-50"
                            title="Restore Attribute"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
