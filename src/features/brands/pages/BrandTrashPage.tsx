import React from 'react';
import { Link } from 'react-router-dom';
import { useBrands, useRestoreBrand } from '../hooks/useBrands';
import { ArrowLeft, RotateCcw, Trash2, Tag, RefreshCw, AlertCircle } from 'lucide-react';

export function BrandTrashPage() {
  const { data, isLoading, isError, error, refetch } = useBrands({
    includeDeleted: true,
  });

  const restoreMutation = useRestoreBrand();

  const handleRestore = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to restore brand "${name}"?`)) {
      await restoreMutation.mutateAsync(id);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/brands"
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Trash2 className="h-6 w-6 text-rose-500" />
              Brand Trash Bin
            </h1>
            <p className="text-sm text-slate-500">
              Soft-deleted brands can be restored back to the active catalog here.
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
        ) : data?.brands.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <Tag className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Trash Bin is Empty</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              No soft-deleted brands found in the trash bin.
            </p>
            <Link
              to="/admin/brands"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              Back to Brands
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Brand</th>
                  <th className="py-3.5 px-4">Code / Slug</th>
                  <th className="py-3.5 px-4">Deleted Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {data?.brands.map((brand) => (
                  <tr key={brand.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {brand.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs">
                      <span className="text-slate-800 block">{brand.code || '—'}</span>
                      <span className="text-slate-400">{brand.slug}</span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {brand.deletedAt ? new Date(brand.deletedAt).toLocaleString() : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleRestore(brand.id, brand.name)}
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
