import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  FolderOpen, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  MoreVertical, 
  ArrowUp, 
  ArrowDown, 
  Star, 
  Home, 
  Layers, 
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { CategoryTreeNode, Category, CategoryStatus } from '../types/category';
import { cn } from '../../../lib/utils';

interface CategoryTreeViewProps {
  data: CategoryTreeNode[];
  onSelect: (category: Category) => void;
  onEdit: (category: Category) => void;
  onAddSubcategory: (parentId: string) => void;
  onDelete: (category: Category) => void;
  onStatusToggle: (id: string, newStatus: CategoryStatus) => void;
  onReorder: (parentId: string | null) => void;
  searchTerm?: string;
}

interface TreeNodeItemProps {
  node: CategoryTreeNode;
  depth: number;
  onSelect: (category: Category) => void;
  onEdit: (category: Category) => void;
  onAddSubcategory: (parentId: string) => void;
  onDelete: (category: Category) => void;
  onStatusToggle: (id: string, newStatus: CategoryStatus) => void;
  searchTerm?: string;
  isLast: boolean;
}

const TreeNodeItem: React.FC<TreeNodeItemProps> = ({
  node,
  depth,
  onSelect,
  onEdit,
  onAddSubcategory,
  onDelete,
  onStatusToggle,
  searchTerm,
  isLast
}) => {
  const [expanded, setExpanded] = useState<boolean>(true);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  const hasChildren = node.children && node.children.length > 0;

  // Highlight search text
  const isSearchMatch = searchTerm && searchTerm.trim().length > 0 && 
    (node.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     node.slug.toLowerCase().includes(searchTerm.toLowerCase()));

  // Depth color badge mapping
  const getDepthBadge = (level: number) => {
    switch (level) {
      case 1:
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">L1 Main</span>;
      case 2:
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-sky-100 text-sky-800 border border-sky-200">L2 Sub</span>;
      case 3:
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800 border border-amber-200">L3 Child</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">L{level}</span>;
    }
  };

  return (
    <div className="relative group">
      <div 
        className={cn(
          "flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-100/80 transition-all border border-transparent my-1",
          isSearchMatch && "bg-amber-50/80 border-amber-200 font-medium",
          node.status === 'INACTIVE' && "opacity-75 bg-slate-50/50"
        )}
        style={{ paddingLeft: `${Math.max(12, depth * 24)}px` }}
      >
        {/* Toggle Expand Icon */}
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            "w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors rounded",
            !hasChildren && "invisible"
          )}
        >
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {/* Thumbnail or Icon */}
        <div className="w-8 h-8 rounded-md bg-slate-200 border border-slate-300 overflow-hidden shrink-0 flex items-center justify-center text-slate-500 shadow-sm">
          {node.imageUrl ? (
            <img src={node.imageUrl} alt={node.name} className="w-full h-full object-cover" />
          ) : node.iconUrl ? (
            <img src={node.iconUrl} alt={node.name} className="w-full h-full object-cover" />
          ) : (
            <Folder className="w-4 h-4 text-indigo-500" />
          )}
        </div>

        {/* Category Name & Slug */}
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={cn("text-sm font-semibold text-slate-900 truncate", isSearchMatch && "text-amber-900")}>
              {node.name}
            </span>
            {node.code && (
              <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                {node.code}
              </span>
            )}
            {getDepthBadge(node.level)}

            {node.isFeatured && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded" title="Featured Category">
                <Star className="w-3 h-3 fill-amber-400 text-amber-500" /> Featured
              </span>
            )}

            {node.showOnHomepage && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded" title="Homepage Visible">
                <Home className="w-3 h-3 text-emerald-500" /> Homepage
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 truncate">
            <span className="font-mono">/{node.slug}</span>
            {hasChildren && (
              <span>• {node.children.length} subcategory/subcategories</span>
            )}
            {node.productCount !== undefined && (
              <span>• {node.productCount} products</span>
            )}
          </div>
        </div>

        {/* Status Badge Toggle */}
        <button
          onClick={() => onStatusToggle(node.id, node.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
          className={cn(
            "px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 border transition-all shrink-0 cursor-pointer",
            node.status === 'ACTIVE'
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
              : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
          )}
          title="Click to toggle status"
        >
          {node.status === 'ACTIVE' ? (
            <>
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
            </>
          ) : (
            <>
              <XCircle className="w-3 h-3 text-slate-400" /> Inactive
            </>
          )}
        </button>

        {/* Inline Actions */}
        <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onSelect(node)}
            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-md border border-transparent hover:border-slate-200 transition-all cursor-pointer"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>

          {node.level < 3 && (
          <button
            onClick={() => onAddSubcategory(node.id)}
            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-white rounded-md border border-transparent hover:border-slate-200 transition-all cursor-pointer flex items-center"
            title={node.level === 1 ? 'Add Child Category' : 'Add Sub-Child Category'}
          >
            <Plus className="w-4 h-4" /> <span className="ml-1 text-xs hidden lg:inline">{node.level === 1 ? 'Add Child' : 'Add Sub-Child'}</span>
          </button>
          )}
            

          <button
            onClick={() => onEdit(node)}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-white rounded-md border border-transparent hover:border-slate-200 transition-all cursor-pointer"
            title="Edit Category"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDelete(node)}
            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-white rounded-md border border-transparent hover:border-slate-200 transition-all cursor-pointer"
            title="Delete Category"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Render Subchildren Recursively */}
      {expanded && hasChildren && (
        <div className="relative pl-3 border-l-2 border-slate-200 ml-5 space-y-1">
          {node.children.map((child, index) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              onSelect={onSelect}
              onEdit={onEdit}
              onAddSubcategory={onAddSubcategory}
              onDelete={onDelete}
              onStatusToggle={onStatusToggle}
              searchTerm={searchTerm}
              isLast={index === node.children.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const CategoryTreeView: React.FC<CategoryTreeViewProps> = ({
  data,
  onSelect,
  onEdit,
  onAddSubcategory,
  onDelete,
  onStatusToggle,
  onReorder,
  searchTerm
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <Layers className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900">No Categories Found</h3>
        <p className="text-sm text-slate-500 mt-1">Start by creating your first main category.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-1">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 px-2 mb-2">
        <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
          Category Tree Hierarchy
        </span>
        <button
          onClick={() => onReorder(null)}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline cursor-pointer"
        >
          <ArrowUp className="w-3.5 h-3.5" /> Reorder Top Categories
        </button>
      </div>

      <div className="space-y-1">
        {data.map((rootNode, index) => (
          <TreeNodeItem
            key={rootNode.id}
            node={rootNode}
            depth={0}
            onSelect={onSelect}
            onEdit={onEdit}
            onAddSubcategory={onAddSubcategory}
            onDelete={onDelete}
            onStatusToggle={onStatusToggle}
            searchTerm={searchTerm}
            isLast={index === data.length - 1}
          />
        ))}
      </div>
    </div>
  );
};
