import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { brandApi } from '../services/brandApi';
import { BrandFilterState, BrandFormData, BrandStatus } from '../types/brand';

export const brandKeys = {
  all: ['brands'] as const,
  lists: () => [...brandKeys.all, 'list'] as const,
  list: (filters: BrandFilterState) => [...brandKeys.lists(), filters] as const,
  options: (query: { activeOnly?: boolean; search?: string }) => [...brandKeys.all, 'options', query] as const,
  details: () => [...brandKeys.all, 'detail'] as const,
  detail: (id: string) => [...brandKeys.details(), id] as const,
};

export function useBrands(filters: BrandFilterState = {}) {
  return useQuery({
    queryKey: brandKeys.list(filters),
    queryFn: () => brandApi.getBrands(filters),
  });
}

export function useBrand(id: string) {
  return useQuery({
    queryKey: brandKeys.detail(id),
    queryFn: () => brandApi.getBrandById(id),
    enabled: Boolean(id),
  });
}

export function useBrandOptions(query: { activeOnly?: boolean; search?: string } = {}) {
  return useQuery({
    queryKey: brandKeys.options(query),
    queryFn: () => brandApi.getBrandOptions(query),
  });
}

export function useCreateBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BrandFormData) => brandApi.createBrand(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.all });
    },
  });
}

export function useUpdateBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BrandFormData> }) =>
      brandApi.updateBrand(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: brandKeys.all });
      queryClient.invalidateQueries({ queryKey: brandKeys.detail(id) });
    },
  });
}

export function useUpdateBrandStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: BrandStatus }) =>
      brandApi.updateBrandStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: brandKeys.all });
      queryClient.invalidateQueries({ queryKey: brandKeys.detail(id) });
    },
  });
}

export function useUpdateBrandFeatured() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isFeatured }: { id: string; isFeatured: boolean }) =>
      brandApi.updateBrandFeatured(id, isFeatured),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: brandKeys.all });
      queryClient.invalidateQueries({ queryKey: brandKeys.detail(id) });
    },
  });
}

export function useDeleteBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => brandApi.deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.all });
    },
  });
}

export function useRestoreBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => brandApi.restoreBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.all });
    },
  });
}

export function useDuplicateBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => brandApi.duplicateBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.all });
    },
  });
}
