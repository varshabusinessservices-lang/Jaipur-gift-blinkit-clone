import { Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Trash2, Gift, RefreshCw } from 'lucide-react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { useProductAddons, useRestoreProductAddon } from '../hooks/useProductAddons';

export function ProductAddonTrashPage() {
  const { data, isLoading, refetch } = useProductAddons({ includeDeleted: true });
  const restoreAddon = useRestoreProductAddon();

  const addons = (data?.data || []).filter((a) => a.deletedAt);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="Product Add-ons Trash"
        description="Soft-deleted add-ons can be restored back to the catalog."
        actions={
          <Link
            to="/admin/product-addons"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Add-ons
          </Link>
        }
      />

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-2">
            <RefreshCw className="h-6 w-6 animate-spin text-indigo-600" />
            <p className="text-sm font-medium">Loading trash items...</p>
          </div>
        ) : addons.length === 0 ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-2">
            <Trash2 className="h-10 w-10 text-slate-300" />
            <p className="text-base font-semibold text-slate-800">Trash is empty</p>
            <p className="text-xs text-slate-500">No deleted add-ons currently found.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {addons.map((item) => (
              <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div>
                  <span className="font-semibold text-slate-900 text-sm">{item.name}</span>
                  <span className="ml-2 font-mono text-xs text-slate-400">({item.slug})</span>
                  <span className="block text-xs text-slate-500 mt-0.5">
                    Deleted on: {item.deletedAt ? new Date(item.deletedAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <button
                  onClick={() => restoreAddon.mutate(item.id, { onSuccess: () => refetch() })}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Restore
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
