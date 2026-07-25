import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productAttributeApi } from '../services/productAttributeApi';
import {
  AttributeFilterQuery,
  CreateAttributeInput,
  CreateAttributeValueInput,
} from '../types/productAttribute';
import { AttributeSelectionInput } from '../../../utils/variationCombinator';

export const productAttributeKeys = {
  all: ['productAttributes'] as const,
  lists: () => [...productAttributeKeys.all, 'list'] as const,
  list: (filters: AttributeFilterQuery) => [...productAttributeKeys.lists(), filters] as const,
  options: (filters?: Record<string, any>) => [...productAttributeKeys.all, 'options', filters] as const,
  details: () => [...productAttributeKeys.all, 'detail'] as const,
  detail: (id: string) => [...productAttributeKeys.details(), id] as const,
  values: (attributeId: string, filters?: Record<string, any>) =>
    [...productAttributeKeys.detail(attributeId), 'values', filters] as const,
  categories: (attributeId: string) =>
    [...productAttributeKeys.detail(attributeId), 'categories'] as const,
};

export const attributeGroupKeys = {
  all: ['attributeGroups'] as const,
  lists: () => [...attributeGroupKeys.all, 'list'] as const,
  list: (filters?: Record<string, any>) => [...attributeGroupKeys.lists(), filters] as const,
  detail: (id: string) => [...attributeGroupKeys.all, 'detail', id] as const,
};

export function useProductAttributes(filters: AttributeFilterQuery = {}) {
  return useQuery({
    queryKey: productAttributeKeys.list(filters),
    queryFn: () => productAttributeApi.getAttributes(filters),
  });
}

export function useProductAttribute(id: string) {
  return useQuery({
    queryKey: productAttributeKeys.detail(id),
    queryFn: () => productAttributeApi.getAttributeById(id),
    enabled: Boolean(id),
  });
}

export function useCreateAttribute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAttributeInput) => productAttributeApi.createAttribute(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productAttributeKeys.all });
    },
  });
}

export function useUpdateAttribute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateAttributeInput> }) =>
      productAttributeApi.updateAttribute(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productAttributeKeys.all });
      queryClient.invalidateQueries({ queryKey: productAttributeKeys.detail(variables.id) });
    },
  });
}

export function useUpdateAttributeStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      productAttributeApi.updateAttributeStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productAttributeKeys.all });
    },
  });
}

export function useDeleteAttribute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productAttributeApi.deleteAttribute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productAttributeKeys.all });
    },
  });
}

export function useRestoreAttribute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productAttributeApi.restoreAttribute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productAttributeKeys.all });
    },
  });
}

export function useCreateAttributeValue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ attributeId, data }: { attributeId: string; data: CreateAttributeValueInput }) =>
      productAttributeApi.createAttributeValue(attributeId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productAttributeKeys.detail(variables.attributeId) });
    },
  });
}

export function useGenerateCombinations() {
  return useMutation({
    mutationFn: ({ selections, maxLimit }: { selections: AttributeSelectionInput[]; maxLimit?: number }) =>
      productAttributeApi.generateCombinations(selections, maxLimit),
  });
}

export function useAttributeGroups() {
  return useQuery({
    queryKey: attributeGroupKeys.all,
    queryFn: () => productAttributeApi.getAttributeGroups(),
  });
}
