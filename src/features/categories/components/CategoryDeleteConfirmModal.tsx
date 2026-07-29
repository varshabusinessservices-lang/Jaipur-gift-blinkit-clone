import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, Folder, ShieldAlert, ArrowRight } from 'lucide-react';
import { Category, DeleteCategoryMode, DeleteCategoryPayload } from '../types/category';

interface CategoryDeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string, payload?: DeleteCategoryPayload) => Promise<void>;
  category: Category | null;
  flatCategoriesList?: Category[];
}

export const CategoryDeleteConfirmModal: React.FC<CategoryDeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  category,
  flatCategoriesList = []
}) => {
  const [selectedMode, setSelectedMode] = useState<DeleteCategoryMode>('CASCADE_DESCENDANTS');
  const [targetParentId, setTargetParentId] = useState<string>('root');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  if (!isOpen || !category) return null;

  const activeChildren = category.children?.filter(c => !c.deletedAt) || [];
  const hasChildren = activeChildren.length > 0;

  // Filter valid parent targets for move (exclude category itself and any descendants)
  const isDescendant = (catId: string): boolean => {
    if (catId === category.id) return true;
    const item = flatCategoriesList.find(c => c.id === catId);
    if (!item || !item.parentId) return false;
    return isDescendant(item.parentId);
  };

  const eligibleParents = flatCategoriesList.filter(
    c => !c.deletedAt && c.id !== category.id && !isDescendant(c.id)
  );

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setModalError(null);
    try {
      if (!hasChildren) {
        await onConfirm(category.id, { mode: 'SINGLE' });
      } else {
        const normTargetParentId = (selectedMode === 'MOVE_DESCENDANTS' && targetParentId !== 'root') ? targetParentId : null;
        await onConfirm(category.id, {
          mode: selectedMode,
          targetParentId: normTargetParentId
        });
      }
      onClose();
    } catch (err: any) {
      setModalError(err.message || 'Operation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8 animate-in zoom-in-95 duration-150">
        
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
                {hasChildren ? 'Delete or Manage Category Branch' : 'Delete Category Confirmation'}
              </h2>
              <p className="text-xs text-slate-500">
                {hasChildren ? 'Select a strategy for subcategory descendants' : 'Soft delete category record'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {modalError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          {hasChildren ? (
            <div className="space-y-4">
              {/* Warning Header */}
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-900 flex items-start gap-2.5">
                <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-950">Category Has Subcategories</p>
                  <p className="mt-0.5 font-medium text-amber-800 leading-relaxed">
                    Category <span className="font-bold underline">{category.name}</span> contains <span className="font-bold">{activeChildren.length} active subcategory/subcategories</span>. Choose how you want to handle these descendants:
                  </p>
                </div>
              </div>

              {/* Direct Subcategory Preview list */}
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Affected Subcategories ({activeChildren.length}):
                </p>
                <div className="max-h-28 overflow-y-auto space-y-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                  {activeChildren.map(ch => (
                    <div key={ch.id} className="flex items-center justify-between p-1.5 bg-white rounded-lg border border-slate-200">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800">
                        <Folder className="w-3.5 h-3.5 text-indigo-500" />
                        {ch.name}
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">/{ch.slug}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selection Options */}
              <div className="space-y-2.5">
                <p className="text-xs font-bold text-slate-700">Select Strategy:</p>

                {/* Option 1: CASCADE */}
                <label className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  selectedMode === 'CASCADE_DESCENDANTS' 
                    ? 'bg-red-50/60 border-red-300 ring-1 ring-red-400/50 shadow-2xs' 
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}>
                  <input
                    type="radio"
                    name="deleteMode"
                    value="CASCADE_DESCENDANTS"
                    checked={selectedMode === 'CASCADE_DESCENDANTS'}
                    onChange={() => setSelectedMode('CASCADE_DESCENDANTS')}
                    className="mt-1 text-red-600 focus:ring-red-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Trash2 className="w-3.5 h-3.5 text-red-600" /> Delete Entire Branch (Cascade)
                      </p>
                      <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-bold uppercase">
                        Soft Delete
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Soft delete <span className="font-semibold text-slate-700">{category.name}</span> AND all {activeChildren.length} subcategories underneath it. You can restore them anytime.
                    </p>
                  </div>
                </label>

                {/* Option 2: MOVE */}
                <label className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  selectedMode === 'MOVE_DESCENDANTS' 
                    ? 'bg-indigo-50/60 border-indigo-300 ring-1 ring-indigo-400/50 shadow-2xs' 
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}>
                  <input
                    type="radio"
                    name="deleteMode"
                    value="MOVE_DESCENDANTS"
                    checked={selectedMode === 'MOVE_DESCENDANTS'}
                    onChange={() => setSelectedMode('MOVE_DESCENDANTS')}
                    className="mt-1 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <ArrowRight className="w-3.5 h-3.5 text-indigo-600" /> Move Subcategories & Delete Target
                      </p>
                      <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[10px] font-bold uppercase">
                        Re-parent
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Move the subcategories to another parent or top level, then soft-delete <span className="font-semibold text-slate-700">{category.name}</span>.
                    </p>

                    {selectedMode === 'MOVE_DESCENDANTS' && (
                      <div className="pt-2 animate-in fade-in duration-150">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Select New Parent Category:
                        </label>
                        <select
                          value={targetParentId}
                          onChange={(e) => setTargetParentId(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                        >
                          <option value="root">Top Level (Root Category)</option>
                          {eligibleParents.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.level > 1 ? `${'— '.repeat(p.level - 1)}${p.name}` : p.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </label>

                {/* Option 3: DEACTIVATE */}
                <label className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  selectedMode === 'DEACTIVATE_BRANCH' 
                    ? 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-400/50 shadow-2xs' 
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}>
                  <input
                    type="radio"
                    name="deleteMode"
                    value="DEACTIVATE_BRANCH"
                    checked={selectedMode === 'DEACTIVATE_BRANCH'}
                    onChange={() => setSelectedMode('DEACTIVATE_BRANCH')}
                    className="mt-1 text-amber-600 focus:ring-amber-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Folder className="w-3.5 h-3.5 text-amber-600" /> Deactivate Entire Branch
                      </p>
                      <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-bold uppercase">
                        Status Inactive
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Mark <span className="font-semibold text-slate-700">{category.name}</span> and all subcategories as INACTIVE without deleting records.
                    </p>
                  </div>
                </label>
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
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-5 py-2 rounded-lg text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
              !hasChildren || selectedMode === 'CASCADE_DESCENDANTS'
                ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20'
                : selectedMode === 'MOVE_DESCENDANTS'
                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'
                : 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20'
            }`}
          >
            {isSubmitting ? (
              <span>Processing...</span>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                {!hasChildren 
                  ? 'Confirm Delete' 
                  : selectedMode === 'CASCADE_DESCENDANTS' 
                  ? 'Cascade Delete Branch' 
                  : selectedMode === 'MOVE_DESCENDANTS' 
                  ? 'Move & Delete Target' 
                  : 'Deactivate Branch'}
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
