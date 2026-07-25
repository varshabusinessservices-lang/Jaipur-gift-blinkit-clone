import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productVariationApi } from '../services/productVariationApi';
import {
  ProductVariationFilterQuery,
  GeneratePreviewInput,
  GenerateVariationsInput,
  CreateVariationInput,
  BulkUpdateInput,
} from '../types/productVariation';

export function useProductVariationsList(productId: string, query: ProductVariationFilterQuery = {}) {
  return useQuery({
    queryKey: ['productVariations', productId, query],
    queryFn: () => productVariationApi.listVariations(productId, query),
    enabled: !!productId,
  });
}

export function useProductVariationDetail(productId: string, variationId: string) {
  return useQuery({
    queryKey: ['productVariation', productId, variationId],
    queryFn: () => productVariationApi.getVariationDetail(productId, variationId),
    enabled: !!productId && !!variationId,
  });
}

export function useGenerateVariationPreview(productId: string) {
  return useMutation({
    mutationFn: (input: GeneratePreviewInput) => productVariationApi.generatePreview(productId, input),
  });
}

export function useGenerateVariations(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: GenerateVariationsInput) => productVariationApi.generateVariations(productId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productVariations', productId] });
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
    },
  });
}

export function useCreateVariation(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateVariationInput) => productVariationApi.createVariation(productId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productVariations', productId] });
    },
  });
}

export function useUpdateVariation(productId: string, variationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<CreateVariationInput>) =>
      productVariationApi.updateVariation(productId, variationId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productVariations', productId] });
      queryClient.invalidateQueries({ queryKey: ['productVariation', productId, variationId] });
    },
  });
}

export function useUpdateVariationStatus(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ variationId, status }: { variationId: string; status: string }) =>
      productVariationApi.updateStatus(productId, variationId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productVariations', productId] });
    },
  });
}

export function useSetDefaultVariation(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variationId: string) => productVariationApi.setDefault(productId, variationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productVariations', productId] });
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
    },
  });
}

export function useBulkUpdateVariations(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: BulkUpdateInput) => productVariationApi.bulkUpdate(productId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productVariations', productId] });
    },
  });
}

export function useDeleteVariation(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variationId: string) => productVariationApi.deleteVariation(productId, variationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productVariations', productId] });
    },
  });
}

export function useRestoreVariation(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variationId: string) => productVariationApi.restoreVariation(productId, variationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productVariations', productId] });
    },
  });
}
