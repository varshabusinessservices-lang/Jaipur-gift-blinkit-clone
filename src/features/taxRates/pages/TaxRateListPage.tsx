import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  useTaxRates, 
  useSetDefaultTaxRate, 
  useUpdateTaxRateStatus, 
  useDeleteTaxRate 
} from '../hooks/useTaxRates';
import { TaxRateFilterState, TaxRateStatus, TaxType } from '../types/taxRate';
import { calculateTax } from '../../../utils/taxCalculator';
import { config } from '../../../config/env';
import { 
  Plus, Search, Filter, Trash2, Edit3, CheckCircle2, 
  XCircle, Star, RefreshCw, Percent, ChevronRight, AlertCircle, Calculator
} from 'lucide-react';

export function TaxRateListPage() {
  const [filters, setFilters] = useState<TaxRateFilterState>({
    search: '',
    status: '',
    taxType: '',
    page: 1,
    limit: 20,
    sortBy: 'sortOrder',
    sortOrder: 'asc',
  });

  const [calcAmount, setCalcAmount] = useState<number>(1000);
  const [selectedTaxForCalc, setSelectedTaxForCalc] = useState<string>('');

  const isMock = config.adminUseMockApi ?? config.useMockApi;

  const { data, isLoading, isError, error, refetch } = useTaxRates(filters);
  const setDefaultMutation = useSetDefaultTaxRate();
  const updateStatusMutation = useUpdateTaxRateStatus();
  const deleteMutation = useDeleteTaxRate();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({ ...prev, status: e.target.value as TaxRateStatus | '', page: 1 }));
  };

  const handleSetDefault = async (id: string, name: string) => {
    if (window.confirm(`Set "${name}" as the default store tax rate?`)) {
      await setDefaultMutation.mutateAsync(id);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: TaxRateStatus) => {
    const newStatus: TaxRateStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await updateStatusMutation.mutateAsync({ id, status: newStatus });
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to soft delete tax rate "${name}"?`)) {
      await deleteMutation.mutateAsync(id);
    }
  };

  // Find tax rate for live test calculation
  const activeTaxForCalc = data?.taxRates.find((t) => t.id === selectedTaxForCalc) || data?.taxRates.find((t) => t.isDefault) || data?.taxRates[0];

  const calcResult = activeTaxForCalc ? calculateTax({
    price: calcAmount,
    quantity: 1,
    totalRate: Number(activeTaxForCalc.totalRate),
    cgstRate: Number(activeTaxForCalc.cgstRate),
    sgstRate: Number(activeTaxForCalc.sgstRate),
    igstRate: Number(activeTaxForCalc.igstRate),
    cessRate: Number(activeTaxForCalc.cessRate),
    includesTax: activeTaxForCalc.priceIncludesTax,
    supplyType: 'INTRA_STATE',
  }) : null;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
            <span>Settings</span>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span className="text-slate-500">Tax Rates</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            Tax Rates & GST Slabs
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${
              isMock 
                ? 'bg-amber-50 text-amber-700 border-amber-200' 
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {isMock ? 'Mock API Mode' : 'Live MySQL API'}
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage Indian GST slabs, HSN/SAC classifications, CGST/SGST/IGST breakdowns, and inclusive/exclusive price rules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/tax-rates/trash"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Trash2 className="h-4 w-4 text-slate-500" />
            Trash
          </Link>
          <Link
            to="/admin/tax-rates/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-600/20"
          >
            <Plus className="h-4 w-4" />
            Add Tax Rate
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
              placeholder="Search by name, code, HSN, or SAC..."
              value={filters.search}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

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
            <span>Loading tax slabs...</span>
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-rose-600 bg-rose-50 flex flex-col items-center gap-2">
            <AlertCircle className="h-6 w-6" />
            <p className="font-medium">Error loading tax rates</p>
            <p className="text-sm text-rose-500">{(error as any)?.message || 'An unexpected error occurred'}</p>
          </div>
        ) : data?.taxRates.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <Percent className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">No tax rates found</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              No tax slabs configured yet. Create a standard GST rate to apply to products.
            </p>
            <Link
              to="/admin/tax-rates/new"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              Create First Tax Rate
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Tax Name & Code</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4 text-center">Total Rate</th>
                  <th className="py-3.5 px-4">CGST / SGST / IGST</th>
                  <th className="py-3.5 px-4">HSN / SAC</th>
                  <th className="py-3.5 px-4 text-center">Price Rules</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {data?.taxRates.map((rate) => (
                  <tr key={rate.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 flex items-center gap-2">
                          {rate.name}
                          {rate.isDefault && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 uppercase">
                              <Star className="h-2.5 w-2.5 fill-amber-500" /> Default
                            </span>
                          )}
                        </span>
                        <span className="text-xs font-mono text-slate-400">{rate.code}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                      {rate.taxType}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-900 text-base">
                      {Number(rate.totalRate).toFixed(2)}%
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono">
                      <div className="flex flex-col gap-0.5 text-slate-500">
                        <span>CGST: {Number(rate.cgstRate).toFixed(2)}%</span>
                        <span>SGST: {Number(rate.sgstRate).toFixed(2)}%</span>
                        <span>IGST: {Number(rate.igstRate).toFixed(2)}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-700">
                      <div>HSN: {rate.hsnCode || '—'}</div>
                      <div>SAC: {rate.sacCode || '—'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        rate.priceIncludesTax
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}>
                        {rate.priceIncludesTax ? 'Inclusive' : 'Exclusive'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        rate.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          rate.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'
                        }`} />
                        {rate.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {!rate.isDefault && rate.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleSetDefault(rate.id, rate.name)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Set as Default Tax Rate"
                          >
                            <Star className="h-4 w-4" />
                          </button>
                        )}
                        <Link
                          to={`/admin/tax-rates/${rate.id}/edit`}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Tax Rate"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleToggleStatus(rate.id, rate.status)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title={rate.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        >
                          {rate.status === 'ACTIVE' ? (
                            <XCircle className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(rate.id, rate.name)}
                          disabled={rate.isDefault}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                          title={rate.isDefault ? 'Cannot delete default tax rate' : 'Soft Delete'}
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

      {/* Tax Calculation Test Widget */}
      {activeTaxForCalc && calcResult && (
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-xl border border-indigo-900 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-indigo-800/60 pb-3">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Calculator className="h-5 w-5 text-indigo-400" />
              Live GST Tax Breakdown Tester
            </h3>
            <span className="text-xs bg-indigo-900/80 text-indigo-200 border border-indigo-700 px-2.5 py-1 rounded-full font-mono">
              Testing: {activeTaxForCalc.name} ({activeTaxForCalc.priceIncludesTax ? 'Inclusive' : 'Exclusive'})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Select Tax Slab</label>
              <select
                value={activeTaxForCalc.id}
                onChange={(e) => setSelectedTaxForCalc(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {data?.taxRates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({Number(t.totalRate).toFixed(1)}%)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Base Product Price (₹)</label>
              <input
                type="number"
                min={0}
                value={calcAmount}
                onChange={(e) => setCalcAmount(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="col-span-2 grid grid-cols-3 gap-2 text-center bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 text-xs">
              <div>
                <span className="text-slate-400 block">Base Price Excl. Tax</span>
                <span className="font-bold text-slate-200 text-sm font-mono">₹{calcResult.baseAmount}</span>
              </div>
              <div>
                <span className="text-slate-400 block">GST Tax Amount</span>
                <span className="font-bold text-amber-400 text-sm font-mono">₹{calcResult.taxAmount}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Final Order Price</span>
                <span className="font-bold text-emerald-400 text-sm font-mono">₹{calcResult.totalAmount}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
