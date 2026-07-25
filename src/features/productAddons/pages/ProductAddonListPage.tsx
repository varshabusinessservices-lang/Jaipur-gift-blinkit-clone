import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Plus, Search, Filter, Trash2, Copy, Edit, Eye, MoreVertical,
  Gift, CheckCircle, AlertCircle, RefreshCw, Tag, Layers, PackageCheck, Layers3
} from 'lucide-react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { StatCard } from '../../../components/common/StatCard';
import {
  useProductAddons,
  useUpdateProductAddonStatus,
  useDeleteProductAddon,
  useDuplicateProductAddon,
} from '../hooks/useProductAddons';
import { ProductAddonInputType, ProductAddonPricingType } from '../types/productAddon';

export function ProductAddonListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [inputTypeFilter, setInputTypeFilter] = useState('');
  const [pricingTypeFilter, setPricingTypeFilter] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const { data, isLoading, refetch } = useProductAddons({
    search: search || undefined,
    status: statusFilter || undefined,
    inputType: inputTypeFilter || undefined,
    pricingType: pricingTypeFilter || undefined,
    includeDeleted: false,
  });

  const addons = data?.data || [];
  const meta = data?.meta;

  const updateStatus = useUpdateProductAddonStatus();
  const deleteAddon = useDeleteProductAddon();
  const duplicateAddon = useDuplicateProductAddon();

  // Summary Metrics
  const totalCount = meta?.total || addons.length;
  const activeCount = addons.filter((a) => a.status === 'ACTIVE').length;
  const globalCount = addons.filter((a) => a.assignments?.some((asg) => asg.assignmentType === 'GLOBAL')).length;
  const personalisedCount = addons.filter((a) =>
    a.assignments?.some((asg) => asg.assignmentType === 'ALL_PERSONALISED_PRODUCTS')
  ).length;

  const formatPriceLabel = (addon: any) => {
    if (addon.pricingType === 'FREE') return <span className="font-semibold text-emerald-600">Free (₹0.00)</span>;
    if (addon.pricingType === 'FIXED') return <span className="font-semibold text-slate-900">₹{Number(addon.fixedPrice || 0).toFixed(2)}</span>;
    if (addon.pricingType === 'PERCENTAGE') return <span className="font-semibold text-indigo-600">{addon.percentageRate}% of Product</span>;
    if (addon.pricingType === 'PER_QUANTITY') return <span className="font-semibold text-amber-600">₹{Number(addon.fixedPrice || 0).toFixed(2)} / unit</span>;
    if (addon.pricingType === 'CUSTOM_AMOUNT') return <span className="font-semibold text-purple-600">Custom (₹{addon.minimumAmount} - ₹{addon.maximumAmount || '∞'})</span>;
    return 'N/A';
  };

  const getInputTypeBadge = (type: ProductAddonInputType) => {
    const styles: Record<string, string> = {
      CHECKBOX: 'bg-blue-50 text-blue-700 border-blue-200',
      RADIO: 'bg-purple-50 text-purple-700 border-purple-200',
      DROPDOWN: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      QUANTITY: 'bg-amber-50 text-amber-700 border-amber-200',
      TEXT: 'bg-slate-100 text-slate-700 border-slate-200',
      TEXTAREA: 'bg-slate-100 text-slate-700 border-slate-200',
      SINGLE_IMAGE: 'bg-rose-50 text-rose-700 border-rose-200',
      MULTI_IMAGE: 'bg-pink-50 text-pink-700 border-pink-200',
      NUMBER: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${styles[type] || 'bg-gray-100 text-gray-700'}`}>
        {type}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Product Add-ons & Optional Extras"
        description="Manage reusable global, category, product, and personalised add-ons, gift options, and design upgrades."
        actions={
          <div className="flex items-center gap-3">
            <Link
              to="/admin/product-addons/trash"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Trash2 className="h-4 w-4 text-slate-500" />
              Trash
            </Link>
            <Link
              to="/admin/addon-groups"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors shadow-sm"
            >
              <Layers3 className="h-4 w-4" />
              Add-on Groups
            </Link>
            <Link
              to="/admin/product-addons/new"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Create Add-on
            </Link>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Add-ons"
          value={totalCount}
          icon={<Gift className="h-5 w-5 text-indigo-600" />}
          trend={{ value: "2", label: "new this month", isPositive: true }}
        />
        <StatCard
          title="Active Add-ons"
          value={activeCount}
          icon={<CheckCircle className="h-5 w-5 text-emerald-600" />}
        />
        <StatCard
          title="Global Catalog Add-ons"
          value={globalCount}
          icon={<PackageCheck className="h-5 w-5 text-blue-600" />}
        />
        <StatCard
          title="Personalised Upgrades"
          value={personalisedCount}
          icon={<Tag className="h-5 w-5 text-purple-600" />}
        />
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by add-on name, slug, or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="ARCHIVED">Archived</option>
            <option value="SCHEDULED">Scheduled</option>
          </select>

          {/* Input Type Filter */}
          <select
            value={inputTypeFilter}
            onChange={(e) => setInputTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Input Types</option>
            <option value="CHECKBOX">Checkbox</option>
            <option value="RADIO">Radio Choices</option>
            <option value="DROPDOWN">Dropdown</option>
            <option value="QUANTITY">Quantity Stepper</option>
            <option value="TEXT">Short Text</option>
            <option value="TEXTAREA">Textarea Message</option>
            <option value="SINGLE_IMAGE">Photo Upload</option>
            <option value="NUMBER">Custom Number / Tip</option>
          </select>

          {/* Pricing Type Filter */}
          <select
            value={pricingTypeFilter}
            onChange={(e) => setPricingTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Pricing Models</option>
            <option value="FIXED">Fixed Amount</option>
            <option value="PERCENTAGE">Percentage</option>
            <option value="FREE">Free</option>
            <option value="PER_QUANTITY">Per Quantity</option>
            <option value="CUSTOM_AMOUNT">Custom Amount</option>
          </select>

          <button
            onClick={() => refetch()}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            title="Refresh List"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Add-ons Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-2">
            <RefreshCw className="h-6 w-6 animate-spin text-indigo-600" />
            <p className="text-sm font-medium">Loading product add-ons...</p>
          </div>
        ) : addons.length === 0 ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3">
            <Gift className="h-10 w-10 text-slate-300" />
            <div>
              <p className="text-base font-semibold text-slate-800">No add-ons found</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {search || statusFilter || inputTypeFilter ? 'Try clearing your active filters.' : 'Create your first add-on to offer gift packing, custom messages, or design proofs.'}
              </p>
            </div>
            <Link
              to="/admin/product-addons/new"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              Create First Add-on
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Add-on Name & Details</th>
                  <th className="py-3 px-4">Input Type</th>
                  <th className="py-3 px-4">Pricing Model</th>
                  <th className="py-3 px-4">Stock Status</th>
                  <th className="py-3 px-4">Assignments</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {addons.map((addon) => (
                  <tr key={addon.id} className="hover:bg-slate-50/60 transition-colors group">
                    {/* Name & Details */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <Link
                          to={`/admin/product-addons/${addon.id}`}
                          className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors flex items-center gap-1.5"
                        >
                          {addon.name}
                          {addon.isRequired && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              Required
                            </span>
                          )}
                        </Link>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.2 rounded">{addon.code || addon.slug}</span>
                          {addon.customerLabel && (
                            <span className="truncate max-w-xs text-slate-400">"{addon.customerLabel}"</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Input Type */}
                    <td className="py-3.5 px-4">{getInputTypeBadge(addon.inputType)}</td>

                    {/* Pricing */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        {formatPriceLabel(addon)}
                        {addon.options && addon.options.length > 0 && (
                          <span className="text-[11px] text-slate-400">{addon.options.length} options configured</span>
                        )}
                      </div>
                    </td>

                    {/* Stock Status */}
                    <td className="py-3.5 px-4">
                      {addon.manageStock ? (
                        addon.stockQuantity !== null && addon.stockQuantity > (addon.lowStockThreshold || 5) ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            In Stock ({addon.stockQuantity})
                          </span>
                        ) : addon.stockQuantity !== null && addon.stockQuantity > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            Low Stock ({addon.stockQuantity})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                            Out of Stock (0)
                          </span>
                        )
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Unmanaged</span>
                      )}
                    </td>

                    {/* Assignments */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {addon.assignments && addon.assignments.length > 0 ? (
                          addon.assignments.map((asg) => (
                            <span
                              key={asg.id}
                              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                asg.assignmentType === 'GLOBAL'
                                  ? 'bg-blue-100 text-blue-800'
                                  : asg.assignmentType === 'ALL_PERSONALISED_PRODUCTS'
                                  ? 'bg-purple-100 text-purple-800'
                                  : asg.assignmentType === 'CATEGORY'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {asg.assignmentType === 'ALL_PERSONALISED_PRODUCTS'
                                ? 'Personalised'
                                : asg.assignmentType}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">Unassigned</span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <StatusBadge
                        status={addon.status === 'ACTIVE' ? 'success' : addon.status === 'SCHEDULED' ? 'info' : 'neutral'}
                        label={addon.status === 'ACTIVE' ? 'Active' : addon.status === 'SCHEDULED' ? 'Scheduled' : 'Inactive'}
                      />
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right relative">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/admin/product-addons/${addon.id}`}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                          title="View & Test Preview"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/admin/product-addons/${addon.id}/edit`}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                          title="Edit Add-on"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => duplicateAddon.mutate(addon.id)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                          title="Duplicate Add-on"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteAddon.mutate(addon.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Move to Trash"
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
      </div>
    </div>
  );
}
