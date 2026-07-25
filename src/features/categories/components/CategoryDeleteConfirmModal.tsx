import React from 'react';
import { AlertTriangle, Trash2, X, Folder, ShieldAlert, ArrowRight } from 'lucide-react';
import { Category } from '../types/category';

interface CategoryDeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
  category: Category | null;
}

export const CategoryDeleteConfirmModal: React.FC<CategoryDeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  category
}) => {
  if (!isOpen || !category) return null;

  // Check children safety rule
  const activeChildren = category.children?.filter(c => !c.deletedAt) || [];
  const hasChildren = activeChildren.length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
              hasChildren ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
            }`}>
              {hasChildren ? <ShieldAlert className="w-5 h-5" /> : <Trash2 className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {hasChildren ? 'Cannot Delete Category' : 'Delete Category Confirmation'}
              </h2>
              <p className="text-xs text-slate-500">
                {hasChildren ? 'Safety check blocked operation' : 'Soft delete category record'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {hasChildren ? (
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Deletion Blocked</p>
                  <p className="mt-0.5 font-normal text-amber-700">
                    Category <span className="font-bold">{category.name}</span> contains {activeChildren.length} active subcategory/subcategories. You must move or delete these subcategories before deleting the parent category.
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Nested Subcategories:
                </p>
                <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  {activeChildren.map((ch) => (
                    <div key={ch.id} className="flex items-center justify-between text-xs text-slate-800 p-1.5 bg-white rounded border border-slate-200">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Folder className="w-3.5 h-3.5 text-indigo-500" />
                        {ch.name}
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">/{ch.slug}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-slate-700 leading-relaxed">
                Are you sure you want to soft delete <span className="font-bold text-slate-900">{category.name}</span>?
              </p>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
                <p className="font-bold text-slate-800">• Soft Deletion:</p>
                <p>The category will be marked as archived/deleted but historical orders and products will remain intact. You can restore it anytime.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {hasChildren ? 'Understood' : 'Cancel'}
          </button>

          {!hasChildren && (
            <button
              type="button"
              onClick={() => onConfirm(category.id)}
              className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md shadow-red-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" /> Confirm Delete
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
