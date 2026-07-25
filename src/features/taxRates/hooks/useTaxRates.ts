import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taxRateApi } from '../services/taxRateApi';
import { TaxRateFilterState, TaxRateFormData, TaxRateStatus } from '../types/taxRate';

export const taxRateKeys = {
  all: ['taxRates'] as const,
  lists: () => [...taxRateKeys.all, 'list'] as const,
  list: (filters: TaxRateFilterState) => [...taxRateKeys.lists(), filters] as const,
  options: (query: { activeOnly?: boolean; search?: string }) => [...taxRateKeys.all, 'options', query] as const,
  details: () => [...taxRateKeys.all, 'detail'] as const,
  detail: (id: string) => [...taxRateKeys.details(), id] as const,
};

export function useTaxRates(filters: TaxRateFilterState = {}) {
  return useQuery({
    queryKey: taxRateKeys.list(filters),
    queryFn: () => taxRateApi.getTaxRates(filters),
  });
}

export function useTaxRate(id: string) {
  return useQuery({
    queryKey: taxRateKeys.detail(id),
    queryFn: () => taxRateApi.getTaxRateById(id),
    enabled: Boolean(id),
  });
}

export function useTaxRateOptions(query: { activeOnly?: boolean; search?: string } = {}) {
  return useQuery({
    queryKey: taxRateKeys.options(query),
    queryFn: () => taxRateApi.getTaxRateOptions(query),
  });
}

export function useCreateTaxRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TaxRateFormData) => taxRateApi.createTaxRate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taxRateKeys.all });
    },
  });
}

export function useUpdateTaxRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TaxRateFormData> }) =>
      taxRateApi.updateTaxRate(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: taxRateKeys.all });
      queryClient.invalidateQueries({ queryKey: taxRateKeys.detail(id) });
    },
  });
}

export function useSetDefaultTaxRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => taxRateApi.setDefaultTaxRate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taxRateKeys.all });
    },
  });
}

export function useUpdateTaxRateStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaxRateStatus }) =>
      taxRateApi.updateTaxRateStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: taxRateKeys.all });
      queryClient.invalidateQueries({ queryKey: taxRateKeys.detail(id) });
    },
  });
}

export function useDeleteTaxRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => taxRateApi.deleteTaxRate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taxRateKeys.all });
    },
  });
}

export function useRestoreTaxRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => taxRateApi.restoreTaxRate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taxRateKeys.all });
    },
  });
}
