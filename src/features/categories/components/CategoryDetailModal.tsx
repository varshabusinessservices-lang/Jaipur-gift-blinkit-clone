import React from 'react';
import { 
  X, 
  Folder, 
  Edit3, 
  Plus, 
  Trash2, 
  Star, 
  Home, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  BarChart2, 
  Globe, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { Category } from '../types/category';
import { cn } from '../../../lib/utils';

interface CategoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  onEdit: (category: Category) => void;
  onAddSubcategory: (parentId: string) => void;
  onDelete: (category: Category) => void;
}

export const CategoryDetailModal: React.FC<CategoryDetailModalProps> = ({
  isOpen,
  onClose,
  category,
  onEdit,
  onAddSubcategory,
  onDelete
}) => {
  if (!isOpen || !category) return null;

  const analytics = category.analyticsPlaceholder || {
    totalProducts: category.productCount || 0,
    activeProducts: category.productCount || 0,
    totalSalesAmount: 145000,
    totalOrdersCount: 98,
    conversionRatePct: 4.5,
    avgOrderValue: 1479
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center text-slate-500 shrink-0 shadow-xs">
              {category.imageUrl ? (
                <img src={category.imageUrl} alt={category.name} className="w-full h-full object-cover" />
              ) : (
                <Folder className="w-6 h-6 text-indigo-500" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{category.name}</h2>
                {category.code && (
                  <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                    {category.code}
                  </span>
                )}
              </div>
              <p className="text-xs font-mono text-slate-400">/{category.slug}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(category)}
              className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Breadcrumb Path */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2 text-xs text-slate-600 overflow-x-auto">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Hierarchy:</span>
            <span className="font-semibold text-indigo-600">Root</span>
            {category.breadcrumbs && category.breadcrumbs.map((b) => (
              <React.Fragment key={b.id}>
                <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="font-medium text-slate-700">{b.name}</span>
              </React.Fragment>
            ))}
            <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
              {category.name}
            </span>
          </div>

          {/* Quick Badges & Info */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <p className="text-[10px] font-bold uppercase text-slate-400">Depth Level</p>
              <p className="text-sm font-bold text-slate-800 mt-0.5">Level {category.level}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <p className="text-[10px] font-bold uppercase text-slate-400">Status</p>
              <p className="text-sm font-bold mt-0.5 inline-flex items-center gap-1">
                {category.status === 'ACTIVE' ? (
                  <span className="text-emerald-700 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Active</span>
                ) : (
                  <span className="text-slate-500 flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Inactive</span>
                )}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <p className="text-[10px] font-bold uppercase text-slate-400">Sort Priority</p>
              <p className="text-sm font-bold font-mono text-slate-800 mt-0.5">#{category.sortOrder}</p>
            </div>
          </div>

          {/* Category Sales & Performance Placeholder Section */}
          <div className="p-4 bg-gradient-to-br from-indigo-50/70 to-slate-50 border border-indigo-100 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                  Category Sales Analytics (Placeholder)
                </h3>
              </div>
              <span className="text-[10px] font-semibold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full border border-indigo-200">
                Last 30 Days
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Total Sales</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">₹{analytics.totalSalesAmount.toLocaleString('en-IN')}</p>
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Total Orders</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{analytics.totalOrdersCount}</p>
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Products</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{analytics.totalProducts}</p>
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Conversion</p>
                <p className="text-sm font-bold text-emerald-600 mt-0.5">{analytics.conversionRatePct}%</p>
              </div>
            </div>
          </div>

          {/* Direct Subcategories */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Direct Subcategories ({category.children?.length || 0})
              </h3>
              <button
                onClick={() => {
                  onClose();
                  onAddSubcategory(category.id);
                }}
                className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Subcategory
              </button>
            </div>

            {category.children && category.children.length > 0 ? (
              <div className="grid grid-cols-1 gap-2">
                {category.children.map((child) => (
                  <div key={child.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Folder className="w-4 h-4 text-indigo-500" />
                      <span className="text-sm font-semibold text-slate-800">{child.name}</span>
                      <span className="text-xs font-mono text-slate-400">/{child.slug}</span>
                    </div>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                      child.status === 'ACTIVE' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200"
                    )}>
                      {child.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic p-3 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-center">
                No subcategories nested under this category yet.
              </p>
            )}
          </div>

          {/* Description */}
          {category.description && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Description</h3>
              <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                {category.description}
              </p>
            </div>
          )}

          {/* Media & Banners Preview */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Media & Banner Assets</h3>
            <div className="grid grid-cols-2 gap-3">
              {category.desktopBannerUrl && (
                <div className="col-span-2">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase mb-1">Desktop Header Banner</p>
                  <div className="w-full h-28 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden">
                    <img src={category.desktopBannerUrl} alt="Desktop Banner" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              {category.mobileBannerUrl && (
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase mb-1">Mobile Header Banner</p>
                  <div className="w-full h-24 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden">
                    <img src={category.mobileBannerUrl} alt="Mobile Banner" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              {category.iconUrl && (
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase mb-1">Category Navigation Icon</p>
                  <div className="w-16 h-16 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center p-2">
                    <img src={category.iconUrl} alt="Icon" className="w-full h-full object-contain" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SEO Metadata */}
          {category.seoTitle && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Globe className="w-4 h-4 text-indigo-600" /> SEO Preview
              </div>
              <p className="text-sm font-semibold text-blue-700 hover:underline">{category.seoTitle}</p>
              <p className="text-xs font-mono text-emerald-700">https://jaipurgifts.com/category/{category.slug}</p>
              <p className="text-xs text-slate-600">{category.seoDescription}</p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onDelete(category);
            }}
            className="px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete Category
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
