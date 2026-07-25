import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTaxRate, useUpdateTaxRate } from '../hooks/useTaxRates';
import { TaxRateFormData, TaxType, TaxRateStatus } from '../types/taxRate';
import { ArrowLeft, Save, Percent, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';

export function TaxRateEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: taxRate, isLoading, isError, error } = useTaxRate(id || '');
  const updateMutation = useUpdateTaxRate();

  const [formData, setFormData] = useState<TaxRateFormData>({
    name: '',
    code: '',
    description: '',
    taxType: 'GST',
    totalRate: 18,
    cgstRate: 9,
    sgstRate: 9,
    igstRate: 18,
    cessRate: 0,
    hsnCode: '',
    sacCode: '',
    priceIncludesTax: true,
    status: 'ACTIVE',
    isDefault: false,
    sortOrder: 0,
    effectiveFrom: '',
    effectiveUntil: '',
  });

  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (taxRate) {
      setFormData({
        name: taxRate.name || '',
        code: taxRate.code || '',
        description: taxRate.description || '',
        taxType: taxRate.taxType || 'GST',
        totalRate: Number(taxRate.totalRate),
        cgstRate: Number(taxRate.cgstRate),
        sgstRate: Number(taxRate.sgstRate),
        igstRate: Number(taxRate.igstRate),
        cessRate: Number(taxRate.cessRate),
        hsnCode: taxRate.hsnCode || '',
        sacCode: taxRate.sacCode || '',
        priceIncludesTax: taxRate.priceIncludesTax ?? true,
        status: taxRate.status || 'ACTIVE',
        isDefault: taxRate.isDefault ?? false,
        sortOrder: taxRate.sortOrder ?? 0,
        effectiveFrom: taxRate.effectiveFrom ? taxRate.effectiveFrom.substring(0, 10) : '',
        effectiveUntil: taxRate.effectiveUntil ? taxRate.effectiveUntil.substring(0, 10) : '',
      });
    }
  }, [taxRate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!id) return;
    if (!formData.name.trim()) {
      setErrorMessage('Tax rate name is required.');
      return;
    }

    if (formData.effectiveFrom && formData.effectiveUntil) {
      if (new Date(formData.effectiveUntil) <= new Date(formData.effectiveFrom)) {
        setErrorMessage('Effective until date must be after effective from date.');
        return;
      }
    }

    try {
      await updateMutation.mutateAsync({ id, data: formData });
      navigate('/admin/tax-rates');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update tax rate');
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3">
        <RefreshCw className="h-6 w-6 animate-spin text-indigo-600" />
        <span>Loading tax slab details...</span>
      </div>
    );
  }

  if (isError || !taxRate) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center space-y-4">
        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Tax Rate Not Found</h2>
        <p className="text-sm text-slate-500">{(error as any)?.message || 'The requested tax rate could not be loaded.'}</p>
        <Link
          to="/admin/tax-rates"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tax Rates
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/tax-rates"
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-0.5">
              <span>Tax Rates</span>
              <ChevronRight className="h-3 w-3 text-slate-400" />
              <span className="text-slate-500">Edit #{taxRate.id}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Edit Tax Rate — {taxRate.name}</h1>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Details */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Percent className="h-4 w-4 text-indigo-600" />
            Tax Slab Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Tax Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Tax Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm font-mono text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Tax Classification Type</label>
              <select
                value={formData.taxType}
                onChange={(e) => setFormData((prev) => ({ ...prev, taxType: e.target.value as TaxType }))}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="GST">GST (Goods and Services Tax)</option>
                <option value="IGST">IGST (Integrated GST)</option>
                <option value="ZERO_RATED">ZERO_RATED (Export / Nil)</option>
                <option value="EXEMPT">EXEMPT</option>
                <option value="CUSTOM">CUSTOM</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Total Tax Rate (%) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.0001"
                min="0"
                max="100"
                required
                value={formData.totalRate}
                onChange={(e) => setFormData((prev) => ({ ...prev, totalRate: Number(e.target.value) }))}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm font-bold text-indigo-600 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Breakdown */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Component Rates Breakdown
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">CGST (%)</label>
                <input
                  type="number"
                  step="0.0001"
                  min="0"
                  max="100"
                  value={formData.cgstRate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, cgstRate: Number(e.target.value) }))}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">SGST (%)</label>
                <input
                  type="number"
                  step="0.0001"
                  min="0"
                  max="100"
                  value={formData.sgstRate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, sgstRate: Number(e.target.value) }))}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">IGST (%)</label>
                <input
                  type="number"
                  step="0.0001"
                  min="0"
                  max="100"
                  value={formData.igstRate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, igstRate: Number(e.target.value) }))}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Cess (%)</label>
                <input
                  type="number"
                  step="0.0001"
                  min="0"
                  max="100"
                  value={formData.cessRate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, cessRate: Number(e.target.value) }))}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={formData.description || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* HSN / SAC Codes */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            HSN / SAC Codes & Pricing Rules
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">HSN Code (Goods)</label>
              <input
                type="text"
                value={formData.hsnCode || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, hsnCode: e.target.value }))}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm font-mono text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">SAC Code (Services)</label>
              <input
                type="text"
                value={formData.sacCode || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, sacCode: e.target.value }))}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm font-mono text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="priceIncludesTax"
                checked={formData.priceIncludesTax}
                onChange={(e) => setFormData((prev) => ({ ...prev, priceIncludesTax: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="priceIncludesTax" className="text-sm font-semibold text-slate-800 cursor-pointer">
                Product Prices Include Tax (Tax Inclusive Pricing)
              </label>
            </div>
          </div>
        </div>

        {/* Status, Default & Dates */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Status & Date Rules
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as TaxRateStatus }))}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Effective From</label>
              <input
                type="date"
                value={formData.effectiveFrom || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, effectiveFrom: e.target.value }))}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Effective Until</label>
              <input
                type="date"
                value={formData.effectiveUntil || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, effectiveUntil: e.target.value }))}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => setFormData((prev) => ({ ...prev, isDefault: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="isDefault" className="text-sm font-semibold text-slate-800 cursor-pointer">
              Set as Default Store Tax Rate
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to="/admin/tax-rates"
            className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {updateMutation.isPending ? 'Updating Tax Rate...' : 'Update Tax Rate'}
          </button>
        </div>
      </form>
    </div>
  );
}
