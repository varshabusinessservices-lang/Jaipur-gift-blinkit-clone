import { useState, useEffect, useCallback } from 'react';
import { productApi } from '../services/productApi';
import {
  ProductDetail,
  ProductFilterQuery,
  CreateProductInput,
  ProductOption,
  ProductStatus,
  ProductVisibility,
} from '../types/product';

export function useProductList(initialQuery: ProductFilterQuery = {}) {
  const [products, setProducts] = useState<ProductDetail[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<ProductFilterQuery>(initialQuery);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await productApi.getProducts(query);
      setProducts(res.products);
      setPagination(res.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    pagination,
    loading,
    error,
    query,
    setQuery,
    refetch: fetchProducts,
  };
}

export function useProductDetail(id: string | undefined) {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await productApi.getProductById(id);
      setProduct(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load product detail');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return { product, loading, error, refetch: fetchDetail };
}

export function useProductOptions(search?: string, categoryId?: string) {
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    productApi
      .getProductOptions(search, categoryId)
      .then((data) => {
        if (active) setOptions(data);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [search, categoryId]);

  return { options, loading };
}

export function useProductActions() {
  const [loading, setLoading] = useState(false);

  const updateStatus = async (id: string, status: ProductStatus) => {
    setLoading(true);
    try {
      return await productApi.updateStatus(id, status);
    } finally {
      setLoading(false);
    }
  };

  const updateVisibility = async (id: string, visibility: ProductVisibility) => {
    setLoading(true);
    try {
      return await productApi.updateVisibility(id, visibility);
    } finally {
      setLoading(false);
    }
  };

  const duplicateProduct = async (id: string) => {
    setLoading(true);
    try {
      return await productApi.duplicateProduct(id);
    } finally {
      setLoading(false);
    }
  };

  const softDeleteProduct = async (id: string) => {
    setLoading(true);
    try {
      return await productApi.softDeleteProduct(id);
    } finally {
      setLoading(false);
    }
  };

  const restoreProduct = async (id: string) => {
    setLoading(true);
    try {
      return await productApi.restoreProduct(id);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    updateStatus,
    updateVisibility,
    duplicateProduct,
    softDeleteProduct,
    restoreProduct,
  };
}
