import React, { useState, useEffect } from 'react';
import { X, ArrowUp, ArrowDown, GripVertical, Check, Layers, Folder } from 'lucide-react';
import { CategoryTreeNode, CategoryReorderPayload } from '../types/category';

interface CategoryReorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: CategoryReorderPayload) => Promise<void>;
  treeData: CategoryTreeNode[];
  parentId: string | null;
}

export const CategoryReorderModal: React.FC<CategoryReorderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  treeData,
  parentId
}) => {
  const [items, setItems] = useState<Array<{ id: string; name: string; sortOrder: number }>>([]);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    let sourceNodes: CategoryTreeNode[] = [];
    if (!parentId) {
      sourceNodes = treeData;
    } else {
      const findParentNode = (nodes: CategoryTreeNode[]): CategoryTreeNode | null => {
        for (const node of nodes) {
          if (node.id === parentId) return node;
          if (node.children && node.children.length > 0) {
            const match = findParentNode(node.children);
            if (match) return match;
          }
        }
        return null;
      };
      const pNode = findParentNode(treeData);
      sourceNodes = pNode?.children || [];
    }

    const initial = sourceNodes.map((node, index) => ({
      id: node.id,
      name: node.name,
      sortOrder: node.sortOrder || index + 1,
    }));

    initial.sort((a, b) => a.sortOrder - b.sortOrder);
    setItems(initial);
  }, [treeData, parentId, isOpen]);

  if (!isOpen) return null;

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === items.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    // Recalculate sort orders
    const updated = newItems.map((item, i) => ({
      ...item,
      sortOrder: i + 1,
    }));

    setItems(updated);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload: CategoryReorderPayload = {
        items: items.map((it, idx) => ({
          id: it.id,
          parentId: parentId,
          sortOrder: idx + 1,
        })),
      };
      await onSave(payload);
    } catch {
      // Error handled by parent hook
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Reorder Category Priority</h2>
              <p className="text-xs text-slate-500">
                {parentId ? 'Sorting subcategories under selected parent' : 'Sorting top-level main categories'}
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

        {/* List Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-2">
          {items.length === 0 ? (
            <p className="text-center text-xs text-slate-500 py-8">No subcategories to reorder.</p>
          ) : (
            items.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 transition-all shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-slate-400" />
                  <span className="w-6 h-6 rounded bg-slate-200 text-slate-700 text-xs font-mono font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-sm font-semibold text-slate-800">{item.name}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveItem(index, 'up')}
                    disabled={index === 0}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveItem(index, 'down')}
                    disabled={index === items.length - 1}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || items.length === 0}
            className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving Order...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" /> Save Ordering
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
