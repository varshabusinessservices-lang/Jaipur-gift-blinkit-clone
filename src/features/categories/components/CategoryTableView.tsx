import React from 'react';
import { 
  Eye, 
  Edit3, 
  Trash2, 
  Plus, 
  RotateCcw, 
  Star, 
  Home, 
  CheckCircle2, 
  XCircle, 
  Folder,
  Layers
} from 'lucide-react';
import { Category, CategoryStatus } from '../types/category';
import { cn } from '../../../lib/utils';

interface CategoryTableViewProps {
  data: Category[];
  onSelect: (category: Category) => void;
  onEdit: (category: Category) => void;
  onAddSubcategory: (parentId: string) => void;
  onDelete: (category: Category) => void;
  onRestore: (id: string) => void;
  onStatusToggle: (id: string, newStatus: CategoryStatus) => void;
  loading?: boolean;
}

export const CategoryTableView: React.FC<CategoryTableViewProps> = ({
  data,
  onSelect,
  onEdit,
  onAddSubcategory,
  onDelete,
  onRestore,
  onStatusToggle,
  loading
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center shadow-sm">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm text-slate-500 font-medium">Loading category table...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
        <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mx-auto mb-3">
          <Layers className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900">No Categories Found</h3>
        <p className="text-sm text-slate-500 mt-1">Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  const getDepthBadge = (level: number) => {
    switch (level) {
      case 1:
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">Level 1 (Main)</span>;
      case 2:
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">Level 2 (Sub)</span>;
      case 3:
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">Level 3 (Child)</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">Level {level}</span>;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-4">Media</th>
              <th className="py-3.5 px-4">Category Name & Code</th>
              <th className="py-3.5 px-4">Parent Category</th>
              <th className="py-3.5 px-4">Level</th>
              <th className="py-3.5 px-4">Visibility</th>
              <th className="py-3.5 px-4">Sort Order</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {data.map((cat) => {
              const isDeleted = !!cat.deletedAt;

              return (
                <tr 
                  key={cat.id} 
                  className={cn(
                    "hover:bg-slate-50/80 transition-colors",
                    isDeleted && "bg-red-50/40 opacity-70"
                  )}
                >
                  {/* Thumbnail */}
                  <td className="py-3 px-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center text-slate-400 shrink-0 shadow-xs">
                      {cat.imageUrl ? (
                        <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
                      ) : cat.iconUrl ? (
                        <img src={cat.iconUrl} alt={cat.name} className="w-full h-full object-cover" />
                      ) : (
                        <Folder className="w-5 h-5 text-indigo-500" />
                      )}
                    </div>
                  </td>

                  {/* Name & Slug */}
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSelect(cat)}
                          className="font-bold text-slate-900 hover:text-indigo-600 transition-colors text-left text-sm"
                        >
                          {cat.name}
                        </button>
                        {cat.code && (
                          <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600">
                            {cat.code}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-mono font-normal">/{cat.slug}</span>
                    </div>
                  </td>

                  {/* Parent */}
                  <td className="py-3 px-4">
                    {cat.parent ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                        <Folder className="w-3.5 h-3.5 text-slate-500" /> {cat.parent.name}
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        Root Category
                      </span>
                    )}
                  </td>

                  {/* Level */}
                  <td className="py-3 px-4">
                    {getDepthBadge(cat.level)}
                  </td>

                  {/* Visibility Badges */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {cat.isFeatured && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Featured
                        </span>
                      )}
                      {cat.showOnHomepage && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <Home className="w-3 h-3 text-emerald-600" /> Homepage
                        </span>
                      )}
                      {!cat.isFeatured && !cat.showOnHomepage && (
                        <span className="text-xs text-slate-400">Standard</span>
                      )}
                    </div>
                  </td>

                  {/* Sort Order */}
                  <td className="py-3 px-4">
                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                      {cat.sortOrder}
                    </span>
                  </td>

                  {/* Status Toggle */}
                  <td className="py-3 px-4">
                    {isDeleted ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                        Deleted
                      </span>
                    ) : (
                      <button
                        onClick={() => onStatusToggle(cat.id, cat.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
                        className={cn(
                          "px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 border transition-all cursor-pointer",
                          cat.status === 'ACTIVE'
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                        )}
                      >
                        {cat.status === 'ACTIVE' ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-slate-400" /> Inactive
                          </>
                        )}
                      </button>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {isDeleted ? (
                        <button
                          onClick={() => onRestore(cat.id)}
                          className="px-2.5 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-all flex items-center gap-1 cursor-pointer"
                          title="Restore Category"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Restore
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => onSelect(cat)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onAddSubcategory(cat.id)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Add Subcategory"
                          >
                            <Plus className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onEdit(cat)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit Category"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onDelete(cat)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Delete Category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
