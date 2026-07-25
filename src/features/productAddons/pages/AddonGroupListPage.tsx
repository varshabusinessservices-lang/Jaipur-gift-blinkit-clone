import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers3, Plus, Search, RefreshCw, Trash2, Edit, Layers, CheckCircle } from 'lucide-react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { useAddonGroups, useDeleteAddonGroup } from '../hooks/useProductAddons';

export function AddonGroupListPage() {
  const { data, isLoading, refetch } = useAddonGroups();
  const deleteGroup = useDeleteAddonGroup();

  const groups = data?.data || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="Add-on Groups & Bundles"
        description="Organize multiple add-ons into selectable option groups (e.g. Gift Wrapping Bundle, Personalisation Pack)."
        actions={
          <div className="flex items-center gap-3">
            <Link
              to="/admin/product-addons"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
            >
              Back to Add-ons
            </Link>
            <button
              onClick={() => alert('Add-on Group Creator dialog / form')}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Create Group
            </button>
          </div>
        }
      />

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-2">
            <RefreshCw className="h-6 w-6 animate-spin text-indigo-600" />
            <p className="text-sm font-medium">Loading add-on groups...</p>
          </div>
        ) : groups.length === 0 ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-2">
            <Layers3 className="h-10 w-10 text-slate-300" />
            <p className="text-base font-semibold text-slate-800">No add-on groups found</p>
            <p className="text-xs text-slate-500">Combine add-ons into grouped choices for streamlined customer selection.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {groups.map((grp) => (
              <div key={grp.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-base">{grp.name}</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {grp.selectionType === 'SINGLE' ? 'Single Choice (Radio)' : 'Multiple Choices (Checkboxes)'}
                    </span>
                    <StatusBadge
                      status={grp.status === 'ACTIVE' ? 'success' : 'neutral'}
                      label={grp.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                    />
                  </div>
                  <p className="text-xs text-slate-500">{grp.description || 'No description provided.'}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                    <span>
                      Selections: {grp.minimumSelections} min to {grp.maximumSelections || 'Unlimited'} max
                    </span>
                    <span>•</span>
                    <span>{grp.items?.length || 0} add-on items included</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => deleteGroup.mutate(grp.id, { onSuccess: () => refetch() })}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-slate-200"
                    title="Delete Group"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
