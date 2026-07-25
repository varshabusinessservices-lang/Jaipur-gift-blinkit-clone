import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productAddonApi } from '../services/productAddonApi';
import { ProductAddonFilterState, ProductAddon, AddonGroup } from '../types/productAddon';
import { toast } from 'sonner';

export const ADDONS_QUERY_KEY = 'productAddons';
export const ADDON_GROUPS_QUERY_KEY = 'addonGroups';

export function useProductAddons(filters?: ProductAddonFilterState) {
  return useQuery({
    queryKey: [ADDONS_QUERY_KEY, filters],
    queryFn: async () => {
      const res = await productAddonApi.getAddons(filters);
      return {
        data: res.data as ProductAddon[],
        meta: res.meta,
      };
    },
  });
}

export function useProductAddonDetail(id?: string) {
  return useQuery({
    queryKey: [ADDONS_QUERY_KEY, id],
    queryFn: async () => {
      if (!id) return null;
      const res = await productAddonApi.getAddonById(id);
      return res.data as ProductAddon;
    },
    enabled: !!id,
  });
}

export function useCreateProductAddon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ProductAddon>) => productAddonApi.createAddon(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: [ADDONS_QUERY_KEY] });
      toast.success(res.message || 'Product Add-on created successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to create add-on');
    },
  });
}

export function useUpdateProductAddon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductAddon> }) =>
      productAddonApi.updateAddon(id, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: [ADDONS_QUERY_KEY] });
      toast.success(res.message || 'Product Add-on updated successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to update add-on');
    },
  });
}

export function useUpdateProductAddonStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      productAddonApi.updateAddonStatus(id, status),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: [ADDONS_QUERY_KEY] });
      toast.success(res.message || 'Status updated');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to update status');
    },
  });
}

export function useDeleteProductAddon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productAddonApi.deleteAddon(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: [ADDONS_QUERY_KEY] });
      toast.success(res.message || 'Product Add-on moved to trash');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete add-on');
    },
  });
}

export function useRestoreProductAddon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productAddonApi.restoreAddon(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: [ADDONS_QUERY_KEY] });
      toast.success(res.message || 'Product Add-on restored successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to restore add-on');
    },
  });
}

export function useDuplicateProductAddon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productAddonApi.duplicateAddon(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: [ADDONS_QUERY_KEY] });
      toast.success(res.message || 'Product Add-on duplicated successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to duplicate add-on');
    },
  });
}

// Groups Hooks
export function useAddonGroups(params?: any) {
  return useQuery({
    queryKey: [ADDON_GROUPS_QUERY_KEY, params],
    queryFn: async () => {
      const res = await productAddonApi.getGroups(params);
      return {
        data: res.data as AddonGroup[],
        meta: res.meta,
      };
    },
  });
}

export function useAddonGroupDetail(id?: string) {
  return useQuery({
    queryKey: [ADDON_GROUPS_QUERY_KEY, id],
    queryFn: async () => {
      if (!id) return null;
      const res = await productAddonApi.getGroupById(id);
      return res.data as AddonGroup;
    },
    enabled: !!id,
  });
}

export function useCreateAddonGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AddonGroup>) => productAddonApi.createGroup(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: [ADDON_GROUPS_QUERY_KEY] });
      toast.success(res.message || 'Add-on group created');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to create group');
    },
  });
}

export function useUpdateAddonGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AddonGroup> }) =>
      productAddonApi.updateGroup(id, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: [ADDON_GROUPS_QUERY_KEY] });
      toast.success(res.message || 'Add-on group updated');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to update group');
    },
  });
}

export function useDeleteAddonGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productAddonApi.deleteGroup(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: [ADDON_GROUPS_QUERY_KEY] });
      toast.success(res.message || 'Add-on group deleted');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete group');
    },
  });
}

export function useRestoreAddonGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productAddonApi.restoreGroup(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: [ADDON_GROUPS_QUERY_KEY] });
      toast.success(res.message || 'Add-on group restored');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to restore group');
    },
  });
}
