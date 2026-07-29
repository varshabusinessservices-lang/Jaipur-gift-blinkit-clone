import { useState, useEffect, useCallback, useMemo } from 'react';
import { categoryApi } from '../services/categoryApi';
import { 
  Category, 
  CategoryTreeNode, 
  CategoryFormData, 
  CategoryFilterState, 
  CategoryStatus,
  CategoryReorderPayload,
  DeleteCategoryPayload
} from '../types/category';

export function useCategories() {
  const [treeData, setTreeData] = useState<CategoryTreeNode[]>([]);
  const [listData, setListData] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Filters State
  const [filters, setFilters] = useState<CategoryFilterState>({
    search: '',
    status: 'ALL',
    parentId: 'ALL',
    isFeatured: 'all',
    showOnHomepage: 'all',
    storeId: '',
    view: 'tree',
    sortBy: 'sortOrder',
    sortOrder: 'asc',
    page: 1,
    limit: 50,
    includeDeleted: false,
  });

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 1,
  });

  // Modal / Drawer Selection States
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formModalOpen, setFormModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [defaultParentId, setDefaultParentId] = useState<string | null>(null);
  const [categoryFormMode, setCategoryFormMode] = useState<'PARENT' | 'CHILD' | 'SUB_CHILD'>('PARENT');

  const [detailModalOpen, setDetailModalOpen] = useState<boolean>(false);
  const [reorderModalOpen, setReorderModalOpen] = useState<boolean>(false);
  const [reorderParentId, setReorderParentId] = useState<string | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Fetch Tree
  const fetchTree = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const tree = await categoryApi.getCategoryTree();
      setTreeData(tree);
    } catch (err: any) {
      setError(err.message || 'Failed to load category tree');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch List
  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await categoryApi.getCategories(filters);
      setListData(result.data);
      setPagination(result.meta);
    } catch (err: any) {
      setError(err.message || 'Failed to load category list');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Load data based on view
  const refresh = useCallback(async () => {
    if (filters.view === 'tree') {
      await fetchTree();
    } else {
      await fetchList();
    }
  }, [filters.view, fetchTree, fetchList]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Flatten helper to select parent categories in dropdowns
  const flatCategoriesList = useMemo(() => {
    const list: Array<{ id: string; name: string; level: number; path: string | null; slug: string }> = [];
    const traverse = (nodes: CategoryTreeNode[]) => {
      for (const node of nodes) {
        list.push({
          id: node.id,
          name: node.name,
          level: node.level,
          path: node.path,
          slug: node.slug,
        });
        if (node.children && node.children.length > 0) {
          traverse(node.children);
        }
      }
    };
    traverse(treeData);
    return list;
  }, [treeData]);

  // Actions
  const handleCreateCategory = async (data: CategoryFormData) => {
    try {
      setError(null);
      let createdRes: Category;
      if (categoryFormMode === 'PARENT') {
        createdRes = await categoryApi.createParentCategory(data);
      } else if (categoryFormMode === 'CHILD') {
        createdRes = await categoryApi.createChildCategory(data);
      } else if (categoryFormMode === 'SUB_CHILD') {
        createdRes = await categoryApi.createSubChildCategory(data);
      } else {
        createdRes = await categoryApi.createCategory(data);
      }

      if (!createdRes || !createdRes.id) {
        throw new Error('Category save failed: Backend returned invalid response or missing ID.');
      }

      // Re-fetch category tree to verify database persistence
      const freshTree = await categoryApi.getCategoryTree();
      
      const findNodeInTree = (nodes: CategoryTreeNode[], targetId: string): boolean => {
        for (const node of nodes) {
          if (node.id === targetId) return true;
          if (node.children && node.children.length > 0 && findNodeInTree(node.children, targetId)) {
            return true;
          }
        }
        return false;
      };

      const existsInFreshTree = findNodeInTree(freshTree, createdRes.id);
      
      if (!existsInFreshTree) {
        const freshList = await categoryApi.getCategories({ limit: 100 });
        const existsInList = freshList.data?.some(c => c.id === createdRes.id);
        if (!existsInList) {
          throw new Error('Category could not be verified after saving.');
        }
      }

      setTreeData(freshTree);
      setActionSuccess(`Category '${createdRes.name}' created successfully.`);
      setFormModalOpen(false);
      setEditingCategory(null);
      setDefaultParentId(null);
      await refresh();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to create category');
      throw err;
    }
  };

  const handleUpdateCategory = async (id: string, data: Partial<CategoryFormData>) => {
    try {
      setError(null);
      const updatedRes = await categoryApi.updateCategory(id, data);
      if (!updatedRes || !updatedRes.id) {
        throw new Error('Category update failed: Backend returned invalid response.');
      }

      // Verification: Refetch category tree from backend
      const freshTree = await categoryApi.getCategoryTree();
      setTreeData(freshTree);

      setActionSuccess(`Category '${updatedRes.name || 'Category'}' updated successfully.`);
      setFormModalOpen(false);
      setEditingCategory(null);
      await refresh();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to update category');
      throw err;
    }
  };

  const handleStatusToggle = async (id: string, status: CategoryStatus) => {
    try {
      setError(null);
      const updatedRes = await categoryApi.updateStatus(id, status);
      if (!updatedRes || updatedRes.status !== status) {
        throw new Error(`Status update verification failed: Expected '${status}' but received '${updatedRes?.status}'.`);
      }

      // Verification: Refetch category tree from backend
      const freshTree = await categoryApi.getCategoryTree();
      setTreeData(freshTree);

      setActionSuccess(`Category status updated to ${status}.`);
      await refresh();
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update category status');
    }
  };

  const handleReorder = async (payload: CategoryReorderPayload) => {
    try {
      setError(null);
      await categoryApi.reorderCategories(payload);
      const freshTree = await categoryApi.getCategoryTree();
      setTreeData(freshTree);
      setActionSuccess('Category sorting updated successfully.');
      setReorderModalOpen(false);
      await refresh();
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to reorder categories');
    }
  };

  const handleDelete = async (id: string, payload?: DeleteCategoryPayload) => {
    try {
      setError(null);
      const res = await categoryApi.deleteCategory(id, payload);

      // Verification step: Refetch tree from backend to confirm deletion
      const freshTree = await categoryApi.getCategoryTree();

      const findNodeInTree = (nodes: CategoryTreeNode[], targetId: string): boolean => {
        for (const node of nodes) {
          if (node.id === targetId) return true;
          if (node.children && node.children.length > 0 && findNodeInTree(node.children, targetId)) {
            return true;
          }
        }
        return false;
      };

      const mode = payload?.mode || 'SINGLE';
      if (mode !== 'DEACTIVATE_BRANCH') {
        const stillExistsInTree = findNodeInTree(freshTree, id);
        if (stillExistsInTree) {
          throw new Error(`Category deletion verification failed: Category '${id}' still present in backend tree.`);
        }
      }

      setTreeData(freshTree);
      setActionSuccess(res?.message || 'Category deleted successfully.');
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
      await refresh();
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err: any) {
      setError(err.message || 'Failed to delete category');
      throw err;
    }
  };

  const handleRestore = async (id: string) => {
    try {
      setError(null);
      await categoryApi.restoreCategory(id);
      setActionSuccess('Category restored successfully.');
      await refresh();
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to restore category');
    }
  };

  // Helper trigger modals
  const openCreateModal = (parentId: string | null = null, mode?: 'PARENT' | 'CHILD' | 'SUB_CHILD') => {
    if (mode) setCategoryFormMode(mode);
    else setCategoryFormMode(parentId ? 'CHILD' : 'PARENT');
    setEditingCategory(null);
    setDefaultParentId(parentId);
    setFormModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    if (category.level === 1) {
      setCategoryFormMode('PARENT');
    } else if (category.level === 2) {
      setCategoryFormMode('CHILD');
    } else if (category.level === 3) {
      setCategoryFormMode('SUB_CHILD');
    }
    setEditingCategory(category);
    setDefaultParentId(category.parentId);
    setFormModalOpen(true);
  };

  const openDetailModal = async (category: Category) => {
    try {
      const detail = await categoryApi.getCategoryById(category.id);
      setSelectedCategory(detail);
      setDetailModalOpen(true);
    } catch {
      setSelectedCategory(category);
      setDetailModalOpen(true);
    }
  };

  const openDeleteModal = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
  };

  const openReorderModal = (parentId: string | null = null) => {
    setReorderParentId(parentId);
    setReorderModalOpen(true);
  };

  return {
    treeData,
    listData,
    flatCategoriesList,
    loading,
    error,
    actionSuccess,
    filters,
    pagination,
    setFilters,
    refresh,
    
    // Modal states
    formModalOpen,
    setFormModalOpen,
    editingCategory,
    defaultParentId,
    categoryFormMode,
    setCategoryFormMode,
    
    detailModalOpen,
    setDetailModalOpen,
    selectedCategory,

    reorderModalOpen,
    setReorderModalOpen,
    reorderParentId,

    deleteModalOpen,
    setDeleteModalOpen,
    categoryToDelete,

    // Handlers
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
  };
}
