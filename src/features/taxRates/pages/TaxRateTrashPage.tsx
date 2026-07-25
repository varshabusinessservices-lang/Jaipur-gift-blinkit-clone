import React from 'react';
import { Link } from 'react-router-dom';
import { useTaxRates, useRestoreTaxRate } from '../hooks/useTaxRates';
import { ArrowLeft, RotateCcw, Trash2, Percent, RefreshCw, AlertCircle } from 'lucide-react';

export function TaxRateTrashPage() {
  const { data, isLoading, isError, error, refetch } = useTaxRates({
    includeDeleted: true,
  });

  const restoreMutation = useRestoreTaxRate();

  const handleRestore = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to restore tax rate "${name}"?`)) {
      await restoreMutation.mutateAsync(id);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
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
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Trash2 className="h-6 w-6 text-rose-500" />
              Tax Rates Trash Bin
            </h1>
            <p className="text-sm text-slate-500">
              Soft-deleted tax rates and archived GST slabs can be restored here.
            </p>
          </div>
        </div>

        <button
          onClick={() => refetch()}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3">
            <RefreshCw className="h-6 w-6 animate-spin text-indigo-600" />
            <span>Loading trashed items...</span>
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-rose-600 bg-rose-50 flex flex-col items-center gap-2">
            <AlertCircle className="h-6 w-6" />
            <p className="font-medium">Error loading trash bin</p>
            <p className="text-sm text-rose-500">{(error as any)?.message || 'An unexpected error occurred'}</p>
          </div>
        ) : data?.taxRates.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <Percent className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Trash Bin is Empty</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              No soft-deleted tax rates found.
            </p>
            <Link
              to="/admin/tax-rates"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              Back to Tax Rates
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Tax Name</th>
                  <th className="py-3.5 px-4">Code</th>
                  <th className="py-3.5 px-4 text-center">Rate</th>
                  <th className="py-3.5 px-4">Deleted Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {data?.taxRates.map((rate) => (
                  <tr key={rate.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {rate.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-700">
                      {rate.code}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                      {Number(rate.totalRate).toFixed(2)}%
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {rate.deletedAt ? new Date(rate.deletedAt).toLocaleString() : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleRestore(rate.id, rate.name)}
                        disabled={restoreMutation.isPending}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Restore
                      </button>
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
