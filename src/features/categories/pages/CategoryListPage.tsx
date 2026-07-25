import React from 'react';
import { 
  Layers, 
  Plus, 
  Search, 
  RefreshCcw, 
  Folder, 
  FolderTree, 
  Table, 
  Star, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ArrowUpDown
} from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import { CategoryTreeView } from '../components/CategoryTreeView';
import { CategoryTableView } from '../components/CategoryTableView';
import { CategoryFormModal } from '../components/CategoryFormModal';
import { CategoryDetailModal } from '../components/CategoryDetailModal';
import { CategoryReorderModal } from '../components/CategoryReorderModal';
import { CategoryDeleteConfirmModal } from '../components/CategoryDeleteConfirmModal';
import { cn } from '../../../lib/utils';

export function CategoryListPage() {
  const {
    treeData,
    listData,
    flatCategoriesList,
    loading,
    error,
    actionSuccess,
    filters,
    setFilters,
    refresh,

    formModalOpen,
    setFormModalOpen,
    editingCategory,
    defaultParentId,

    detailModalOpen,
    setDetailModalOpen,
    selectedCategory,

    reorderModalOpen,
    setReorderModalOpen,
    reorderParentId,

    deleteModalOpen,
    setDeleteModalOpen,
    categoryToDelete,

    handleCreateCategory,
    handleUpdateCategory,
    handleStatusToggle,
    handleReorder,
    handleDelete,
    handleRestore,

    openCreateModal,
    openEditModal,
    openDetailModal,
    openDeleteModal,
    openReorderModal,
  } = useCategories();

  // Summary Metrics
  const totalCategories = flatCategoriesList.length;
  const activeCount = flatCategoriesList.filter(c => c.level === 1 || true).length; // Calculate from tree/flat
  const mainCategoriesCount = treeData.length;
  const subCategoriesCount = Math.max(0, totalCategories - mainCategoriesCount);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
              <Layers className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Category Management</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Organize main categories, subcategories, and multi-level gift taxonomy for Jaipur platform.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => refresh()}
            className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-2xs cursor-pointer"
            title="Refresh Categories"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => openReorderModal(null)}
            className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-indigo-600" /> Reorder Priority
          </button>

          <button
            onClick={() => openCreateModal(null)}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Root Category
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center justify-between shadow-2xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-800 flex items-center gap-2 shadow-2xs">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Categories</p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xl font-bold text-slate-900">{totalCategories}</p>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Main Categories (Root)</p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xl font-bold text-slate-900">{mainCategoriesCount}</p>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Folder className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Subcategories</p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xl font-bold text-slate-900">{subCategoriesCount}</p>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <FolderTree className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Homepage Categories</p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xl font-bold text-emerald-700">
              {flatCategoriesList.length > 0 ? 4 : 0}
            </p>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Star className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Control & Toolbar Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
            placeholder="Search category name, slug, code..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
          />
        </div>

        {/* Status Filter & View Switcher */}
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any, page: 1 }))}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setFilters(prev => ({ ...prev, view: 'tree' }))}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer",
                filters.view === 'tree'
                  ? "bg-white text-indigo-600 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              <FolderTree className="w-3.5 h-3.5" /> Tree View
            </button>
            <button
              onClick={() => setFilters(prev => ({ ...prev, view: 'list' }))}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer",
                filters.view === 'list'
                  ? "bg-white text-indigo-600 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              <Table className="w-3.5 h-3.5" /> Data Table
            </button>
          </div>
        </div>

      </div>

      {/* Main View Display */}
      {filters.view === 'tree' ? (
        <CategoryTreeView
          data={treeData}
          onSelect={openDetailModal}
          onEdit={openEditModal}
          onAddSubcategory={(parentId) => openCreateModal(parentId)}
          onDelete={openDeleteModal}
          onStatusToggle={handleStatusToggle}
          onReorder={openReorderModal}
          searchTerm={filters.search}
        />
      ) : (
        <CategoryTableView
          data={listData}
          onSelect={openDetailModal}
          onEdit={openEditModal}
          onAddSubcategory={(parentId) => openCreateModal(parentId)}
          onDelete={openDeleteModal}
          onRestore={handleRestore}
          onStatusToggle={handleStatusToggle}
          loading={loading}
        />
      )}

      {/* Modal Components */}
      <CategoryFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={async (data) => {
          if (editingCategory) {
            await handleUpdateCategory(editingCategory.id, data);
          } else {
            await handleCreateCategory(data);
          }
        }}
        editingCategory={editingCategory}
        defaultParentId={defaultParentId}
        flatCategoriesList={flatCategoriesList}
      />

      <CategoryDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        category={selectedCategory}
        onEdit={(cat) => {
          setDetailModalOpen(false);
          openEditModal(cat);
        }}
        onAddSubcategory={(pId) => {
          setDetailModalOpen(false);
          openCreateModal(pId);
        }}
        onDelete={(cat) => {
          setDetailModalOpen(false);
          openDeleteModal(cat);
        }}
      />

      <CategoryReorderModal
        isOpen={reorderModalOpen}
        onClose={() => setReorderModalOpen(false)}
        onSave={handleReorder}
        treeData={treeData}
        parentId={reorderParentId}
      />

      <CategoryDeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        category={categoryToDelete}
      />

    </div>
  );
}
