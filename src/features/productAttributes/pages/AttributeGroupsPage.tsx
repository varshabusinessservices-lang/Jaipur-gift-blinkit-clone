import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Layers, Plus, Sparkles } from 'lucide-react';
import { useAttributeGroups } from '../hooks/useProductAttributes';

export const AttributeGroupsPage: React.FC = () => {
  const { data: groups, isLoading, isError } = useAttributeGroups();

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/product-attributes"
            className="p-2 text-stone-500 hover:text-stone-900 rounded-lg bg-white border border-stone-200 hover:bg-stone-50 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Attribute Groups</h1>
            <p className="text-sm text-stone-500 mt-0.5">
              Group related attributes together for organized product tab presentation.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
        {isLoading ? (
          <div className="p-8 text-center text-stone-500">Loading attribute groups...</div>
        ) : isError ? (
          <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg">
            Failed to load attribute groups.
          </div>
        ) : !groups || groups.length === 0 ? (
          <div className="p-8 text-center text-stone-500">
            <Layers className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-stone-700">No Attribute Groups</p>
            <p className="text-xs text-stone-500">Create groups to organize specification tabs.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {groups.map((group) => (
              <div
                key={group.id}
                className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-stone-900">{group.name}</div>
                  <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold">
                    {group.status}
                  </span>
                </div>
                <p className="text-xs text-stone-600">{group.description}</p>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {group.attributes.map((attr) => (
                    <span
                      key={attr.id}
                      className="px-2 py-1 bg-white text-stone-800 text-xs font-semibold rounded border border-stone-200 shadow-sm"
                    >
                      {attr.name} ({attr.type})
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
